# UniSwitch

A universal programming language converter. UniSwitch parses source code in one language, builds a shared intermediate representation of it, and emits equivalent source code in another language.

Full documentation lives in [`/docs`](./docs/README.md). This file is the short version.

## What UniSwitch actually is

Converting between programming languages perfectly, in general, is not solvable. Languages differ in memory model, type system, concurrency model, and standard library, and some constructs in one language have no clean equivalent in another. UniSwitch does not claim to produce a perfect translation every time.

What it aims for instead:

- A structural, best-effort conversion that gets you most of the way there for common language constructs.
- Clear, visible flags on anything it could not convert with confidence, rather than silently guessing.
- A growing set of supported language pairs, expanded deliberately rather than all at once.
- A plugin architecture, so a new language is a matter of writing a parser adapter and an emitter, not rewriting the engine.

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full technical design, including why a fully general converter is out of scope and what "confidence" means in a conversion result.

## Status

Early. The scaffolding, documentation, and CI in this repository exist before the conversion engine itself does. Supported languages will be tracked here as they land.

| Source language | Target language | Status |
| ---------------- | ---------------- | ------ |
| _(none yet)_ | _(none yet)_ | planned |

## Project layout

This is a pnpm monorepo:

- `packages/core` — the intermediate representation and conversion pipeline
- `packages/language-plugin-api` — the interface a language plugin implements
- `packages/languages/*` — one package per supported language (parser adapter + emitter)
- `apps/cli` — command line interface
- `apps/web` — the web app and API server behind the hosted instance
- `apps/desktop` — Electron wrapper around the web app
- `apps/mobile` — Capacitor wrapper around the web app
- `apps/webhook` — small service that redeploys the self-hosted instance on push

## Getting started

```bash
git clone https://github.com/<your-org>/uniswitch.git
cd uniswitch
pnpm install
pnpm build
```

See [`docs/USAGE.md`](./docs/USAGE.md) for how to run the CLI, the web app, and the desktop app, and [`docs/BUILDING.md`](./docs/BUILDING.md) for building the desktop and mobile targets from source.

## Contributing

UniSwitch is meant to grow through contributions: new language plugins, bug reports, and improvements to existing conversions. Start with [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md).

## License

UniSwitch is licensed under the [GNU Affero General Public License v3.0 or later](./LICENSE) (AGPL-3.0-or-later).

AGPL was chosen deliberately over plain GPL because UniSwitch is meant to run as a hosted service (see the live instance link below) as well as a desktop and mobile app. AGPL closes the loophole where someone could run a modified version as a network service without sharing the changes back. If that's ever a problem for a legitimate use case you have, open an issue and it can be discussed.

## Hosted instance

A reference instance is self-hosted at **https://switch.hexadecinull.dpdns.org**, once the web app has something to show.
