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
    makeSub("ChatGPT Plus", 74.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("Netflix", 59.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("شاهد VIP", 45.00, "monthly", 4, "confirmed", "investigate"),
    makeSub("Spotify", 32.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("YouTube Premium", 26.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("Calm", 19.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("Amazon Prime", 16.00, "monthly", 4, "confirmed", "investigate"),
    makeSub("iCloud+", 14.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("Microsoft 365", 29.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("فتنس تايم", 199.00, "yearly", 1, "confirmed", "investigate"),
    makeSub("Duolingo Plus", 22.99, "monthly", 4, "suspicious", "investigate"),
    makeSub("Canva Pro", 22.99, "monthly", 4, "suspicious", "investigate"),
  ],
  totalMonthly: 363.49,
  totalYearly: 4361.88,
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
    { name: "اشتراكات", nameEn: "Subscriptions", total: 1453.96, percent: 23, monthlyAvg: 363.49, count: 45, topMerchants: ["ChatGPT Plus", "Netflix", "شاهد VIP"] },
    { name: "بقالة", nameEn: "Groceries", total: 1885.30, percent: 30, monthlyAvg: 471.33, count: 8, topMerchants: ["بنده ماركت", "NANA GROCERY"] },
    { name: "مطاعم", nameEn: "Eating Out", total: 465.00, percent: 7, monthlyAvg: 116.25, count: 7, topMerchants: ["مطعم البيك", "هنقرستيشن"] },
    { name: "وقود ومواصلات", nameEn: "Transport", total: 812.00, percent: 13, monthlyAvg: 203.00, count: 9, topMerchants: ["ARAMCO", "كريم"] },
    { name: "تسوق", nameEn: "Shopping", total: 486.58, percent: 8, monthlyAvg: 121.65, count: 7, topMerchants: ["AMAZON.SA", "JARIR BOOKSTORE"] },
  ],
  takeaways: [
    { ar: "اشتراكاتك تمثل <b>٢٣٪</b> من إجمالي مصاريفك.", en: "Subscriptions make up <b>23%</b> of your total spending." },
    { ar: "أعلى اشتراك هو <b>ChatGPT Plus</b> بـ ٧٥ ريال/شهر.", en: "Your most expensive subscription is <b>ChatGPT Plus</b> at 75 SAR/mo." },
    { ar: "تصرف <b>٣٦٣ ريال/شهر</b> على ١٢ اشتراك.", en: "You're spending <b>363 SAR/mo</b> across 12 subscriptions." },
  ],
};
