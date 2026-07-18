/**
 * Services barrel export
 * All external library logic is isolated here per CLAUDE.md architecture rules.
 */

export { parseCSV, parseCSVRobust, detectBank } from "./csv-parser.service";
export type { CSVParseResult } from "./csv-parser.service";

export { parsePDF, parsePDFRobust } from "./pdf-parser.service";
export type { PDFParseResult } from "./pdf-parser.service";

export {
  analyzeFileWithAI,
  analyzeFilesWithAI,
  mergeSubscriptionReports,
} from "./ai-analyzer.service";
export type { AIAnalysisResult } from "./ai-analyzer.service";

export { analyzeTransactions } from "./subscription-analyzer.service";

export { analyzeSpending } from "./spending-analyzer.service";
export type { SpendingBreakdown, SpendingCategory } from "./spending-analyzer.service";
