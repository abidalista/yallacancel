import { BankId, Transaction } from "./types";

interface BankConfig {
  id: BankId;
  dateColumn: string[];
  descriptionColumn: string[];
  amountColumn: string[];
  debitColumn?: string[];
  creditColumn?: string[];
  dateFormats: string[];
  delimiter: string;
  skipRows?: number;
}

export interface ParseResult {
  transactions: Transaction[];
  bankId: BankId;
  parseMethod: "csv-headers" | "csv-headerless" | "csv-fallback";
  warnings: string[];
}

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
      "Txn Date", "تاريخ المعاملة",
    ],
    descriptionColumn: [
      "Description", "الوصف", "Details", "التفاصيل", "Transaction Description",
      "Narrative", "البيان", "Particulars", "وصف المعاملة",
    ],
    amountColumn: ["Amount", "المبلغ", "Value", "القيمة"],
    debitColumn: ["Debit", "مدين", "Withdrawal", "سحب"],
    creditColumn: ["Credit", "دائن", "Deposit", "إيداع"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"],
    delimiter: ",",
  },
  riyadbank: {
    id: "riyadbank",
    dateColumn: ["Date", "التاريخ", "Transaction Date", "تاريخ المعاملة", "Txn Date"],
    descriptionColumn: [
      "Description", "الوصف", "Particulars", "التفاصيل", "Details",
      "Narrative", "البيان", "وصف المعاملة",
    ],
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
    // Count how many lines have the same number of fields with this delimiter
    const counts = firstLines.map(line => parseCSVLine(line, delim).length);
    const mode = counts.sort((a, b) =>
      counts.filter(v => v === b).length - counts.filter(v => v === a).length
    )[0];
    // Score = consistency (how many lines match the mode) * field count
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

// ── Exact column match ──
function findColumn(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const idx = headers.findIndex(
      (h) => h.trim().toLowerCase() === name.toLowerCase()
    );
    if (idx !== -1) return idx;
  }
  return -1;
}

// ── Fuzzy column match (partial/contains) ──
function findColumnFuzzy(headers: string[], possibleNames: string[]): number {
  // First try exact match
  const exact = findColumn(headers, possibleNames);
  if (exact !== -1) return exact;

  // Then try contains match
  for (const name of possibleNames) {
    const lower = name.toLowerCase();
    const idx = headers.findIndex(
      (h) => h.trim().toLowerCase().includes(lower) || lower.includes(h.trim().toLowerCase())
    );
    if (idx !== -1) return idx;
  }

  return -1;
}

// ── Date detection for headerless parsing ──
const DATE_PATTERNS = [
  /^\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2}$/,  // YYYY-MM-DD
  /^\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{4}$/,  // DD/MM/YYYY or MM/DD/YYYY
  /^\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2}$/,  // DD/MM/YY
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

  // Try YYYY-MM-DD
  if (/^\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2}/.test(cleaned)) {
    const [y, m, d] = cleaned.split(/[\/\-.]/);
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // Try DD/MM/YYYY or DD-MM-YYYY
  const match = cleaned.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Try DD/MM/YY
  const matchYY = cleaned.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})$/);
  if (matchYY) {
    const yr = parseInt(matchYY[3]) > 50 ? `19${matchYY[3]}` : `20${matchYY[3]}`;
    return `${yr}-${matchYY[2].padStart(2, "0")}-${matchYY[1].padStart(2, "0")}`;
  }

  // Try named months: DD MMM YYYY or DD-MMM-YY
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

  // Find header row (try first 10 rows — some bank exports have metadata rows)
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

    // Skip credits/deposits (we only want debits/charges)
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

// ── Headerless CSV parsing: detect column roles from data patterns ──
function parseCSVHeaderless(
  lines: string[],
  delimiter: string,
): { transactions: Transaction[]; warnings: string[] } {
  const warnings: string[] = [];

  // Sample first 20 data rows to detect column patterns
  const sampleSize = Math.min(20, lines.length);
  const allFields: string[][] = [];

  for (let i = 0; i < sampleSize; i++) {
    allFields.push(parseCSVLine(lines[i], delimiter));
  }

  if (allFields.length === 0) return { transactions: [], warnings: ["empty_file"] };

  const colCount = allFields[0].length;
  if (colCount < 2) return { transactions: [], warnings: ["too_few_columns"] };

  // Score each column for being a date, amount, or description
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

  // If we found a date and amount column that overlap, find a different amount column
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

  // If no desc column found yet, use the first column that's not date or amount
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

  // Now skip any row that looks like a header row
  const transactions: Transaction[] = [];
  const headerPatterns = /^(date|description|amount|debit|credit|balance|التاريخ|الوصف|المبلغ|مدين|دائن|الرصيد)$/i;

  for (const fields of allFields) {
    if (fields.length <= Math.max(dateCol, descCol, amountCol)) continue;

    const dateVal = (fields[dateCol] || "").trim();
    const descVal = (fields[descCol] || "").trim();
    const amountVal = (fields[amountCol] || "").trim();

    // Skip header-like rows
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

  // Continue with remaining lines beyond the sample
  for (let i = sampleSize; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i], delimiter);
    if (fields.length <= Math.max(dateCol, descCol, amountCol)) continue;

    const dateVal = (fields[dateCol] || "").trim();
    const descVal = (fields[descCol] || "").trim();
    const amountVal = (fields[amountCol] || "").trim();

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

// ── Line-by-line fallback: extract date + amount + description from each line ──
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

    // Description = everything that's not the date or amount
    let desc = line
      .replace(dateMatch[0], " ")
      .replace(amountMatch[0], " ")
      .replace(/[,\t]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Remove pure numbers
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

// ── Main parseCSV export ──
export function parseCSV(
  content: string,
  bankId: BankId
): Transaction[] {
  const result = parseCSVRobust(content, bankId);
  return result.transactions;
}

// ── Robust parseCSV with full diagnostics ──
export function parseCSVRobust(
  content: string,
  bankId: BankId
): ParseResult {
  const config = bankConfigs[bankId];
  const lines = content.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length < 2) {
    return {
      transactions: [],
      bankId,
      parseMethod: "csv-headers",
      warnings: ["file_too_short"],
    };
  }

  // Auto-detect delimiter
  const delimiter = detectDelimiter(content);

  // Strategy 1: Try header-based parsing with detected delimiter
  const headerResult = parseCSVWithHeaders(lines, config, delimiter);
  if (headerResult.transactions.length > 0) {
    return {
      transactions: headerResult.transactions,
      bankId,
      parseMethod: "csv-headers",
      warnings: headerResult.warnings,
    };
  }

  // Strategy 2: Try header-based with the config's original delimiter (if different)
  if (delimiter !== config.delimiter) {
    const origResult = parseCSVWithHeaders(lines, config, config.delimiter);
    if (origResult.transactions.length > 0) {
      return {
        transactions: origResult.transactions,
        bankId,
        parseMethod: "csv-headers",
        warnings: origResult.warnings,
      };
    }
  }

  // Strategy 3: Try with 'other' bank config (broadest column matching)
  if (bankId !== "other") {
    const otherConfig = bankConfigs.other;
    const otherResult = parseCSVWithHeaders(lines, otherConfig, delimiter);
    if (otherResult.transactions.length > 0) {
      return {
        transactions: otherResult.transactions,
        bankId: "other",
        parseMethod: "csv-headers",
        warnings: [...otherResult.warnings, "used_generic_config"],
      };
    }
  }

  // Strategy 4: Headerless parsing — detect column roles from data patterns
  const headerlessResult = parseCSVHeaderless(lines, delimiter);
  if (headerlessResult.transactions.length > 0) {
    return {
      transactions: headerlessResult.transactions,
      bankId,
      parseMethod: "csv-headerless",
      warnings: headerlessResult.warnings,
    };
  }

  // Strategy 5: Line-by-line fallback — extract date + amount + text from each line
  const fallbackResult = parseCSVLineFallback(lines);
  if (fallbackResult.transactions.length > 0) {
    return {
      transactions: fallbackResult.transactions,
      bankId,
      parseMethod: "csv-fallback",
      warnings: fallbackResult.warnings,
    };
  }

  // All strategies failed
  const allWarnings = [
    ...headerResult.warnings,
    ...headerlessResult.warnings,
    ...fallbackResult.warnings,
    "all_strategies_failed",
  ];

  return {
    transactions: [],
    bankId,
    parseMethod: "csv-headers",
    warnings: allWarnings,
  };
}

export function detectBank(content: string): BankId {
  const lower = content.toLowerCase();
  const normalized = normalizeDigits(lower);
  const firstLines = normalized.split(/\r?\n/).slice(0, 15).join(" ");

  // Check for bank-specific keywords in headers/first lines
  if (firstLines.includes("الراجحي") || firstLines.includes("alrajhi") || firstLines.includes("al rajhi"))
    return "alrajhi";
  if (
    firstLines.includes("الأهلي") ||
    firstLines.includes("snb") ||
    firstLines.includes("الاهلي") ||
    firstLines.includes("national bank")
  )
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
  if (firstLines.includes("stc") || firstLines.includes("اس تي سي"))
    return "other";

  // Try all bank configs and pick the one that yields the most transactions
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

export function getBankConfig(bankId: BankId): BankConfig {
  return bankConfigs[bankId];
}
