/** Western digits (0-9) with US grouping — same in Arabic and English UI */
const intFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export const PRICE_LABEL = "49 SAR";

export function formatInt(n: number): string {
  return intFormatter.format(Math.round(n));
}

export function formatNum(n: number, maxDecimals = 2): string {
  if (maxDecimals === 0) return formatInt(n);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(n);
}

export function formatMoney(n: number): string {
  return Number.isInteger(n) || Math.abs(n % 1) < 0.005
    ? formatInt(n)
    : formatNum(n, 2);
}

/** English byte units: `1.8 MB`, `245.3 KB`, `512 B` */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${formatInt(bytes)} B`;
  if (bytes < 1024 * 1024) return `${formatNum(bytes / 1024, 1)} KB`;
  return `${formatNum(bytes / (1024 * 1024), 1)} MB`;
}

export function formatByteLimit(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return `${Number.isInteger(mb) ? formatInt(mb) : formatNum(mb, 1)} MB`;
  }
  return formatBytes(bytes);
}

export function formatByteBudget(usedBytes: number, maxBytes: number): string {
  return `${formatBytes(usedBytes)} / ${formatByteLimit(maxBytes)}`;
}

export function formatSar(n: number): string {
  return `${formatMoney(n)} SAR`;
}

export function formatSarMo(n: number): string {
  return `${formatMoney(n)} SAR/mo`;
}

/** Monthly subscription cost — Arabic uses ريال/شهر */
export function formatSubCost(monthly: number, ar: boolean): string {
  const amount = formatMoney(monthly);
  return ar ? `${amount} ريال/شهر` : `${amount} SAR/mo`;
}

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  PLN: "zł",
  AED: "AED ",
  SAR: "",
};

/** Headline yearly total — always Western digits + English unit (amount then unit) */
export function formatHeadlineYearly(yearlySar: number, _ar?: boolean): string {
  const amount = formatMoney(yearlySar);
  return `${amount} SAR/year`;
}

/** JFC-style native yearly display: $316/yr · €210/yr · 672 ريال/سنة */
export function formatNativeYearly(
  yearly: number,
  currency: string | undefined,
  ar: boolean
): string {
  const cur = (currency || "SAR").toUpperCase();
  const amount = formatMoney(yearly);
  if (cur === "SAR") {
    return ar ? `${amount} ريال/سنة` : `${amount} SAR/yr`;
  }
  const sym = CURRENCY_SYMBOL[cur];
  if (sym) {
    if (sym.endsWith(" ")) return `${sym}${amount}/yr`;
    return `${sym}${amount}/yr`;
  }
  return `${amount} ${cur}/yr`;
}

/** Native monthly for HITL cards */
export function formatNativeMonthly(
  monthly: number,
  currency: string | undefined,
  ar: boolean
): string {
  const cur = (currency || "SAR").toUpperCase();
  const amount = formatMoney(monthly);
  if (cur === "SAR") {
    return ar ? `${amount} ريال/شهر` : `${amount} SAR/mo`;
  }
  const sym = CURRENCY_SYMBOL[cur] ?? `${cur} `;
  if (sym.endsWith(" ")) return `${sym}${amount}/mo`;
  return `${sym}${amount}/mo`;
}

export function formatPriceOnce(ar: boolean): string {
  return ar ? "49 ريال" : "49 SAR";
}

export function formatSarYr(n: number): string {
  return `${formatMoney(n)} SAR/yr`;
}

export function formatSarPerYear(n: number): string {
  return `${formatMoney(n)} SAR/year`;
}

export function fileCountLabel(count: number, ar: boolean): string {
  if (ar) {
    if (count === 1) return "ملف واحد";
    if (count === 2) return "ملفين";
    if (count >= 3 && count <= 10) return `${count} ملفات`;
    return `${count} ملف`;
  }
  return count === 1 ? "1 file" : `${count} files`;
}

export function subscriptionCountLabel(count: number, ar: boolean): string {
  if (ar) {
    if (count === 1) return "اشتراك واحد";
    if (count === 2) return "اشتراكين";
    if (count >= 3 && count <= 10) return `${count} اشتراكات`;
    return `${count} اشتراك`;
  }
  return count === 1 ? "1 subscription" : `${count} subscriptions`;
}

export function truncateFilename(name: string, max = 32): string {
  if (name.length <= max) return name;
  const dot = name.lastIndexOf(".");
  if (dot > 0 && name.length - dot <= 6) {
    const ext = name.slice(dot);
    const base = name.slice(0, dot);
    const keep = max - ext.length - 3;
    return keep > 0 ? `${base.slice(0, keep)}...${ext}` : `${name.slice(0, max - 3)}...`;
  }
  return `${name.slice(0, max - 3)}...`;
}

/** Normalize founder codes: "yc abi" / "YC-ABI" → "ycabi" */
export function normalizeAccessCode(code: string): string {
  return code.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

export function isFounderReceipt(receiptId: string, token?: string): boolean {
  if (!token || !receiptId.startsWith("founder_")) return false;
  const entered = normalizeAccessCode(receiptId.slice("founder_".length));
  const expected = normalizeAccessCode(token);
  return !!expected && entered === expected;
}
