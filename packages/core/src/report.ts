// The conversion report is the actual deliverable of a conversion, not a side
// effect. See docs/ARCHITECTURE.md section 5 and docs/USAGE.md section 4.

import type { Confidence } from "./uir.js";

export interface ConversionReportEntry {
  confidence: Confidence;
  /** Roughly where in the source this applies, for a human to find it. */
  location: string;
  note?: string;
}

export interface ConversionReport {
  sourceLanguage: string;
  targetLanguage: string;
  entries: ConversionReportEntry[];
}

/** Convenience split, used by CLI/web output to group entries under headings. */
export function groupByConfidence(
  report: ConversionReport,
): Record<Confidence, ConversionReportEntry[]> {
  const grouped: Record<Confidence, ConversionReportEntry[]> = {
    high: [],
    approximated: [],
    unsupported: [],
  };
  for (const entry of report.entries) {
    grouped[entry.confidence].push(entry);
  }
  return grouped;
}
