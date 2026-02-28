export type Locale = "ar" | "en";

export const translations = {
  ar: {
    // Header
    appName: "أبداستا",
    tagline: "اتش اشتراات اخة اغ ا ا تحتاج",
    subtitle: "ارع ش حساب اب ح  ع ط",

    // Navigation
    home: "ارئسة",
    howItWorks: " ع",
    privacy: "اخصصة",
    language: "English",

    // Upload Section
    uploadTitle: "ارع ش حساب",
    uploadDesc: "اسحب  CSV ا أ اضغط اختار",
    uploadHint: "دع شات: اراجح اأ ب اراض اباد اإاء ازد",
    uploadButton: "اختر ",
    supportedFormats: "اصغ ادعة: CSV",
    selectBank: "اختر ب",
    analyzing: "جار اتح...",

    // Banks
    alRajhi: "صر اراجح",
    snb: "اب اأ اسعد",
    riyadBank: "ب اراض",
    alBilad: "ب اباد",
    alinma: "صر اإاء",
    sabb: "ب ساب",
    bsf: "اب اسعد ارس",
    anb: "اب اعرب اط",
    otherBank: "ب آخر",

    // Report
    reportTitle: "ترر ااشتراات",
    totalSubscriptions: "إجا ااشتراات",
    monthlyTotal: "اجع اشر",
    yearlyTotal: "اجع اس",
    currency: "را",

    // Categories
    cancelSection: "🚫 اغا",
    cancelDesc: "اشتراات ا تستخدا تسحب س",
    keepSection: "✅ خا",
    keepDesc: "اشتراات تستخدا تستا",
    investigateSection: " راجعا",
    investigateDesc: "اشتراات تحتاج تتأد ا",

    // Actions
    markCancel: "اغ",
    markKeep: "خ",
    markInvestigate: "راجع",
    copyList: "سخ اائة",
    copied: "ت اسخ!",
    exportReport: "تصدر اترر",
    privacyToggle: "إخاء اأساء",
    startOver: "ابدأ  جدد",

    // How it works
    step1Title: "ارع ش حساب",
    step1Desc: "ز ش احساب  تطب ب بصغة CSV ارع ا",
    step2Title: "ح  ااشتراات",
    step2Desc: "تش  ااشتراات اتررة صا ",
    step3Title: "رر اغ",
    step3Desc: "اختر ا تب تغ ا تب تخ",

    // Privacy
    privacyTitle: "خصصت أا",
    privacyDesc: " اتح ت ع جاز. ا رس أ باات أ سرر.",
    privacyPoint1: "باات ا تطع  جاز أبدا",
    privacyPoint2: "ا خز أ عات بة",
    privacyPoint3: "اد تح اصدر تدر تتأد بس",
    privacyPoint4: "تدر تخ أساء ااشتراات  اترر",

    // Footer
    madeWith: "صع بحب  اسعدة 🇸🇦",
    openSource: "تح اصدر",

    // Misc
    perMonth: "/شر",
    perYear: "/سة",
    transactions: "عة",
    lastCharge: "آخر خص",
    frequency: "اترار",
    monthly: "شر",
    yearly: "س",
    weekly: "أسبع",
    quarterly: "ربع س",
    noSubscriptions: "ا ا اشتراات تررة",
    potentialSavings: "ر حد",
  },
  en: {
    appName: "Abidalista",
    tagline: "Find your hidden subscriptions and cancel what you don't need",
    subtitle: "Upload your bank statement and we'll analyze it instantly",

    home: "Home",
    howItWorks: "How it works",
    privacy: "Privacy",
    language: "اعربة",

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
    investigateSection: " Investigate",
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
      "All analysis happens on your device. No data is ever sent to any server.",
    privacyPoint1: "Your data never leaves your device",
    privacyPoint2: "We don't store any banking information",
    privacyPoint3: "Open source — verify for yourself",
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
