# Contributing to UniSwitch

Thanks for considering it. This project is meant to grow through outside contribution, not just a single maintainer, so this guide tries to make that as friction-free as possible.

## Ways to contribute, roughly easiest to hardest

1. **Report a bad conversion.** If UniSwitch converted something incorrectly, or marked something as unconvertible that shouldn't be, open an issue with the input snippet and what you expected. This is the single most useful contribution type, and doesn't require reading any code.
2. **Add a standard library or idiom mapping entry.** Each language plugin has a `stdlibMap` (see [`ARCHITECTURE.md`](./ARCHITECTURE.md) section 4). Adding one mapping entry is usually a small, self-contained pull request.
3. **Improve an emitter.** Making generated code look more idiomatic in the target language, better formatting, better naming conventions, doesn't touch the core pipeline.
4. **Add a language plugin.** The biggest kind of contribution, covered below.
5. **Change the core pipeline or the UIR schema.** Open an issue to discuss the design first, changes here affect every language plugin at once.

## Before you start

- Check open issues and pull requests first, someone may already be on it.
- For anything bigger than a small fix, open an issue describing what you want to do before writing code. This avoids wasted work on both sides if the approach needs discussion.
- Read [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

## Development setup

```bash
git clone https://github.com/<your-org>/uniswitch.git
cd uniswitch
pnpm install
pnpm build
pnpm test
```

## Adding a language plugin

At a high level:

1. Create `packages/languages/<name>` implementing the `LanguagePlugin` interface from `packages/language-plugin-api` (see [`ARCHITECTURE.md`](./ARCHITECTURE.md) section 4).
2. Start with `parse` and `lower`: get source in your language turning into UIR correctly for a small, representative set of programs before worrying about `raise` and `emit` in the other direction.
3. Add tests under `packages/languages/<name>/test`, each one a small source snippet with an expected UIR shape, or an expected round-trip output if testing the full pipeline.
4. Add a `stdlibMap` entry for at least the common cases (string operations, collection operations, I/O). It does not need to be complete before merging, a partial map with an issue tracking the gaps is fine.
5. Update the supported languages table in the root `README.md`.

If you're referencing an existing converter or transpiler for how it handled a tricky mapping, that's encouraged, but treat it as a reference for the mapping decision, not a source to copy code from, unless its license explicitly permits that and you note it in the relevant file's header.

## Code style

- TypeScript throughout, strict mode on, see `tsconfig.base.json`.
- Run `pnpm lint` and `pnpm format` before opening a pull request, CI enforces both.
- Comments should be short and written for a stranger reading the code for the first time, not for yourself six months from now. Explain why, not what, when the code doesn't already make the "what" obvious.

## Commit messages and branches

- Branch names: `feature/<short-description>`, `fix/<short-description>`, or `docs/<short-description>`.
- Commit messages: a short imperative summary line (`Add Python len() mapping`, not `Added` or `Adding`), with more detail in the body if the change needs explaining.
- Keep pull requests focused. A plugin addition and an unrelated core refactor should be two pull requests, not one.

## Pull request process

1. Fork, branch, make your change, and make sure `pnpm build`, `pnpm lint`, and `pnpm test` all pass locally.
2. Open the pull request using the template, it'll ask what changed and how it was tested.
3. CI runs lint, typecheck, tests, and CodeQL automatically. A maintainer reviews once CI is green.
4. Be responsive to review feedback, but don't feel obligated to agree with every suggestion, pushing back with reasoning is welcome.

## Sign-off

By contributing, you agree your contribution is licensed under the project's AGPL-3.0-or-later license (see the root [`LICENSE`](../LICENSE)). No separate CLA is required.

## Questions

Open a discussion or an issue tagged `question`. There's no dumb question here, especially about the UIR design, it's genuinely not obvious from reading the code alone.
