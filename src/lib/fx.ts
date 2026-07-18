/** Approximate mid-market rates into SAR */

export const FX_TO_SAR: Record<string, number> = {
  SAR: 1,
  USD: 3.75,
  EUR: 4.1,
  GBP: 4.8,
  AED: 1.02,
  KWD: 12.2,
  BHD: 9.95,
  QAR: 1.03,
  CHF: 4.25,
  CAD: 2.75,
  AUD: 2.45,
  SGD: 2.85,
  HKD: 0.48,
  PLN: 0.95,
};

export function toSar(amount: number, currency?: string | null): number {
  if (!Number.isFinite(amount)) return 0;
  const cur = (currency || "SAR").trim().toUpperCase();
  const rate = FX_TO_SAR[cur] ?? 1;
  return Math.round(amount * rate * 100) / 100;
}
