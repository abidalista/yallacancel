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
    makeSub("شاهد VIP", 45.00, "monthly", 4, "confirmed", "investigate"),
    makeSub("Calm", 44.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("Apple", 14.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("iCloud+", 14.99, "monthly", 4, "confirmed", "investigate"),
    makeSub("هنقرستيشن", 29.00, "monthly", 4, "confirmed", "investigate"),
    makeSub("بنده ماركت", 272.91, "monthly", 8, "suspicious", "investigate"),
    makeSub("ARAMCO محطة وقود", 182.56, "monthly", 9, "suspicious", "investigate"),
    makeSub("مطعم البيك - الرياض", 76.43, "monthly", 7, "suspicious", "investigate"),
    makeSub("كريم - مشوار", 29.20, "monthly", 5, "suspicious", "investigate"),
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
    { name: "اشتراكات", nameEn: "Subscriptions", total: 2033.52, percent: 32, monthlyAvg: 508.38, count: 36, topMerchants: ["Adobe Creative Cloud", "ChatGPT Plus", "Netflix"] },
    { name: "بقالة", nameEn: "Groceries", total: 1885.30, percent: 30, monthlyAvg: 471.33, count: 8, topMerchants: ["بنده ماركت", "NANA GROCERY"] },
    { name: "مطاعم", nameEn: "Eating Out", total: 465.00, percent: 7, monthlyAvg: 116.25, count: 7, topMerchants: ["مطعم البيك - الرياض"] },
    { name: "وقود", nameEn: "Transport", total: 1471.00, percent: 23, monthlyAvg: 367.75, count: 9, topMerchants: ["ARAMCO محطة وقود", "كريم - مشوار"] },
    { name: "تسوق", nameEn: "Shopping", total: 486.58, percent: 8, monthlyAvg: 121.65, count: 7, topMerchants: ["AMAZON.SA", "JARIR BOOKSTORE"] },
  ],
  takeaways: [
    { ar: "اشتراكاتك تمثل <b>٣٢٪</b> من إجمالي مصاريفك.", en: "Subscriptions make up <b>32%</b> of your total spending." },
    { ar: "أعلى اشتراك هو <b>Adobe Creative Cloud</b> بـ ١٣٤ ريال/شهر.", en: "Your most expensive subscription is <b>Adobe Creative Cloud</b> at 134 SAR/mo." },
    { ar: "تصرف على البقالة حوالي <b>٤٧١ ريال/شهر</b>.", en: "You spend about <b>471 SAR/mo</b> on groceries." },
  ],
};
