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
    if (count === 1) return "اشتراك متكرر واحد";
    if (count === 2) return "اشتراكين متكررين";
    if (count >= 3 && count <= 10) return `${count} اشتراكات متكررة`;
    return `${count} اشتراك متكرر`;
  }
  return count === 1 ? "1 recurring subscription" : `${count} recurring subscriptions`;
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

export function isFounderReceipt(receiptId: string, token?: string): boolean {
  return !!token && receiptId === `founder_${token}`;
}
