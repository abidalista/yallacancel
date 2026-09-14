/**
 * Shared subscription QA rules: Apple aggregators, charge annualization, FX sanity.
 */

import { toSar } from "./fx";
import type { SubscriptionFrequency } from "./types";

const APPLE_PRODUCT_RE =
  /\b(apple\s*tv\+?|apple\s*music|apple\s*arcade|apple\s*one|apple\s*fitness|apple\s*news|icloud)\b/i;

const APPLE_AGGREGATOR_RE =
  /apple\.com|itunes|\bapp\s*store\b|\bapl\*|\bapple\s*(bill|services|subscription)?s?\b/i;

/** Known ~$20/mo AI tools. Wild SAR yearly (~5000) usually means bad FX or weekly coercion. */
const LIST_PRICE_USD_MONTHLY: Array<{ test: RegExp; usd: number; maxMonthlySar: number }> = [
  { test: /claude\s*pro|\banthropic\b/i, usd: 20, maxMonthlySar: 120 },
  { test: /chatgpt|openai/i, usd: 20, maxMonthlySar: 120 },
  { test: /cursor\s*pro/i, usd: 20, maxMonthlySar: 120 },
  { test: /perplexity/i, usd: 20, maxMonthlySar: 120 },
];

const KNOWN_MONTHLY_SAAS =
  /claude|anthropic|chatgpt|openai|cursor|perplexity|netflix|spotify|icloud|apple\s*music|apple\s*tv|adobe|notion|canva|grammarly/i;

export function isKnownAppleSubscriptionProduct(
  name: string,
  description = ""
): boolean {
  return APPLE_PRODUCT_RE.test(`${name} ${description}`);
}

export function isAppleBillingAggregator(name: string, description = ""): boolean {
  if (isKnownAppleSubscriptionProduct(name, description)) return false;
  const hay = `${name} ${description}`;
  const trimmed = name.trim();
  if (/^apple(\s+subscriptions?)?$/i.test(trimmed)) return true;
  if (/apple\s*itunes/i.test(trimmed)) return true;
  if (/^app\s*store$/i.test(trimmed)) return true;
  return APPLE_AGGREGATOR_RE.test(hay);
}

export function appleDisplayName(name: string, description = ""): string {
  const hay = `${name} ${description}`;
  if (/icloud/i.test(hay)) return "iCloud+";
  if (/apple\s*tv/i.test(hay)) return "Apple TV+";
  if (/apple\s*music/i.test(hay)) return "Apple Music";
  if (/apple\s*arcade/i.test(hay)) return "Apple Arcade";
  if (/apple\s*one/i.test(hay)) return "Apple One";
  if (/apple\s*fitness/i.test(hay)) return "Apple Fitness+";
  if (/apple\s*news/i.test(hay)) return "Apple News+";
  if (/itunes/i.test(hay)) return "Apple iTunes";
  if (/app\s*store/i.test(hay)) return "App Store";
  return name.trim() || "Apple";
}

export type AppleChargeClass =
  | "named_product"
  | "recurring_aggregator"
  | "one_off"
  | "not_apple";

export function classifyAppleCharge(opts: {
  name: string;
  description?: string;
  occurrences: number;
  consistentAmount?: boolean;
  frequency?: SubscriptionFrequency | null;
}): {
  kind: AppleChargeClass;
  include: boolean;
  confidence: "confirmed" | "suspicious";
} {
  const description = opts.description || "";
  if (isKnownAppleSubscriptionProduct(opts.name, description)) {
    return { kind: "named_product", include: true, confidence: "confirmed" };
  }
  if (!isAppleBillingAggregator(opts.name, description)) {
    return { kind: "not_apple", include: false, confidence: "confirmed" };
  }

  const hasCadence =
    opts.frequency === "weekly" ||
    opts.frequency === "monthly" ||
    opts.frequency === "quarterly" ||
    opts.frequency === "yearly";
  const recurring =
    opts.occurrences >= 2 && opts.consistentAmount !== false && hasCadence;

  if (recurring) {
    return {
      kind: "recurring_aggregator",
      include: true,
      confidence: "confirmed",
    };
  }
  if (opts.occurrences >= 2) {
    return {
      kind: "recurring_aggregator",
      include: true,
      confidence: "suspicious",
    };
  }
  return { kind: "one_off", include: false, confidence: "suspicious" };
}

export function yearlyMultiplier(frequency: SubscriptionFrequency): number {
  switch (frequency) {
    case "weekly":
      return 52;
    case "monthly":
      return 12;
    case "quarterly":
      return 4;
    case "yearly":
      return 1;
  }
}

export function monthlyFromCharge(
  amount: number,
  frequency: SubscriptionFrequency
): number {
  return (amount * yearlyMultiplier(frequency)) / 12;
}

export function yearlyFromCharge(
  amount: number,
  frequency: SubscriptionFrequency
): number {
  return amount * yearlyMultiplier(frequency);
}

/**
 * Free/local path sometimes misses Currency col and treats USD as SAR.
 * Keep native amount for display.
 */
export function resolveNativeAmount(
  name: string,
  amount: number,
  currency: string
): { amount: number; currency: string } {
  const n = name.toLowerCase();
  const cur = (currency || "SAR").toUpperCase();
  const isAiTool = /claude|anthropic|chatgpt|openai|cursor|perplexity|midjourney/.test(
    n
  );

  if (cur === "SAR" && isAiTool && amount >= 17 && amount <= 23) {
    return { amount, currency: "USD" };
  }
  if (cur === "SAR" && isAiTool && amount >= 65 && amount <= 90) {
    return { amount: Math.round((amount / 3.75) * 100) / 100, currency: "USD" };
  }
  return { amount, currency: cur || "SAR" };
}

export function coerceKnownProductFrequency(
  name: string,
  frequency: SubscriptionFrequency,
  occurrences: number
): SubscriptionFrequency {
  if (frequency === "weekly" && occurrences < 4 && KNOWN_MONTHLY_SAAS.test(name)) {
    return "monthly";
  }
  return frequency;
}

/**
 * Annualize from the statement per-charge amount. Never invent extra multipliers.
 * Clamps known $20/mo tools when SAR math is wildly high (~5000 SAR/yr).
 */
export function amountsFromCharge(params: {
  name: string;
  chargeAmount: number;
  currency: string;
  frequency: SubscriptionFrequency;
  occurrences?: number;
}): {
  amount: number;
  currency: string;
  frequency: SubscriptionFrequency;
  monthlyEquivalent: number;
  yearlyEquivalent: number;
  monthlySar: number;
  yearlySar: number;
} {
  const frequency = coerceKnownProductFrequency(
    params.name,
    params.frequency,
    params.occurrences ?? 1
  );
  const resolved = resolveNativeAmount(
    params.name,
    params.chargeAmount,
    params.currency
  );

  let amount = resolved.amount;
  let currency = resolved.currency;
  let freq = frequency;

  // Charge already looks yearly (e.g. 900 SAR tagged monthly for Claude Pro)
  if (
    freq === "monthly" &&
    currency === "SAR" &&
    amount >= 200 &&
    amount <= 1200
  ) {
    const asMonthly = amount / 12;
    if (
      (asMonthly >= 17 && asMonthly <= 23) ||
      (asMonthly >= 65 && asMonthly <= 95)
    ) {
      freq = "yearly";
    }
  }

  let monthlyEquivalent = monthlyFromCharge(amount, freq);
  let yearlyEquivalent = yearlyFromCharge(amount, freq);
  let monthlySar = toSar(monthlyEquivalent, currency);
  let yearlySar = toSar(yearlyEquivalent, currency);

  for (const row of LIST_PRICE_USD_MONTHLY) {
    if (!row.test.test(params.name)) continue;
    if (monthlySar <= row.maxMonthlySar) break;
    amount = row.usd;
    currency = "USD";
    freq = "monthly";
    monthlyEquivalent = row.usd;
    yearlyEquivalent = row.usd * 12;
    monthlySar = toSar(row.usd, "USD");
    yearlySar = toSar(row.usd * 12, "USD");
    break;
  }

  return {
    amount: Math.round(amount * 100) / 100,
    currency,
    frequency: freq,
    monthlyEquivalent: Math.round(monthlyEquivalent * 100) / 100,
    yearlyEquivalent: Math.round(yearlyEquivalent * 100) / 100,
    monthlySar: Math.round(monthlySar * 100) / 100,
    yearlySar: Math.round(yearlySar * 100) / 100,
  };
}
