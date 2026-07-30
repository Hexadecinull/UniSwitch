// Python language plugin. This is a stub showing the shape a plugin takes,
// see docs/CONTRIBUTING.md "Adding a language plugin" for the intended order
// of work: parse and lower first, raise and emit second.
//
// TODO: wire up the Python tree-sitter grammar via web-tree-sitter for parse().
// TODO: implement lower() for at least: function defs, if/for/while, basic
//       expressions, before attempting anything Python-specific like decorators.
// TODO: implement raise() and emit() the same way, once lower() round-trips.
// TODO: start stdlibMap with the handful of calls used in the plugin's own tests.

import type { LanguagePlugin, ConcreteSyntaxTree, UirModule } from "@uniswitch/language-plugin-api";

export const pythonPlugin: LanguagePlugin = {
  id: "python",
  extensions: [".py"],

  parse(_source: string): ConcreteSyntaxTree {
    throw new Error("python plugin: parse() not yet implemented");
  },

  lower(_cst: ConcreteSyntaxTree): UirModule {
    throw new Error("python plugin: lower() not yet implemented");
  },

  raise(_uir: UirModule): ConcreteSyntaxTree {
    throw new Error("python plugin: raise() not yet implemented");
  },

  emit(_cst: ConcreteSyntaxTree): string {
    throw new Error("python plugin: emit() not yet implemented");
  },

  stdlibMap: {
    // e.g. "len": { ... } once there's a second plugin to map it against
  },
};

export default pythonPlugin;
