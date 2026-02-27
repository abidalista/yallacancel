/**
 * PDF Parser Service
 * Isolated service for parsing PDF bank statements.
 * Uses pdfjs-dist for client-side text extraction.
 */

import { Transaction } from "../types";

export interface PDFParseResult {
  transactions: Transaction[];
  pageCount: number;
  lineCount: number;
  parseMethod: "structured" | "fallback" | "aggressive";
  warnings: string[];
}

// ── Arabic-Indic numeral conversion ──

const ARABIC_DIGITS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

function normalizeDigits(str: string): string {
  return str.replace(/[٠-٩]/g, (d) => ARABIC_DIGITS[d] || d);
}

// ── Date patterns ──

const DATE_SLASH = /\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/;
const DATE_ISO = /\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2}/;
const DATE_NAMED = /\d{1,2}[\s\-](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\-]\d{2,4}/i;

function findDate(str: string): string | null {
  const normalized = normalizeDigits(str);
  let m = normalized.match(DATE_ISO);
  if (m) return m[0];
  m = normalized.match(DATE_NAMED);
  if (m) return m[0];
  m = normalized.match(DATE_SLASH);
  if (m) return m[0];
  return null;
}

// ── Amount patterns ──

function findAmounts(str: string): number[] {
  const normalized = normalizeDigits(str);
  const results: number[] = [];
  const re = /(-?[\d,]+(?:\.\d{1,2})?)/g;
  let match;
  while ((match = re.exec(normalized)) !== null) {
    const raw = match[1].replace(/,/g, "");
    const num = parseFloat(raw);
    if (!isNaN(num) && Math.abs(num) >= 0.5 && Math.abs(num) < 10_000_000) {
      results.push(Math.abs(num));
    }
  }
  return results;
}

function parseDate(dateStr: string): string {
  const cleaned = normalizeDigits(dateStr.trim());

  if (/^\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2}$/.test(cleaned)) {
    const [y, m, d] = cleaned.split(/[\/\-.]/);
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const m1 = cleaned.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m1) {
    return `${m1[3]}-${m1[2].padStart(2, "0")}-${m1[1].padStart(2, "0")}`;
  }

  const m2 = cleaned.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})$/);
  if (m2) {
    const year = parseInt(m2[3]) > 50 ? `19${m2[3]}` : `20${m2[3]}`;
    return `${year}-${m2[2].padStart(2, "0")}-${m2[1].padStart(2, "0")}`;
  }

  const MONTHS: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };
  const m3 = cleaned.match(/^(\d{1,2})[\s\-]([A-Za-z]+)[\s\-](\d{2,4})$/);
  if (m3) {
    const monthKey = m3[2].toLowerCase().slice(0, 3);
    const month = MONTHS[monthKey];
    if (month) {
      const year = m3[3].length === 2
        ? (parseInt(m3[3]) > 50 ? `19${m3[3]}` : `20${m3[3]}`)
        : m3[3];
      return `${year}-${month}-${m3[1].padStart(2, "0")}`;
    }
  }

  return cleaned;
}

// ── Header / junk line detection ──

const SKIP_PATTERNS = [
  /opening\s*balance/i,
  /closing\s*balance/i,
  /رصيد\s*افتتاحي/,
  /رصيد\s*ختامي/,
  /^date$/i,
  /^التاريخ$/,
  /^description$/i,
  /^الوصف$/,
  /^transaction\s*date/i,
  /^value\s*date/i,
  /^debit$/i,
  /^credit$/i,
  /^balance$/i,
  /^الرصيد$/,
  /^المبلغ$/,
  /page\s*\d+\s*of\s*\d+/i,
  /statement\s*of\s*account/i,
  /كشف\s*حساب/,
  /account\s*number/i,
  /رقم\s*الحساب/,
  /^total$/i,
  /^المجموع$/,
  /branch/i,
  /iban/i,
  /customer\s*name/i,
  /اسم\s*العميل/,
  /currency/i,
  /العملة/,
  /^sr\s*no\.?$/i,
  /^s\.?no\.?$/i,
  /^#$/,
];

function isJunkLine(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (lower.length < 3) return true;
  return SKIP_PATTERNS.some((p) => p.test(lower));
}

// ── Main structured extraction ──

function extractTransactions(lines: string[]): Transaction[] {
  const transactions: Transaction[] = [];

  for (const line of lines) {
    const parts = line.split("\t").map((p) => p.trim()).filter(Boolean);
    const fullLine = normalizeDigits(parts.join(" "));

    const dateStr = findDate(fullLine);
    if (!dateStr) continue;

    const lineWithoutDate = fullLine.replace(dateStr, " ");
    const amounts = findAmounts(lineWithoutDate);
    if (amounts.length === 0) continue;

    let description = "";
    for (const part of parts) {
      const normalized = normalizeDigits(part.trim());
      if (findDate(normalized)) continue;
      if (/^-?[\d,]+(?:\.\d{1,2})?$/.test(normalized.replace(/\s/g, ""))) continue;
      if (/^(?:SAR|ريال|SR|د\.إ|AED)$/i.test(normalized)) continue;
      if (normalized.length >= 2) {
        description += (description ? " " : "") + part.trim();
      }
    }

    description = description.replace(/\s+/g, " ").trim();
    if (!description || isJunkLine(description)) continue;

    const amount = amounts[0];
    if (amount < 0.5) continue;

    transactions.push({
      date: parseDate(dateStr),
      description,
      amount,
    });
  }

  return transactions;
}

// ── Fallback extraction ──

function extractFallback(lines: string[]): Transaction[] {
  const transactions: Transaction[] = [];

  for (const rawLine of lines) {
    const line = normalizeDigits(rawLine);
    if (line.length < 10) continue;
    if (isJunkLine(line)) continue;

    const dateStr = findDate(line);
    if (!dateStr) continue;

    const amounts = findAmounts(line.replace(dateStr, " "));
    if (amounts.length === 0) continue;

    const dateIdx = line.indexOf(dateStr);
    let desc = line
      .slice(dateIdx + dateStr.length)
      .replace(/\t/g, " ")
      .replace(/-?[\d,]+(?:\.\d{1,2})?/g, " ")
      .replace(/(?:SAR|ريال|SR)/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!desc || desc.length < 2 || isJunkLine(desc)) continue;

    transactions.push({
      date: parseDate(dateStr),
      description: desc,
      amount: amounts[0],
    });
  }

  return transactions;
}

// ── Aggressive extraction ──

function extractAggressive(lines: string[]): Transaction[] {
  const transactions: Transaction[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line1 = normalizeDigits(lines[i]);
    if (isJunkLine(line1)) continue;

    const dateStr = findDate(line1);
    if (!dateStr) continue;

    // Try single line first
    const amounts1 = findAmounts(line1.replace(dateStr, " "));
    if (amounts1.length > 0) {
      let desc = line1
        .replace(dateStr, " ")
        .replace(/\t/g, " ")
        .replace(/-?[\d,]+(?:\.\d{1,2})?/g, " ")
        .replace(/(?:SAR|ريال|SR)/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (desc && desc.length >= 2 && !isJunkLine(desc)) {
        transactions.push({
          date: parseDate(dateStr),
          description: desc,
          amount: amounts1[0],
        });
        continue;
      }
    }

    // Try combining with next line
    if (i + 1 < lines.length) {
      const line2 = normalizeDigits(lines[i + 1]);
      const combined = line1 + " " + line2;
      const amountsCombined = findAmounts(combined.replace(dateStr, " "));
      if (amountsCombined.length > 0) {
        let desc = combined
          .replace(dateStr, " ")
          .replace(/\t/g, " ")
          .replace(/-?[\d,]+(?:\.\d{1,2})?/g, " ")
          .replace(/(?:SAR|ريال|SR)/gi, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (desc && desc.length >= 2 && !isJunkLine(desc)) {
          transactions.push({
            date: parseDate(dateStr),
            description: desc,
            amount: amountsCombined[0],
          });
          i++;
          continue;
        }
      }

      // Try combining with next 2 lines
      if (i + 2 < lines.length) {
        const line3 = normalizeDigits(lines[i + 2]);
        const combined3 = line1 + " " + line2 + " " + line3;
        const amounts3 = findAmounts(combined3.replace(dateStr, " "));
        if (amounts3.length > 0) {
          let desc = combined3
            .replace(dateStr, " ")
            .replace(/\t/g, " ")
            .replace(/-?[\d,]+(?:\.\d{1,2})?/g, " ")
            .replace(/(?:SAR|ريال|SR)/gi, " ")
            .replace(/\s+/g, " ")
            .trim();
          if (desc && desc.length >= 2 && !isJunkLine(desc)) {
            transactions.push({
              date: parseDate(dateStr),
              description: desc,
              amount: amounts3[0],
            });
            i += 2;
            continue;
          }
        }
      }
    }
  }

  return transactions;
}

// ── Public API ──

export async function parsePDF(file: File): Promise<Transaction[]> {
  const result = await parsePDFRobust(file);
  return result.transactions;
}

export async function parsePDFRobust(file: File): Promise<PDFParseResult> {
  const pdfjs = await import("pdfjs-dist");

  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();

  let pdf;
  try {
    pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  } catch (err) {
    console.error("[pdf-parser] Failed to open PDF:", err);
    return {
      transactions: [],
      pageCount: 0,
      lineCount: 0,
      parseMethod: "structured",
      warnings: ["pdf_open_failed"],
    };
  }

  const allLines: string[] = [];
  const warnings: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const rows = new Map<number, { x: number; str: string }[]>();
      const fontSizes: number[] = [];

      for (const item of content.items) {
        if (!("str" in item) || !item.str.trim()) continue;
        if ("height" in item && item.height > 0) {
          fontSizes.push(item.height);
        }
      }

      let avgFontSize = 12;
      if (fontSizes.length > 0) {
        avgFontSize = fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length;
      }

      const yTolerance = Math.max(3, Math.min(8, Math.round(avgFontSize / 2)));

      for (const item of content.items) {
        if (!("str" in item) || !item.str.trim()) continue;
        const y = Math.round(item.transform[5] / yTolerance) * yTolerance;
        const x = item.transform[4];
        if (!rows.has(y)) rows.set(y, []);
        rows.get(y)!.push({ x, str: item.str.trim() });
      }

      const sortedYs = [...rows.keys()].sort((a, b) => b - a);
      for (const y of sortedYs) {
        const items = rows.get(y)!.sort((a, b) => a.x - b.x);
        const line = items.map((i) => i.str).join(" \t ");
        if (line.trim()) allLines.push(line);
      }
    } catch (err) {
      console.error(`[pdf-parser] Failed to parse page ${i}:`, err);
      warnings.push(`page_${i}_failed`);
    }
  }

  if (allLines.length === 0) {
    return {
      transactions: [],
      pageCount: pdf.numPages,
      lineCount: 0,
      parseMethod: "structured",
      warnings: [...warnings, "no_text_extracted"],
    };
  }

  // Strategy 1: Structured
  let transactions = extractTransactions(allLines);
  let method: PDFParseResult["parseMethod"] = "structured";

  // Strategy 2: Fallback
  if (transactions.length < 3) {
    const fallback = extractFallback(allLines);
    if (fallback.length > transactions.length) {
      transactions = fallback;
      method = "fallback";
    }
  }

  // Strategy 3: Aggressive
  if (transactions.length < 3) {
    const aggressive = extractAggressive(allLines);
    if (aggressive.length > transactions.length) {
      transactions = aggressive;
      method = "aggressive";
    }
  }

  if (transactions.length === 0) {
    warnings.push("no_transactions_found");
  }

  return {
    transactions,
    pageCount: pdf.numPages,
    lineCount: allLines.length,
    parseMethod: method,
    warnings,
  };
}
