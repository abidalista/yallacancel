"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Zap, Link2, BarChart3, FileText, ArrowRight,
  Lock, ChevronDown, ChevronUp, Clock, CheckCircle2,
  RotateCcw, Loader2,
} from "lucide-react";
import Header from "@/components/Header";
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
import { AuditReport as Report, SubscriptionStatus, Transaction, BankId } from "@/lib/types";
import { getCancelInfo } from "@/lib/cancel-db";

type Step = "landing" | "analyzing" | "identify" | "results";

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

const LOGO = (domain: string) =>
  `https://logo.clearbit.com/${domain}`;
const FAV = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

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
  { num: "٣٨٢ ريال", text: "متوسط إنفاق السعودي على الاشتراكات شهرياً" },
  { num: "٧٣٪", text: "من السعوديين ناسين على الأقل اشتراك واحد" },
  { num: "٤,٥٨٤ ريال", text: "متوسط التوفير المحتمل سنوياً" },
];

const FEATURES = [
  {
    icon: Shield,
    title: "خصوصية كاملة",
    desc: "كل التحليل يتم على جهازك — ما نحتفظ بأي بيانات.",
  },
  {
    icon: Lock,
    title: "يفهم بنكك",
    desc: "يقرأ كشوفات ٩ بنوك سعودية ويفكك الرموز الغريبة تلقائياً.",
  },
  {
    icon: Zap,
    title: "نتيجة في ثوانٍ",
    desc: "ارفع الكشف وخلال ثوانٍ تشوف كل اشتراكاتك مع روابط الإلغاء.",
  },
  {
    icon: BarChart3,
    title: "تقرير تفصيلي",
    desc: "نوريك المبلغ الشهري والسنوي ونقترح لك وش تلغي ووش تخلي.",
  },
  {
    icon: Link2,
    title: "روابط إلغاء مباشرة",
    desc: "لكل اشتراك رابط مباشر يوديك صفحة الإلغاء — بدون دوخة.",
  },
  {
    icon: FileText,
    title: "أدلة إلغاء خطوة بخطوة",
    desc: "٢٠٠+ دليل إلغاء مفصّل لأشهر الخدمات في السعودية والعالم.",
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

const TESTIMONIALS = [
  {
    quote: "ما توقعت إن Calm وDropbox وشي اسمه Adobe Stock ما فتحته من سنتين ينخصمون كلهم. ألغيتهم كلهم في دقيقتين وأنا أشرب قهوتي.",
    name: "محمد ع.",
    role: "مهندس برمجيات — الرياض",
    initial: "م",
  },
  {
    quote: "كنت أشوف APPLE.COM/BILL كل شهر وما أعرف وش هي بالضبط. يلا كانسل فكّها وعرّفتني إنها iCloud+ و Apple Music وApple TV+ — دفعت فيهم ثلاثتهم بدون ما أقصد!",
    name: "نورة الغامدي",
    role: "معلمة — جدة",
    initial: "ن",
  },
  {
    quote: "كنت مشترك في Adobe وأنا ما أحتاجه — بس خفت من رسوم الإلغاء المبكر. الموقع حذّرني من التوقيت الصح وأنقذني من دفع رسوم إضافية. وفرت ١,٦٠٨ ريال.",
    name: "عبدالرحمن ف.",
    role: "مصمم مستقل — الدمام",
    initial: "ع",
  },
];

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
  const [analyzeTimer, setAnalyzeTimer] = useState(0);
  const [analyzeStatus, setAnalyzeStatus] = useState("");
  const [spendingData, setSpendingData] = useState<SpendingData | null>(null);
  const [manualBankId, setManualBankId] = useState<BankId | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [retryFiles, setRetryFiles] = useState<File[]>([]);
  const heroRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    setAnalyzeTimer(0);
    setTxCount(0);
    setAnalyzeStatus(ar ? "نقرأ الملفات..." : "Reading files...");
    window.scrollTo({ top: 0, behavior: "smooth" });

    const start = Date.now();
    timerRef.current = setInterval(() => {
      setAnalyzeTimer(Math.floor((Date.now() - start) / 1000));
    }, 1000);

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
        if (timerRef.current) clearInterval(timerRef.current);
        setParseError(buildParseError(failedFiles, allWarnings));
        setRetryFiles(files);
        setStep("landing");
        return;
      }

      setAnalyzeStatus(ar ? "نبحث عن الاشتراكات المخفية..." : "Looking for hidden subscriptions...");
      await new Promise((r) => setTimeout(r, 1500));

      const result = analyzeTransactions(allTx);
      const spending = analyzeSpending(allTx);
      if (timerRef.current) clearInterval(timerRef.current);

      setReport(result);
      setSpendingData(spending);

      const suspicious = result.subscriptions.filter((s) => s.confidence === "suspicious");
      if (suspicious.length > 0) {
        setStep("identify");
      } else {
        setStep("results");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Scan failed:", err);
      if (timerRef.current) clearInterval(timerRef.current);
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
    try {
      const res = await fetch("/test-statement.csv");
      const text = await res.text();
      const blob = new Blob([text], { type: "text/csv" });
      const file = new File([blob], "test-statement.csv", { type: "text/csv" });
      handleScan([file]);
    } catch {
      setParseError({
        type: "file_error",
        message: "Couldn't load sample data",
        messageAr: "ما قدرنا نحمل البيانات التجريبية",
        details: "The test file couldn't be fetched.",
        detailsAr: "ما قدرنا نجيب الملف التجريبي. جرب ارفع ملفك.",
        suggestions: [],
        suggestionsAr: [],
        showBankSelector: false,
        showPasteInput: true,
        failedFiles: [],
        warnings: ["test_file_fetch_failed"],
      });
    }
  }

  function handleIdentifyConfirm(id: string, choice: "subscription" | "not" | "unknown") {
    if (!report) return;
    setReport({
      ...report,
      subscriptions: report.subscriptions.map((s) => {
        if (s.id !== id) return s;
        if (choice === "subscription") return { ...s, userConfirmed: true, confidence: "confirmed" as const };
        if (choice === "not") return { ...s, userConfirmed: true, status: "keep" as const };
        return { ...s, userConfirmed: true };
      }),
    });
  }

  function handleFinishIdentify() {
    if (report) {
      const filtered = report.subscriptions.filter(
        (s) => !(s.userConfirmed && s.status === "keep" && s.confidence === "suspicious")
      );
      setReport({ ...report, subscriptions: filtered });
    }
    setStep("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSkipIdentify() {
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
    setAnalyzeTimer(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ── Render ──

  return (
    <div className="min-h-screen bg-white">
      <Header
        locale={locale}
        onLocaleChange={setLocale}
        onLogoClick={() => { setStep("landing"); setReport(null); scrollToTop(); }}
      />

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
            className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 bg-slate-50"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-[500px] bento-card py-16 px-8 text-center"
            >
              <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-2">
                {txCount.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400 mb-6">
                {ar ? "عملية" : "transactions"}
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Loader2 size={14} strokeWidth={1.5} className="text-indigo-500 animate-spin" />
                <span className="text-sm text-slate-500">{analyzeStatus}</span>
              </div>
              <div className="text-lg font-bold text-slate-300 mb-6">
                {analyzeTimer}s
              </div>
              <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-400">
                <Clock size={12} strokeWidth={1.5} />
                {ar ? "تقريباً خلصنا — لا تطلع من الصفحة" : "Almost there – stay on this page"}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── IDENTIFY ── */}
      {step === "identify" && report && (() => {
        const confirmed = report.subscriptions.filter((s) => s.confidence === "confirmed");
        const suspicious = report.subscriptions.filter((s) => s.confidence === "suspicious");
        return (
          <div className="min-h-screen bg-white pt-24 pb-16 px-6">
            <div className="max-w-[700px] mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <p className="text-indigo-500 font-bold text-sm mb-2">
                  {ar ? `لقينا ${confirmed.length} اشتراكات مؤكدة` : `Found ${confirmed.length} clear subscriptions`}
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
                  {ar ? `ساعدنا نتعرف على ${suspicious.length} إضافية` : `Help identify ${suspicious.length} more`}
                </h1>
                <div className="h-1 bg-indigo-100 rounded-full mb-6">
                  <div className="h-1 bg-indigo-500 rounded-full" style={{ width: "60%" }} />
                </div>
                <p className="text-sm text-slate-500 mb-8">
                  {ar
                    ? "لقينا بعض العمليات المتكررة مو متأكدين منها. ساعدنا نضيفها لمجموعك:"
                    : "We found some recurring charges we're not sure about. Help us include them in your total:"}
                </p>
              </motion.div>

              <div className="space-y-4 mb-8">
                {suspicious.map((sub, i) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bento-card p-5"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <span className="font-bold text-base text-slate-800">{sub.name}</span>
                        {sub.occurrences > 1 && (
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full mr-2 ml-2">
                            x{sub.occurrences}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-base text-slate-900">
                        {sub.amount.toFixed(0)} {ar ? "ريال/شهر" : "SAR/monthly"}
                      </span>
                    </div>
                    {sub.rawDescription && (
                      <p className="text-xs text-slate-400 mb-3">{sub.rawDescription}</p>
                    )}
                    <div className="flex gap-2.5">
                      {(["subscription", "not", "unknown"] as const).map((choice) => {
                        const labels = {
                          subscription: ar ? "اشتراك" : "Subscription",
                          not: ar ? "مو اشتراك" : "Not a sub",
                          unknown: ar ? "ما أدري" : "Don't know",
                        };
                        const isActive =
                          (choice === "subscription" && sub.userConfirmed && sub.confidence === "confirmed") ||
                          (choice === "not" && sub.userConfirmed && sub.status === "keep") ||
                          (choice === "unknown" && sub.userConfirmed && sub.confidence === "suspicious" && sub.status !== "keep");
                        return (
                          <button
                            key={choice}
                            onClick={() => handleIdentifyConfirm(sub.id, choice)}
                            className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${
                              isActive
                                ? "bg-indigo-500 text-white"
                                : "bg-white border border-slate-200 text-slate-500 hover:border-indigo-300"
                            }`}
                          >
                            {labels[choice]}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleFinishIdentify}
                  className="btn-primary flex-1"
                >
                  {ar ? "شوف المجموع" : "See your total"} <ArrowRight size={16} strokeWidth={1.5} />
                </button>
                <button
                  onClick={handleSkipIdentify}
                  className="btn-ghost"
                >
                  {ar ? `تخطى (${confirmed.length})` : `Skip (${confirmed.length})`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── RESULTS ── */}
      {step === "results" && report && (() => {
        const subs = report.subscriptions;
        const FREE_VISIBLE = 3;
        const visible = subs.slice(0, FREE_VISIBLE);
        const hidden = subs.slice(FREE_VISIBLE);
        const hiddenYearly = hidden.reduce((s, sub) => s + sub.yearlyEquivalent, 0);

        return (
          <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-6">
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
                    ? "وقف النزيف. الغي أي اشتراك بضغطتين."
                    : "Stop the drain. Cancel any subscription in two clicks."}
                </h1>
                <p className="text-lg text-indigo-200/70 max-w-[600px] mx-auto mb-12 leading-relaxed">
                  {ar
                    ? "ارفع كشف حسابك البنكي ونكشف لك كل الاشتراكات المخفية — مع روابط إلغاء مباشرة."
                    : "Upload your bank statement and we'll find every hidden subscription — with direct cancel links."}
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
                  <div className="text-3xl font-extrabold tracking-tight text-indigo-600 mb-2">{stat.num}</div>
                  <p className="text-sm text-slate-500">{stat.text}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="bg-white py-20 px-6">
            <div className="max-w-[1000px] mx-auto text-center">
              <span className="section-label">
                <Zap size={12} strokeWidth={1.5} /> {ar ? "كيف يعمل" : "How it works"}
              </span>
              <h2 className="section-title">
                {ar ? "اكتشف. قرر. وفّر." : "Discover. Decide. Save."}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
                {FEATURES.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                      className="bento-card text-right p-6"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                        <Icon size={20} strokeWidth={1.5} className="text-indigo-500" />
                      </div>
                      <h3 className="font-bold text-base text-slate-800 mb-2">{f.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Subscription chips */}
          <section className="bg-slate-50 py-16 px-6">
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

          {/* Testimonials */}
          <section className="bg-gradient-to-b from-indigo-50/40 to-white py-20 px-6">
            <div className="max-w-[900px] mx-auto text-center">
              <span className="section-label">
                {ar ? "تجارب المستخدمين" : "What users say"}
              </span>
              <h2 className="section-title mb-12">
                {ar ? "وفّروا آلاف الريالات" : "They saved thousands"}
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

          {/* FAQ */}
          <section className="bg-slate-50 py-20 px-6">
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

          {/* CTA Banner */}
          <section className="bg-gradient-to-br from-indigo-600 to-violet-700 py-14 px-6 text-center">
            <div className="max-w-[600px] mx-auto">
              <h2 className="text-2xl font-extrabold text-white mb-3">
                {ar ? "تبي تلغي اشتراك معين؟" : "Want to cancel a specific subscription?"}
              </h2>
              <p className="text-base text-white/70 mb-6">
                {ar ? "عندنا أدلة إلغاء مفصلة لأكثر من ٢٠٠ خدمة." : "We have detailed cancellation guides for 200+ services."}
              </p>
              <a
                href="/guides"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-3.5 rounded-full font-bold text-sm no-underline transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <FileText size={16} strokeWidth={1.5} />
                {ar ? "تصفح أدلة الإلغاء" : "Browse Cancel Guides"}
              </a>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-slate-900 py-10 px-6">
            <div className="max-w-[1100px] mx-auto text-center">
              <div className="nav-logo nav-logo-light justify-center mb-3">
                yalla<span className="accent">cancel</span>
              </div>
              <div className="flex justify-center gap-6 mb-4">
                <a href="/guides" className="text-sm text-slate-400 hover:text-white transition-colors no-underline">
                  {ar ? "أدلة الإلغاء" : "Cancel Guides"}
                </a>
              </div>
              <p className="text-sm text-slate-500">
                {ar ? "صُنع بحب في السعودية" : "Made with love in Saudi Arabia"}
              </p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
