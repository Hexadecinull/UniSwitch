// JavaScript/TypeScript language plugin. Stub, same shape as the Python plugin,
// see packages/languages/python/src/index.ts and docs/CONTRIBUTING.md.
//
// This is a reasonable second plugin to pair with Python for validating the
// UIR design (see docs/ARCHITECTURE.md section 6 on rollout order), since
// both are dynamically typed and share a lot of common control flow shape.

import type { LanguagePlugin, ConcreteSyntaxTree, UirModule } from "@uniswitch/language-plugin-api";

export const javascriptPlugin: LanguagePlugin = {
  id: "javascript",
  extensions: [".js", ".mjs", ".ts"],

  parse(_source: string): ConcreteSyntaxTree {
    throw new Error("javascript plugin: parse() not yet implemented");
  },

  lower(_cst: ConcreteSyntaxTree): UirModule {
    throw new Error("javascript plugin: lower() not yet implemented");
  },

  raise(_uir: UirModule): ConcreteSyntaxTree {
    throw new Error("javascript plugin: raise() not yet implemented");
  },

  emit(_cst: ConcreteSyntaxTree): string {
    throw new Error("javascript plugin: emit() not yet implemented");
  },

  stdlibMap: {
    // e.g. "Array.prototype.length" once there's a second plugin to map it against
  },
};

export default javascriptPlugin;
