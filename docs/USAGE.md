# Usage

This covers the CLI, the web app, and the desktop app. All three run the same conversion engine (see [`ARCHITECTURE.md`](./ARCHITECTURE.md)), so behavior is consistent across them.

Before reading further: UniSwitch is a proof of concept and will never produce a one-to-one, perfect conversion, that isn't achievable between real programming languages. A UniSwitch conversion is not meant to be taken as final output without review. Read the conversion report every time. See section 4.

## 1. CLI

```bash
uniswitch convert <input-file> --to <target-language> [--out <output-file>]
```

Example:

```bash
uniswitch convert src/utils.py --to typescript --out src/utils.ts
```

If `--out` is omitted, output goes to stdout and the conversion report goes to stderr, so you can pipe the converted code without the report mixing in.

Other CLI commands:

```bash
uniswitch languages          # list supported source and target languages
uniswitch convert --help     # full flag reference
```

### Config file

For repeated conversions with the same settings, a `uniswitch.config.json` in your project root is picked up automatically:

```json
{
  "from": "python",
  "to": "typescript",
  "include": ["src/**/*.py"],
  "exclude": ["src/**/test_*.py"],
  "outDir": "converted/"
}
```

Running `uniswitch convert` with no arguments in a directory containing this file converts everything matched by `include`.

## 2. Web app

The hosted instance at the project's deployment URL (see the root [`README.md`](../README.md)) provides the same conversion through a browser UI: paste or upload source, pick a target language, get converted output and the report side by side. No account is required for a single conversion; see [`PRIVACY.md`](./PRIVACY.md) for what is and isn't retained.

## 3. Desktop app

The Electron app wraps the same interface as the web app, running locally against a bundled copy of the core engine, so conversions do not require a network connection. Install instructions are in [`BUILDING.md`](./BUILDING.md) until signed installers are published.

## 4. Reading the conversion report

Every conversion produces a report. In the CLI it's printed to stderr (or saved alongside the output with `--report <file>`); in the web and desktop apps it's shown next to the converted code. The report has three sections:

- **Converted** — constructs translated with high confidence, no action needed.
- **Approximated** — constructs translated using a best-effort equivalent, with a short note on what changed in meaning, if anything. Worth a skim.
- **Unconverted** — constructs UniSwitch could not translate. These are left in the output as a clearly marked block containing the original source, for you to port by hand.

A conversion with an empty "Unconverted" section and a short "Approximated" section is a good sign. A conversion with a long "Unconverted" section usually means that language pair, or that specific construct, isn't well supported yet, worth an issue if it isn't already tracked.

## 5. Supported languages

Tracked in the table in the root [`README.md`](../README.md), which is kept current as plugins land.
