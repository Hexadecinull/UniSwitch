// PM2 process definitions for the self-hosted deployment. See docs/DEPLOY.md.
// Each app loads its own .env file from its own cwd via dotenv, so the actual
// PORT / WEBHOOK_SECRET / etc. values live in apps/web/.env and
// apps/webhook/.env, not here, see the .env.example in each app.

module.exports = {
  apps: [
    {
      name: "uniswitch-web",
      cwd: __dirname + "/../apps/web",
      script: "dist/server.js",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "uniswitch-webhook",
      cwd: __dirname + "/../apps/webhook",
      script: "dist/index.js",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
