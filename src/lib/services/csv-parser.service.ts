/**
 * CSV Parser Service
 * Isolated service for parsing bank CSV statements.
 * Supports all Saudi banks + generic formats.
 */

import { BankId, Transaction } from "../types";

interface BankConfig {
  id: BankId;
  dateColumn: string[];
  descriptionColumn: string[];
  amountColumn: string[];
  debitColumn?: string[];
  creditColumn?: string[];
  dateFormats: string[];
  delimiter: string;
}

export interface CSVParseResult {
  transactions: Transaction[];
  bankId: BankId;
  parseMethod: "csv-headers" | "csv-headerless" | "csv-fallback";
  warnings: string[];
  rawLineCount: number;
}

// ── Bank configurations ──

const bankConfigs: Record<BankId, BankConfig> = {
  alrajhi: {
    id: "alrajhi",
    dateColumn: ["Date", "التاريخ", "Transaction Date", "تاريخ العملية", "Txn Date", "تاريخ المعاملة"],
    descriptionColumn: [
      "Description", "الوصف", "Details", "التفاصيل", "Narrative", "البيان",
      "Transaction Description", "وصف المعاملة", "Particulars",
    ],
    amountColumn: ["Amount", "المبلغ", "Debit", "مدين", "Value", "القيمة"],
    debitColumn: ["Debit", "مدين", "Debit Amount", "مبلغ المدين", "Withdrawal", "سحب"],
    creditColumn: ["Credit", "دائن", "Credit Amount", "مبلغ الدائن", "Deposit", "إيداع"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"],
    delimiter: ",",
  },
  snb: {
    id: "snb",
    dateColumn: [
      "Date", "التاريخ", "Transaction Date", "تاريخ العملية", "Posting Date",
      "Txn Date", "تاريخ المعاملة", "Value Date", "Book Date",
    ],
    descriptionColumn: [
      "Description", "الوصف", "Details", "التفاصيل", "Transaction Description",
      "Narrative", "البيان", "Particulars", "وصف المعاملة",
      "English Description", "Arabic Description", "Transaction Details", "Remarks",
    ],
    amountColumn: ["Amount", "المبلغ", "Value", "القيمة", "Transaction Amount"],
    debitColumn: ["Debit", "مدين", "Withdrawal", "سحب", "Debit Amount"],
    creditColumn: ["Credit", "دائن", "Deposit", "إيداع", "Credit Amount"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"],
    delimiter: ",",
  },
  riyadbank: {
    id: "riyadbank",
    dateColumn: ["Date", "التاريخ", "Transaction Date", "تاريخ المعاملة", "Txn Date"],
    descriptionColumn: ["Description", "الوصف", "Particulars", "التفاصيل", "Details", "Narrative", "البيان", "وصف المعاملة"],
    amountColumn: ["Amount", "المبلغ", "Value"],
    debitColumn: ["Debit", "مدين", "Withdrawal", "سحب"],
    creditColumn: ["Credit", "دائن", "Deposit", "إيداع"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD"],
    delimiter: ",",
  },
  albilad: {
    id: "albilad",
    dateColumn: ["Date", "التاريخ", "Transaction Date", "تاريخ المعاملة"],
    descriptionColumn: ["Description", "الوصف", "Details", "التفاصيل", "البيان"],
    amountColumn: ["Amount", "المبلغ"],
    debitColumn: ["Debit", "مدين"],
    creditColumn: ["Credit", "دائن"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD"],
    delimiter: ",",
  },
  alinma: {
    id: "alinma",
    dateColumn: ["Date", "التاريخ", "Transaction Date", "تاريخ العملية", "تاريخ المعاملة"],
    descriptionColumn: ["Description", "الوصف", "Details", "البيان", "التفاصيل"],
    amountColumn: ["Amount", "المبلغ"],
    debitColumn: ["Debit", "مدين"],
    creditColumn: ["Credit", "دائن"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD"],
    delimiter: ",",
  },
  sabb: {
    id: "sabb",
    dateColumn: ["Date", "التاريخ", "Value Date", "Transaction Date", "تاريخ المعاملة"],
    descriptionColumn: ["Description", "الوصف", "Narrative", "Details", "البيان"],
    amountColumn: ["Amount", "المبلغ"],
    debitColumn: ["Debit", "مدين"],
    creditColumn: ["Credit", "دائن"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD"],
    delimiter: ",",
  },
  bsf: {
    id: "bsf",
    dateColumn: ["Date", "التاريخ", "Transaction Date", "تاريخ المعاملة"],
    descriptionColumn: ["Description", "الوصف", "Details", "البيان"],
    amountColumn: ["Amount", "المبلغ"],
    debitColumn: ["Debit", "مدين"],
    creditColumn: ["Credit", "دائن"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD"],
    delimiter: ",",
  },
  anb: {
    id: "anb",
    dateColumn: ["Date", "التاريخ", "Transaction Date", "تاريخ المعاملة"],
    descriptionColumn: ["Description", "الوصف", "Details", "البيان", "التفاصيل"],
    amountColumn: ["Amount", "المبلغ"],
    debitColumn: ["Debit", "مدين"],
    creditColumn: ["Credit", "دائن"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD"],
    delimiter: ",",
  },
  revolut: {
    id: "revolut",
    dateColumn: [
      "Completed Date", "Date completed (UTC)", "Date completed",
      "Started Date", "Date started (UTC)", "Date started",
    ],
    descriptionColumn: ["Description"],
    amountColumn: ["Amount", "Orig amount", "Payment amount"],
    dateFormats: ["YYYY-MM-DD", "DD/MM/YYYY"],
    delimiter: ",",
  },
  cryptocom: {
    id: "cryptocom",
    dateColumn: ["Timestamp (UTC)", "Timestamp"],
    descriptionColumn: ["Transaction Description", "Description"],
    amountColumn: ["Native Amount", "Amount"],
    dateFormats: ["YYYY-MM-DD"],
    delimiter: ",",
  },
  other: {
    id: "other",
    dateColumn: [
      "Date", "التاريخ", "Transaction Date", "تاريخ العملية", "تاريخ",
      "Posting Date", "Value Date", "Txn Date", "تاريخ المعاملة",
      "Trade Date", "Settle Date",
    ],
    descriptionColumn: [
      "Description", "الوصف", "Details", "التفاصيل", "البيان",
      "Narrative", "Particulars", "Transaction Description", "وصف العملية",
      "وصف المعاملة", "Memo", "Payee", "المستفيد",
    ],
    amountColumn: ["Amount", "المبلغ", "Value", "القيمة", "Total", "المجموع"],
    debitColumn: [
      "Debit", "مدين", "Withdrawal", "سحب", "Debit Amount", "مبلغ المدين",
      "Charge", "Payment",
    ],
    creditColumn: [
      "Credit", "دائن", "Deposit", "إيداع", "Credit Amount", "مبلغ الدائن",
      "Refund",
    ],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY", "DD-MM-YYYY"],
    delimiter: ",",
  },
};

// ── Arabic-Indic numeral conversion ──

const ARABIC_DIGITS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

function normalizeDigits(str: string): string {
  return str.replace(/[٠-٩]/g, (d) => ARABIC_DIGITS[d] || d);
}

// ── Delimiter detection ──

function detectDelimiter(content: string): string {
  const firstLines = content.split(/\r?\n/).slice(0, 10).filter(l => l.trim());
  if (firstLines.length === 0) return ",";

  const candidates = [",", "\t", ";", "|"];
  let bestDelim = ",";
  let bestScore = 0;

  for (const delim of candidates) {
    const counts = firstLines.map(line => parseCSVLine(line, delim).length);
    const mode = counts.sort((a, b) =>
      counts.filter(v => v === b).length - counts.filter(v => v === a).length
    )[0];
    if (mode >= 3) {
      const consistency = counts.filter(c => c === mode).length;
      const score = consistency * mode;
      if (score > bestScore) {
        bestScore = score;
        bestDelim = delim;
      }
    }
  }

  return bestDelim;
}

// ── Column matching ──

function findColumn(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const idx = headers.findIndex(
      (h) => h.trim().toLowerCase() === name.toLowerCase()
    );
    if (idx !== -1) return idx;
  }
  return -1;
}

function findColumnFuzzy(headers: string[], possibleNames: string[]): number {
  const exact = findColumn(headers, possibleNames);
  if (exact !== -1) return exact;

  for (const name of possibleNames) {
    const lower = name.toLowerCase();
    const idx = headers.findIndex(
      (h) => h.trim().toLowerCase().includes(lower) || lower.includes(h.trim().toLowerCase())
    );
    if (idx !== -1) return idx;
  }

  return -1;
}

// ── Date detection ──

const DATE_PATTERNS = [
  /^\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2}$/,
  /^\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{4}$/,
  /^\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2}$/,
  /^\d{1,2}[\s\-](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\-]\d{2,4}$/i,
];

function looksLikeDate(value: string): boolean {
  const cleaned = normalizeDigits(value.trim());
  return DATE_PATTERNS.some(p => p.test(cleaned));
}

function looksLikeAmount(value: string): boolean {
  const cleaned = normalizeDigits(value.trim())
    .replace(/[^\d.,-]/g, "")
    .replace(/,/g, "");
  if (!cleaned) return false;
  const num = parseFloat(cleaned);
  return !isNaN(num) && Math.abs(num) >= 0.01 && Math.abs(num) < 10_000_000;
}

function parseDate(dateStr: string): string {
  const cleaned = normalizeDigits(dateStr.trim()).replace(
    /\s+\d{1,2}:\d{2}(?::\d{2})?$/,
    ""
  );

  if (/^\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2}$/.test(cleaned)) {
    const [y, m, d] = cleaned.split(/[\/\-.]/);
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const match = cleaned.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const matchYY = cleaned.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})$/);
  if (matchYY) {
    const yr = parseInt(matchYY[3]) > 50 ? `19${matchYY[3]}` : `20${matchYY[3]}`;
    return `${yr}-${matchYY[2].padStart(2, "0")}-${matchYY[1].padStart(2, "0")}`;
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

function parseAmount(value: string): number {
  const cleaned = normalizeDigits(value)
    .replace(/[^\d.,-]/g, "")
    .replace(/,/g, "")
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.abs(num);
}

/** Signed parse — negative = spend (Revolut-style), positive = credit/income */
function parseSignedAmount(value: string): number | null {
  const cleaned = normalizeDigits(value)
    .replace(/[^\d.,+\-]/g, "")
    .replace(/,/g, "")
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseCSVLine(line: string, delimiter: string = ","): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ── Header-based CSV parsing ──

function parseCSVWithHeaders(
  lines: string[],
  config: BankConfig,
  delimiter: string,
): { transactions: Transaction[]; warnings: string[] } {
  const warnings: string[] = [];

  let headerRowIdx = -1;
  let headers: string[] = [];

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const parsed = parseCSVLine(lines[i], delimiter);
    const dateIdx = findColumnFuzzy(parsed, config.dateColumn);
    const descIdx = findColumnFuzzy(parsed, config.descriptionColumn);
    if (dateIdx !== -1 && descIdx !== -1) {
      headerRowIdx = i;
      headers = parsed;
      break;
    }
  }

  if (headerRowIdx === -1 || headers.length === 0) {
    return { transactions: [], warnings: ["no_headers"] };
  }

  const dateIdx = findColumnFuzzy(headers, config.dateColumn);
  const descIdx = findColumnFuzzy(headers, config.descriptionColumn);
  const amountIdx = findColumnFuzzy(headers, config.amountColumn);
  const debitIdx = config.debitColumn
    ? findColumnFuzzy(headers, config.debitColumn)
    : -1;
  const creditIdx = config.creditColumn
    ? findColumnFuzzy(headers, config.creditColumn)
    : -1;

  if (dateIdx === -1 || descIdx === -1) {
    return { transactions: [], warnings: ["no_date_desc_columns"] };
  }

  if (amountIdx === -1 && debitIdx === -1) {
    warnings.push("no_amount_column");
  }

  const transactions: Transaction[] = [];

  for (let i = headerRowIdx + 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i], delimiter);
    if (fields.length <= Math.max(dateIdx, descIdx)) continue;

    const description = fields[descIdx]?.trim();
    if (!description) continue;

    let amount = 0;
    if (debitIdx !== -1 && fields[debitIdx]?.trim()) {
      amount = parseAmount(fields[debitIdx]);
    } else if (amountIdx !== -1 && fields[amountIdx]?.trim()) {
      const signed = parseSignedAmount(fields[amountIdx]);
      if (signed === null || signed === 0) continue;
      // Single Amount column: positive = money in (payout/salary) — not a subscription charge
      if (signed > 0) continue;
      amount = Math.abs(signed);
    }

    if (amount === 0) continue;
    if (
      creditIdx !== -1 &&
      fields[creditIdx]?.trim() &&
      parseAmount(fields[creditIdx]) > 0 &&
      debitIdx !== -1 &&
      !fields[debitIdx]?.trim()
    ) {
      continue;
    }

    const dateRaw = fields[dateIdx] || "";
    if (!dateRaw.trim()) continue;
    const date = parseDate(dateRaw);

    transactions.push({
      date,
      description,
      amount,
      currency: "SAR",
      reference: fields.length > 3 ? fields[3] : undefined,
    });
  }

  return { transactions, warnings };
}

// ── Headerless CSV parsing ──

function parseCSVHeaderless(
  lines: string[],
  delimiter: string,
): { transactions: Transaction[]; warnings: string[] } {
  const warnings: string[] = [];

  const sampleSize = Math.min(20, lines.length);
  const allFields: string[][] = [];

  for (let i = 0; i < sampleSize; i++) {
    allFields.push(parseCSVLine(lines[i], delimiter));
  }

  if (allFields.length === 0) return { transactions: [], warnings: ["empty_file"] };

  const colCount = allFields[0].length;
  if (colCount < 2) return { transactions: [], warnings: ["too_few_columns"] };

  let dateCol = -1;
  let amountCol = -1;
  let descCol = -1;
  let bestDateScore = 0;
  let bestAmountScore = 0;

  for (let col = 0; col < colCount; col++) {
    let dateScore = 0;
    let amountScore = 0;
    let textScore = 0;

    for (const fields of allFields) {
      const val = (fields[col] || "").trim();
      if (!val) continue;
      if (looksLikeDate(val)) dateScore++;
      else if (looksLikeAmount(val)) amountScore++;
      else textScore++;
    }

    if (dateScore > bestDateScore) {
      bestDateScore = dateScore;
      dateCol = col;
    }
    if (amountScore > bestAmountScore) {
      bestAmountScore = amountScore;
      amountCol = col;
    }
    if (textScore > 0 && descCol === -1 && dateScore < 2 && amountScore < 2) {
      descCol = col;
    }
  }

  if (dateCol === amountCol) {
    let secondBest = 0;
    for (let col = 0; col < colCount; col++) {
      if (col === dateCol) continue;
      let score = 0;
      for (const fields of allFields) {
        if (looksLikeAmount((fields[col] || "").trim())) score++;
      }
      if (score > secondBest) {
        secondBest = score;
        amountCol = col;
      }
    }
  }

  if (descCol === -1) {
    for (let col = 0; col < colCount; col++) {
      if (col !== dateCol && col !== amountCol) {
        descCol = col;
        break;
      }
    }
  }

  if (dateCol === -1 || amountCol === -1 || descCol === -1) {
    return { transactions: [], warnings: ["cant_detect_columns"] };
  }

  warnings.push("headerless_mode");

  const transactions: Transaction[] = [];
  const headerPatterns = /^(date|description|amount|debit|credit|balance|التاريخ|الوصف|المبلغ|مدين|دائن|الرصيد)$/i;

  for (let i = 0; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i], delimiter);
    if (fields.length <= Math.max(dateCol, descCol, amountCol)) continue;

    const dateVal = (fields[dateCol] || "").trim();
    const descVal = (fields[descCol] || "").trim();
    const amountVal = (fields[amountCol] || "").trim();

    if (headerPatterns.test(dateVal) || headerPatterns.test(descVal)) continue;
    if (!looksLikeDate(dateVal)) continue;
    if (!descVal || descVal.length < 2) continue;

    const amount = parseAmount(amountVal);
    if (amount === 0) continue;

    transactions.push({
      date: parseDate(dateVal),
      description: descVal,
      amount,
      currency: "SAR",
    });
  }

  return { transactions, warnings };
}

// ── Revolut & Crypto.com (dedicated formats) ──

function headerIndex(headers: string[], names: string[]): number {
  const normalized = headers.map((h) => h.trim().toLowerCase());
  for (const name of names) {
    const lower = name.toLowerCase();
    const exact = normalized.indexOf(lower);
    if (exact !== -1) return exact;
  }
  for (let i = 0; i < normalized.length; i++) {
    for (const name of names) {
      const lower = name.toLowerCase();
      if (normalized[i].includes(lower) || lower.includes(normalized[i])) {
        return i;
      }
    }
  }
  return -1;
}

function detectCsvFormat(lines: string[]): BankId | null {
  if (lines.length === 0) return null;
  const header = lines[0].toLowerCase();

  if (header.includes("transaction kind") && header.includes("timestamp")) {
    return "cryptocom";
  }

  if (
    header.includes("description") &&
    (header.includes("completed date") ||
      header.includes("date completed") ||
      header.includes("date started (utc)"))
  ) {
    return "revolut";
  }

  return null;
}

function parseRevolutCSV(
  lines: string[],
  delimiter: string
): { transactions: Transaction[]; warnings: string[] } {
  const warnings: string[] = [];
  const headers = parseCSVLine(lines[0], delimiter);

  const dateIdx = headerIndex(headers, [
    "Completed Date",
    "Date completed (UTC)",
    "Date completed",
    "Started Date",
    "Date started (UTC)",
  ]);
  const descIdx = headerIndex(headers, ["Description"]);
  const amountIdx = headerIndex(headers, ["Amount", "Orig amount", "Payment amount"]);
  const currencyIdx = headerIndex(headers, [
    "Currency",
    "Payment currency",
    "Orig currency",
  ]);
  const typeIdx = headerIndex(headers, ["Type"]);
  const stateIdx = headerIndex(headers, ["State"]);

  if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) {
    return { transactions: [], warnings: ["no_revolut_headers"] };
  }

  const skipTypes = new Set([
    "EXCHANGE",
    "TRANSFER",
    "TOPUP",
    "TOP-UP",
    "ATM",
    "FEE",
    "CARD_REFUND",
  ]);

  const transactions: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i], delimiter);
    if (fields.length <= Math.max(dateIdx, descIdx, amountIdx)) continue;

    if (stateIdx !== -1 && fields[stateIdx]?.trim()) {
      const state = fields[stateIdx].trim().toUpperCase();
      if (state !== "COMPLETED") continue;
    }

    if (typeIdx !== -1 && fields[typeIdx]?.trim()) {
      const type = fields[typeIdx].trim().toUpperCase();
      if (skipTypes.has(type)) continue;
    }

    const description = fields[descIdx]?.trim();
    if (!description) continue;
    if (/^exchanged\s+(to|from)\b/i.test(description)) continue;

    const amountRaw = fields[amountIdx]?.trim();
    if (!amountRaw) continue;

    const signed = parseFloat(
      normalizeDigits(amountRaw).replace(/,/g, "").replace(/'/g, "")
    );
    if (isNaN(signed) || signed === 0) continue;
    if (signed > 0) continue;

    const dateRaw = fields[dateIdx]?.trim();
    if (!dateRaw) continue;

    const currency =
      currencyIdx !== -1 ? fields[currencyIdx]?.trim().toUpperCase() : "SAR";

    transactions.push({
      date: parseDate(dateRaw),
      description,
      amount: Math.abs(signed),
      currency: currency || "SAR",
    });
  }

  return { transactions, warnings };
}

const CRYPTO_COM_FIAT = new Set([
  "EUR", "USD", "GBP", "SAR", "AED", "CAD", "AUD", "CHF", "SGD", "HKD",
]);

const CRYPTO_COM_SPEND_KINDS = new Set([
  "crypto_payment",
  "viban_purchase",
  "recurring_buy_order",
  "card_payment",
]);

/** Card rebate lines that still prove an active subscription (JFC-style HITL) */
const CRYPTO_SUB_HINT =
  /\b(netflix|spotify|disney|youtube|apple|icloud|claude|anthropic|openai|chatgpt|adobe|amazon|prime|shahid|anghami|canva|notion|cursor|perplexity|midjourney|hulu|hbo|paramount|twitch|dropbox|grammarly|linkedin|microsoft|office|xbox|playstation|duolingo|headspace|calm)\b/i;

function isCryptoRebateRow(kind: string, description: string): boolean {
  if (/rebate|cashback|card_cashback|card\s*cashback/i.test(kind)) return true;
  return /card\s*(cashback|rebate)|rebate\s*:|cashback\s*:/i.test(description);
}

function parseCryptoComCSV(
  lines: string[],
  delimiter: string
): { transactions: Transaction[]; warnings: string[] } {
  const warnings: string[] = [];
  const headers = parseCSVLine(lines[0], delimiter);

  const dateIdx = headerIndex(headers, ["Timestamp (UTC)", "Timestamp"]);
  const descIdx = headerIndex(headers, ["Transaction Description", "Description"]);
  const kindIdx = headerIndex(headers, ["Transaction Kind"]);
  const nativeAmountIdx = headerIndex(headers, ["Native Amount"]);
  const nativeCurrencyIdx = headerIndex(headers, ["Native Currency"]);
  const amountIdx = headerIndex(headers, ["Amount"]);

  if (dateIdx === -1 || descIdx === -1) {
    return { transactions: [], warnings: ["no_cryptocom_headers"] };
  }

  const transactions: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i], delimiter);
    if (fields.length <= Math.max(dateIdx, descIdx)) continue;

    const description = fields[descIdx]?.trim();
    if (!description) continue;

    const kind = (fields[kindIdx]?.trim() || "").toLowerCase();
    const isSpend =
      (!!kind && CRYPTO_COM_SPEND_KINDS.has(kind)) ||
      !kind; // card export often omits Transaction Kind
    const isRebate = isCryptoRebateRow(kind, description) && CRYPTO_SUB_HINT.test(description);

    if (!isSpend && !isRebate) continue;

    if (
      !isRebate &&
      (/^(transfer|balance conversion|card top up|card cashback|cardholder cro|cro lockup|cro unlock|supercharger|pay rewards|eur deposit|usd deposit)/i.test(
        description
      ) ||
        /\s->\s/.test(description))
    ) {
      continue;
    }

    let amount = 0;
    let currency = "EUR";

    if (nativeAmountIdx !== -1 && nativeCurrencyIdx !== -1) {
      const nativeCurrency = fields[nativeCurrencyIdx]?.trim().toUpperCase();
      const nativeRaw = fields[nativeAmountIdx]?.trim();
      if (nativeCurrency && nativeRaw && CRYPTO_COM_FIAT.has(nativeCurrency)) {
        const nativeSigned = parseFloat(
          normalizeDigits(nativeRaw).replace(/,/g, "")
        );
        if (!isNaN(nativeSigned) && nativeSigned !== 0) {
          // Spends are usually negative; rebates/credits can be positive
          if (isRebate || nativeSigned < 0) {
            amount = Math.abs(nativeSigned);
            currency = nativeCurrency;
          }
        }
      }
    }

    if (amount === 0 && amountIdx !== -1 && fields[amountIdx]?.trim()) {
      const signed = parseFloat(
        normalizeDigits(fields[amountIdx]).replace(/,/g, "")
      );
      if (!isNaN(signed) && signed !== 0) {
        if (isRebate || signed < 0) {
          amount = Math.abs(signed);
          currency = "USD";
        }
      }
    }

    if (amount < 0.5) continue;

    const dateRaw = fields[dateIdx]?.trim();
    if (!dateRaw) continue;

    const cleanDesc = isRebate
      ? description.replace(/^(card\s*)?(cashback|rebate)\s*:?\s*/i, "Card Rebate: ").trim()
      : description;

    transactions.push({
      date: parseDate(dateRaw),
      description: cleanDesc || description,
      amount,
      currency,
      source: isRebate ? "rebate" : "charge",
    });
  }

  return { transactions, warnings };
}

// ── Line-by-line fallback ──

function parseCSVLineFallback(
  lines: string[],
): { transactions: Transaction[]; warnings: string[] } {
  const transactions: Transaction[] = [];
  const DATE_RE = /(\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2}|\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/;
  const AMOUNT_RE = /(-?[\d,]+\.\d{1,2})\b/;

  for (const rawLine of lines) {
    const line = normalizeDigits(rawLine);
    if (line.length < 10) continue;

    const dateMatch = line.match(DATE_RE);
    if (!dateMatch) continue;

    const amountMatch = line.match(AMOUNT_RE);
    if (!amountMatch) continue;

    const amount = parseAmount(amountMatch[1]);
    if (amount < 0.5) continue;

    let desc = line
      .replace(dateMatch[0], " ")
      .replace(amountMatch[0], " ")
      .replace(/[,\t]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    desc = desc.replace(/\b\d+\b/g, " ").replace(/\s+/g, " ").trim();

    if (!desc || desc.length < 2) continue;

    transactions.push({
      date: parseDate(dateMatch[0]),
      description: desc,
      amount,
      currency: "SAR",
    });
  }

  return { transactions, warnings: ["line_fallback"] };
}

// ── Public API ──

export function parseCSV(content: string, bankId: BankId): Transaction[] {
  const result = parseCSVRobust(content, bankId);
  return result.transactions;
}

export function parseCSVRobust(content: string, bankId: BankId): CSVParseResult {
  const config = bankConfigs[bankId];
  const lines = content.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length < 2) {
    return {
      transactions: [],
      bankId,
      parseMethod: "csv-headers",
      warnings: ["file_too_short"],
      rawLineCount: lines.length,
    };
  }

  const delimiter = detectDelimiter(content);

  const csvFormat = detectCsvFormat(lines);
  if (csvFormat === "revolut" || bankId === "revolut") {
    const revolutResult = parseRevolutCSV(lines, delimiter);
    return {
      transactions: revolutResult.transactions,
      bankId: "revolut",
      parseMethod: "csv-headers",
      warnings:
        revolutResult.transactions.length === 0
          ? [...revolutResult.warnings, "no_revolut_spending"]
          : revolutResult.warnings,
      rawLineCount: lines.length,
    };
  }
  if (csvFormat === "cryptocom" || bankId === "cryptocom") {
    const cryptoResult = parseCryptoComCSV(lines, delimiter);
    return {
      transactions: cryptoResult.transactions,
      bankId: "cryptocom",
      parseMethod: "csv-headers",
      warnings:
        cryptoResult.transactions.length === 0
          ? [...cryptoResult.warnings, "no_cryptocom_spending"]
          : cryptoResult.warnings,
      rawLineCount: lines.length,
    };
  }

  // Strategy 1: Header-based with detected delimiter
  const headerResult = parseCSVWithHeaders(lines, config, delimiter);
  if (headerResult.transactions.length > 0) {
    return {
      transactions: headerResult.transactions,
      bankId,
      parseMethod: "csv-headers",
      warnings: headerResult.warnings,
      rawLineCount: lines.length,
    };
  }

  // Strategy 2: Header-based with config's delimiter
  if (delimiter !== config.delimiter) {
    const origResult = parseCSVWithHeaders(lines, config, config.delimiter);
    if (origResult.transactions.length > 0) {
      return {
        transactions: origResult.transactions,
        bankId,
        parseMethod: "csv-headers",
        warnings: origResult.warnings,
        rawLineCount: lines.length,
      };
    }
  }

  // Strategy 3: Try 'other' bank config (broadest matching)
  if (bankId !== "other") {
    const otherConfig = bankConfigs.other;
    const otherResult = parseCSVWithHeaders(lines, otherConfig, delimiter);
    if (otherResult.transactions.length > 0) {
      return {
        transactions: otherResult.transactions,
        bankId: "other",
        parseMethod: "csv-headers",
        warnings: [...otherResult.warnings, "used_generic_config"],
        rawLineCount: lines.length,
      };
    }
  }

  // Strategy 4: Headerless parsing
  const headerlessResult = parseCSVHeaderless(lines, delimiter);
  if (headerlessResult.transactions.length > 0) {
    return {
      transactions: headerlessResult.transactions,
      bankId,
      parseMethod: "csv-headerless",
      warnings: headerlessResult.warnings,
      rawLineCount: lines.length,
    };
  }

  // Strategy 5: Line-by-line fallback
  const fallbackResult = parseCSVLineFallback(lines);
  if (fallbackResult.transactions.length > 0) {
    return {
      transactions: fallbackResult.transactions,
      bankId,
      parseMethod: "csv-fallback",
      warnings: fallbackResult.warnings,
      rawLineCount: lines.length,
    };
  }

  return {
    transactions: [],
    bankId,
    parseMethod: "csv-headers",
    warnings: [
      ...headerResult.warnings,
      ...headerlessResult.warnings,
      ...fallbackResult.warnings,
      "all_strategies_failed",
    ],
    rawLineCount: lines.length,
  };
}

export function detectBank(content: string): BankId {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  const csvFormat = detectCsvFormat(lines);
  if (csvFormat) return csvFormat;

  const lower = content.toLowerCase();
  const normalized = normalizeDigits(lower);
  const firstLines = normalized.split(/\r?\n/).slice(0, 15).join(" ");

  if (firstLines.includes("revolut")) return "revolut";
  if (firstLines.includes("crypto.com") || firstLines.includes("cryptocom")) {
    return "cryptocom";
  }

  if (firstLines.includes("الراجحي") || firstLines.includes("alrajhi") || firstLines.includes("al rajhi"))
    return "alrajhi";
  if (firstLines.includes("الأهلي") || firstLines.includes("snb") || firstLines.includes("الاهلي") || firstLines.includes("national bank") || firstLines.includes("saudi national bank"))
    return "snb";
  if (firstLines.includes("بنك الرياض") || firstLines.includes("riyad") || firstLines.includes("riyadbank"))
    return "riyadbank";
  if (firstLines.includes("البلاد") || firstLines.includes("albilad") || firstLines.includes("al bilad"))
    return "albilad";
  if (firstLines.includes("الإنماء") || firstLines.includes("الانماء") || firstLines.includes("alinma"))
    return "alinma";
  if (firstLines.includes("ساب") || firstLines.includes("sabb"))
    return "sabb";
  if (firstLines.includes("الفرنسي") || firstLines.includes("fransi") || firstLines.includes("bsf"))
    return "bsf";
  if (firstLines.includes("العربي") || firstLines.includes("anb") || firstLines.includes("arab national"))
    return "anb";

  // Try Saudi bank configs only (avoid mis-parsing fintech CSVs)
  let bestBank: BankId = "other";
  let bestCount = 0;

  const saudiBanks: BankId[] = [
    "alrajhi", "snb", "riyadbank", "albilad", "alinma", "sabb", "bsf", "anb",
  ];

  const delimiter = detectDelimiter(content);

  for (const id of saudiBanks) {
    const result = parseCSVWithHeaders(lines, bankConfigs[id], delimiter);
    if (result.transactions.length > bestCount) {
      bestCount = result.transactions.length;
      bestBank = id;
    }
  }

  return bestCount > 0 ? bestBank : "other";
}
