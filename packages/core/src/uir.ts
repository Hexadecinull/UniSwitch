// The UniSwitch Intermediate Representation (UIR).
// See docs/ARCHITECTURE.md section 3 for the reasoning behind this shape.
// This is intentionally a starting skeleton, not a finished schema: it will
// grow as language plugins are added and expose constructs it doesn't cover yet.

/** How sure a conversion is about a given node. Not a boolean, translation is rarely all-or-nothing. */
export type Confidence = "high" | "approximated" | "unsupported";

/** Metadata every UIR node carries about how it came to be, for the conversion report. */
export interface ConversionMeta {
  confidence: Confidence;
  /** Human-readable note, required when confidence isn't "high". */
  note?: string;
  /** Original source text, kept when confidence is "unsupported" so it can be surfaced verbatim. */
  originalSource?: string;
}

export interface UirNode {
  kind: string;
  meta: ConversionMeta;
}

export interface UirModule extends UirNode {
  kind: "Module";
  path: string;
  body: UirStatement[];
}

// Statements and expressions are intentionally not fully modeled yet, so
// these are plain aliases for now rather than interfaces: an interface here
// with no added members would be identical to UirNode, which is what these
// comments are for, spelling out that concrete kinds still need to be added.
// A real implementation adds concrete node kinds here (UirIfStatement,
// UirFunctionDeclaration, UirBinaryExpression, and so on) as language plugins
// need them. Keeping this file small until then avoids guessing at a shape
// that doesn't match what real languages actually need.

export type UirStatement = UirNode;

export type UirExpression = UirNode;
