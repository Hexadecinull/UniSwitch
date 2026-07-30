// The interface every language plugin implements. See docs/ARCHITECTURE.md
// section 4. Kept in core rather than a separate package for now since nothing
// else depends on this without also depending on core's UIR types; it can move
// out to @uniswitch/language-plugin-api later without changing its shape.

import type { UirModule } from "./uir.js";

/** Opaque per-language concrete syntax tree. Plugins define their own shape internally. */
export type ConcreteSyntaxTree = unknown;

export interface StdlibMapping {
  // maps a call in this language (by qualified name) to how it should be
  // represented once lowered to UIR, and vice versa on the way out. Left
  // loose on purpose until the first real plugin needs a concrete shape.
  [qualifiedName: string]: unknown;
}

export interface LanguagePlugin {
  id: string;
  extensions: string[];
  parse(source: string): ConcreteSyntaxTree;
  lower(cst: ConcreteSyntaxTree): UirModule;
  raise(uir: UirModule): ConcreteSyntaxTree;
  emit(cst: ConcreteSyntaxTree): string;
  stdlibMap: StdlibMapping;
}
