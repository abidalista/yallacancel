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
      // Round Y to group items on the same line (within 3px)
      const y = Math.round(item.transform[5] / 3) * 3;
      const x = item.transform[4];
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y)!.push({ x, str: item.str.trim() });
    }

    // Sort rows top-to-bottom, items left-to-right
    const sortedYs = [...rows.keys()].sort((a, b) => b - a);
    for (const y of sortedYs) {
      const items = rows.get(y)!.sort((a, b) => a.x - b.x);
      const line = items.map((i) => i.str).join(" | ");
      if (line.trim()) allLines.push(line);
    }
  }

  return extractTransactions(allLines);
}

// Date patterns: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD/MM/YY
const DATE_RE =
  /(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/;

// Amount: numbers with optional commas and decimals, optional SAR/ر.س
const AMOUNT_RE = /[\d,]+\.\d{2}/;

function parseDate(dateStr: string): string {
  const cleaned = dateStr.trim();

  // YYYY-MM-DD
  if (/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(cleaned)) {
    const [y, m, d] = cleaned.split(/[\/\-]/);
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const m1 = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m1) {
    return `${m1[3]}-${m1[2].padStart(2, "0")}-${m1[1].padStart(2, "0")}`;
  }

  // DD/MM/YY
  const m2 = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/);
  if (m2) {
    const year = parseInt(m2[3]) > 50 ? `19${m2[3]}` : `20${m2[3]}`;
    return `${year}-${m2[2].padStart(2, "0")}-${m2[1].padStart(2, "0")}`;
  }

  return cleaned;
}

function parseAmount(str: string): number {
  const cleaned = str.replace(/[^\d.,-]/g, "").replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.abs(num);
}

function extractTransactions(lines: string[]): Transaction[] {
  const transactions: Transaction[] = [];

  for (const line of lines) {
    // Split by | (our column separator from PDF text extraction)
    const parts = line.split("|").map((p) => p.trim());

    // Find a date in the line
    let dateStr = "";
    let datePartIdx = -1;
    for (let i = 0; i < parts.length; i++) {
      const match = parts[i].match(DATE_RE);
      if (match) {
        dateStr = match[0];
        datePartIdx = i;
        break;
      }
    }
    if (!dateStr) continue;

    // Find amounts in the line
    const amounts: { value: number; idx: number }[] = [];
    for (let i = 0; i < parts.length; i++) {
      if (i === datePartIdx) continue;
      const match = parts[i].match(AMOUNT_RE);
      if (match) {
        amounts.push({ value: parseAmount(match[0]), idx: i });
      }
    }
    if (amounts.length === 0) continue;

    // Description = parts that are not date and not amount
    const descParts = parts.filter((_, i) => {
      if (i === datePartIdx) return false;
      if (amounts.some((a) => a.idx === i)) return false;
      return true;
    });
    const description = descParts
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    // Skip lines with no real description
    if (!description || description.length < 2) continue;

    // Skip header-like lines
    const lower = description.toLowerCase();
    if (
      lower.includes("opening balance") ||
      lower.includes("closing balance") ||
      lower.includes("رصيد افتتاحي") ||
      lower.includes("رصيد ختامي") ||
      lower === "date" ||
      lower === "التاريخ" ||
      lower === "description" ||
      lower === "الوصف"
    )
      continue;

    // Use the first amount as the transaction amount (usually debit)
    const amount = amounts[0].value;
    if (amount === 0) continue;

    transactions.push({
      date: parseDate(dateStr),
      description,
      amount,
    });
  }

  return transactions;
}
