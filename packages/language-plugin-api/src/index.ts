// A language plugin author should only need this package, not the rest of
// @uniswitch/core's internals (the pipeline, the report grouping helpers, and
// so on). Re-exporting the relevant types here keeps that surface small and
// lets it stay stable even as core's other internals change.

export type { LanguagePlugin, ConcreteSyntaxTree, StdlibMapping } from "@uniswitch/core";

export type {
  UirModule,
  UirStatement,
  UirExpression,
  Confidence,
  ConversionMeta,
} from "@uniswitch/core";
