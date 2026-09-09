export type Locale = "ar" | "en";

export const translations = {
  ar: {
    // Header
    appName: "أبدالستا",
    tagline: "اكتشف اشتراكاتك المخفية والغي اللي ما تحتاجه",
    subtitle: "ارفع كشف حسابك البنكي ونحلله لك على طول",

    // Navigation
    home: "الرئيسية",
    howItWorks: "كيف يعمل",
    privacy: "الخصوصية",
    language: "English",

    // Upload Section
    uploadTitle: "ارفع كشف حسابك",
    uploadDesc: "اسحب ملف CSV هنا أو اضغط للاختيار",
    uploadHint: "ندعم كشوفات: الراجحي، الأهلي، بنك الرياض، البلاد، الإنماء، والمزيد",
    uploadButton: "اختر ملف",
    supportedFormats: "الصيغ المدعومة: CSV",
    selectBank: "اختر بنكك",
    analyzing: "جاري التحليل...",

    // Banks
    alRajhi: "مصرف الراجحي",
    snb: "البنك الأهلي السعودي",
    riyadBank: "بنك الرياض",
    alBilad: "بنك البلاد",
    alinma: "مصرف الإنماء",
    sabb: "بنك ساب",
    bsf: "البنك السعودي الفرنسي",
    anb: "البنك العربي الوطني",
    revolut: "Revolut",
    cryptocom: "Crypto.com",
    otherBank: "بنك آخر",

    // Report
    reportTitle: "تقرير الاشتراكات",
    totalSubscriptions: "إجمالي الاشتراكات",
    monthlyTotal: "المجموع الشهري",
    yearlyTotal: "المجموع السنوي",
    currency: "ريال",

    // Categories
    cancelSection: "🚫 الغيها",
    cancelDesc: "اشتراكات ما تستخدمها وتسحب فلوسك",
    keepSection: "✅ خلّها",
    keepDesc: "اشتراكات تستخدمها وتستاهل",
    investigateSection: "🔍 راجعها",
    investigateDesc: "اشتراكات تحتاج تتأكد منها",

    // Actions
    markCancel: "الغي",
    markKeep: "خلّه",
    markInvestigate: "راجع",
    copyList: "نسخ القائمة",
    copied: "تم النسخ!",
    exportReport: "تصدير التقرير",
    privacyToggle: "إخفاء الأسماء",
    startOver: "ابدأ من جديد",

    // How it works
    step1Title: "ارفع كشف حسابك",
    step1Desc: "نزّل كشف الحساب من تطبيق بنكك بصيغة CSV وارفعه هنا",
    step2Title: "نحلل لك الاشتراكات",
    step2Desc: "نكتشف كل الاشتراكات المتكررة ونصنّفها لك",
    step3Title: "قرر والغي",
    step3Desc: "اختر اللي تبي تلغيه واللي تبي تخليه",

    // Privacy
    privacyTitle: "خصوصيتك أولاً",
    privacyDesc: "CSV ينقرأ في المتصفح أولاً. الفحص الأعمق يرسل نص الكشف لسيرفرنا ثم نحذف الملف.",
    privacyPoint1: "ما نخزن كشف حسابك بعد التحليل",
    privacyPoint2: "ما نبيع بياناتك ولا نستخدمها لإعلانات",
    privacyPoint3: "الكود على GitHub وتقدر تتأكد بنفسك",
    privacyPoint4: "تقدر تخفي أسماء الاشتراكات في التقرير",

    // Footer
    madeWith: "صُنع بحب في السعودية 🇸🇦",
    openSource: "مفتوح المصدر",

    // Misc
    perMonth: "/شهر",
    perYear: "/سنة",
    transactions: "عملية",
    lastCharge: "آخر خصم",
    frequency: "التكرار",
    monthly: "شهري",
    yearly: "سنوي",
    weekly: "أسبوعي",
    quarterly: "ربع سنوي",
    noSubscriptions: "ما لقينا اشتراكات متكررة",
    potentialSavings: "وفر لحد",
  },
  en: {
    appName: "Abidalista",
    tagline: "Find your hidden subscriptions and cancel what you don't need",
    subtitle: "Upload your bank statement and we'll analyze it instantly",

    home: "Home",
    howItWorks: "How it works",
    privacy: "Privacy",
    language: "العربية",

    uploadTitle: "Upload your bank statement",
    uploadDesc: "Drag a CSV file here or click to browse",
    uploadHint:
      "We support: Al Rajhi, SNB, Riyad Bank, Al Bilad, Alinma, and more",
    uploadButton: "Choose file",
    supportedFormats: "Supported formats: CSV",
    selectBank: "Select your bank",
    analyzing: "Analyzing...",

    alRajhi: "Al Rajhi Bank",
    snb: "Saudi National Bank",
    riyadBank: "Riyad Bank",
    alBilad: "Bank AlBilad",
    alinma: "Alinma Bank",
    sabb: "SABB",
    bsf: "Banque Saudi Fransi",
    anb: "Arab National Bank",
    revolut: "Revolut",
    cryptocom: "Crypto.com",
    otherBank: "Other Bank",

    reportTitle: "Subscription Report",
    totalSubscriptions: "Total Subscriptions",
    monthlyTotal: "Monthly Total",
    yearlyTotal: "Yearly Total",
    currency: "SAR",

    cancelSection: "🚫 Cancel These",
    cancelDesc: "Subscriptions you don't use that are draining your money",
    keepSection: "✅ Keep These",
    keepDesc: "Subscriptions you actively use",
    investigateSection: "🔍 Investigate",
    investigateDesc: "Subscriptions you need to review",

    markCancel: "Cancel",
    markKeep: "Keep",
    markInvestigate: "Review",
    copyList: "Copy List",
    copied: "Copied!",
    exportReport: "Export Report",
    privacyToggle: "Hide Names",
    startOver: "Start Over",

    step1Title: "Upload your statement",
    step1Desc:
      "Download your bank statement as CSV from your banking app and upload it here",
    step2Title: "We analyze your subscriptions",
    step2Desc:
      "We detect all recurring charges and categorize them for you",
    step3Title: "Decide and cancel",
    step3Desc: "Choose what to cancel and what to keep",

    privacyTitle: "Privacy First",
    privacyDesc:
      "CSV is read in the browser first. Deep analysis sends statement text to our API, then we discard the file.",
    privacyPoint1: "We do not store your statement after the scan",
    privacyPoint2: "We do not sell your data or use it for ads",
    privacyPoint3: "Code is on GitHub · verify for yourself",
    privacyPoint4: "You can hide subscription names in the report",

    madeWith: "Made with love in Saudi Arabia 🇸🇦",
    openSource: "Open Source",

    perMonth: "/mo",
    perYear: "/yr",
    transactions: "transactions",
    lastCharge: "Last charge",
    frequency: "Frequency",
    monthly: "Monthly",
    yearly: "Yearly",
    weekly: "Weekly",
    quarterly: "Quarterly",
    noSubscriptions: "No recurring subscriptions found",
    potentialSavings: "Potential savings up to",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["ar"];

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}
