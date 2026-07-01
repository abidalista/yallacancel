/**
 * Subscription Analyzer Service
 * Detects recurring subscriptions from bank transactions with tiered confidence.
 */

import {
  Transaction,
  Subscription,
  SubscriptionFrequency,
  AuditReport,
} from "../types";

// Known subscription services (Arabic and English names)
const KNOWN_SUBSCRIPTIONS: Record<string, string> = {
  netflix: "Netflix",
  "nflx.com": "Netflix",
  nflx: "Netflix",
  spotify: "Spotify",
  "spotify ab": "Spotify",
  "apple.com": "Apple",
  "apple.com/bill": "Apple Subscriptions",
  itunes: "Apple iTunes",
  "google play": "Google Play",
  "google storage": "Google One",
  "google one": "Google One",
  "goog*youtube": "YouTube Premium",
  youtube: "YouTube Premium",
  "amazon prime": "Amazon Prime",
  "amzn mktp": "Amazon",
  amazon: "Amazon",
  shahid: "شاهد VIP",
  "shahid.mbc": "شاهد VIP",
  "shahid vip": "شاهد VIP",
  "stc play": "STC Play",
  "stc tv": "STC TV",
  "stc bill": "STC",
  "stc mobile": "STC",
  jarir: "جرير",
  noon: "نون",
  anghami: "أنغامي",
  deezer: "Deezer",
  "adobe creative": "Adobe Creative Cloud",
  "adobe systems": "Adobe",
  adobe: "Adobe",
  microsoft: "Microsoft 365",
  "msft *": "Microsoft",
  "office 365": "Microsoft 365",
  chatgpt: "ChatGPT Plus",
  openai: "OpenAI",
  "discord nitro": "Discord Nitro",
  discord: "Discord",
  playstation: "PlayStation Plus",
  "ps plus": "PlayStation Plus",
  xbox: "Xbox Game Pass",
  "game pass": "Xbox Game Pass",
  steam: "Steam",
  dropbox: "Dropbox",
  icloud: "iCloud+",
  "notion.so": "Notion",
  notion: "Notion",
  figma: "Figma",
  canva: "Canva Pro",
  grammarly: "Grammarly",
  zoom: "Zoom",
  slack: "Slack",
  linkedin: "LinkedIn Premium",
  twitter: "X Premium",
  "x premium": "X Premium",
  gym: "نادي رياضي",
  fitness: "نادي رياضي",
  "fitness time": "فتنس تايم",
  leejam: "لي جام",
  uber: "Uber",
  careem: "كريم",
  jahez: "جاهز",
  hungerstation: "هنقرستيشن",
  "hunger station": "هنقرستيشن",
  "hungerstation plus": "هنقرستيشن",
  toyou: "توصيل تويو",
  mrsool: "مرسول",
  nana: "نعناع",
  tamara: "تمارا",
  tabby: "تابي",
  webook: "ويبوك",
  telfaz: "تلفاز",
  vudu: "Vudu",
  hbo: "HBO",
  "max.com": "Max (HBO)",
  "disney+": "Disney+",
  "disney plus": "Disney+",
  disney: "Disney+",
  hulu: "Hulu",
  "paramount+": "Paramount+",
  paramount: "Paramount+",
  "apple tv": "Apple TV+",
  twitch: "Twitch",
  crunchyroll: "Crunchyroll",
  duolingo: "Duolingo Plus",
  headspace: "Headspace",
  calm: "Calm",
  "calm.com": "Calm",
  todoist: "Todoist",
  evernote: "Evernote",
  "1password": "1Password",
  lastpass: "LastPass",
  nordvpn: "NordVPN",
  expressvpn: "ExpressVPN",
  surfshark: "Surfshark",
  coursera: "Coursera",
  udemy: "Udemy",
  skillshare: "Skillshare",
  masterclass: "MasterClass",
  "github copilot": "GitHub Copilot",
  copilot: "GitHub Copilot",
  osn: "OSN+",
  bein: "beIN Sports",
  snapchat: "Snapchat+",
  telegram: "Telegram Premium",
  tidal: "TIDAL",
  audible: "Audible",
  kindle: "Kindle Unlimited",
  "prime video": "Prime Video",
  claude: "Claude Pro",
  perplexity: "Perplexity Pro",
  midjourney: "Midjourney",
  cursor: "Cursor Pro",
  gemini: "Google Gemini",
};

const DEFINITE_SUBSCRIPTIONS = new Set([
  "Netflix", "Spotify", "Apple Subscriptions", "Apple iTunes", "Apple",
  "Google One", "YouTube Premium", "Amazon Prime",
  "شاهد VIP", "STC Play", "STC TV", "STC",
  "أنغامي", "Deezer", "Adobe Creative Cloud", "Adobe",
  "Microsoft 365", "ChatGPT Plus", "OpenAI",
  "Discord Nitro", "PlayStation Plus", "Xbox Game Pass",
  "Dropbox", "iCloud+", "Notion", "Figma", "Canva Pro",
  "Grammarly", "Zoom", "Slack", "LinkedIn Premium", "X Premium",
  "نادي رياضي", "فتنس تايم", "لي جام",
  "Disney+", "Hulu", "Paramount+", "Apple TV+",
  "Crunchyroll", "Duolingo Plus", "Headspace", "Calm",
  "1Password", "LastPass", "NordVPN", "ExpressVPN", "Surfshark",
  "Coursera", "Skillshare", "MasterClass",
  "GitHub Copilot", "OSN+", "beIN Sports",
  "Snapchat+", "Telegram Premium", "TIDAL", "Audible",
  "Kindle Unlimited", "Prime Video", "Max (HBO)", "HBO",
  "Twitch", "Todoist", "Evernote", "هنقرستيشن",
  "Claude Pro", "Perplexity Pro", "Midjourney", "Cursor Pro", "Google Gemini",
]);

/** Payroll, P2P transfers, cashback — never subscriptions (phrase-level only) */
const HARD_NON_SUBSCRIPTION_PATTERNS: RegExp[] = [
  /\ballowance\s+from\s+employer\b/i,
  /\bemployer\s+allowance\b/i,
  /\bother\s+allowance\b/i,
  /\bsalary\s+deposit\b/i,
  /\bsalary\s+transfer\b/i,
  /\bpayroll\b/i,
  /\bwage[s]?\s+payment\b/i,
  /\bend\s+of\s+service\b/i,
  /\bصرف\s+رواتب\b/,
  /\bراتب\s+شهري\b/,
  /\bتحويل\s+راتب\b/,
  /\blocal\s+transfer\b/i,
  /\binternational\s+transfer\b/i,
  /\bwire\s+transfer\b/i,
  /\bfunds\s+transfer\b/i,
  /\baccount\s+transfer\b/i,
  /\btransfer\s+to\b/i,
  /\btransfer\s+from\b/i,
  /\bp2p\s+transfer\b/i,
  /\bown\s+account\s+transfer\b/i,
  /\bbetween\s+accounts\b/i,
  /\baccount\s+to\s+account\b/i,
  /\bتحويل\s+محلي\b/,
  /\bتحويل\s+دولي\b/,
  /\bحوال[ةه]\s+محلية\b/,
  /\bحوال[ةه]\s+دولية\b/,
  /\bحوال[ةه]\s+صادرة\b/,
  /\bحوال[ةه]\s+واردة\b/,
  /\bمن\s+حساب\s+إلى\b/,
  /\bمن\s+حساب\s+الى\b/,
  /\bإلى\s+حساب\b/,
  /\bالى\s+حساب\b/,
  /\bstc\s*pay\s+transfer\b/i,
  /\burpay\s+transfer\b/i,
  /\bwestern\s+union\b/i,
  /\bremittance\b/i,
  /\bsarie\s+transfer\b/i,
  /\binstant\s+payment\s+transfer\b/i,
  /\bcash\s*back\b/i,
  /\bcashback\b/i,
  /\bcb\s+reward\b/i,
  /\breward\s+cash\b/i,
  /\bmada\s+cashback\b/i,
  /\bاسترداد\s+نقدي\b/,
  /\bمكافأ[ةه]\s+نقدية\b/,
  /\batm\s+withdrawal\b/i,
  /\bcash\s+withdrawal\b/i,
  /\bسحب\s+نقدي\b/,
  /\bسحب\s+atm\b/i,
  /\bloan\s+repayment\b/i,
  /\bقرض\b/,
  /\brepayment\s+of\s+loan\b/i,
];

/** Everyday retail — recurring but not subscriptions */
const RETAIL_NON_SUBSCRIPTION_PATTERNS: RegExp[] = [
  /\baramco\b/i,
  /\bمحطة\s+وقود\b/,
  /\bبنده\b/,
  /\bcarrefour\b/i,
  /\bpanda\b/i,
  /\blulu\b/i,
  /\bتميم\b/,
  /\bdanube\b/i,
  /\bمطعم\b/,
  /\brestaurant\b/i,
  /\bgrocery\b/i,
  /\bماركت\b/,
  /\bhypermarket\b/i,
  /\bgas\s+station\b/i,
  /\bfuel\b/i,
  /\bوقود\b/,
  /\bstarbucks\b/i,
  /\bمقهى\b/,
  /\bcafe\b/i,
  /\bpharmacy\b/i,
  /\bصيدلية\b/,
];

/** Standalone fee/VAT lines with no merchant */
const FEE_ONLY_PATTERNS: RegExp[] = [
  /^(vat|ضريبة|fee|رسوم|commission|عمولة)\b/i,
  /\bforeign\s+transaction\s+fee\b/i,
  /\bmonthly\s+account\s+fee\b/i,
  /\bannual\s+card\s+fee\b/i,
];

const BANK_NOISE_PREFIX =
  /^(pos|mada|visa|mastercard|mc|purchase|payment|online|ecommerce|e-commerce|sadad|سداد|شراء|دفع|عملية|transaction|debit|credit|card)\b[\s\-:]*/i;

const SHORT_KEYWORD_BOUNDARY = new Set(["max", "du", "hbo", "osn", "stc"]);

function matchKnownSubscription(description: string): string | null {
  const lower = description.toLowerCase();
  for (const [keyword, name] of Object.entries(KNOWN_SUBSCRIPTIONS)) {
    if (SHORT_KEYWORD_BOUNDARY.has(keyword)) {
      const re = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (re.test(lower)) return name;
    } else if (lower.includes(keyword)) {
      return name;
    }
  }
  return null;
}

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function isNonSubscriptionDescription(description: string): boolean {
  const text = description.trim();
  if (!text) return true;

  if (matchKnownSubscription(text)) return false;

  if (matchesAny(text, HARD_NON_SUBSCRIPTION_PATTERNS)) return true;
  if (matchesAny(text, RETAIL_NON_SUBSCRIPTION_PATTERNS)) return true;
  if (matchesAny(text, FEE_ONLY_PATTERNS)) return true;

  return false;
}

function filterSubscriptionCandidates(transactions: Transaction[]): Transaction[] {
  return transactions.filter(
    (tx) => tx.amount > 0 && !isNonSubscriptionDescription(tx.description)
  );
}

function stripBankNoise(desc: string): string {
  let text = desc.trim();
  for (let i = 0; i < 4; i++) {
    const next = text.replace(BANK_NOISE_PREFIX, "").trim();
    if (next === text) break;
    text = next;
  }
  return text;
}

function normalizeDescription(desc: string): string {
  return stripBankNoise(desc)
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, " ")
    .replace(/\s+/g, " ")
    .replace(
      /\b(payment|purchase|pos|online|recurring|subscription|اشتراك|دفع|شراء|sadad|سداد)\b/g,
      ""
    )
    .replace(/\b[A-Z]{2}\s*$/i, "")
    .replace(/\d{4,}/g, "")
    .trim();
}

function buildMerchantKey(description: string): string {
  const known = matchKnownSubscription(description);
  if (known) return known;
  const normalized = normalizeDescription(description);
  return normalized.length >= 2 ? normalized : "";
}

function groupTransactionsByMerchant(
  transactions: Transaction[]
): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();

  for (const tx of transactions) {
    const key = buildMerchantKey(tx.description);
    if (!key) continue;

    const existing = groups.get(key);
    if (existing) {
      existing.push(tx);
    } else {
      groups.set(key, [tx]);
    }
  }

  return groups;
}

function detectFrequency(
  transactions: Transaction[]
): SubscriptionFrequency | null {
  if (transactions.length < 2) return null;

  const dates = transactions
    .map((t) => new Date(t.date).getTime())
    .filter((d) => !isNaN(d))
    .sort((a, b) => a - b);

  if (dates.length < 2) return null;

  const intervals: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    intervals.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
  }

  const sorted = [...intervals].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const avgInterval =
    intervals.reduce((sum, d) => sum + d, 0) / intervals.length;

  const interval = median > 0 ? median : avgInterval;

  if (interval <= 10) return "weekly";
  if (interval <= 50) return "monthly";
  if (interval <= 120) return "quarterly";
  if (interval <= 400) return "yearly";

  return null;
}

function hasConsistentAmount(
  transactions: Transaction[],
  tolerance = 0.18
): boolean {
  if (transactions.length < 2) return false;
  const amounts = transactions.map((t) => t.amount);
  const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
  if (avg <= 0) return false;
  return amounts.every((a) => Math.abs(a - avg) / avg < tolerance);
}

function inferFrequencyOrDefault(
  txs: Transaction[]
): SubscriptionFrequency {
  return detectFrequency(txs) ?? "monthly";
}

function calculateMonthlyEquivalent(
  amount: number,
  frequency: SubscriptionFrequency
): number {
  switch (frequency) {
    case "weekly":
      return amount * 4.33;
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "yearly":
      return amount / 12;
  }
}

function pushSubscription(
  subscriptions: Subscription[],
  idCounter: { value: number },
  params: {
    key: string;
    txs: Transaction[];
    name: string;
    frequency: SubscriptionFrequency;
    confidence: Subscription["confidence"];
  }
): void {
  const { key, txs, name, frequency, confidence } = params;
  const avgAmount = txs.reduce((sum, t) => sum + t.amount, 0) / txs.length;
  const monthlyEquivalent = calculateMonthlyEquivalent(avgAmount, frequency);
  const sortedDates = txs
    .map((t) => t.date)
    .sort()
    .filter((d) => d);

  subscriptions.push({
    id: `sub_${++idCounter.value}`,
    name,
    normalizedName: key,
    amount: Math.round(avgAmount * 100) / 100,
    frequency,
    monthlyEquivalent: Math.round(monthlyEquivalent * 100) / 100,
    yearlyEquivalent: Math.round(monthlyEquivalent * 12 * 100) / 100,
    occurrences: txs.length,
    lastCharge: sortedDates[sortedDates.length - 1] || "",
    firstCharge: sortedDates[0] || "",
    status: "investigate",
    confidence,
    rawDescription: txs[0].description,
    transactions: txs,
  });
}

export function analyzeTransactions(
  transactions: Transaction[]
): AuditReport {
  const candidates = filterSubscriptionCandidates(transactions);
  const groups = groupTransactionsByMerchant(candidates);
  const subscriptions: Subscription[] = [];
  const idCounter = { value: 0 };

  for (const [key, txs] of groups) {
    const knownName = matchKnownSubscription(txs[0].description);
    const isKnownSub = knownName && DEFINITE_SUBSCRIPTIONS.has(knownName);

    if (txs.length >= 2) {
      const consistent = hasConsistentAmount(
        txs,
        isKnownSub ? 0.22 : 0.18
      );
      const frequency = detectFrequency(txs);

      if (isKnownSub) {
        pushSubscription(subscriptions, idCounter, {
          key,
          txs,
          name: knownName!,
          frequency: frequency ?? "monthly",
          confidence: "confirmed",
        });
        continue;
      }

      if (!consistent) continue;

      if (frequency) {
        pushSubscription(subscriptions, idCounter, {
          key,
          txs,
          name: knownName || txs[0].description,
          frequency,
          confidence: "suspicious",
        });
        continue;
      }

      // Same merchant + same amount 2+ times but fuzzy dates — still flag
      pushSubscription(subscriptions, idCounter, {
        key,
        txs,
        name: knownName || txs[0].description,
        frequency: inferFrequencyOrDefault(txs),
        confidence: "suspicious",
      });
    } else if (isKnownSub && txs.length === 1) {
      const tx = txs[0];
      pushSubscription(subscriptions, idCounter, {
        key,
        txs,
        name: knownName!,
        frequency: "monthly",
        confidence: "confirmed",
      });
    }
  }

  subscriptions.sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent);

  const totalMonthly = subscriptions.reduce(
    (sum, s) => sum + s.monthlyEquivalent,
    0
  );
  const totalYearly = totalMonthly * 12;

  const cancelSubs = subscriptions.filter((s) => s.status === "cancel");
  const potentialMonthlySavings = cancelSubs.reduce(
    (sum, s) => sum + s.monthlyEquivalent,
    0
  );

  const allDates = transactions
    .map((t) => t.date)
    .filter((d) => d)
    .sort();

  return {
    subscriptions,
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    totalYearly: Math.round(totalYearly * 100) / 100,
    potentialMonthlySavings:
      Math.round(potentialMonthlySavings * 100) / 100,
    potentialYearlySavings:
      Math.round(potentialMonthlySavings * 12 * 100) / 100,
    analyzedTransactions: transactions.length,
    dateRange: {
      from: allDates[0] || "",
      to: allDates[allDates.length - 1] || "",
    },
  };
}
