/**
 * Subscription Analyzer Service
 * Isolated service for detecting recurring subscriptions from transactions.
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
  stc: "STC",
  "stc play": "STC Play",
  "stc tv": "STC TV",
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
  toyou: "توصيل تويو",
  mrsool: "مرسول",
  nana: "نعناع",
  tamara: "تمارا",
  tabby: "تابي",
  webook: "ويبوك",
  telfaz: "تلفاز",
  vudu: "Vudu",
  hbo: "HBO",
  max: "Max (HBO)",
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
};

// Services that are definitely subscription-based
const DEFINITE_SUBSCRIPTIONS = new Set([
  "Netflix", "Spotify", "Apple Subscriptions", "Apple iTunes",
  "Google One", "YouTube Premium", "Amazon Prime",
  "شاهد VIP", "STC Play", "STC TV",
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
  "Twitch", "Todoist", "Evernote",
]);

function normalizeDescription(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, " ")
    .replace(/\s+/g, " ")
    .replace(
      /\b(payment|purchase|pos|online|recurring|subscription|اشتراك|دفع|شراء)\b/g,
      ""
    )
    .replace(/\d{4,}/g, "")
    .trim();
}

function matchKnownSubscription(description: string): string | null {
  const lower = description.toLowerCase();
  for (const [keyword, name] of Object.entries(KNOWN_SUBSCRIPTIONS)) {
    if (lower.includes(keyword)) {
      return name;
    }
  }
  return null;
}

function groupTransactionsByMerchant(
  transactions: Transaction[]
): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();

  for (const tx of transactions) {
    const normalized = normalizeDescription(tx.description);
    const known = matchKnownSubscription(tx.description);
    const key = known || normalized;

    if (!key || key.length < 2) continue;

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
    const days = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
    intervals.push(days);
  }

  const avgInterval =
    intervals.reduce((sum, d) => sum + d, 0) / intervals.length;

  if (avgInterval <= 10) return "weekly";
  if (avgInterval <= 45) return "monthly";
  if (avgInterval <= 120) return "quarterly";
  if (avgInterval <= 400) return "yearly";

  return null;
}

function hasConsistentAmount(transactions: Transaction[]): boolean {
  if (transactions.length < 2) return false;
  const amounts = transactions.map((t) => t.amount);
  const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
  return amounts.every((a) => Math.abs(a - avg) / avg < 0.15);
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

export function analyzeTransactions(
  transactions: Transaction[]
): AuditReport {
  const groups = groupTransactionsByMerchant(transactions);
  const subscriptions: Subscription[] = [];

  let idCounter = 0;

  for (const [key, txs] of groups) {
    const knownName = matchKnownSubscription(txs[0].description);
    const isKnownSub = knownName && DEFINITE_SUBSCRIPTIONS.has(knownName);

    if (txs.length >= 2) {
      const consistent = hasConsistentAmount(txs);
      const frequency = detectFrequency(txs);

      if (!consistent || !frequency) {
        // Still include as suspicious if multiple occurrences
        const avgAmount = txs.reduce((sum, t) => sum + t.amount, 0) / txs.length;
        const sortedDates = txs.map((t) => t.date).sort().filter((d) => d);

        subscriptions.push({
          id: `sub_${++idCounter}`,
          name: knownName || txs[0].description,
          normalizedName: key,
          amount: Math.round(avgAmount * 100) / 100,
          frequency: "monthly",
          monthlyEquivalent: Math.round(avgAmount * 100) / 100,
          yearlyEquivalent: Math.round(avgAmount * 12 * 100) / 100,
          occurrences: txs.length,
          lastCharge: sortedDates[sortedDates.length - 1] || "",
          firstCharge: sortedDates[0] || "",
          status: "investigate",
          confidence: isKnownSub ? "confirmed" : "suspicious",
          rawDescription: txs[0].description,
          transactions: txs,
        });
        continue;
      }

      const avgAmount =
        txs.reduce((sum, t) => sum + t.amount, 0) / txs.length;
      const monthlyEquivalent = calculateMonthlyEquivalent(avgAmount, frequency);

      const sortedDates = txs
        .map((t) => t.date)
        .sort()
        .filter((d) => d);

      subscriptions.push({
        id: `sub_${++idCounter}`,
        name: knownName || txs[0].description,
        normalizedName: key,
        amount: Math.round(avgAmount * 100) / 100,
        frequency,
        monthlyEquivalent: Math.round(monthlyEquivalent * 100) / 100,
        yearlyEquivalent: Math.round(monthlyEquivalent * 12 * 100) / 100,
        occurrences: txs.length,
        lastCharge: sortedDates[sortedDates.length - 1] || "",
        firstCharge: sortedDates[0] || "",
        status: "investigate",
        confidence: isKnownSub ? "confirmed" : "suspicious",
        rawDescription: txs[0].description,
        transactions: txs,
      });
    } else if (isKnownSub && txs.length === 1) {
      const tx = txs[0];
      const amount = tx.amount;

      subscriptions.push({
        id: `sub_${++idCounter}`,
        name: knownName!,
        normalizedName: key,
        amount: Math.round(amount * 100) / 100,
        frequency: "monthly",
        monthlyEquivalent: Math.round(amount * 100) / 100,
        yearlyEquivalent: Math.round(amount * 12 * 100) / 100,
        occurrences: 1,
        lastCharge: tx.date || "",
        firstCharge: tx.date || "",
        status: "investigate",
        confidence: "confirmed",
        rawDescription: tx.description,
        transactions: txs,
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
