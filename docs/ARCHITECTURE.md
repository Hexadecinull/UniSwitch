# Architecture

This document explains how UniSwitch converts code from one language to another, and just as importantly, what it does not try to do.

**UniSwitch is a proof of concept, not a finished product, and it is not aiming to become one that outputs a perfect result.** A one-to-one, fully faithful conversion between two programming languages is not achievable in general, this isn't a current limitation to be engineered away later, it's a property of what programming languages are. UniSwitch's job is to get as close as it honestly can and be explicit about the gap, not to pretend the gap doesn't exist.

## 1. Goals and non-goals

**Goal:** given source code in a supported language, produce equivalent source code in another supported language, plus a report of anything that could not be converted with confidence.

**Non-goal:** producing a byte-for-byte behavioral guarantee across arbitrary language pairs. This is not achievable in general. Languages differ in memory model (garbage collected vs manual vs ownership-based), type system (structural vs nominal, static vs dynamic), concurrency model (threads vs event loop vs actors), and standard library shape. Some source constructs have no clean target equivalent at all.

UniSwitch's actual promise is narrower and more honest: convert what can be converted with confidence, and be loud, not silent, about the rest. A conversion that quietly produces wrong code is worse than one that stops and says "I don't know how to translate this."

## 2. Pipeline

```
source file
    |
    v
[1] Parser adapter        (language-specific: source text -> concrete syntax tree)
    |
    v
[2] Lowering               (CST -> UniSwitch Intermediate Representation, "UIR")
    |
    v
[3] Analysis passes         (type inference where possible, stdlib call resolution,
    |                        confidence scoring per node)
    v
[4] Transform passes         (UIR -> UIR, language-neutral rewrites, e.g. simplifying
    |                        a construct into an equivalent that more targets support)
    v
[5] Emitter                 (UIR -> target language source text, target-specific)
    |
    v
[6] Formatter pass           (target-specific, e.g. prettier for JS/TS, black-style for
    |                        Python, so output reads like idiomatic code, not a dump)
    v
target file + conversion report
```

Steps 1 and 5 are the only steps that know anything about a specific language. Steps 2 through 4 operate entirely on the UIR and are shared across every language pair. This is the entire point of the design: adding language number N+1 means writing one parser adapter and one emitter, not N new converters for N existing languages.

## 3. The UIR (UniSwitch Intermediate Representation)

The UIR is a language-neutral tree describing a program in terms that most imperative and object-oriented languages share: modules, declarations, functions, types, statements, expressions, control flow. It is not an attempt at a universal semantic model of computation. It is a pragmatic common denominator sized for the language pairs UniSwitch actually targets first (see section 6).

Two design decisions matter most:

- **Every UIR node can carry an `unsupported` marker.** When a lowering step meets a source construct with no reasonable UIR representation (a language-specific macro system, an inline assembly block, a construct tied to a runtime that has no equivalent), it does not force a bad translation. It wraps the original source as an opaque, annotated blob, and the emitter surfaces that as a clearly marked TODO in the output plus an entry in the conversion report.
- **Every UIR node carries a confidence score**, not just a pass/fail. A straightforward `if` statement converts with high confidence. A generator function converting from Python to a language without generators converts with low confidence and a note explaining the approximation that was used.

The UIR schema itself is versioned and lives in `packages/core/src`. It will grow incrementally as language plugins are added and expose gaps in it; it is deliberately not designed upfront to cover every construct in every language that might someday be supported.

## 4. Language plugins

A language plugin is a package under `packages/languages/<name>` implementing the interface defined in `packages/language-plugin-api`. At minimum:

```typescript
interface LanguagePlugin {
  id: string; // e.g. "python"
  extensions: string[]; // e.g. [".py"]
  parse(source: string): ConcreteSyntaxTree;
  lower(cst: ConcreteSyntaxTree): UirModule;
  raise(uir: UirModule): ConcreteSyntaxTree;
  emit(cst: ConcreteSyntaxTree): string;
  stdlibMap: StdlibMapping; // see section 5
}
```

`parse` and `emit` are the only places tied to a specific parsing/printing library. `lower` and `raise` are the translation to and from the shared UIR.

### Parsing technology

UniSwitch uses [tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammars via `web-tree-sitter` (the WASM build) as the default parsing layer wherever a mature grammar exists for a language. This was chosen over writing bespoke parsers for three reasons: tree-sitter grammars exist for most mainstream languages already and are maintained by large communities, the WASM build runs unmodified in Node, in the browser, and inside Electron and Capacitor, so the CLI, web app, desktop app, and mobile app all share the exact same parsing code, and tree-sitter's incremental, error-tolerant parsing means UniSwitch can still attempt a conversion on code with minor syntax issues instead of failing outright.

Where a language's tree-sitter grammar is missing or too immature for reliable lowering, a plugin may use a native parser package for that language instead, at the cost of that plugin not being usable in a pure-WASM context (this should be rare and will be called out per plugin).

### Standard library and idiom mapping

Syntax conversion is the easy 30 percent. The part that actually determines whether output code works is mapping standard library calls and idioms: Python's `len(x)` is JavaScript's `x.length`, Python's `with open(...) as f` is a `try/finally` in languages without context managers, and so on. Each plugin owns a `stdlibMap` for its language, and cross-language conversion quality depends on both plugins in a pair having entries for the relevant calls. This is the part of the project that scales worst with engineering effort and best with community contribution: adding a mapping entry does not require understanding the whole pipeline.

## 5. Confidence and the conversion report

Every conversion run produces, alongside the target file, a report listing:

- constructs converted with high confidence (no note needed)
- constructs converted with an approximation, and what the approximation was
- constructs that could not be converted, left as a marked TODO with the original source attached

This report is the actual deliverable of a conversion, not a side effect. Treating a UniSwitch conversion as "done, ship it" without reading the report is a misuse of the tool. `docs/USAGE.md` covers what the report looks like in practice.

## 6. Language pair rollout order

Language pairs are not added all at once and are not chosen at random. The rollout strategy starts with pairs sharing similar paradigms, where confidence in a UIR design decision can be validated quickly, and only then extends to more distant pairs where the UIR needs to grow to accommodate real differences (e.g. a language with manual memory management, or a language without exceptions). Prior art in existing source-to-source converters (tree-sitter based tools, transpilers such as those that target JavaScript from other languages, and language-specific converters like the various Java-to-C# and Java-to-Objective-C tools that have existed for years) is used as a reference for what idiom mappings and pitfalls look like in practice. Referencing how an existing tool solved a mapping problem is fair game; copying its source code is not, unless its license explicitly allows it and that is recorded per file.

## 7. Security posture

Parsing untrusted source code is, by itself, not code execution: UniSwitch never calls `eval`, never shells out to an interpreter for the source language, and never executes submitted code as part of a conversion. Parsing happens in-process against the tree-sitter grammar only. Resource limits (input size, parse timeout) are enforced at the API layer for the hosted instance. See [`SECURITY.md`](./SECURITY.md) for the vulnerability reporting process.

## 8. Why one core, four apps

`apps/cli`, `apps/web`, `apps/desktop`, and `apps/mobile` are thin shells. All of them call into `packages/core` for the actual conversion pipeline. This means a conversion behaves identically no matter which app someone used to run it, and a bug fix in the core benefits every surface at once rather than needing to be ported four times.
