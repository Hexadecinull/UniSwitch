// The actual pipeline described in docs/ARCHITECTURE.md section 2. This is a
// working skeleton: it wires the stages together and produces a report, but
// steps 3 and 4 (analysis and transform passes) are no-ops until there's a
// second language plugin to validate them against. Registering plugins and
// running two real ones through this is the next real milestone for the project.

import type { LanguagePlugin } from "./plugin.js";
import type { ConversionReport, ConversionReportEntry } from "./report.js";

export interface ConvertOptions {
  source: string;
  from: LanguagePlugin;
  to: LanguagePlugin;
}

export interface ConvertResult {
  output: string;
  report: ConversionReport;
}

export function convert(options: ConvertOptions): ConvertResult {
  const { source, from, to } = options;

  const cst = from.parse(source);
  const uir = from.lower(cst);

  // Steps 3 and 4 (analysis, transform) go here once there's a second
  // language plugin to test them against. Left out rather than faked.

  const targetCst = to.raise(uir);
  const output = to.emit(targetCst);

  const entries: ConversionReportEntry[] = collectReportEntries(uir);

  return {
    output,
    report: {
      sourceLanguage: from.id,
      targetLanguage: to.id,
      entries,
    },
  };
}

function collectReportEntries(uirModule: {
  body: Array<{ meta: { confidence: string; note?: string } }>;
}): ConversionReportEntry[] {
  return uirModule.body.map((node, index) => ({
    confidence: node.meta.confidence as ConversionReportEntry["confidence"],
    location: `statement ${index}`,
    note: node.meta.note,
  }));
}
