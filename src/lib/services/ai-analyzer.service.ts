/**
 * Client-side AI analysis — calls /api/parse-pdf and maps to AuditReport.
 */

import {
  Transaction,
  Subscription,
  AuditReport,
  SubscriptionFrequency,
} from "../types";
import { getCancelInfo } from "../cancel-db";

export interface ClaudeAnalysisResult {
  success: true;
  report: AuditReport;
  parseMethod: "claude_ai";
}

export interface ClaudeAnalysisError {
  success: false;
  error: string;
}

export type AIAnalysisResult = ClaudeAnalysisResult | ClaudeAnalysisError;

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

export async function analyzeFilesWithAI(
  files: File[],
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<AIAnalysisResult> {
  const reports: AuditReport[] = [];
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i + 1, files.length, file.name);
    const result = await analyzeFileWithAI(file);
    if (result.success) {
      reports.push(result.report);
    } else {
      errors.push(`${file.name}: ${result.error}`);
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
        existing.monthlyEquivalent = sub.monthlyEquivalent;
        existing.yearlyEquivalent = sub.yearlyEquivalent;
      }
      existing.transactions = [...existing.transactions, ...sub.transactions].slice(0, 12);
    }
  }

  const subscriptions = [...byName.values()]
    .sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent)
    .map((sub, i) => ({ ...sub, id: `sub_${i + 1}` }));

  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.monthlyEquivalent, 0);
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

function transformClaudeResponse(data: Record<string, unknown>): AuditReport {
  const subs = (data.subscriptions || []) as Array<Record<string, unknown>>;
  const subscriptions: Subscription[] = [];
  let idCounter = 0;

  for (const sub of subs) {
    const name = String(sub.name || "Unknown");
    const amount = Number(sub.amount) || 0;
    const frequency = normalizeFrequency(String(sub.frequency || "monthly"));
    const occurrences = Number(sub.occurrences) || 1;
    const monthlyEquivalent = calculateMonthly(amount, frequency);

    subscriptions.push({
      id: `sub_${++idCounter}`,
      name,
      normalizedName: name.toLowerCase(),
      amount: Math.round(amount * 100) / 100,
      frequency,
      monthlyEquivalent: Math.round(monthlyEquivalent * 100) / 100,
      yearlyEquivalent: Math.round(monthlyEquivalent * 12 * 100) / 100,
      occurrences,
      lastCharge: String(sub.last_date || ""),
      firstCharge: String(sub.first_date || ""),
      status: "investigate",
      confidence: "confirmed",
      aiDescription: sub.category ? String(sub.category) : undefined,
      rawDescription: String(sub.raw_description || name),
      transactions: buildFakeTransactions(sub),
    });
  }

  subscriptions.sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent);

  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.monthlyEquivalent, 0);
  const period = data.statement_period as Record<string, string> | undefined;

  return {
    subscriptions,
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    totalYearly: Math.round(totalMonthly * 12 * 100) / 100,
    potentialMonthlySavings: 0,
    potentialYearlySavings: 0,
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

function buildFakeTransactions(sub: Record<string, unknown>): Transaction[] {
  const txs: Transaction[] = [];
  const occurrences = Number(sub.occurrences) || 1;
  const amount = Number(sub.amount) || 0;
  const name = String(sub.raw_description || sub.name || "");

  for (let i = 0; i < Math.min(occurrences, 6); i++) {
    txs.push({
      date: i === 0 ? String(sub.last_date || "") : String(sub.first_date || ""),
      description: name,
      amount,
    });
  }

  return txs;
}
