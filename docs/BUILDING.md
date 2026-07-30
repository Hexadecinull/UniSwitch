# Building from source

This covers building each app in the monorepo. For running a self-hosted instance of the web app long-term, see [`DEPLOY.md`](./DEPLOY.md) instead, this document is about producing build artifacts.

## Prerequisites

- Node.js 20 or newer (the project is tested against Node 24)
- [pnpm](https://pnpm.io/) 9 or newer
- Git

Install dependencies once from the repo root:

```bash
pnpm install
```

Every command below assumes you're running it from the repo root unless noted.

## Core and CLI

```bash
pnpm --filter @uniswitch/core run build
pnpm --filter @uniswitch/cli run build
```

The CLI can then be run locally with `node apps/cli/dist/index.js`, or linked globally with `pnpm --filter @uniswitch/cli link --global`.

## Web app

```bash
pnpm --filter @uniswitch/web run build
```

Output is a production Node server bundle in `apps/web/dist`. Run it with:

```bash
node apps/web/dist/server.js
```

It reads `PORT` from the environment (defaults to 3010). See [`DEPLOY.md`](./DEPLOY.md) for running this continuously on a server.

## Desktop app (Electron)

Additional prerequisite: a matching native toolchain for your OS if you're packaging for it (Xcode command line tools on macOS, Visual Studio Build Tools on Windows, standard build-essential on Linux).

```bash
pnpm --filter @uniswitch/desktop run build       # bundles the renderer
pnpm --filter @uniswitch/desktop run package      # produces installers via electron-builder
```

`package` builds for whichever OS you run it on. Cross-compiling installers for other platforms is possible with electron-builder but not configured by default, see electron-builder's documentation if you need it. CI produces installers for all three desktop platforms on release, see the Release Build workflow in `.github/workflows`.

## Mobile app (Capacitor)

Additional prerequisites:

- Android: Android Studio, an Android SDK matching the version in `apps/mobile/android` once generated
- iOS: Xcode, on macOS only, this is an Apple platform requirement, not a UniSwitch one

First-time setup, after `pnpm install`:

```bash
pnpm --filter @uniswitch/mobile run build     # builds the web assets Capacitor wraps
pnpm --filter @uniswitch/mobile exec cap sync  # generates android/ and ios/ native projects
```

From there:

```bash
pnpm --filter @uniswitch/mobile exec cap open android   # opens Android Studio
pnpm --filter @uniswitch/mobile exec cap open ios       # opens Xcode, macOS only
```

Building signed release APKs/AABs or IPAs happens through Android Studio and Xcode respectively, since both require platform-specific signing credentials that don't belong in this repository.

## Running tests

```bash
pnpm test           # all packages
pnpm --filter @uniswitch/core test    # a single package
```
