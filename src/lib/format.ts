/** Always Western digits (0-9) with US grouping — readable in Arabic and English UI */
const intFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

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
