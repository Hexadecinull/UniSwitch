#!/usr/bin/env bash
# Pulls the latest main, rebuilds the web app, and reloads it under PM2.
# Run by apps/webhook on a verified push, or by hand: ./deploy/deploy.sh
# See docs/DEPLOY.md.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$REPO_ROOT"

echo "[deploy] pulling main"
git fetch origin main
git reset --hard origin/main

echo "[deploy] installing dependencies"
pnpm install --frozen-lockfile

echo "[deploy] building web app"
pnpm --filter @uniswitch/web run build

echo "[deploy] reloading under pm2"
pm2 reload "$SCRIPT_DIR/ecosystem.config.js" --only uniswitch-web

echo "[deploy] done"
