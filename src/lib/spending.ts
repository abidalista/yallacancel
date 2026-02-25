import { Transaction } from "./types";

export interface SpendingCategory {
  name: string;
  nameEn: string;
  total: number;
  percent: number;
  monthlyAvg: number;
  count: number;
  topMerchants: string[];
}

export interface SpendingBreakdown {
  totalSpend: number;
  monthlyAvg: number;
  transactionCount: number;
  dateRange: { from: string; to: string };
  months: number;
  categories: SpendingCategory[];
  takeaways: { ar: string; en: string }[];
}

// Category keyword matching (Saudi-focused)
const CATEGORY_RULES: { category: string; categoryEn: string; keywords: string[] }[] = [
  {
    category: "توصيل طعام",
    categoryEn: "Food Delivery",
    keywords: ["hungerstation", "هنقرستيشن", "jahez", "جاهز", "mrsool", "مرسول", "toyou", "تويو", "wolt", "uber eats", "deliveroo", "talabat", "طلبات", "carriage", "كاريدج"],
  },
  {
    category: "مطاعم",
    categoryEn: "Eating Out",
    keywords: ["restaurant", "مطعم", "cafe", "كافيه", "coffee", "قهوة", "starbucks", "dunkin", "mcdonald", "ماكدونالدز", "burger", "برجر", "kfc", "بيتزا", "pizza", "shawarma", "شاورما", "sushi", "بوفيه", "buffet", "herfy", "هرفي", "albaik", "البيك", "kudu", "كودو"],
  },
  {
    category: "بقالة",
    categoryEn: "Groceries",
    keywords: ["nana", "نعناع", "grocery", "بقالة", "tamimi", "التميمي", "panda", "بنده", "danube", "الدانوب", "carrefour", "كارفور", "lulu", "لولو", "othaim", "العثيم", "farm", "مزرعة"],
  },
  {
    category: "تسوق",
    categoryEn: "Shopping",
    keywords: ["noon", "نون", "amazon", "أمازون", "jarir", "جرير", "extra", "اكسترا", "namshi", "نمشي", "shein", "aliexpress", "zara", "hm", "ikea", "ايكيا", "xcite", "اكسايت"],
  },
  {
    category: "مواصلات",
    categoryEn: "Transport",
    keywords: ["uber", "أوبر", "careem", "كريم", "bolt", "بولت", "taxi", "تاكسي", "fuel", "وقود", "aramco", "أرامكو", "gas", "benzin", "petrol", "parking", "مواقف", "saher", "ساهر", "sixt", "rental car", "تأجير"],
  },
  {
    category: "اتصالات",
    categoryEn: "Telecom",
    keywords: ["stc", "mobily", "موبايلي", "zain", "زين", "jawwy", "جوّي", "virgin", "فيرجن", "lebara", "ليبارا", "salam", "سلام"],
  },
  {
    category: "تحويلات",
    categoryEn: "Transfers",
    keywords: ["transfer", "تحويل", "حوالة", "stc pay", "urpay", "bayan", "western union", "ويسترن يونيون", "p2p", "iban"],
  },
  {
    category: "سكن",
    categoryEn: "Housing",
    keywords: ["rent", "إيجار", "ايجار", "ejar", "إيجار", "housing", "سكن", "mortgage", "رهن", "electricity", "كهرباء", "water", "مياه", "sec", "marafiq"],
  },
  {
    category: "اشتراكات",
    categoryEn: "Subscriptions",
    keywords: ["netflix", "spotify", "apple.com", "itunes", "google play", "youtube", "shahid", "شاهد", "adobe", "microsoft", "chatgpt", "openai", "discord", "playstation", "xbox", "icloud", "notion", "figma", "canva", "grammarly", "zoom", "slack", "linkedin", "twitter", "nordvpn", "expressvpn", "dropbox", "headspace", "calm", "duolingo", "crunchyroll", "disney", "hulu", "paramount", "hbo", "max", "osn", "bein", "tidal", "audible", "anghami", "deezer"],
  },
  {
    category: "صحة",
    categoryEn: "Health",
    keywords: ["pharmacy", "صيدلية", "hospital", "مستشفى", "clinic", "عيادة", "doctor", "دكتور", "medical", "طبي", "gym", "fitness", "نادي", "leejam", "لي جام", "insurance", "تأمين", "bupa", "medgulf", "tawuniya"],
  },
  {
    category: "تعليم",
    categoryEn: "Education",
    keywords: ["university", "جامعة", "school", "مدرسة", "course", "coursera", "udemy", "skillshare", "masterclass", "تعليم", "education", "tuition"],
  },
];

function categorizeTransaction(description: string): { category: string; categoryEn: string } {
  const lower = description.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        return { category: rule.category, categoryEn: rule.categoryEn };
      }
    }
  }
  return { category: "أخرى", categoryEn: "Other" };
}

export function analyzeSpending(transactions: Transaction[]): SpendingBreakdown {
  if (transactions.length === 0) {
    return {
      totalSpend: 0, monthlyAvg: 0, transactionCount: 0,
      dateRange: { from: "", to: "" }, months: 1,
      categories: [], takeaways: [],
    };
  }

  // Calculate date range
  const dates = transactions.map((t) => t.date).filter(Boolean).sort();
  const from = dates[0] || "";
  const to = dates[dates.length - 1] || "";

  // Estimate months
  let months = 1;
  if (from && to) {
    const d1 = new Date(from);
    const d2 = new Date(to);
    months = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (30.44 * 24 * 60 * 60 * 1000)));
  }

  // Group by category
  const catMap = new Map<string, { categoryEn: string; total: number; count: number; merchants: Map<string, number> }>();

  let totalSpend = 0;

  for (const tx of transactions) {
    const { category, categoryEn } = categorizeTransaction(tx.description);
    totalSpend += tx.amount;

    if (!catMap.has(category)) {
      catMap.set(category, { categoryEn, total: 0, count: 0, merchants: new Map() });
    }
    const cat = catMap.get(category)!;
    cat.total += tx.amount;
    cat.count += 1;

    // Track merchant names (simplified)
    const merchantName = tx.description.split(/[,\-\/]/)[0].trim().slice(0, 30);
    cat.merchants.set(merchantName, (cat.merchants.get(merchantName) || 0) + tx.amount);
  }

  // Build categories sorted by total
  const categories: SpendingCategory[] = [...catMap.entries()]
    .map(([name, data]) => {
      const topMerchants = [...data.merchants.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([m]) => m);
      return {
        name,
        nameEn: data.categoryEn,
        total: Math.round(data.total),
        percent: Math.round((data.total / totalSpend) * 100),
        monthlyAvg: Math.round(data.total / months),
        count: data.count,
        topMerchants,
      };
    })
    .sort((a, b) => b.total - a.total);

  // Generate takeaways
  const takeaways: { ar: string; en: string }[] = [];

  if (categories.length > 0) {
    const top = categories[0];
    takeaways.push({
      ar: `**${top.name}** هي أكبر فئة إنفاق — ${top.total.toLocaleString()} ريال (${top.percent}٪ من المجموع).`,
      en: `**${top.nameEn}** is your biggest spending category — ${top.total.toLocaleString()} SAR (${top.percent}% of total).`,
    });
  }

  const foodDelivery = categories.find((c) => c.nameEn === "Food Delivery");
  const groceries = categories.find((c) => c.nameEn === "Groceries");
  if (foodDelivery && groceries && foodDelivery.total > groceries.total) {
    const ratio = Math.round(foodDelivery.total / groceries.total);
    takeaways.push({
      ar: `**التوصيل أكثر من البقالة بـ ${ratio}x** — ${foodDelivery.total.toLocaleString()} ريال توصيل مقابل ${groceries.total.toLocaleString()} ريال بقالة.`,
      en: `**Food delivery > groceries by ${ratio}x** — ${foodDelivery.total.toLocaleString()} SAR delivery vs ${groceries.total.toLocaleString()} SAR groceries.`,
    });
  }

  const subscriptions = categories.find((c) => c.nameEn === "Subscriptions");
  if (subscriptions) {
    takeaways.push({
      ar: `**الاشتراكات** تكلفك ${subscriptions.monthlyAvg.toLocaleString()} ريال/شهر — وش منها تحتاجه فعلاً؟`,
      en: `**Subscriptions** cost you ${subscriptions.monthlyAvg.toLocaleString()} SAR/mo — which ones do you actually use?`,
    });
  }

  const transport = categories.find((c) => c.nameEn === "Transport");
  if (transport && transport.topMerchants.length > 0) {
    takeaways.push({
      ar: `**المواصلات** — ${transport.total.toLocaleString()} ريال (${transport.topMerchants.join("، ")}).`,
      en: `**Transport** — ${transport.total.toLocaleString()} SAR (${transport.topMerchants.join(", ")}).`,
    });
  }

  // Biggest month
  const monthTotals = new Map<string, number>();
  for (const tx of transactions) {
    if (!tx.date) continue;
    const key = tx.date.slice(0, 7); // YYYY-MM
    monthTotals.set(key, (monthTotals.get(key) || 0) + tx.amount);
  }
  if (monthTotals.size > 1) {
    const sorted = [...monthTotals.entries()].sort((a, b) => b[1] - a[1]);
    const [bigMonth, bigAmt] = sorted[0];
    takeaways.push({
      ar: `**أعلى شهر**: ${bigMonth} (${Math.round(bigAmt).toLocaleString()} ريال).`,
      en: `**Biggest month**: ${bigMonth} (${Math.round(bigAmt).toLocaleString()} SAR).`,
    });
  }

  return {
    totalSpend: Math.round(totalSpend),
    monthlyAvg: Math.round(totalSpend / months),
    transactionCount: transactions.length,
    dateRange: { from, to },
    months,
    categories,
    takeaways,
  };
}
