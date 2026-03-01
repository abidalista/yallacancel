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
    makeSub("Adobe Creative Cloud", 133.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("ChatGPT Plus", 74.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("Netflix", 59.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("شاهد VIP", 45.00, "monthly", 4, "confirmed", "investigate"),
    makeSub("Calm", 44.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("Spotify", 32.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("YouTube Premium", 26.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("Amazon Prime", 16.00, "monthly", 4, "confirmed", "investigate"),
    makeSub("iCloud+", 14.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("NordVPN", 44.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("LinkedIn Premium", 119.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("فتنس تايم", 199.00, "yearly", 1, "confirmed", "investigate"),
    makeSub("Duolingo Plus", 38.99, "monthly", 4, "suspicious", "investigate"),
    makeSub("Microsoft 365", 29.99, "monthly", 4, "suspicious", "investigate"),
  ],
  totalMonthly: 660.49,
  totalYearly: 7925.88,
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
    { name: "اشتراكات", nameEn: "Subscriptions", total: 2641.96, percent: 42, monthlyAvg: 660.49, count: 53, topMerchants: ["Adobe Creative Cloud", "LinkedIn Premium", "ChatGPT Plus"] },
    { name: "بقالة", nameEn: "Groceries", total: 1885.30, percent: 30, monthlyAvg: 471.33, count: 8, topMerchants: ["بنده ماركت", "NANA GROCERY"] },
    { name: "مطاعم", nameEn: "Eating Out", total: 465.00, percent: 7, monthlyAvg: 116.25, count: 7, topMerchants: ["مطعم البيك", "هنقرستيشن"] },
    { name: "وقود ومواصلات", nameEn: "Transport", total: 812.00, percent: 13, monthlyAvg: 203.00, count: 9, topMerchants: ["ARAMCO", "كريم"] },
    { name: "تسوق", nameEn: "Shopping", total: 486.58, percent: 8, monthlyAvg: 121.65, count: 7, topMerchants: ["AMAZON.SA", "JARIR BOOKSTORE"] },
  ],
  takeaways: [
    { ar: "اشتراكاتك تمثل <b>٤٢٪</b> من إجمالي مصاريفك.", en: "Subscriptions make up <b>42%</b> of your total spending." },
    { ar: "أعلى اشتراك هو <b>Adobe Creative Cloud</b> بـ ١٣٤ ريال/شهر.", en: "Your most expensive subscription is <b>Adobe Creative Cloud</b> at 134 SAR/mo." },
    { ar: "<b>LinkedIn Premium</b> يكلفك ١٢٠ ريال/شهر — تحتاجه؟", en: "<b>LinkedIn Premium</b> costs 120 SAR/mo — do you still need it?" },
  ],
};
