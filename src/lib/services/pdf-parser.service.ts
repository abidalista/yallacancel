/**
 * PDF Parser Service
 * Sends PDF/CSV to server-side Claude API for subscription analysis.
 * Falls back to client-side pdfjs + old analyzer if API fails.
 */

import { Transaction, Subscription, AuditReport, SubscriptionFrequency } from "../types";
import { getCancelInfo } from "../cancel-db";

export interface PDFParseResult {
  transactions: Transaction[];
  pageCount: number;
  lineCount: number;
  parseMethod: "llamaparse" | "pdfjs_fallback";
  warnings: string[];
}

// New: Claude returns subscriptions directly
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

// ── Main: send file to Claude API for full analysis ──

export async function analyzeFileWithAI(file: File): Promise<AIAnalysisResult> {
  console.log("[ai-parser] Analyzing:", file.name, "size:", file.size);

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/parse-pdf", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[ai-parser] API error:", res.status, errText);
      return { success: false, error: `API error ${res.status}: ${errText}` };
    }

    const data = await res.json();
    console.log("[ai-parser] Claude response:", JSON.stringify(data).slice(0, 500));

    if (data.error) {
      return { success: false, error: data.error };
    }

    // Transform Claude's response into our AuditReport format
    const report = transformClaudeResponse(data);
    return { success: true, report, parseMethod: "claude_ai" };
  } catch (err) {
    console.error("[ai-parser] Failed:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ── Transform Claude's JSON into our AuditReport ──

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

    // Check our cancel database
    const cancelInfo = getCancelInfo(name);

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
    case "weekly": return amount * 4.33;
    case "monthly": return amount;
    case "quarterly": return amount / 3;
    case "yearly": return amount / 12;
  }
}

function buildFakeTransactions(sub: Record<string, unknown>): Transaction[] {
  // Build minimal transaction records for the UI
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

// ── Legacy exports (still used as fallback) ──

export async function parsePDF(file: File): Promise<Transaction[]> {
  const result = await parsePDFRobust(file);
  return result.transactions;
}

export async function parsePDFRobust(file: File): Promise<PDFParseResult> {
  console.log("[pdf-parser] Fallback parse for:", file.name);

  try {
    const transactions = await parsePDFClientSide(file);
    return {
      transactions,
      pageCount: 0,
      lineCount: 0,
      parseMethod: "pdfjs_fallback",
      warnings: [],
    };
  } catch (err) {
    console.error("[pdf-parser] pdfjs failed:", err);
    return {
      transactions: [],
      pageCount: 0,
      lineCount: 0,
      parseMethod: "pdfjs_fallback",
      warnings: ["pdfjs_failed"],
    };
  }
}

// ── Fallback: client-side pdfjs extraction ──

async function parsePDFClientSide(file: File): Promise<Transaction[]> {
  const pdfjs = await import("pdfjs-dist");

  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const allLines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const rows = new Map<number, { x: number; str: string }[]>();

      for (const item of content.items) {
        if (!("str" in item) || !item.str.trim()) continue;
        const y = Math.round(item.transform[5] / 5) * 5;
        const x = item.transform[4];
        if (!rows.has(y)) rows.set(y, []);
        rows.get(y)!.push({ x, str: item.str.trim() });
      }

      const sortedYs = [...rows.keys()].sort((a, b) => b - a);
      for (const y of sortedYs) {
        const items = rows.get(y)!.sort((a, b) => a.x - b.x);
        const line = items.map((item) => item.str).join(" \t ");
        if (line.trim()) allLines.push(line);
      }
    } catch {
      // skip failed pages
    }
  }

  return extractFromRawLines(allLines);
}

function extractFromRawLines(lines: string[]): Transaction[] {
  const transactions: Transaction[] = [];

  const DATE_RE = /(?:\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i;

  const SKIP = [
    /opening\s*balance/i, /closing\s*balance/i, /^date$/i,
    /statement/i, /account\s*number/i, /iban/i, /^card:/i,
    /^to:\s/i, /^from:\s/i, /^reference:/i, /revolut\s*bank/i,
    /page\s*\d+/i, /deposit\s*guarantee/i,
  ];

  function stripCurrency(s: string): string {
    return s
      .replace(/[€$£¥₹₩₺₽﷼]/g, "")
      .replace(/ر\.س|د\.إ|ر\.ع/g, "")
      .replace(/\b(?:SAR|SR|AED|EUR|USD|GBP|PLN|HUF|CZK)\b/gi, "");
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length < 10) continue;
    if (SKIP.some((p) => p.test(line))) continue;

    const dateMatch = line.match(DATE_RE);
    if (!dateMatch) continue;

    const afterDate = stripCurrency(line.replace(dateMatch[0], " "));
    const amounts: number[] = [];
    const amountRe = /(-?[\d,]+(?:\.\d{1,2})?)/g;
    let m;
    while ((m = amountRe.exec(afterDate)) !== null) {
      const num = parseFloat(m[1].replace(/,/g, ""));
      if (!isNaN(num) && num >= 0.5 && num < 10_000_000) amounts.push(num);
    }

    if (amounts.length === 0) continue;

    let desc = afterDate
      .replace(/-?[\d,]+(?:\.\d{1,2})?/g, " ")
      .replace(/\t/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!desc || desc.length < 2) continue;

    transactions.push({
      date: dateMatch[0],
      description: desc,
      amount: amounts[0],
    });
  }

  return transactions;
}
