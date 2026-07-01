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

export function formatSarYr(n: number): string {
  return `${formatMoney(n)} SAR/yr`;
}

export function formatSarPerYear(n: number): string {
  return `${formatMoney(n)} SAR/year`;
}
