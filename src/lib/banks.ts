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

const bankConfigs: Record<BankId, BankConfig> = {
  alrajhi: {
    id: "alrajhi",
    dateColumn: ["Date", "التاريخ", "Transaction Date", "تاريخ العملية"],
    descriptionColumn: [
      "Description",
      "الوصف",
      "Details",
      "التفاصيل",
      "Narrative",
      "البيان",
    ],
    amountColumn: ["Amount", "المبلغ", "Debit", "مدين"],
    debitColumn: ["Debit", "مدين", "Debit Amount", "مبلغ المدين"],
    creditColumn: ["Credit", "دائن", "Credit Amount", "مبلغ الدائن"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"],
    delimiter: ",",
  },
  snb: {
    id: "snb",
    dateColumn: [
      "Date",
      "التاريخ",
      "Transaction Date",
      "تاريخ العملية",
      "Posting Date",
    ],
    descriptionColumn: [
      "Description",
      "الوصف",
      "Details",
      "التفاصيل",
      "Transaction Description",
    ],
    amountColumn: ["Amount", "المبلغ"],
    debitColumn: ["Debit", "مدين", "Withdrawal", "سحب"],
    creditColumn: ["Credit", "دائن", "Deposit", "إيداع"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"],
    delimiter: ",",
  },
  riyadbank: {
    id: "riyadbank",
    dateColumn: ["Date", "التاريخ", "Transaction Date", "تاريخ المعاملة"],
    descriptionColumn: [
      "Description",
      "الوصف",
      "Particulars",
      "التفاصيل",
    ],
    amountColumn: ["Amount", "المبلغ"],
    debitColumn: ["Debit", "مدين"],
    creditColumn: ["Credit", "دائن"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD"],
    delimiter: ",",
  },
  albilad: {
    id: "albilad",
    dateColumn: ["Date", "التاريخ", "Transaction Date"],
    descriptionColumn: ["Description", "الوصف", "Details"],
    amountColumn: ["Amount", "المبلغ"],
    debitColumn: ["Debit", "مدين"],
    creditColumn: ["Credit", "دائن"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD"],
    delimiter: ",",
  },
  alinma: {
    id: "alinma",
    dateColumn: ["Date", "التاريخ", "Transaction Date", "تاريخ العملية"],
    descriptionColumn: ["Description", "الوصف", "Details", "البيان"],
    amountColumn: ["Amount", "المبلغ"],
    debitColumn: ["Debit", "مدين"],
    creditColumn: ["Credit", "دائن"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD"],
    delimiter: ",",
  },
  sabb: {
    id: "sabb",
    dateColumn: ["Date", "التاريخ", "Value Date"],
    descriptionColumn: ["Description", "الوصف", "Narrative"],
    amountColumn: ["Amount", "المبلغ"],
    debitColumn: ["Debit", "مدين"],
    creditColumn: ["Credit", "دائن"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD"],
    delimiter: ",",
  },
  bsf: {
    id: "bsf",
    dateColumn: ["Date", "التاريخ"],
    descriptionColumn: ["Description", "الوصف"],
    amountColumn: ["Amount", "المبلغ"],
    debitColumn: ["Debit", "مدين"],
    creditColumn: ["Credit", "دائن"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD"],
    delimiter: ",",
  },
  anb: {
    id: "anb",
    dateColumn: ["Date", "التاريخ", "Transaction Date"],
    descriptionColumn: ["Description", "الوصف", "Details"],
    amountColumn: ["Amount", "المبلغ"],
    debitColumn: ["Debit", "مدين"],
    creditColumn: ["Credit", "دائن"],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD"],
    delimiter: ",",
  },
  other: {
    id: "other",
    dateColumn: [
      "Date",
      "التاريخ",
      "Transaction Date",
      "تاريخ العملية",
      "تاريخ",
      "Posting Date",
      "Value Date",
    ],
    descriptionColumn: [
      "Description",
      "الوصف",
      "Details",
      "التفاصيل",
      "البيان",
      "Narrative",
      "Particulars",
      "Transaction Description",
      "وصف العملية",
    ],
    amountColumn: ["Amount", "المبلغ", "Value", "القيمة"],
    debitColumn: [
      "Debit",
      "مدين",
      "Withdrawal",
      "سحب",
      "Debit Amount",
      "مبلغ المدين",
    ],
    creditColumn: [
      "Credit",
      "دائن",
      "Deposit",
      "إيداع",
      "Credit Amount",
      "مبلغ الدائن",
    ],
    dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY", "DD-MM-YYYY"],
    delimiter: ",",
  },
};

function findColumn(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const idx = headers.findIndex(
      (h) => h.trim().toLowerCase() === name.toLowerCase()
    );
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseDate(dateStr: string): string {
  const cleaned = dateStr.trim();

  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) {
    return cleaned.substring(0, 10);
  }

  // Try DD/MM/YYYY or DD-MM-YYYY
  const match = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Try MM/DD/YYYY
  const match2 = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match2) {
    const [, month, day, year] = match2;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return cleaned;
}

function parseAmount(value: string): number {
  const cleaned = value
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

export function parseCSV(
  content: string,
  bankId: BankId
): Transaction[] {
  const config = bankConfigs[bankId];
  const lines = content.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length < 2) return [];

  // Find header row (try first few rows)
  let headerRowIdx = 0;
  let headers: string[] = [];

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const parsed = parseCSVLine(lines[i], config.delimiter);
    const dateIdx = findColumn(parsed, config.dateColumn);
    const descIdx = findColumn(parsed, config.descriptionColumn);
    if (dateIdx !== -1 && descIdx !== -1) {
      headerRowIdx = i;
      headers = parsed;
      break;
    }
  }

  if (headers.length === 0) {
    // Fallback: use first row as headers
    headers = parseCSVLine(lines[0], config.delimiter);
    headerRowIdx = 0;
  }

  const dateIdx = findColumn(headers, config.dateColumn);
  const descIdx = findColumn(headers, config.descriptionColumn);
  const amountIdx = findColumn(headers, config.amountColumn);
  const debitIdx = config.debitColumn
    ? findColumn(headers, config.debitColumn)
    : -1;
  const creditIdx = config.creditColumn
    ? findColumn(headers, config.creditColumn)
    : -1;

  if (dateIdx === -1 || descIdx === -1) {
    return [];
  }

  const transactions: Transaction[] = [];

  for (let i = headerRowIdx + 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i], config.delimiter);
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

    const date = parseDate(fields[dateIdx] || "");

    transactions.push({
      date,
      description,
      amount,
      reference: fields.length > 3 ? fields[3] : undefined,
    });
  }

  return transactions;
}

export function getBankConfig(bankId: BankId): BankConfig {
  return bankConfigs[bankId];
}
