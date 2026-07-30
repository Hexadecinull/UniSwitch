// Minimal server for the web app. Serves a placeholder page until the actual
// conversion UI exists, plus a health check endpoint the deploy guide and any
// uptime monitoring can hit. See docs/USAGE.md section 2 for the intended
// end-user behavior once this is real.

import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3010;

app.use(express.json({ limit: "1mb" })); // conversions are source files, not uploads, keep this small on purpose

app.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

// TODO: replace with the real conversion API once packages/core has a
// registered plugin pair to call. Kept as a clear stub rather than faked output.
app.post("/api/convert", (_req, res) => {
  res.status(501).json({
    error: "No language plugins are registered yet, see docs/ARCHITECTURE.md section 6.",
  });
});

app.use(express.static(join(__dirname, "public")));

app.listen(port, () => {
  console.log(`UniSwitch web app listening on port ${port}`);
});
