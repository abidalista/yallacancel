"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Zap, Link2, BarChart3, FileText, ArrowRight,
  Lock, ChevronDown, ChevronUp, Clock, CheckCircle2,
  RotateCcw, Loader2, Search,
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
  analyzeFileWithAI,
} from "@/lib/services";
import type { SpendingBreakdown as SpendingData } from "@/lib/services";
import { AuditReport as Report, SubscriptionStatus, Transaction, BankId } from "@/lib/types";
import { getCancelInfo } from "@/lib/cancel-db";
import MerchantLogo from "@/components/MerchantLogo";

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
  { num: "٣٨٢ ريال", text: "متوسط ما يدفعه السعودي على الاشتراكات الرقمية كل شهر" },
  { num: "٧٣٪", text: "من السعوديين عندهم اشتراك واحد على الأقل ناسيه ومو مستخدمه" },
  { num: "٤,٥٨٤ ريال", text: "متوسط التوفير السنوي لو ألغيت الاشتراكات اللي ما تحتاجها" },
];

const FEATURES = [
  {
    icon: Shield,
    title: "آمن وخاص",
    desc: "كل التحليل يصير داخل متصفحك مباشرة — ملفك ما يوصل لأي سيرفر خارجي.",
  },
  {
    icon: Lock,
    title: "يقرأ كشف بنكك",
    desc: "يتعرف على كشوفات ٩ بنوك سعودية ويفك رموز العمليات الغريبة تلقائيا.",
  },
  {
    icon: Zap,
    title: "نتائج في ثواني",
    desc: "ارفع الكشف وخلال ثواني تشوف قائمة كاملة باشتراكاتك مع تكلفة كل واحد.",
  },
  {
    icon: BarChart3,
    title: "تقرير واضح",
    desc: "نوريك المبلغ الشهري والسنوي لكل اشتراك وتقدر تحدد وش تبقي ووش تلغي.",
  },
  {
    icon: Link2,
    title: "روابط إلغاء مباشرة",
    desc: "كل اشتراك معه رابط يوديك مباشرة لصفحة الإلغاء — بدون دوخة.",
  },
  {
    icon: FileText,
    title: "أدلة تفصيلية",
    desc: "أكثر من ٢٠٠ دليل إلغاء خطوة بخطوة لأشهر الخدمات في السعودية والعالم.",
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
    quote: "كنت اشوف APPLE.COM/BILL كل شهر وما اعرف وش هي بالضبط. يلا كنسل فكها وعرفتني انها iCloud+ و Apple Music وApple TV+ — دفعت فيهم ثلاثتهم بدون ما اقصد!",
    name: "نورة الغامدي",
    role: "معلمة — جدة",
    initial: "ن",
  },
  {
    quote: "كنت مشترك في Adobe وانا ما احتاجه — بس خفت من رسوم الالغاء المبكر. الموقع حذرني من التوقيت الصح وانقذني من دفع رسوم اضافية. وفرت ١,٦٠٨ ريال.",
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
    q: "كيف انزل كشف حسابي؟",
    a: "افتح تطبيق بنكك → الحسابات → كشف الحساب → اختر اخر ٣-٦ اشهر → نزله كـ CSV او PDF.",
  },
  {
    q: "هل الأداة مجانية؟",
    a: "التحليل الأول مجاني. بعدها تقدر تترقى بـ ٤٩ ريال لمرة واحدة — بدون اشتراك شهري.",
  },
  {
    q: "هل يلا كنسل يلغي الاشتراكات عني؟",
    a: "حاليا نوفر لك تقرير تفصيلي مع روابط إلغاء مباشرة. الإلغاء نفسه تسويه بنفسك عبر الرابط — عادة يأخذ أقل من دقيقة لكل اشتراك.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [step, setStep] = useState<Step>("landing");
  const [report, setReport] = useState<Report | null>(null);
  const [parseError, setParseError] = useState<ParseError | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
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

  // Push browser history when leaving landing so back button returns to landing
  useEffect(() => {
    if (step !== "landing") {
      window.history.pushState({ step }, "", window.location.pathname);
    }
  }, [step]);

  // Handle browser back button
  useEffect(() => {
    function onPopState() {
      if (step !== "landing") {
        handleStartOver();
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [step]);

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
      suggestionsAr.push("اختر بنكك يدويا تحت وجرب مرة ثانية");
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
      // ── Try AI analysis first (Claude API) ──
      setAnalyzeStatus(ar ? "الذكاء الاصطناعي يحلل كشفك..." : "AI is analyzing your statement...");

      let aiSuccess = false;
      for (const file of files) {
        const aiResult = await analyzeFileWithAI(file);
        if (aiResult.success) {
          console.log("[handleScan] AI analysis succeeded");
          if (timerRef.current) clearInterval(timerRef.current);
          setReport(aiResult.report);
          setSpendingData(null);
          setStep("results");
          window.scrollTo({ top: 0, behavior: "smooth" });
          aiSuccess = true;
          break;
        } else {
          console.warn("[handleScan] AI analysis failed:", aiResult.error);
        }
      }

      if (aiSuccess) return;

      // ── Fallback: old parser + analyzer ──
      console.log("[handleScan] Falling back to local parser");
      setAnalyzeStatus(ar ? "نجرب طريقة ثانية..." : "Trying alternative method...");

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

      // Go straight to results — everything is a subscription by default
      setStep("results");
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

  function handleTestStatement() {
    router.push("/report/sample");
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
    // Don't filter out any items — keep all subscriptions visible
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
    <div className="min-h-screen bg-[#EDF5F3]">
      <Header
        locale={locale}
        onLocaleChange={setLocale}
        onLogoClick={() => { setStep("landing"); setReport(null); scrollToTop(); }}
      />

      {showPaywall && (
        <PaywallModal locale={locale} onClose={() => setShowPaywall(false)} onPaymentSuccess={() => { setIsPaid(true); setShowPaywall(false); }} />
      )}

      {/* ── ANALYZING ── */}
      <AnimatePresence>
        {step === "analyzing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 bg-[#EDF5F3]"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-[500px] bento-card py-16 px-8 text-center"
            >
              <div className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-2" style={{ color: "#1A3A35" }}>
                {txCount.toLocaleString()}
              </div>
              <div className="text-sm mb-6" style={{ color: "#8AADA8" }}>
                {ar ? "عملية" : "transactions"}
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Loader2 size={14} strokeWidth={1.5} className="animate-spin" style={{ color: "#00A651" }} />
                <span className="text-sm" style={{ color: "#4A6862" }}>{analyzeStatus}</span>
              </div>
              <div className="text-lg font-bold mb-6" style={{ color: "#C5DDD9" }}>
                {analyzeTimer}s
              </div>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs" style={{ background: "#E5EFED", color: "#8AADA8" }}>
                <Clock size={12} strokeWidth={1.5} />
                {ar ? "تقريبا خلصنا — لا تطلع من الصفحة" : "Almost there – stay on this page"}
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
          <div className="min-h-screen bg-[#EDF5F3] pt-24 pb-16 px-6">
            <div className="max-w-[700px] mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <p className="font-bold text-sm mb-2" style={{ color: "#00A651" }}>
                  {ar ? `لقينا ${confirmed.length} اشتراكات مؤكدة` : `Found ${confirmed.length} clear subscriptions`}
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: "#1A3A35" }}>
                  {ar ? `ساعدنا نتعرف على ${suspicious.length} إضافية` : `Help identify ${suspicious.length} more`}
                </h1>
                <div className="h-1 rounded-full mb-6" style={{ background: "#C5DDD9" }}>
                  <div className="h-1 rounded-full" style={{ width: "60%", background: "#1A3A35" }} />
                </div>
                <p className="text-sm mb-8" style={{ color: "#4A6862" }}>
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
                        <span className="font-bold text-base" style={{ color: "#1A3A35" }}>{sub.name}</span>
                      </div>
                      <span className="font-bold text-base" style={{ color: "#1A3A35" }}>
                        {sub.amount.toFixed(0)} {ar ? "ريال/شهر" : "SAR/monthly"}
                      </span>
                    </div>
                    {sub.rawDescription && (
                      <p className="text-xs mb-3" style={{ color: "#8AADA8" }}>{sub.rawDescription}</p>
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
                            className="text-xs font-bold px-4 py-2 rounded-full transition-all"
                            style={isActive
                              ? { background: "#1A3A35", color: "white", border: "1.5px solid #1A3A35" }
                              : { background: "white", color: "#4A6862", border: "1.5px solid #E5EFED" }}
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
                  {ar ? "شوف تقريري" : "Show my report"} <ArrowRight size={16} strokeWidth={1.5} />
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
          <div className="min-h-screen bg-[#EDF5F3] pt-24 pb-16 px-6">
            <div className="max-w-[700px] mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1" style={{ color: "#1A3A35" }}>
                  {ar
                    ? `تصرف ${report.totalYearly.toFixed(0)} ريال/سنة`
                    : `You're spending ${report.totalYearly.toFixed(0)} SAR/year`}
                </h1>
                <p className="text-sm mb-4" style={{ color: "#8AADA8" }}>
                  {ar ? `من ${subs.length} اشتراك` : `across ${subs.length} subscriptions`}
                </p>
                <div className="h-1 rounded-full mb-8" style={{ background: "#C5DDD9" }}>
                  <div className="h-1 rounded-full w-full" style={{ background: "#1A3A35" }} />
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
                    <div key={sub.id} className="flex items-center px-5 py-4" style={{ borderBottom: "1px solid #E5EFED" }}>
                      <span className="text-sm w-8 flex-shrink-0" style={{ color: "#8AADA8" }}>{i + 1}.</span>
                      <span className="font-bold text-sm flex-1" style={{ color: "#1A3A35" }}>{sub.name}</span>
                      <span className="font-bold text-sm mr-4 ml-4" style={{ color: "#1A3A35" }}>
                        {sub.yearlyEquivalent.toFixed(0)} {ar ? "ريال/سنة" : "SAR/yr"}
                      </span>
                      {info?.cancelUrl ? (
                        <a
                          href={info.cancelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-sm no-underline hover:underline flex-shrink-0"
                          style={{ color: "#00A651" }}
                        >
                          {ar ? "الغي" : "Cancel"} <ArrowRight size={12} strokeWidth={1.5} className="inline" />
                        </a>
                      ) : (
                        <span className="font-bold text-sm flex-shrink-0" style={{ color: "#00A651" }}>
                          {ar ? "الغي" : "Cancel"} <ArrowRight size={12} strokeWidth={1.5} className="inline" />
                        </span>
                      )}
                    </div>
                  );
                })}

                {hidden.map((sub, i) => (
                  <div key={sub.id} className="flex items-center px-5 py-4" style={{ borderBottom: "1px solid #E5EFED" }}>
                    <span className="text-sm w-8 flex-shrink-0" style={{ color: "#8AADA8" }}>{FREE_VISIBLE + i + 1}.</span>
                    <span className="font-bold text-sm flex-1 blur-sm select-none" style={{ color: "#1A3A35" }}>{sub.name}</span>
                    <span className="font-bold text-sm mr-4 ml-4" style={{ color: "#1A3A35" }}>
                      {sub.yearlyEquivalent.toFixed(0)} {ar ? "ريال/سنة" : "SAR/yr"}
                    </span>
                    <Lock size={14} strokeWidth={1.5} style={{ color: "#C5DDD9" }} className="flex-shrink-0" />
                  </div>
                ))}

                {hidden.length > 0 && (
                  <div className="px-5 py-3 text-center text-sm" style={{ background: "#EDF5F3", color: "#8AADA8" }}>
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
                  <p className="text-center font-bold text-base mb-4" style={{ color: "#1A3A35" }}>
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
                  <p className="text-xs text-center mb-8" style={{ color: "#8AADA8" }}>
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
                isPaid={isPaid}
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
                <span className="section-label inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full mb-5">
                  <Shield size={12} strokeWidth={1.5} /> {ar ? "متتبع اشتراكاتك الشخصي" : "Your personal subscription tracker"}
                </span>
                <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 max-w-3xl mx-auto leading-[1.1]" style={{ color: "#1A3A35" }}>
                  {ar
                    ? "اعرف وين تروح فلوسك كل شهر"
                    : "See exactly where your money goes each month"}
                </h1>
                <p className="text-lg max-w-[600px] mx-auto mb-12 leading-relaxed" style={{ color: "#4A6862" }}>
                  {ar
                    ? "ارفع كشف حسابك البنكي وفي ثواني نجيب لك كل اشتراكاتك الشهرية مع رابط الغاء مباشر لكل خدمة."
                    : "Upload your bank statement and in seconds we'll list every subscription you're paying for — with a direct cancel link for each one."}
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
                          className="text-xs font-bold px-3 py-1.5 rounded-full border border-[#E5EFED] transition-all bg-white hover:border-[#00A651]" style={{ color: "#4A6862" }}
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
                        className="w-full h-24 p-3 rounded-xl border border-[#E5EFED] text-sm bg-white resize-none focus:outline-none focus:border-[#00A651]" style={{ color: "#1A3A35" }}
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
                  <div key={bank.name} className="flex items-center gap-2 bg-white border border-[#E5EFED] rounded-full px-3 py-1.5">
                    <MerchantLogo name={bank.name} domain={bank.domain} size={20} />
                    <span className="text-xs font-medium" style={{ color: "#4A6862" }}>{bank.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Cancel guides + subscription chips */}
          <section className="py-16 px-6" style={{ background: "#EDF5F3" }}>
            <div className="max-w-[800px] mx-auto text-center">
              <h2 className="text-xl font-extrabold tracking-tight mb-2" style={{ color: "#1A3A35" }}>
                {ar ? "تبي تلغي اشتراك؟" : "Want to cancel a subscription?"}
              </h2>
              <p className="text-sm mb-6" style={{ color: "#8AADA8" }}>
                {ar ? "عندنا اكثر من ٢٠٠ دليل الغاء خطوة بخطوة" : "200+ step-by-step cancellation guides"}
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {SUB_CHIPS.map((chip) => (
                  <div key={chip.name} className="inline-flex items-center gap-2 bg-white border border-[#E5EFED] rounded-full px-4 py-2 shadow-sm">
                    <MerchantLogo name={chip.name} domain={chip.domain} size={20} />
                    <span className="text-sm font-medium" style={{ color: "#4A6862" }}>{chip.name}</span>
                  </div>
                ))}
              </div>
              <a
                href="/guides"
                className="inline-flex items-center gap-2 font-bold text-sm py-3 px-7 rounded-full transition-all hover:-translate-y-0.5 no-underline"
                style={{
                  background: "#00A651",
                  color: "white",
                  boxShadow: "0 2px 8px rgba(0,166,81,0.25)",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#009147"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,166,81,0.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#00A651"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,166,81,0.25)"; }}
              >
                <Search size={16} strokeWidth={1.5} />
                {ar ? "ابحث في أدلة الإلغاء" : "Search cancel guides"}
              </a>
            </div>
          </section>

          {/* Stats */}
          <section className="py-16 px-6 border-y" style={{ background: "#E5EFED", borderColor: "#C5DDD9" }}>
            <div className="max-w-[900px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PROBLEM_STATS.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bento-card text-center py-8 px-4"
                >
                  <div className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: "#00A651" }}>{stat.num}</div>
                  <p className="text-sm" style={{ color: "#4A6862" }}>{stat.text}</p>
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
                {ar ? "سهل، سريع، وواضح" : "Simple, fast, and clear"}
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
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#E8F7EE" }}>
                        <Icon size={20} strokeWidth={1.5} style={{ color: "#00A651" }} />
                      </div>
                      <h3 className="font-bold text-base mb-2" style={{ color: "#1A3A35" }}>{f.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "#4A6862" }}>{f.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-white py-20 px-6">
            <div className="max-w-[900px] mx-auto text-center">
              <span className="section-label">
                {ar ? "قالوا عنا" : "What users say"}
              </span>
              <h2 className="section-title mb-12">
                {ar ? "ناس جربوا يلا كنسل" : "People who tried Yalla Cancel"}
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
                    <p className="text-sm leading-relaxed mb-4" style={{ color: "#4A6862" }}>&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "#E5EFED", color: "#1A3A35" }}>
                        {t.initial}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#1A3A35" }}>{t.name}</p>
                        <p className="text-xs" style={{ color: "#8AADA8" }}>{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 px-6" style={{ background: "#EDF5F3" }}>
            <div className="max-w-[700px] mx-auto">
              <div className="text-center mb-12">
                <span className="section-label">{ar ? "أسئلة شائعة" : "FAQ"}</span>
                <h2 className="section-title">{ar ? "عندك سؤال؟" : "Got a question?"}</h2>
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
                      <span className="font-bold text-sm" style={{ color: "#1A3A35" }}>{faq.q}</span>
                      {openFaq === i
                        ? <ChevronUp size={16} strokeWidth={1.5} style={{ color: "#8AADA8" }} className="flex-shrink-0" />
                        : <ChevronDown size={16} strokeWidth={1.5} style={{ color: "#8AADA8" }} className="flex-shrink-0" />}
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
                          <p className="text-sm leading-relaxed pt-3 mt-3" style={{ color: "#4A6862", borderTop: "1px solid #E5EFED" }}>
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

          {/* Footer */}
          <footer className="pt-14 pb-10 px-6" style={{ background: "#112920" }}>
            <div className="max-w-[1100px] mx-auto">
              {/* Top row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 pb-10 mb-10" style={{ borderBottom: "1px solid rgba(197,221,217,0.15)" }}>
                <div>
                  <div className="nav-logo mb-2" style={{ color: "#C5DDD9" }}>yallacancel</div>
                  <p className="text-sm" style={{ color: "#8AADA8" }}>
                    {ar ? "اداة مجانية لكشف الاشتراكات المنسية" : "Free tool to find forgotten subscriptions"}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-10 gap-y-8">
                  <div>
                    <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: "#4A6862" }}>
                      {ar ? "الخدمة" : "Product"}
                    </p>
                    <div className="flex flex-col gap-2">
                      <a href="/" className="text-sm no-underline transition-colors" style={{ color: "#8AADA8" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#C5DDD9")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#8AADA8")}
                      >
                        {ar ? "كشف الاشتراكات" : "Subscription Scanner"}
                      </a>
                      <a href="/guides" className="text-sm no-underline transition-colors" style={{ color: "#8AADA8" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#C5DDD9")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#8AADA8")}
                      >
                        {ar ? "ادلة الالغاء" : "Cancel Guides"}
                      </a>
                      <a href="/transparency" className="text-sm no-underline transition-colors" style={{ color: "#8AADA8" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#C5DDD9")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#8AADA8")}
                      >
                        {ar ? "الشفافية" : "Transparency"}
                      </a>
                      <a href="/blog" className="text-sm no-underline transition-colors" style={{ color: "#8AADA8" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#C5DDD9")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#8AADA8")}
                      >
                        {ar ? "المقالات" : "Articles"}
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: "#4A6862" }}>
                      {ar ? "ادلة شائعة" : "Popular Guides"}
                    </p>
                    <div className="flex flex-col gap-2">
                      {[
                        { slug: "cancel-netflix", label: ar ? "الغاء Netflix" : "Cancel Netflix" },
                        { slug: "cancel-spotify", label: ar ? "الغاء Spotify" : "Cancel Spotify" },
                        { slug: "cancel-shahid", label: ar ? "الغاء شاهد" : "Cancel Shahid" },
                        { slug: "cancel-adobe", label: ar ? "الغاء Adobe" : "Cancel Adobe" },
                        { slug: "cancel-chatgpt", label: ar ? "الغاء ChatGPT" : "Cancel ChatGPT" },
                        { slug: "cancel-amazon-prime", label: ar ? "الغاء Amazon Prime" : "Cancel Amazon Prime" },
                        { slug: "cancel-disney-plus", label: ar ? "الغاء Disney+" : "Cancel Disney+" },
                      ].map(({ slug, label }) => (
                        <a key={slug} href={`/${slug}.html`} className="text-sm no-underline transition-colors" style={{ color: "#8AADA8" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#C5DDD9")}
                          onMouseLeave={e => (e.currentTarget.style.color = "#8AADA8")}
                        >
                          {label}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: "#4A6862" }}>
                      {ar ? "المزيد من الأدلة" : "More Guides"}
                    </p>
                    <div className="flex flex-col gap-2">
                      {[
                        { slug: "cancel-stc", label: ar ? "الغاء stc" : "Cancel stc" },
                        { slug: "cancel-youtube-premium", label: ar ? "الغاء YouTube Premium" : "Cancel YouTube Premium" },
                        { slug: "cancel-icloud", label: ar ? "الغاء iCloud" : "Cancel iCloud" },
                        { slug: "cancel-microsoft-365", label: ar ? "الغاء Microsoft 365" : "Cancel Microsoft 365" },
                        { slug: "cancel-nordvpn", label: ar ? "الغاء NordVPN" : "Cancel NordVPN" },
                        { slug: "cancel-linkedin-premium", label: ar ? "الغاء LinkedIn" : "Cancel LinkedIn" },
                        { slug: "cancel-apple-tv-plus", label: ar ? "الغاء Apple TV+" : "Cancel Apple TV+" },
                      ].map(({ slug, label }) => (
                        <a key={slug} href={`/${slug}.html`} className="text-sm no-underline transition-colors" style={{ color: "#8AADA8" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#C5DDD9")}
                          onMouseLeave={e => (e.currentTarget.style.color = "#8AADA8")}
                        >
                          {label}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: "#4A6862" }}>
                      {ar ? "بنوك مدعومة" : "Supported Banks"}
                    </p>
                    <div className="flex flex-col gap-2">
                      {["الراجحي", "الاهلي", "بنك الرياض", "الانماء", "البلاد", "ساب"].map((bank) => (
                        <span key={bank} className="text-sm" style={{ color: "#8AADA8" }}>{bank}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: "#4A6862" }}>
                      {ar ? "المقالات" : "Articles"}
                    </p>
                    <div className="flex flex-col gap-2">
                      {[
                        { slug: "kam-yisrif-sudi-ishtirakaat", label: ar ? "كم يصرف السعودي على الاشتراكات؟" : "Saudi Spending on Subscriptions" },
                        { slug: "kif-talgi-ishtirakaat-mukhfiya", label: ar ? "كيف تكتشف الاشتراكات المخفية؟" : "How to Find Hidden Subscriptions" },
                        { slug: "dark-patterns-tatbikat", label: ar ? "كيف التطبيقات تخليك تدفع" : "How Apps Trick You Into Paying" },
                        { slug: "tawfir-floos-ishtirakaat", label: ar ? "٥ طرق لتوفير فلوس الاشتراكات" : "5 Ways to Save on Subscriptions" },
                        { slug: "trial-trap-tajriba-majaniya", label: ar ? "فخ التجربة المجانية" : "The Free Trial Trap" },
                      ].map(({ slug, label }) => (
                        <a key={slug} href={`/blog/${slug}`} className="text-sm no-underline transition-colors" style={{ color: "#8AADA8" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#C5DDD9")}
                          onMouseLeave={e => (e.currentTarget.style.color = "#8AADA8")}
                        >
                          {label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm" style={{ color: "#8AADA8" }}>
                  {ar ? "صنع بحب في السعودية" : "Made with love in Saudi Arabia"}
                </p>
                <p className="text-xs" style={{ color: "#4A6862" }}>
                  {ar ? "جميع الحقوق محفوظة © ٢٠٢٥ يلا كنسل" : "© 2025 Yalla Cancel. All rights reserved."}
                </p>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
