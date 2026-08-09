/**
 * Client-side AI analysis — calls /api/parse-pdf and maps to AuditReport.
 */

import { toSar } from "../fx";
import {
  Transaction,
  Subscription,
  AuditReport,
  SubscriptionFrequency,
} from "../types";

export interface ClaudeAnalysisResult {
  success: true;
  report: AuditReport;
  parseMethod: "claude_ai";
  /** Filenames that could not be read server-side (partial scan) */
  fileErrors?: string[];
}

export interface ClaudeAnalysisError {
  success: false;
  error: string;
}

export type AIAnalysisResult = ClaudeAnalysisResult | ClaudeAnalysisError;

/** Swap PDFs for in-browser extracted text — avoids LlamaParse timeout on Cloudflare (~30s limit) */
export function buildServerUploadFiles(
  files: File[],
  pdfTexts: Record<string, string>
): File[] {
  return files.map((file) => {
    if (!/\.pdf$/i.test(file.name)) return file;
    const text = pdfTexts[file.name]?.trim();
    if (!text || text.length < 50) return file;
    const txtName = file.name.replace(/\.pdf$/i, ".extracted.txt");
    return new File([text], txtName, { type: "text/plain" });
  });
}

export async function analyzeFileWithAI(file: File): Promise<AIAnalysisResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/parse-pdf", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `API error ${res.status}: ${errText}` };
    }

    const data = await res.json();
    if (data.error) {
      return { success: false, error: data.error };
    }

    const report = transformClaudeResponse(data);
    return { success: true, report, parseMethod: "claude_ai" };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * One skill-grade Claude call for all statement files (prompt-cached system).
 * tier "teaser" → cheap Haiku model (free scan fallback); "full" → Sonnet (paid).
 */
export async function analyzeStatementsWithAI(
  files: File[],
  tier: "teaser" | "full" = "full"
): Promise<AIAnalysisResult> {
  try {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    formData.append("tier", tier);

    const res = await fetch("/api/analyze-statements", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `API error ${res.status}: ${errText}` };
    }

    const data = await res.json();
    if (data.error) {
      return { success: false, error: String(data.error) };
    }

    const fileErrors = Array.isArray(data._file_errors)
      ? (data._file_errors as string[])
      : undefined;

    const report = transformClaudeResponse(data);
    return { success: true, report, parseMethod: "claude_ai", fileErrors };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function analyzeFilesWithAI(
  files: File[],
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<AIAnalysisResult> {
  // Prefer single combined skill-grade call (no per-file progress)
  if (!onProgress) {
    return analyzeStatementsWithAI(files);
  }

  const reports: AuditReport[] = [];
  const errors: string[] = [];
  let completed = 0;

  const concurrency = 2;
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (file, batchIdx) => {
        onProgress?.(
          Math.min(i + batchIdx + 1, files.length),
          files.length,
          file.name
        );
        return { file, result: await analyzeFileWithAI(file) };
      })
    );

    for (const { file, result } of results) {
      completed += 1;
      onProgress?.(completed, files.length, file.name);
      if (result.success) {
        reports.push(result.report);
      } else {
        errors.push(`${file.name}: ${result.error}`);
      }
    }
  }

  if (reports.length === 0) {
    return {
      success: false,
      error: errors.join("; ") || "No files could be analyzed",
    };
  }

  const report = reports.length === 1 ? reports[0] : mergeAuditReports(reports);
  return { success: true, report, parseMethod: "claude_ai" };
}

/** Merge local + Claude reports — union by name, keep higher monthlySar */
export function mergeSubscriptionReports(
  primary: AuditReport,
  secondary: AuditReport | null | undefined
): AuditReport {
  if (!secondary || secondary.subscriptions.length === 0) return primary;
  if (primary.subscriptions.length === 0) return secondary;
  return mergeAuditReports([primary, secondary]);
}

function mergeAuditReports(reports: AuditReport[]): AuditReport {
  const byName = new Map<string, Subscription>();

  for (const report of reports) {
    for (const sub of report.subscriptions) {
      const key = sub.normalizedName || sub.name.toLowerCase();
      const existing = byName.get(key);
      if (!existing) {
        byName.set(key, { ...sub, transactions: [...sub.transactions] });
        continue;
      }

      existing.occurrences += sub.occurrences;
      if (sub.firstCharge && (!existing.firstCharge || sub.firstCharge < existing.firstCharge)) {
        existing.firstCharge = sub.firstCharge;
      }
      if (sub.lastCharge && (!existing.lastCharge || sub.lastCharge > existing.lastCharge)) {
        existing.lastCharge = sub.lastCharge;
        existing.amount = sub.amount;
        existing.currency = sub.currency;
        existing.monthlyEquivalent = sub.monthlyEquivalent;
        existing.yearlyEquivalent = sub.yearlyEquivalent;
        existing.monthlySar = sub.monthlySar;
      }
      existing.transactions = [...existing.transactions, ...sub.transactions].slice(0, 12);
    }
  }

  const subscriptions = [...byName.values()]
    .sort((a, b) => b.monthlySar - a.monthlySar)
    .map((sub, i) => ({ ...sub, id: `sub_${i + 1}` }));

  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.monthlySar, 0);
  const dateFrom =
    reports.map((r) => r.dateRange.from).filter(Boolean).sort()[0] || "";
  const dateTo =
    reports.map((r) => r.dateRange.to).filter(Boolean).sort().reverse()[0] || "";

  return {
    subscriptions,
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    totalYearly: Math.round(totalMonthly * 12 * 100) / 100,
    potentialMonthlySavings: 0,
    potentialYearlySavings: 0,
    analyzedTransactions: reports.reduce((sum, r) => sum + r.analyzedTransactions, 0),
    dateRange: { from: dateFrom, to: dateTo },
  };
}

/** Known monthly services — OK to keep even with 1 charge in a short window */
const KNOWN_MONTHLY_BRANDS =
  /netflix|spotify|apple|icloud|chatgpt|claude|anthropic|openai|youtube premium|disney|hbo|amazon prime|microsoft|office 365|adobe|linkedin|shahid|anghami|canva|notion|cursor|grammarly|perplexity|midjourney|lovable|clueso/i;

/** Pay-per-use / day-pass — drop if only charged once */
const PAY_PER_USE_MERCHANTS =
  /playtomic|wework|we work|bolt|wolt|cityfit|etsy|namecheap/i;

function shouldDropOneOffSub(
  name: string,
  rawDescription: string,
  occurrences: number,
  category: string
): boolean {
  if (occurrences >= 2) return false;
  const hay = `${name} ${rawDescription}`.toLowerCase();
  if (KNOWN_MONTHLY_BRANDS.test(hay)) return false;
  if (PAY_PER_USE_MERCHANTS.test(hay)) return true;
  if (
    occurrences === 1 &&
    /fitness|coworking|food_delivery|shopping/.test(category.toLowerCase())
  ) {
    return true;
  }
  return false;
}

function transformClaudeResponse(data: Record<string, unknown>): AuditReport {
  const subs = (data.subscriptions || []) as Array<Record<string, unknown>>;
  const subscriptions: Subscription[] = [];
  let idCounter = 0;

  for (const sub of subs) {
    const name = String(sub.name || "Unknown");
    const rawDescription = String(sub.raw_description || name);
    const category = String(sub.category || "");
    const occurrences = Number(sub.occurrences) || 1;

    if (shouldDropOneOffSub(name, rawDescription, occurrences, category)) {
      continue;
    }
    const originalAmount =
      sub.original_amount != null ? Number(sub.original_amount) : undefined;
    const originalCurrency = (
      sub.original_currency != null ? String(sub.original_currency) : "SAR"
    ).toUpperCase();
    const rawSar = Number(sub.amount) || 0;
    const frequency = normalizeFrequency(String(sub.frequency || "monthly"));

    const nativeCharge =
      originalAmount != null && Number.isFinite(originalAmount)
        ? originalAmount
        : originalCurrency === "SAR"
          ? rawSar
          : rawSar;
    const currency =
      originalAmount != null && originalCurrency
        ? originalCurrency
        : "SAR";

    const monthlyNative = calculateMonthly(nativeCharge, frequency);
    const monthlySar =
      currency === "SAR"
        ? monthlyNative
        : toSar(monthlyNative, currency) ||
          (rawSar > 0 ? calculateMonthly(rawSar, frequency) : toSar(monthlyNative, currency));

    const confidenceRaw = String(sub.confidence || "confirmed").toLowerCase();
    const confidence =
      confidenceRaw.includes("suspect") || confidenceRaw.includes("unsure")
        ? ("suspicious" as const)
        : ("confirmed" as const);
    const reason =
      sub.reason != null
        ? String(sub.reason)
        : sub.category
          ? String(sub.category)
          : undefined;

    const verdictRaw = String(sub.verdict || "investigate").toLowerCase();
    const status =
      verdictRaw.includes("cancel")
        ? ("cancel" as const)
        : verdictRaw.includes("keep")
          ? ("keep" as const)
          : ("investigate" as const);

    subscriptions.push({
      id: `sub_${++idCounter}`,
      name,
      normalizedName: name.toLowerCase(),
      amount: Math.round(nativeCharge * 100) / 100,
      currency,
      frequency,
      monthlyEquivalent: Math.round(monthlyNative * 100) / 100,
      yearlyEquivalent: Math.round(monthlyNative * 12 * 100) / 100,
      monthlySar: Math.round(monthlySar * 100) / 100,
      occurrences,
      lastCharge: String(sub.last_date || ""),
      firstCharge: String(sub.first_date || ""),
      status,
      confidence,
      aiDescription: reason,
      rawDescription,
      transactions: buildFakeTransactions(sub, nativeCharge, currency),
    });
  }

  subscriptions.sort((a, b) => b.monthlySar - a.monthlySar);

  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.monthlySar, 0);
  const period = data.statement_period as Record<string, string> | undefined;
  const savingsOnTable = Number(data.savings_on_the_table_yearly) || 0;

  return {
    subscriptions,
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    totalYearly: Math.round(totalMonthly * 12 * 100) / 100,
    potentialMonthlySavings: Math.round((savingsOnTable / 12) * 100) / 100,
    potentialYearlySavings: Math.round(savingsOnTable * 100) / 100,
    analyzedTransactions: Number(data.total_transactions_analyzed) || 0,
    dateRange: {
      from: period?.from || "",
      to: period?.to || "",
    },
  };
}

function normalizeFrequency(freq: string): SubscriptionFrequency {
  const f = freq.toLowerCase();
  if (f.includes("week")) return "weekly";
  if (f.includes("quarter")) return "quarterly";
  if (f.includes("year") || f.includes("annual")) return "yearly";
  return "monthly";
}

function calculateMonthly(amount: number, frequency: SubscriptionFrequency): number {
  switch (frequency) {
    case "weekly":
      return amount * 4.33;
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "yearly":
      return amount / 12;
  }
}

function buildFakeTransactions(
  sub: Record<string, unknown>,
  amount: number,
  currency: string
): Transaction[] {
  const txs: Transaction[] = [];
  const occurrences = Number(sub.occurrences) || 1;
  const name = String(sub.raw_description || sub.name || "");

  for (let i = 0; i < Math.min(occurrences, 6); i++) {
    txs.push({
      date: i === 0 ? String(sub.last_date || "") : String(sub.first_date || ""),
      description: name,
      amount,
      currency,
    });
  }

  return txs;
}
