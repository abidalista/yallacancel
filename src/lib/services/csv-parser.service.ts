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
    dateColumn: ["Date", "التاريخ", "Transaction Date", "تاريخ العملية", "Posting Date", "Txn Date", "تاريخ المعاملة"],
    descriptionColumn: ["Description", "الوصف", "Details", "التفاصيل", "Transaction Description", "Narrative", "البيان", "Particulars", "وصف المعاملة"],
    amountColumn: ["Amount", "المبلغ", "Value", "القيمة"],
    debitColumn: ["Debit", "مدين", "Withdrawal", "سحب"],
    creditColumn: ["Credit", "دائن", "Deposit", "إيداع"],
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
  const cleaned = normalizeDigits(dateStr.trim());

  if (/^\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2}/.test(cleaned)) {
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
      amount = parseAmount(fields[amountIdx]);
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
  const lower = content.toLowerCase();
  const normalized = normalizeDigits(lower);
  const firstLines = normalized.split(/\r?\n/).slice(0, 15).join(" ");

  if (firstLines.includes("الراجحي") || firstLines.includes("alrajhi") || firstLines.includes("al rajhi"))
    return "alrajhi";
  if (firstLines.includes("الأهلي") || firstLines.includes("snb") || firstLines.includes("الاهلي") || firstLines.includes("national bank"))
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

  // Try all bank configs
  let bestBank: BankId = "other";
  let bestCount = 0;

  for (const [id] of Object.entries(bankConfigs)) {
    if (id === "other") continue;
    const txs = parseCSV(content, id as BankId);
    if (txs.length > bestCount) {
      bestCount = txs.length;
      bestBank = id as BankId;
    }
  }

  return bestCount > 0 ? bestBank : "other";
}
