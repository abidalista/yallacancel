"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Zap, Link2, BarChart3, FileText, ArrowRight,
  Lock, ChevronDown, ChevronUp, Clock, CheckCircle2,
  RotateCcw, Loader2, Upload, Eye,
} from "lucide-react";
import Header from "@/components/Header";
import FundingTicker from "@/components/FundingTicker";
import AddToHomeScreen from "@/components/AddToHomeScreen";
import UploadZone from "@/components/UploadZone";
import AuditReport from "@/components/AuditReport";
import PaywallModal from "@/components/PaywallModal";
import SpendingBreakdownComponent from "@/components/SpendingBreakdown";
import {
  parseCSVRobust, detectBank,
  parsePDFRobust,
  analyzeTransactions,
  analyzeSpending,
} from "@/lib/services";
import type { SpendingBreakdown as SpendingData } from "@/lib/services";
import { AuditReport as Report, Subscription, SubscriptionStatus, Transaction, BankId } from "@/lib/types";
import { getCancelInfo } from "@/lib/cancel-db";
import { logoUrl as LOGO, faviconUrl as FAV } from "@/lib/logo";

type Step = "landing" | "analyzing" | "results";

interface ParseError {
  type: "no_transactions" | "file_error" | "format_error";
  message: string;
  messageAr: string;
  details: string;
  detailsAr: string;
  suggestions: string[];
  suggestionsAr: string[];
  showBankSelector: boolean;
  showPasteInput: boolean;
  failedFiles: string[];
  warnings: string[];
}

function BrandLogo({ domain, alt, className }: { domain: string; alt: string; className?: string }) {
  return (
    <img
      src={LOGO(domain)}
      alt={alt}
      className={className || "w-5 h-5 rounded-sm object-contain"}
      onError={(e) => {
        const img = e.currentTarget;
        if (!img.dataset.fallback) {
          img.dataset.fallback = "1";
          img.src = FAV(domain);
        }
      }}
    />
  );
}

const BANKS = [
  { name: "الراجحي", domain: "alrajhibank.com.sa" },
  { name: "الأهلي", domain: "alahli.com" },
  { name: "بنك الرياض", domain: "riyadbank.com" },
  { name: "البلاد", domain: "bankalbilad.com" },
  { name: "الإنماء", domain: "alinma.com" },
  { name: "الأول (ساب)", domain: "sabb.com" },
  { name: "الفرنسي", domain: "alfransi.com.sa" },
  { name: "العربي الوطني", domain: "anb.com.sa" },
  { name: "stc pay", domain: "stcpay.com.sa" },
];

const PROBLEM_STATS = [
  { num: "٣٨٢ ريال/شهر", numEn: "382 SAR/mo", text: "يُخصم من حسابك على اشتراكات كل شهر", textEn: "deducted from your account on subscriptions monthly" },
  { num: "٣ اشتراكات", numEn: "3 subscriptions", text: "معدّل الاشتراكات المنسية لكل سعودي", textEn: "the average Saudi forgets about" },
  { num: "٩٠ ثانية", numEn: "90 seconds", text: "هو كل اللي تحتاجه عشان تكتشفهم وتلغيهم", textEn: "is all it takes to find and cancel them" },
];

const STEPS = [
  {
    num: "١",
    icon: Upload,
    titleAr: "ارفع كشف حسابك",
    titleEn: "Upload your statement",
    descAr: "نزّل كشف حسابك من تطبيق بنكك (CSV أو PDF). أو جرّب بمثال جاهز بدون ملف.",
    descEn: "Download your statement from your banking app (CSV or PDF). Or try the demo — no file needed.",
  },
  {
    num: "٢",
    icon: Eye,
    titleAr: "شوف كل اشتراكاتك",
    titleEn: "See every subscription",
    descAr: "نحلل عملياتك ونطلع لك كل اشتراك — المبلغ، التكرار، وأول وآخر خصم.",
    descEn: "We analyze your transactions and surface every subscription — amount, frequency, and charge history.",
  },
  {
    num: "٣",
    icon: Link2,
    titleAr: "الغي بضغطة زر",
    titleEn: "Cancel in one click",
    descAr: "لكل اشتراك رابط إلغاء مباشر. اضغط وألغي — بدون دوخة أو بحث.",
    descEn: "Every subscription has a direct cancel link. Click and cancel — no searching or runaround.",
  },
];

const SUB_CHIPS = [
  { name: "Netflix", domain: "netflix.com" },
  { name: "Spotify", domain: "spotify.com" },
  { name: "شاهد", domain: "shahid.mbc.net" },
  { name: "Disney+", domain: "disneyplus.com" },
  { name: "YouTube", domain: "youtube.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "Amazon", domain: "amazon.sa" },
  { name: "Adobe", domain: "adobe.com" },
  { name: "ChatGPT", domain: "openai.com" },
  { name: "iCloud", domain: "icloud.com" },
  { name: "هنقرستيشن", domain: "hungerstation.com" },
  { name: "stc", domain: "stc.com.sa" },
];

const TESTIMONIALS: { quote: string; name: string; role: string; initial: string }[] = [];

const FAQ_ITEMS = [
  {
    q: "هل بياناتي آمنة؟",
    a: "نعم. كل التحليل يتم داخل متصفحك — ملفك ما يتم رفعه لأي سيرفر. ما نحتفظ بأي بيانات.",
  },
  {
    q: "أي بنوك تدعمون؟",
    a: "ندعم جميع البنوك السعودية: الراجحي، الأهلي، بنك الرياض، البلاد، الإنماء، ساب، الفرنسي، العربي الوطني، و stc bank.",
  },
  {
    q: "كيف أنزّل كشف حسابي؟",
    a: "افتح تطبيق بنكك → الحسابات → كشف الحساب → اختر آخر ٣-٦ أشهر → نزّله كـ CSV أو PDF.",
  },
  {
    q: "هل الأداة مجانية؟",
    a: "التحليل الأول مجاني. بعدها تقدر تترقى بـ ٤٩ ريال لمرة واحدة — بدون اشتراك شهري.",
  },
  {
    q: "هل يلا كانسل يلغي الاشتراكات عني؟",
    a: "حالياً نوفر لك تقرير تفصيلي مع روابط إلغاء مباشرة. الإلغاء نفسه تسويه بنفسك عبر الرابط — عادة يأخذ أقل من دقيقة لكل اشتراك.",
  },
];

export default function HomePage() {
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [step, setStep] = useState<Step>("landing");
  const [report, setReport] = useState<Report | null>(null);
  const [parseError, setParseError] = useState<ParseError | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [txCount, setTxCount] = useState(0);
  const [analyzeStatus, setAnalyzeStatus] = useState("");
  const [spendingData, setSpendingData] = useState<SpendingData | null>(null);
  const [manualBankId, setManualBankId] = useState<BankId | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [retryFiles, setRetryFiles] = useState<File[]>([]);
  const heroRef = useRef<HTMLElement>(null);


  const ar = locale === "ar";

  useEffect(() => {
    document.documentElement.setAttribute("dir", ar ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", locale);
  }, [locale, ar]);

  async function parseFile(file: File, bankOverride?: BankId): Promise<{ transactions: Transaction[]; warnings: string[] }> {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") {
      const result = await parsePDFRobust(file);
      return { transactions: result.transactions, warnings: result.warnings };
    } else {
      const text = await file.text();
      const bankId = bankOverride || detectBank(text);
      const result = parseCSVRobust(text, bankId);
      return { transactions: result.transactions, warnings: result.warnings };
    }
  }

  function buildParseError(failedFiles: string[], allWarnings: string[]): ParseError {
    const hasPdfFail = failedFiles.some(f => f.toLowerCase().endsWith(".pdf"));
    const hasCsvFail = failedFiles.some(f => f.toLowerCase().endsWith(".csv"));
    const hasHeaderIssue = allWarnings.includes("no_headers") || allWarnings.includes("no_date_desc_columns");
    const hasColumnIssue = allWarnings.includes("cant_detect_columns") || allWarnings.includes("no_amount_column");

    const suggestions: string[] = [];
    const suggestionsAr: string[] = [];
    let details = "The file format wasn't recognized.";
    let detailsAr = "صيغة الملف ما تعرفنا عليها.";

    if (hasPdfFail && !hasCsvFail) {
      details = "We couldn't extract data from this PDF. Some bank PDFs use image-based formats.";
      detailsAr = "ما قدرنا نقرأ البيانات من ملف PDF. بعض الكشوفات تكون بصيغة صور.";
      suggestions.push("Try downloading CSV instead of PDF from your bank app");
      suggestionsAr.push("حاول تنزل كشف CSV بدل PDF من تطبيق بنكك");
    }

    if (hasCsvFail || hasHeaderIssue) {
      suggestions.push("Select your bank manually below and try again");
      suggestionsAr.push("اختر بنكك يدوياً تحت وجرب مرة ثانية");
    }

    if (hasColumnIssue) {
      suggestions.push("Make sure the file has: Date, Description, Amount columns");
      suggestionsAr.push("تأكد إن الملف فيه: التاريخ، الوصف، المبلغ");
    }

    suggestions.push("Or copy-paste your transactions text directly");
    suggestionsAr.push("أو انسخ والصق نص العمليات مباشرة");

    return {
      type: "no_transactions",
      message: "Couldn't find any transactions",
      messageAr: "ما قدرنا نلقى أي عمليات",
      details,
      detailsAr,
      suggestions,
      suggestionsAr,
      showBankSelector: hasCsvFail || hasHeaderIssue || hasColumnIssue,
      showPasteInput: true,
      failedFiles,
      warnings: allWarnings,
    };
  }

  async function handleScan(files: File[], bankOverride?: BankId) {
    setParseError(null);
    setStep("analyzing");
    setTxCount(0);
    setAnalyzeStatus(ar ? "نقرأ الملفات..." : "Reading files...");
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      let allTx: Transaction[] = [];
      const failedFiles: string[] = [];
      let allWarnings: string[] = [];

      for (const file of files) {
        try {
          setAnalyzeStatus(ar ? `نقرأ ${file.name}...` : `Reading ${file.name}...`);
          const { transactions, warnings } = await parseFile(file, bankOverride || undefined);
          allWarnings = allWarnings.concat(warnings);
          if (transactions.length === 0) {
            failedFiles.push(file.name);
          } else {
            allTx = allTx.concat(transactions);
            setTxCount(allTx.length);
          }
        } catch (err) {
          console.error(`Failed to parse ${file.name}:`, err);
          failedFiles.push(file.name);
          allWarnings.push("file_exception");
        }
      }

      if (allTx.length === 0) {

        setParseError(buildParseError(failedFiles, allWarnings));
        setRetryFiles(files);
        setStep("landing");
        return;
      }

      setAnalyzeStatus(ar ? "نبحث عن الاشتراكات المخفية..." : "Looking for hidden subscriptions...");
      await new Promise((r) => setTimeout(r, 1500));

      const result = analyzeTransactions(allTx);
      const spending = analyzeSpending(allTx);

      setReport(result);
      setSpendingData(spending);

      setStep("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Scan failed:", err);
      setParseError({
        type: "file_error",
        message: "Something went wrong",
        messageAr: "صار خطأ غير متوقع",
        details: "An unexpected error occurred.",
        detailsAr: "صار خطأ غير متوقع أثناء معالجة ملفك.",
        suggestions: ["Try uploading the file again"],
        suggestionsAr: ["جرب ارفع الملف مرة ثانية"],
        showBankSelector: true,
        showPasteInput: true,
        failedFiles: [],
        warnings: ["unexpected_error"],
      });
      setStep("landing");
    }
  }

  async function handlePasteAnalyze() {
    if (!pasteText.trim()) return;
    const blob = new Blob([pasteText], { type: "text/csv" });
    const file = new File([blob], "pasted-data.csv", { type: "text/csv" });
    setPasteText("");
    handleScan([file], manualBankId || undefined);
  }

  async function handleRetryWithBank(bankId: BankId) {
    setManualBankId(bankId);
    if (retryFiles.length > 0) {
      handleScan(retryFiles, bankId);
    }
  }

  async function handleTestStatement() {
    setParseError(null);
    setStep("analyzing");
    setTxCount(0);
    setAnalyzeStatus(ar ? "نقرأ الملفات..." : "Reading files...");
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const res = await fetch("/test-statement.csv");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (!text || text.length < 50) throw new Error("Empty response");

      const bankId = detectBank(text);
      const parsed = parseCSVRobust(text, bankId);

      if (parsed.transactions.length === 0) {
        throw new Error("Parser returned 0 transactions");
      }

      setTxCount(parsed.transactions.length);
      setAnalyzeStatus(ar ? "نبحث عن الاشتراكات المخفية..." : "Looking for hidden subscriptions...");
      await new Promise((r) => setTimeout(r, 1200));

      const result = analyzeTransactions(parsed.transactions);
      const spending = analyzeSpending(parsed.transactions);

      setReport(result);
      setSpendingData(spending);
      setStep("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    } catch (fetchErr) {
      // Fetch/parse failed — fall through to hardcoded data
    }

    setTxCount(72);
    setAnalyzeStatus(ar ? "نبحث عن الاشتراكات المخفية..." : "Looking for hidden subscriptions...");
    await new Promise((r) => setTimeout(r, 1500));

    const now = "2026-02-27";
    const makeSub = (
      name: string, amount: number, freq: "monthly" | "yearly", occ: number,
      confidence: "confirmed" | "suspicious", status: "investigate" | "cancel" | "keep"
    ): Subscription => ({
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
    });

    const hardcodedReport: Report = {
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

    const hardcodedSpending: SpendingData = {
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

    setReport(hardcodedReport);
    setSpendingData(hardcodedSpending);
    setStep("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleStatusChange(id: string, status: SubscriptionStatus) {
    if (!report) return;
    setReport({
      ...report,
      subscriptions: report.subscriptions.map((s) =>
        s.id === id ? { ...s, status } : s
      ),
    });
  }

  function handleStartOver() {
    setStep("landing");
    setReport(null);
    setSpendingData(null);
    setParseError(null);
    setManualBankId(null);
    setPasteText("");
    setRetryFiles([]);
    setTxCount(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ── Render ──

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <FundingTicker locale={locale} />
      <Header
        locale={locale}
        onLocaleChange={setLocale}
        onLogoClick={() => { setStep("landing"); setReport(null); scrollToTop(); }}
      />

      <AddToHomeScreen locale={locale} />

      {showPaywall && (
        <PaywallModal locale={locale} onClose={() => setShowPaywall(false)} />
      )}

      {/* ── ANALYZING ── */}
      <AnimatePresence>
        {step === "analyzing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen px-6 pt-24 pb-16 bg-[#F8FAFF]"
          >
            <div className="max-w-[700px] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
              >
                <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-2">
                  {txCount.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400 mb-4">
                  {ar ? "عملية" : "transactions"}
                </div>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Loader2 size={14} strokeWidth={1.5} className="text-indigo-500 animate-spin" />
                  <span className="text-sm text-slate-500">{analyzeStatus}</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-400">
                  <Clock size={12} strokeWidth={1.5} />
                  {ar ? "تقريباً خلصنا — لا تطلع من الصفحة" : "Almost there – stay on this page"}
                </div>
              </motion.div>

              {/* Skeleton cards */}
              <div className="space-y-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.12 }}
                    className="bento-card p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="skeleton-circle w-11 h-11 flex-shrink-0" />
                      <div className="flex-1 space-y-2.5">
                        <div className="flex items-center gap-3">
                          <div className="skeleton h-4 w-28" />
                          <div className="skeleton h-4 w-14" />
                        </div>
                        <div className="skeleton h-6 w-40" />
                        <div className="flex gap-4">
                          <div className="skeleton h-3 w-24" />
                          <div className="skeleton h-3 w-20" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RESULTS ── */}
      {step === "results" && report && (() => {
        const subs = report.subscriptions;
        const FREE_VISIBLE = 3;
        const visible = subs.slice(0, FREE_VISIBLE);
        const hidden = subs.slice(FREE_VISIBLE);
        const hiddenYearly = hidden.reduce((s, sub) => s + sub.yearlyEquivalent, 0);

        return (
          <div className="min-h-screen bg-[#F8FAFF] pt-24 pb-16 px-6">
            <div className="max-w-[700px] mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-1">
                  {ar
                    ? `تصرف ${report.totalYearly.toFixed(0)} ريال/سنة`
                    : `You're spending ${report.totalYearly.toFixed(0)} SAR/year`}
                </h1>
                <p className="text-sm text-slate-400 mb-4">
                  {ar ? `من ${subs.length} اشتراك` : `across ${subs.length} subscriptions`}
                </p>
                <div className="h-1 bg-indigo-100 rounded-full mb-8">
                  <div className="h-1 bg-indigo-500 rounded-full w-full" />
                </div>
              </motion.div>

              {/* Subscription list */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bento-card overflow-hidden mb-6 p-0"
              >
                {visible.map((sub, i) => {
                  const info = getCancelInfo(sub.name);
                  return (
                    <div key={sub.id} className="flex items-center px-5 py-4 border-b border-slate-100">
                      <span className="text-sm text-slate-400 w-8 flex-shrink-0">{i + 1}.</span>
                      <span className="font-bold text-sm flex-1 text-slate-800">{sub.name}</span>
                      <span className="font-bold text-sm mr-4 ml-4 text-slate-700">
                        {sub.yearlyEquivalent.toFixed(0)} {ar ? "ريال/سنة" : "SAR/yr"}
                      </span>
                      {info?.cancelUrl ? (
                        <a
                          href={info.cancelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-500 font-bold text-sm no-underline hover:underline flex-shrink-0"
                        >
                          {ar ? "الغي" : "Cancel"} <ArrowRight size={12} strokeWidth={1.5} className="inline" />
                        </a>
                      ) : (
                        <span className="text-indigo-500 font-bold text-sm flex-shrink-0">
                          {ar ? "الغي" : "Cancel"} <ArrowRight size={12} strokeWidth={1.5} className="inline" />
                        </span>
                      )}
                    </div>
                  );
                })}

                {hidden.map((sub, i) => (
                  <div key={sub.id} className="flex items-center px-5 py-4 border-b border-slate-100">
                    <span className="text-sm text-slate-400 w-8 flex-shrink-0">{FREE_VISIBLE + i + 1}.</span>
                    <span className="font-bold text-sm flex-1 blur-sm select-none text-slate-800">{sub.name}</span>
                    <span className="font-bold text-sm mr-4 ml-4 text-slate-700">
                      {sub.yearlyEquivalent.toFixed(0)} {ar ? "ريال/سنة" : "SAR/yr"}
                    </span>
                    <Lock size={14} strokeWidth={1.5} className="text-slate-300 flex-shrink-0" />
                  </div>
                ))}

                {hidden.length > 0 && (
                  <div className="px-5 py-3 bg-slate-50 text-center text-sm text-slate-400">
                    + {hidden.length} {ar ? "إضافية" : "more"} ({hiddenYearly.toFixed(0)} {ar ? "ريال/سنة" : "SAR/yr"})
                  </div>
                )}
              </motion.div>

              {/* Paywall CTA */}
              {hidden.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <p className="text-center text-indigo-600 font-bold text-base mb-4">
                    {ar
                      ? `ادفع ٤٩ ريال، ووفر ${hiddenYearly.toFixed(0)} ريال/سنة — يعني ${Math.round(hiddenYearly / 49)}x عائد`
                      : `Pay 49 SAR, save up to ${hiddenYearly.toFixed(0)} SAR/yr — that's a ${Math.round(hiddenYearly / 49)}x return`}
                  </p>
                  <button
                    onClick={() => setShowPaywall(true)}
                    className="btn-primary w-full text-base py-4 mb-3"
                  >
                    {ar
                      ? `اكشف كل ${subs.length} اشتراك — ٤٩ ريال`
                      : `Unlock all ${subs.length} subscriptions — 49 SAR`}
                  </button>
                  <p className="text-xs text-center text-slate-400 mb-8">
                    {ar
                      ? "دفعة واحدة · بدون حساب · ضمان استرداد كامل"
                      : "One-time payment · No account needed · 100% money-back guarantee"}
                  </p>
                </motion.div>
              )}

              {/* Full audit report */}
              <AuditReport
                report={report}
                locale={locale}
                onStatusChange={handleStatusChange}
                onStartOver={handleStartOver}
                onUpgradeClick={() => setShowPaywall(true)}
              />

              {/* Spending breakdown */}
              {spendingData && spendingData.categories.length > 0 && (
                <div className="mt-6">
                  <SpendingBreakdownComponent data={spendingData} locale={locale} />
                </div>
              )}

              {/* Start over */}
              <div className="text-center mt-8">
                <button onClick={handleStartOver} className="btn-ghost">
                  <RotateCcw size={14} strokeWidth={1.5} />
                  {ar ? "ابدأ من جديد" : "Start Over"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── LANDING PAGE ── */}
      {step === "landing" && (
        <>
          {/* Hero */}
          <section ref={heroRef} className="hero-gradient pt-24 pb-20 px-6">
            <div className="max-w-[1100px] mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="section-label-light inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full mb-5">
                  <Shield size={12} strokeWidth={1.5} /> {ar ? "خصوصية ١٠٠٪ — كل شيء على جهازك" : "100% Private — Everything stays on your device"}
                </span>
                <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white mb-4 max-w-3xl mx-auto leading-[1.1]">
                  {ar
                    ? "٣٨٢ ريال كل شهر. بدون ما تدري."
                    : "382 SAR every month. Without you knowing."}
                </h1>
                <p className="text-lg text-indigo-200/70 max-w-[600px] mx-auto mb-4 leading-relaxed">
                  {ar
                    ? "السعودي العادي يدفع ٤,٥٨٤ ريال سنوياً على اشتراكات ناسيها. ارفع كشف حسابك واكتشف كم تخسر أنت — في ٩٠ ثانية."
                    : "The average Saudi pays 4,584 SAR/year on forgotten subscriptions. Upload your statement and find out how much you're losing — in 90 seconds."}
                </p>
                <p className="text-sm text-indigo-300/50 mb-12">
                  {ar ? "اكتشف. الغي. وفّر." : "Find it. Cancel it. Save."}
                </p>
              </motion.div>

              {/* Upload zone */}
              <UploadZone
                locale={locale}
                onScan={(files) => handleScan(files)}
                onTestClick={handleTestStatement}
              />

              {/* Parse error display */}
              {parseError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 max-w-[560px] mx-auto bento-card bg-red-50 border-red-100 p-5 text-right"
                >
                  <p className="font-bold text-red-700 mb-1">
                    {ar ? parseError.messageAr : parseError.message}
                  </p>
                  <p className="text-sm text-red-600 mb-3">
                    {ar ? parseError.detailsAr : parseError.details}
                  </p>
                  {(ar ? parseError.suggestionsAr : parseError.suggestions).map((s, i) => (
                    <p key={i} className="text-xs text-red-500 mb-1">
                      <CheckCircle2 size={12} strokeWidth={1.5} className="inline mr-1 ml-1" /> {s}
                    </p>
                  ))}

                  {/* Bank retry buttons */}
                  {parseError.showBankSelector && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(["alrajhi", "snb", "riyadbank", "albilad", "alinma", "sabb", "bsf", "anb", "other"] as BankId[]).map((bankId) => (
                        <button
                          key={bankId}
                          onClick={() => handleRetryWithBank(bankId)}
                          className="text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all bg-white"
                        >
                          {bankId}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Paste input */}
                  {parseError.showPasteInput && (
                    <div className="mt-4">
                      <textarea
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        placeholder={ar ? "الصق نص كشف الحساب هنا..." : "Paste your statement text here..."}
                        className="w-full h-24 p-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white resize-none focus:outline-none focus:border-indigo-400"
                      />
                      <button
                        onClick={handlePasteAnalyze}
                        disabled={!pasteText.trim()}
                        className="btn-primary mt-2 text-sm disabled:opacity-50"
                      >
                        {ar ? "حلل النص" : "Analyze text"}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Bank logos */}
              <div className="mt-12 flex flex-wrap justify-center gap-4">
                {BANKS.map((bank) => (
                  <div key={bank.name} className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5">
                    <BrandLogo domain={bank.domain} alt={bank.name} className="w-5 h-5 rounded-sm object-contain" />
                    <span className="text-xs text-white/70 font-medium">{bank.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-indigo-50/60 py-16 px-6 border-y border-indigo-100/50">
            <div className="max-w-[900px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PROBLEM_STATS.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white border border-indigo-100 rounded-[24px] shadow-sm text-center py-8 px-4"
                >
                  <div className="text-3xl font-extrabold tracking-tight text-indigo-600 mb-2">{ar ? stat.num : stat.numEn}</div>
                  <p className="text-sm text-slate-500">{ar ? stat.text : stat.textEn}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* How it works — 3 steps */}
          <section className="bg-white py-20 px-6">
            <div className="max-w-[800px] mx-auto text-center">
              <span className="section-label">
                <Zap size={12} strokeWidth={1.5} /> {ar ? "كيف يعمل" : "How it works"}
              </span>
              <h2 className="section-title">
                {ar ? "٣ خطوات بس" : "Just 3 steps"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.12 }}
                      className="bento-card text-center p-6 relative"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-lg font-extrabold mx-auto mb-4">
                        {step.num}
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                        <Icon size={20} strokeWidth={1.5} className="text-indigo-500" />
                      </div>
                      <h3 className="font-bold text-base text-slate-800 mb-2">{ar ? step.titleAr : step.titleEn}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{ar ? step.descAr : step.descEn}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Result preview — show value before upload */}
          <section className="bg-[#F8FAFF] py-16 px-6">
            <div className="max-w-[600px] mx-auto text-center">
              <span className="section-label">
                <BarChart3 size={12} strokeWidth={1.5} /> {ar ? "هذا اللي بتشوفه" : "Here's what you'll get"}
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 mb-8">
                {ar ? "تقرير كامل — مثل هذا بالضبط" : "A full audit — exactly like this"}
              </h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bento-card p-5 text-right"
              >
                {[
                  { name: "Netflix", amount: "59.99", freq: ar ? "شهري" : "Monthly", domain: "netflix.com" },
                  { name: "Spotify", amount: "32.99", freq: ar ? "شهري" : "Monthly", domain: "spotify.com" },
                  { name: "ChatGPT Plus", amount: "74.99", freq: ar ? "شهري" : "Monthly", domain: "openai.com" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 py-3 ${i > 0 ? "border-t border-slate-100" : ""}`}>
                    <BrandLogo domain={item.domain} alt={item.name} className="w-9 h-9 rounded-xl bg-slate-50 p-1 object-contain" />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-sm text-slate-800">{item.name}</span>
                      <span className="text-xs text-slate-400 mx-2">{item.freq}</span>
                    </div>
                    <div className="text-right ltr-always">
                      <span className="font-extrabold text-sm text-slate-900">{item.amount}</span>
                      <span className="text-xs text-slate-400 ml-1">{ar ? "ريال" : "SAR"}</span>
                    </div>
                  </div>
                ))}
                <div className="border-t border-dashed border-slate-200 mt-2 pt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{ar ? "+١١ اشتراك آخر..." : "+11 more subscriptions..."}</span>
                  <span className="text-xs font-bold text-indigo-500">{ar ? "١٥,٢١٩ ريال/سنة" : "15,219 SAR/year"}</span>
                </div>
              </motion.div>
              <p className="text-xs text-slate-400 mt-4">
                {ar
                  ? "مع روابط إلغاء مباشرة + تحليل مصاريفك بالفئات"
                  : "With direct cancel links + spending breakdown by category"}
              </p>
            </div>
          </section>

          {/* Subscription chips */}
          <section className="bg-[#F0F1FF] py-16 px-6">
            <div className="max-w-[800px] mx-auto text-center">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 mb-6">
                {ar ? "نكتشف أكثر من ١٢٠ خدمة" : "We detect 120+ services"}
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {SUB_CHIPS.map((chip) => (
                  <div key={chip.name} className="inline-flex items-center gap-2 bg-white border border-slate-100 rounded-full px-4 py-2 shadow-sm">
                    <BrandLogo domain={chip.domain} alt={chip.name} className="w-5 h-5 rounded-sm object-contain" />
                    <span className="text-sm font-medium text-slate-600">{chip.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials — add real ones here when available */}
          {TESTIMONIALS.length > 0 && (
          <section className="bg-gradient-to-b from-indigo-50/40 to-white py-20 px-6">
            <div className="max-w-[900px] mx-auto text-center">
              <span className="section-label">
                {ar ? "تجارب المستخدمين" : "What users say"}
              </span>
              <h2 className="section-title mb-12">
                {ar ? "وش يقولون" : "What they say"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {TESTIMONIALS.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="bento-card p-6 text-right"
                  >
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                        {t.initial}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{t.name}</p>
                        <p className="text-xs text-slate-400">{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
          )}

          {/* Comparison table */}
          <section className="bg-white py-20 px-6">
            <div className="max-w-[700px] mx-auto text-center">
              <span className="section-label">
                <BarChart3 size={12} strokeWidth={1.5} /> {ar ? "ليش يلا كانسل" : "Why YallaCancel"}
              </span>
              <h2 className="section-title mb-8">
                {ar ? "قارن بنفسك" : "Compare for yourself"}
              </h2>
              <div className="bento-card overflow-hidden p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-right px-4 py-3 font-bold text-slate-500 text-xs">{ar ? "" : ""}</th>
                      <th className="px-4 py-3 font-bold text-indigo-600 text-xs">{ar ? "يلا كانسل" : "YallaCancel"}</th>
                      <th className="px-4 py-3 font-bold text-slate-400 text-xs">{ar ? "يدوياً" : "Manually"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { labelAr: "وقت البحث", labelEn: "Time to find", ycAr: "٩٠ ثانية", ycEn: "90 sec", manAr: "٣-٤ ساعات", manEn: "3-4 hours" },
                      { labelAr: "الاشتراكات المكتشفة", labelEn: "Subscriptions found", ycAr: "كلها", ycEn: "All of them", manAr: "بعضها", manEn: "Some" },
                      { labelAr: "روابط إلغاء", labelEn: "Cancel links", ycAr: "✓ مباشرة", ycEn: "✓ Direct", manAr: "✗ تدور بنفسك", manEn: "✗ Search yourself" },
                      { labelAr: "يفهم بنوك سعودية", labelEn: "Saudi bank support", ycAr: "✓ ٩ بنوك", ycEn: "✓ 9 banks", manAr: "—", manEn: "—" },
                      { labelAr: "خصوصية", labelEn: "Privacy", ycAr: "✓ على جهازك", ycEn: "✓ On your device", manAr: "✓", manEn: "✓" },
                      { labelAr: "السعر", labelEn: "Price", ycAr: "٤٩ ريال مرة واحدة", ycEn: "49 SAR once", manAr: "وقتك", manEn: "Your time" },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="text-right px-4 py-3 font-medium text-slate-700">{ar ? row.labelAr : row.labelEn}</td>
                        <td className="px-4 py-3 text-center font-bold text-indigo-600">{ar ? row.ycAr : row.ycEn}</td>
                        <td className="px-4 py-3 text-center text-slate-400">{ar ? row.manAr : row.manEn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="bg-[#F8FAFF] py-20 px-6 scroll-mt-20">
            <div className="max-w-[500px] mx-auto text-center">
              <span className="section-label">
                <Zap size={12} strokeWidth={1.5} /> {ar ? "سعر واحد. بدون اشتراك." : "One price. No subscription."}
              </span>
              <h2 className="section-title mb-2">
                {ar ? "٤٩ ريال" : "49 SAR"}
              </h2>
              <p className="text-sm text-slate-400 mb-8">
                {ar ? "دفعة واحدة — مو اشتراك شهري. وتقدر تسترجع فلوسك كاملة." : "One-time payment — not a monthly subscription. Full money-back guarantee."}
              </p>
              <div className="bento-card p-6 text-right mb-6">
                {[
                  { ar: "تحليل غير محدود — كل بنوكك وبطاقاتك", en: "Unlimited analysis — all your banks and cards" },
                  { ar: "روابط إلغاء مباشرة لـ ٥٠+ خدمة سعودية", en: "Direct cancel links for 50+ Saudi services" },
                  { ar: "تقرير PDF بالعربي تحتفظ فيه", en: "Arabic PDF report you can keep" },
                  { ar: "قوالب رسائل إلغاء جاهزة", en: "Ready-to-send cancellation message templates" },
                  { ar: "تحديثات مدى الحياة", en: "Lifetime updates" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <CheckCircle2 size={16} strokeWidth={1.5} className="text-indigo-500 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{ar ? item.ar : item.en}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowPaywall(true)}
                className="btn-primary w-full text-base py-4 mb-3"
              >
                {ar ? "حلل كشف حسابك — ٤٩ ريال" : "Analyze your statement — 49 SAR"}
              </button>
              <p className="text-xs text-slate-400">
                {ar ? "يقبل مدى · فيزا · ماستركارد · ضمان استرداد كامل" : "Accepts mada · Visa · Mastercard · Full refund guarantee"}
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-[#F8FAFF] py-20 px-6">
            <div className="max-w-[700px] mx-auto">
              <div className="text-center mb-12">
                <span className="section-label">{ar ? "أسئلة شائعة" : "FAQ"}</span>
                <h2 className="section-title">{ar ? "أسئلة وأجوبة" : "Questions & Answers"}</h2>
              </div>
              <div className="space-y-3">
                {FAQ_ITEMS.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bento-card"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between py-1 text-right"
                    >
                      <span className="font-bold text-sm text-slate-800">{faq.q}</span>
                      {openFaq === i
                        ? <ChevronUp size={16} strokeWidth={1.5} className="text-slate-400 flex-shrink-0" />
                        : <ChevronDown size={16} strokeWidth={1.5} className="text-slate-400 flex-shrink-0" />}
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-slate-500 leading-relaxed pt-3 border-t border-slate-100 mt-3">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Sources — external citation links */}
          <section className="bg-[#F8FAFF] py-12 px-6">
            <div className="max-w-[700px] mx-auto text-center">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                {ar ? "مصادر ومراجع" : "Sources & References"}
              </p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
                <a href="https://www.sama.gov.sa" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors no-underline">
                  {ar ? "البنك المركزي السعودي (ساما)" : "Saudi Central Bank (SAMA)"}
                </a>
                <a href="https://www.mcit.gov.sa" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors no-underline">
                  {ar ? "وزارة الاتصالات وتقنية المعلومات" : "MCIT Saudi Arabia"}
                </a>
                <a href="https://www.vision2030.gov.sa" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors no-underline">
                  {ar ? "رؤية السعودية ٢٠٣٠" : "Saudi Vision 2030"}
                </a>
              </div>
            </div>
          </section>

          {/* CTA Banner */}
          <section className="bg-gradient-to-br from-indigo-600 to-violet-700 py-14 px-6 text-center">
            <div className="max-w-[600px] mx-auto">
              <h2 className="text-2xl font-extrabold text-white mb-3">
                {ar ? "كل شهر تأخره = فلوس تخسرها" : "Every month you wait = money lost"}
              </h2>
              <p className="text-base text-white/70 mb-6">
                {ar ? "٩٠ ثانية تفصلك عن معرفة كم تدفع على اشتراكات ناسيها." : "90 seconds between you and knowing how much you pay on forgotten subscriptions."}
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-3.5 rounded-full font-bold text-sm no-underline transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer border-none"
              >
                <Upload size={16} strokeWidth={1.5} />
                {ar ? "حلل كشف حسابك الآن" : "Analyze your statement now"}
              </button>
              <div className="mt-4">
                <a
                  href="/guides"
                  className="text-xs text-white/50 hover:text-white/80 transition-colors no-underline"
                >
                  {ar ? "أو تصفح ٢٠٠+ دليل إلغاء مجاني" : "Or browse 200+ free cancellation guides"}
                </a>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-slate-900 py-12 px-6">
            <div className="max-w-[1100px] mx-auto text-center">
              <div className="nav-logo nav-logo-light justify-center mb-2">
                yalla<span className="accent">cancel</span>
              </div>
              <p className="text-lg font-bold text-white/80 mb-4">
                {ar ? "اكتشف. الغي. وفّر." : "Find it. Cancel it. Save."}
              </p>
              <div className="flex justify-center gap-6 mb-6">
                <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors no-underline">
                  {ar ? "الأسعار" : "Pricing"}
                </a>
                <a href="/guides" className="text-sm text-slate-400 hover:text-white transition-colors no-underline">
                  {ar ? "أدلة الإلغاء" : "Cancel Guides"}
                </a>
              </div>
              <p className="text-xs text-slate-500 mb-1">
                {ar ? "٤٩ ريال مرة واحدة · بدون اشتراك · ضمان استرداد كامل" : "49 SAR one-time · No subscription · Full refund guarantee"}
              </p>
              <p className="text-xs text-slate-600">
                © {new Date().getFullYear()} YallaCancel · {ar ? "صُنع بحب في السعودية 🇸🇦" : "Made with love in Saudi Arabia 🇸🇦"}
              </p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
