import { AuditReport, Subscription } from "@/lib/types";
import type { SpendingBreakdown } from "@/lib/services";

function makeSub(
  name: string, amount: number, freq: "monthly" | "yearly", occ: number,
  confidence: "confirmed" | "suspicious", status: "investigate" | "cancel" | "keep"
): Subscription {
  const now = new Date().toISOString().slice(0, 10);
  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    normalizedName: name.toLowerCase(),
    amount,
    frequency: freq,
    monthlyEquivalent: freq === "yearly" ? +(amount / 12).toFixed(2) : amount,
    yearlyEquivalent: freq === "yearly" ? amount : +(amount * 12).toFixed(2),
    occurrences: occ,
    lastCharge: now,
    firstCharge: "2025-11-01",
    status,
    confidence,
    transactions: [],
  };
}

export const SAMPLE_REPORT: AuditReport = {
  subscriptions: [
    makeSub("Spotify", 32.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("Netflix", 59.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("ChatGPT Plus", 74.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("Adobe Creative Cloud", 133.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("شاد VIP", 45.00, "monthly", 4, "confirmed", "investigate"),
    makeSub("Calm", 44.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("Apple", 14.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("iCloud+", 14.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("رستش", 29.00, "monthly", 4, "confirmed", "investigate"),
    makeSub("بد ارت", 272.91, "monthly", 8, "suspicious", "investigate"),
    makeSub("ARAMCO حطة د", 182.56, "monthly", 9, "suspicious", "investigate"),
    makeSub("طع اب - اراض", 76.43, "monthly", 7, "suspicious", "investigate"),
    makeSub("ر - شار", 29.20, "monthly", 5, "suspicious", "investigate"),
    makeSub("Amazon", 256.25, "monthly", 4, "suspicious", "investigate"),
  ],
  totalMonthly: 1268.28,
  totalYearly: 15219.36,
  potentialMonthlySavings: 0,
  potentialYearlySavings: 0,
  analyzedTransactions: 72,
  dateRange: { from: "2025-11-01", to: "2026-02-27" },
};

export const SAMPLE_SPENDING: SpendingBreakdown = {
  totalSpend: 6341.40,
  monthlyAvg: 1585.35,
  transactionCount: 72,
  months: 4,
  dateRange: { from: "2025-11-01", to: "2026-02-27" },
  categories: [
    { name: "اشتراات", nameEn: "Subscriptions", total: 2033.52, percent: 32, monthlyAvg: 508.38, count: 36, topMerchants: ["Adobe Creative Cloud", "ChatGPT Plus", "Netflix"] },
    { name: "باة", nameEn: "Groceries", total: 1885.30, percent: 30, monthlyAvg: 471.33, count: 8, topMerchants: ["بد ارت", "NANA GROCERY"] },
    { name: "طاع", nameEn: "Eating Out", total: 465.00, percent: 7, monthlyAvg: 116.25, count: 7, topMerchants: ["طع اب - اراض"] },
    { name: "د", nameEn: "Transport", total: 1471.00, percent: 23, monthlyAvg: 367.75, count: 9, topMerchants: ["ARAMCO حطة د", "ر - شار"] },
    { name: "تس", nameEn: "Shopping", total: 486.58, percent: 8, monthlyAvg: 121.65, count: 7, topMerchants: ["AMAZON.SA", "JARIR BOOKSTORE"] },
  ],
  takeaways: [
    { ar: "اشتراات تث <b></b>  إجا صار.", en: "Subscriptions make up <b>32%</b> of your total spending." },
    { ar: "أع اشترا  <b>Adobe Creative Cloud</b> ب  را/شر.", en: "Your most expensive subscription is <b>Adobe Creative Cloud</b> at 134 SAR/mo." },
    { ar: "تصر ع اباة حا <b> را/شر</b>.", en: "You spend about <b>471 SAR/mo</b> on groceries." },
  ],
};
