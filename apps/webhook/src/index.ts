// Verifies a GitHub push webhook and triggers deploy/deploy.sh. See
// docs/DEPLOY.md section 4 for how this fits into the self-deploy setup.
//
// Kept dependency-free on purpose: this listens on a public port and runs a
// shell script, so the less code involved the smaller the attack surface.

import "dotenv/config";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = Number(process.env.WEBHOOK_PORT) || 9002;
const secret = process.env.WEBHOOK_SECRET;
const deployBranch = process.env.DEPLOY_BRANCH || "main";
const deployScript = process.env.DEPLOY_SCRIPT || join(__dirname, "../../../deploy/deploy.sh");
const maxBodyBytes = 1_000_000; // a push payload is small JSON, 1MB is generous

if (!secret) {
  console.error("WEBHOOK_SECRET is not set. Refusing to start: an unauthenticated listener that can trigger a deploy is not safe to run.");
  process.exit(1);
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBodyBytes) {
        reject(new Error("payload too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function isValidSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret as string).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from("sha256=" + expected);
  const givenBuf = Buffer.from(signatureHeader);
  if (expectedBuf.length !== givenBuf.length) return false;
  return timingSafeEqual(expectedBuf, givenBuf);
}

function runDeploy(): void {
  console.log(`Deploying: running ${deployScript}`);
  const child = spawn("bash", [deployScript], { stdio: "inherit" });
  child.on("exit", (code) => {
    console.log(`Deploy script exited with code ${code}`);
  });
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method !== "POST") {
    res.writeHead(405).end("method not allowed");
    return;
  }

  let rawBody: Buffer;
  try {
    rawBody = await readBody(req);
  } catch {
    res.writeHead(413).end("payload too large");
    return;
  }

  if (!isValidSignature(rawBody, req.headers["x-hub-signature-256"] as string | undefined)) {
    console.warn("Rejected webhook request: invalid or missing signature");
    res.writeHead(401).end("invalid signature");
    return;
  }

  const event = req.headers["x-github-event"];

  if (event === "ping") {
    res.writeHead(200).end("pong");
    return;
  }

  if (event !== "push") {
    res.writeHead(200).end("ignored: not a push event");
    return;
  }

  let payload: { ref?: string };
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    res.writeHead(400).end("invalid JSON");
    return;
  }

  if (payload.ref !== `refs/heads/${deployBranch}`) {
    res.writeHead(200).end(`ignored: push was not to ${deployBranch}`);
    return;
  }

  res.writeHead(200).end("deploying");
  runDeploy();
});

server.listen(port, () => {
  console.log(`Webhook listener on port ${port}, watching branch "${deployBranch}"`);
});
