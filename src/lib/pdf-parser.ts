import { Transaction } from "./types";

/**
 * Parse a PDF bank statement into transactions.
 * Uses pdfjs-dist for client-side PDF text extraction.
 */
export async function parsePDF(file: File): Promise<Transaction[]> {
  const pdfjs = await import("pdfjs-dist");

  // Use the worker from public directory
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  const allLines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Group text items into rows by Y position
    const rows = new Map<number, { x: number; str: string }[]>();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      // Round Y to group items on the same line (within 5px tolerance)
      const y = Math.round(item.transform[5] / 5) * 5;
      const x = item.transform[4];
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y)!.push({ x, str: item.str.trim() });
    }

    // Sort rows top-to-bottom, items left-to-right
    const sortedYs = [...rows.keys()].sort((a, b) => b - a);
    for (const y of sortedYs) {
      const items = rows.get(y)!.sort((a, b) => a.x - b.x);
      const line = items.map((i) => i.str).join(" \t ");
      if (line.trim()) allLines.push(line);
    }
  }

  console.log(`[pdf-parser] Extracted ${allLines.length} lines from ${pdf.numPages} pages`);

  // Try structured extraction first
  let transactions = extractTransactions(allLines);

  // If structured extraction found very few, try fallback line-by-line
  if (transactions.length < 3) {
    console.log(`[pdf-parser] Structured extraction found only ${transactions.length}, trying fallback...`);
    const fallback = extractFallback(allLines);
    if (fallback.length > transactions.length) {
      transactions = fallback;
    }
  }

  console.log(`[pdf-parser] Final result: ${transactions.length} transactions`);
  return transactions;
}

// ─── Arabic-Indic numeral conversion ───
const ARABIC_DIGITS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

function normalizeDigits(str: string): string {
  return str.replace(/[٠-٩]/g, (d) => ARABIC_DIGITS[d] || d);
}

// ─── Date patterns ───
// DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD/MM/YY, DD.MM.YYYY
const DATE_SLASH = /\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/;
const DATE_ISO = /\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2}/;
// DD MMM YYYY or DD-MMM-YYYY (e.g. 15 Jan 2026, 15-Jan-26)
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

// ─── Amount patterns ───
// Matches: 1,234.56  1234.56  1,234.5  1234  1,234  234.00  -1,234.56
const AMOUNT_RE = /(?:^|[^.\d])(-?[\d,]{1,10}(?:\.\d{1,2})?)\s*(?:SAR|ريال|SR|د\.إ|AED)?(?:[^.\d]|$)/;

function findAmounts(str: string): number[] {
  const normalized = normalizeDigits(str);
  const results: number[] = [];
  // Find all number-like patterns
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

  // YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2}$/.test(cleaned)) {
    const [y, m, d] = cleaned.split(/[\/\-.]/);
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const m1 = cleaned.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m1) {
    return `${m1[3]}-${m1[2].padStart(2, "0")}-${m1[1].padStart(2, "0")}`;
  }

  // DD/MM/YY
  const m2 = cleaned.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})$/);
  if (m2) {
    const year = parseInt(m2[3]) > 50 ? `19${m2[3]}` : `20${m2[3]}`;
    return `${year}-${m2[2].padStart(2, "0")}-${m2[1].padStart(2, "0")}`;
  }

  // DD MMM YYYY or DD-MMM-YY
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

// ─── Header / junk line detection ───
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
];

function isJunkLine(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (lower.length < 3) return true;
  return SKIP_PATTERNS.some((p) => p.test(lower));
}

// ─── Main structured extraction ───
function extractTransactions(lines: string[]): Transaction[] {
  const transactions: Transaction[] = [];

  for (const line of lines) {
    // Split by tab separator (from PDF text extraction)
    const parts = line.split("\t").map((p) => p.trim()).filter(Boolean);
    const fullLine = normalizeDigits(parts.join(" "));

    // Find a date anywhere in the line
    const dateStr = findDate(fullLine);
    if (!dateStr) continue;

    // Find amounts in the line (excluding the date portion)
    const lineWithoutDate = fullLine.replace(dateStr, " ");
    const amounts = findAmounts(lineWithoutDate);
    if (amounts.length === 0) continue;

    // Build description: everything that's not the date or a pure number
    let description = "";
    for (const part of parts) {
      const normalized = normalizeDigits(part.trim());
      // Skip if this part IS the date
      if (findDate(normalized)) continue;
      // Skip if this part is purely a number (amount)
      if (/^-?[\d,]+(?:\.\d{1,2})?$/.test(normalized.replace(/\s/g, ""))) continue;
      // Skip currency labels
      if (/^(?:SAR|ريال|SR|د\.إ|AED)$/i.test(normalized)) continue;
      if (normalized.length >= 2) {
        description += (description ? " " : "") + part.trim();
      }
    }

    description = description.replace(/\s+/g, " ").trim();

    // Skip header/junk lines
    if (!description || isJunkLine(description)) continue;

    // Use the first reasonable amount
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

// ─── Fallback: try to parse each line as a whole ───
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

    // Everything between the date and the first number = description
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
