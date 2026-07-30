# Self-deploying the web app

This is the general guide for running the UniSwitch web app on your own server, with automatic redeployment on push to your main branch. It assumes a Linux server you have shell access to. It does not assume any particular hosting provider or DNS provider.

If you're the maintainer deploying the reference instance, use the personalized deploy guide you were given separately alongside this repository instead, it has your exact server details filled in. This document is the version anyone self-hosting can follow.

## 1. Requirements

- Node.js 20 or newer on the server
- [pnpm](https://pnpm.io/) 9 or newer
- Git, with the server able to `git clone` your fork or the upstream repo
- A process manager, this guide uses [PM2](https://pm2.keymetrics.io/)
- A reverse proxy or CDN in front of the app if you want TLS and a real domain, this guide assumes one exists but doesn't require a specific one

## 2. First deploy

```bash
git clone <your-fork-url> uniswitch
cd uniswitch
pnpm install
pnpm --filter @uniswitch/web run build
```

Copy `apps/web/.env.example` to `apps/web/.env` and fill in at minimum:

```
PORT=3010
NODE_ENV=production
```

Start it under PM2:

```bash
pm2 start deploy/ecosystem.config.js --only uniswitch-web
pm2 save
```

`pm2 save` plus `pm2 startup` (run once, follow its printed instructions) makes the app survive a server reboot.

## 3. Putting it behind a domain

Point your domain at the server through whatever reverse proxy or CDN you use, forwarding to `127.0.0.1:<PORT>` (3010 by default). If you're using Cloudflare in front of the server, a proxied DNS record pointing at the server's IP, with the origin server itself only listening on localhost or behind a firewall rule that only allows Cloudflare's IP ranges, is a reasonable default so the app is never reachable by its bare IP.

## 4. Automatic redeploy on push

UniSwitch includes a small webhook listener at `apps/webhook` that redeploys the app when GitHub notifies it of a push to your main branch. This avoids needing to log in and pull manually for every change.

### 4.1. Start the listener

```bash
cp apps/webhook/.env.example apps/webhook/.env
# edit apps/webhook/.env: set WEBHOOK_PORT and WEBHOOK_SECRET
pnpm --filter @uniswitch/webhook run build
pm2 start deploy/ecosystem.config.js --only uniswitch-webhook
pm2 save
```

`WEBHOOK_SECRET` should be a long random string, generate one with `openssl rand -hex 32`. This same value goes into the GitHub webhook config in the next step, it is what GitHub uses to sign each request so the listener can verify a push notification actually came from GitHub and not from anyone who finds the URL.

### 4.2. Expose the webhook port

The webhook listener needs to be reachable from GitHub's servers, either directly on its port or behind the same reverse proxy as the web app on a distinct path. Either way, only expose the webhook endpoint itself, not general shell or file access.

### 4.3. Register the webhook on GitHub

In your repository: **Settings → Webhooks → Add webhook**.

- **Payload URL**: wherever the listener is reachable, e.g. `https://your-domain/webhook` or `https://your-domain:9002/`
- **Content type**: `application/json`
- **Secret**: the same `WEBHOOK_SECRET` from step 4.1
- **Events**: "Just the push event" is sufficient
- **Active**: checked

GitHub will send a test ping on save. Check `pm2 logs uniswitch-webhook` to confirm it arrived and verified.

### 4.4. What happens on push

The listener verifies the request signature, checks the push was to your configured branch (default `main`), and if so runs `deploy/deploy.sh`, which does `git pull`, `pnpm install`, rebuilds the web app, and reloads it under PM2. This is a normal deploy, not a hot patch, so a broken commit on main will produce a broken deployment, same as anywhere else. Keep your main branch protected accordingly if multiple people can push to it.

## 5. Updating manually

If you'd rather not run the webhook listener, `deploy/deploy.sh` can be run by hand over SSH any time you want to update:

```bash
cd uniswitch
./deploy/deploy.sh
```

## 6. Logs and troubleshooting

```bash
pm2 logs uniswitch-web
pm2 logs uniswitch-webhook
pm2 status
```

If the webhook listener receives a request but nothing happens, the most common cause is a `WEBHOOK_SECRET` mismatch between `apps/webhook/.env` and the GitHub webhook config, the signature check will fail silently from GitHub's point of view (it shows as a non-2xx response in GitHub's webhook delivery log, under **Settings → Webhooks → your webhook → Recent Deliveries**).
