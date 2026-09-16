/**
 * Scan + pay unlock decisions.
 * Keep AI failures honest: never sell a local teaser as the paid AI report.
 */

import type { AuditReport } from "./types";
import type { AIAnalysisResult } from "./services/ai-analyzer.service";
import { mergeSubscriptionReports } from "./services/ai-analyzer.service";
import type { ScanEngine } from "./scan-session";

export type AiErrorKind =
  | "auth"
  | "rate_limit"
  | "llamaparse"
  | "empty_extract"
  | "timeout"
  | "unavailable"
  | "missing_files"
  | "generic";

export interface ScanUserError {
  type: "no_transactions" | "file_error" | "format_error";
  message: string;
  messageAr: string;
  details: string;
  detailsAr: string;
  suggestions: string[];
  suggestionsAr: string[];
  showBankSelector: boolean;
  showPasteInput: boolean;
  failedFiles: string[];
  warnings: string[];
}

export type TeaserDecision =
  | {
      action: "use";
      report: AuditReport;
      engine: ScanEngine;
      failedFiles?: string[];
    }
  | {
      action: "error";
      kind: AiErrorKind;
      error: string;
      failedFiles?: string[];
    };

export type PayUnlockPlan =
  | { action: "unblur_existing" }
  | { action: "need_ai" }
  | { action: "missing_files" };

export type PayAiDecision =
  | { action: "use_ai"; report: AuditReport; failedFiles?: string[] }
  | { action: "error"; kind: AiErrorKind; error: string };

const PLACEHOLDER_RECEIPTS = new Set(["", "whop_paid"]);

export function isUsableReceiptId(receiptId: unknown): receiptId is string {
  if (typeof receiptId !== "string") return false;
  const id = receiptId.trim();
  if (!id) return false;
  if (PLACEHOLDER_RECEIPTS.has(id)) return false;
  return true;
}

export function classifyAiError(error: string): AiErrorKind {
  const e = error.toLowerCase();
  if ((/llama/.test(e) || /llamaparse/.test(e)) && /timeout/.test(e)) {
    return "timeout";
  }
  if (/llama/.test(e) || /llamaparse/.test(e)) return "llamaparse";
  if (
    /401/.test(e) ||
    /authentication_error/.test(e) ||
    /api key is invalid/.test(e) ||
    /anthropic_api_key/.test(e) ||
    /api key not/.test(e)
  ) {
    return "auth";
  }
  if (/429/.test(e) || /too many requests/.test(e)) return "rate_limit";
  if (/timeout/.test(e)) return "timeout";
  if (
    /empty extract/.test(e) ||
    /could not extract/.test(e) ||
    /could not read/.test(e) ||
    /no text/.test(e)
  ) {
    return "empty_extract";
  }
  if (/404/.test(e) || /not_found/.test(e) || /not configured/.test(e)) {
    return "unavailable";
  }
  if (/missing files|session/.test(e) && /file/.test(e)) return "missing_files";
  return "generic";
}

export function isEmptyAiReport(report: AuditReport | null | undefined): boolean {
  if (!report) return true;
  return report.subscriptions.length === 0 && (report.analyzedTransactions || 0) === 0;
}

export function decideTeaserScan(input: {
  hasPdf: boolean;
  localReport: AuditReport | null;
  localCount: number;
  /** null when the client skipped the server (CSV local hits) */
  aiResult: AIAnalysisResult | null;
}): TeaserDecision {
  const { hasPdf, localReport, localCount, aiResult } = input;

  if (aiResult == null) {
    if (localReport && localCount > 0) {
      return { action: "use", report: localReport, engine: "local" };
    }
    return {
      action: "error",
      kind: "generic",
      error: "No local results and AI was not called",
    };
  }

  if (aiResult.success) {
    const failedFiles = fileNamesFromErrors(aiResult.fileErrors);
    const claudeCount = aiResult.report.subscriptions.length;

    if (hasPdf && isEmptyAiReport(aiResult.report) && localCount === 0) {
      return {
        action: "error",
        kind: "empty_extract",
        error: aiResult.fileErrors?.join("; ") || "PDF AI scan returned no transactions",
        failedFiles,
      };
    }

    if (claudeCount > 0 && localCount > 0 && localReport) {
      return {
        action: "use",
        report: mergeSubscriptionReports(aiResult.report, localReport),
        engine: "claude",
        failedFiles,
      };
    }
    if (claudeCount > 0) {
      return {
        action: "use",
        report: aiResult.report,
        engine: "claude",
        failedFiles,
      };
    }
    if (localReport && localCount > 0) {
      return { action: "use", report: localReport, engine: "local", failedFiles };
    }

    return {
      action: "use",
      report: localReport || aiResult.report,
      engine: "claude",
      failedFiles,
    };
  }

  const kind = classifyAiError(aiResult.error);
  const failedFiles = fileNamesFromErrors([aiResult.error]);

  if (hasPdf && localCount === 0) {
    return { action: "error", kind, error: aiResult.error, failedFiles };
  }

  if (localReport && (localCount > 0 || !hasPdf)) {
    return { action: "use", report: localReport, engine: "local" };
  }

  return { action: "error", kind, error: aiResult.error, failedFiles };
}

export function decidePayUnlock(input: {
  engine: ScanEngine;
  hasPendingFiles: boolean;
}): PayUnlockPlan {
  if (input.engine === "claude") return { action: "unblur_existing" };
  if (!input.hasPendingFiles) return { action: "missing_files" };
  return { action: "need_ai" };
}

export function decidePayAiResult(
  aiResult: AIAnalysisResult,
  localTeaser?: AuditReport | null
): PayAiDecision {
  if (!aiResult.success) {
    return {
      action: "error",
      kind: classifyAiError(aiResult.error),
      error: aiResult.error,
    };
  }

  if (isEmptyAiReport(aiResult.report)) {
    return {
      action: "error",
      kind: "empty_extract",
      error: aiResult.fileErrors?.join("; ") || "AI scan returned no transactions",
    };
  }

  const report =
    aiResult.report.subscriptions.length > 0 &&
    localTeaser &&
    localTeaser.subscriptions.length > 0
      ? mergeSubscriptionReports(aiResult.report, localTeaser)
      : aiResult.report;

  return {
    action: "use_ai",
    report,
    failedFiles: fileNamesFromErrors(aiResult.fileErrors),
  };
}

export function scanErrorFromAi(
  kind: AiErrorKind,
  opts?: {
    failedFiles?: string[];
    warning?: string;
    showPasteInput?: boolean;
  }
): ScanUserError {
  const copy = AI_ERROR_COPY[kind] || AI_ERROR_COPY.generic;
  return {
    type: "file_error",
    message: copy.message,
    messageAr: copy.messageAr,
    details: copy.details,
    detailsAr: copy.detailsAr,
    suggestions: copy.suggestions,
    suggestionsAr: copy.suggestionsAr,
    showBankSelector: false,
    showPasteInput: opts?.showPasteInput ?? true,
    failedFiles: opts?.failedFiles || [],
    warnings: [opts?.warning || `ai_${kind}`],
  };
}

const AI_ERROR_COPY: Record<
  AiErrorKind,
  {
    message: string;
    messageAr: string;
    details: string;
    detailsAr: string;
    suggestions: string[];
    suggestionsAr: string[];
  }
> = {
  auth: {
    message: "AI scan is unavailable",
    messageAr: "فحص الذكاء الاصطناعي غير متاح",
    details:
      "The AI service rejected the request. We did not treat the free preview as a full report.",
    detailsAr:
      "خدمة الذكاء الاصطناعي رفضت الطلب. ما اعتبرنا المعاينة المجانية تقرير كامل.",
    suggestions: ["Try again in a minute", "Use CSV from your bank app if you can"],
    suggestionsAr: ["جرب بعد دقيقة", "استخدم CSV من تطبيق البنك إذا قدرت"],
  },
  rate_limit: {
    message: "Too many scans right now",
    messageAr: "في ضغط على الفحص الحين",
    details: "Wait a minute and retry. Your payment stays saved if you already paid.",
    detailsAr: "انتظر دقيقة وجرب. دفعتك تبقى محفوظة إذا دفعت.",
    suggestions: ["Retry in a minute"],
    suggestionsAr: ["جرب بعد دقيقة"],
  },
  llamaparse: {
    message: "Could not read this PDF",
    messageAr: "ما قدرنا نقرأ ملف PDF",
    details:
      "PDF text extraction failed. Try CSV from your bank app, or retry this file.",
    detailsAr: "استخراج نص PDF فشل. جرّب CSV من تطبيق البنك، أو أعد المحاولة.",
    suggestions: ["Download CSV instead of PDF", "Retry the same file"],
    suggestionsAr: ["نزّل CSV بدل PDF", "أعد محاولة نفس الملف"],
  },
  empty_extract: {
    message: "This PDF had no readable transactions",
    messageAr: "ملف PDF ما فيه عمليات نقدر نقرأها",
    details:
      "The scan finished but found no statement text. This is not an empty success. Try CSV.",
    detailsAr:
      "الفحص خلص بس ما لقينا نص كشف. هذا مو نجاح فاضي. جرّب CSV.",
    suggestions: ["Download CSV from your bank app", "Try another statement file"],
    suggestionsAr: ["نزّل CSV من تطبيق البنك", "جرب ملف كشف ثاني"],
  },
  timeout: {
    message: "The PDF scan timed out",
    messageAr: "فحص PDF أخذ وقت طويل وتوقف",
    details: "Stay on the page and retry. Large PDFs can take about a minute.",
    detailsAr: "ابقَ في الصفحة وجرب مرة ثانية. ملفات PDF الكبيرة تاخذ حوالي دقيقة.",
    suggestions: ["Retry the scan", "Use CSV if the PDF keeps timing out"],
    suggestionsAr: ["أعد الفحص", "استخدم CSV إذا PDF يكمل يتأخر"],
  },
  unavailable: {
    message: "AI scan is temporarily unavailable",
    messageAr: "فحص الذكاء الاصطناعي مو متاح حالياً",
    details: "Try again in a minute. We will not unblur a local preview as the AI report.",
    detailsAr: "جرب بعد دقيقة. ما راح نفتح المعاينة المحلية كأنها تقرير الذكاء الاصطناعي.",
    suggestions: ["Try again in a minute", "Use CSV if PDF fails"],
    suggestionsAr: ["جرب بعد دقيقة", "جرّب CSV لو PDF ما انقرأ"],
  },
  missing_files: {
    message: "Files left this session",
    messageAr: "الملفات اختفت من هالجلسة",
    details:
      "Your payment is saved. Upload the statements again, then tap Unlock. You will not pay again.",
    detailsAr:
      "دفعتك محفوظة. ارفع الكشوفات مرة ثانية، بعدين اضغط فتح. ما راح تدفع مرة ثانية.",
    suggestions: ["Upload the same files again", "Then tap Unlock"],
    suggestionsAr: ["ارفع نفس الملفات مرة ثانية", "بعدين اضغط فتح"],
  },
  generic: {
    message: "Could not finish the AI scan",
    messageAr: "ما قدرنا نكمل فحص الذكاء الاصطناعي",
    details:
      "Something went wrong on the AI path. We did not unblur the free preview as a full report.",
    detailsAr:
      "صار خطأ في مسار الذكاء الاصطناعي. ما فتحنا المعاينة المجانية كأنها التقرير الكامل.",
    suggestions: ["Retry the scan", "Try CSV if you uploaded a PDF"],
    suggestionsAr: ["أعد الفحص", "جرّب CSV إذا رفعت PDF"],
  },
};

function fileNamesFromErrors(errors?: string[]): string[] | undefined {
  if (!errors?.length) return undefined;
  const names = errors
    .map((e) => e.split(":")[0]?.trim() || "")
    .filter(Boolean);
  return names.length ? names : undefined;
}
