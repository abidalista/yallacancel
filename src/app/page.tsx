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
  { name: "اراجح", domain: "alrajhibank.com.sa" },
  { name: "اأ", domain: "alahli.com" },
  { name: "ب اراض", domain: "riyadbank.com" },
  { name: "اباد", domain: "bankalbilad.com" },
  { name: "اإاء", domain: "alinma.com" },
  { name: "اأ (ساب)", domain: "sabb.com" },
  { name: "ارس", domain: "alfransi.com.sa" },
  { name: "اعرب اط", domain: "anb.com.sa" },
  { name: "stc pay", domain: "stcpay.com.sa" },
];

const PROBLEM_STATS = [
  { num: " را", text: "تسط ا دع اسعد ع ااشتراات ارة  شر" },
  { num: "", text: " اسعد عد اشترا احد ع اأ اس  ستخد" },
  { num: ", را", text: "تسط اتر اس  أغت ااشتراات ا ا تحتاجا" },
];

const FEATURES = [
  {
    icon: Shield,
    title: "آ خاص",
    desc: " اتح صر داخ تصح باشرة —  ا ص أ سرر خارج.",
  },
  {
    icon: Lock,
    title: "رأ ش ب",
    desc: "تعر ع شات  ب سعدة  رز اعات اغربة تائا.",
  },
  {
    icon: Zap,
    title: "تائج  ثا",
    desc: "ارع اش خا ثا تش ائة اة باشتراات ع تة  احد.",
  },
  {
    icon: BarChart3,
    title: "ترر اضح",
    desc: "ر ابغ اشر اس  اشترا تدر تحدد ش تب ش تغ.",
  },
  {
    icon: Link2,
    title: "رابط إغاء باشرة",
    desc: " اشترا ع رابط د باشرة صحة اإغاء — بد دخة.",
  },
  {
    icon: FileText,
    title: "أدة تصة",
    desc: "أثر   د إغاء خطة بخطة أشر اخدات  اسعدة اعا.",
  },
];

const SUB_CHIPS = [
  { name: "Netflix", domain: "netflix.com" },
  { name: "Spotify", domain: "spotify.com" },
  { name: "شاد", domain: "shahid.mbc.net" },
  { name: "Disney+", domain: "disneyplus.com" },
  { name: "YouTube", domain: "youtube.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "Amazon", domain: "amazon.sa" },
  { name: "Adobe", domain: "adobe.com" },
  { name: "ChatGPT", domain: "openai.com" },
  { name: "iCloud", domain: "icloud.com" },
  { name: "رستش", domain: "hungerstation.com" },
  { name: "stc", domain: "stc.com.sa" },
];

const TESTIMONIALS = [
  {
    quote: "ا تعت إ Calm Dropbox ش اس Adobe Stock ا تحت  ست خص . أغت   دت أا أشرب ت.",
    name: "حد ع.",
    role: "دس برجات — اراض",
    initial: "",
  },
  {
    quote: "ت اش APPLE.COM/BILL  شر ا اعر ش  باضبط. ا س ا عرت اا iCloud+  Apple Music Apple TV+ — دعت  ثاثت بد ا اصد!",
    name: "رة اغاد",
    role: "عة — جدة",
    initial: "",
  },
  {
    quote: "ت شتر  Adobe اا ا احتاج — بس خت  رس ااغاء ابر. اع حذر  اتت اصح اذ  دع رس اضاة. رت , را.",
    name: "عبدارح .",
    role: "ص ست — ادا",
    initial: "ع",
  },
];

const FAQ_ITEMS = [
  {
    q: " باات آة؟",
    a: "ع.  اتح ت داخ تصح —  ا ت رع أ سرر. ا حتظ بأ باات.",
  },
  {
    q: "أ ب تدع؟",
    a: "دع جع اب اسعدة: اراجح اأ ب اراض اباد اإاء ساب ارس اعرب اط  stc bank.",
  },
  {
    q: " از ش حساب؟",
    a: "اتح تطب ب  احسابات  ش احساب  اختر اخر - اشر  ز  CSV ا PDF.",
  },
  {
    q: " اأداة جاة؟",
    a: "اتح اأ جا. بعدا تدر تتر ب  را رة احدة — بد اشترا شر.",
  },
  {
    q: " ا س غ ااشتراات ع؟",
    a: "حاا ر  ترر تص ع رابط إغاء باشرة. اإغاء س تس بس عبر ارابط — عادة أخذ أ  دة  اشترا.",
  },
];

export default function HomePage() {
  const router = useRouter();
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
    let detailsAr = "صغة ا ا تعرا عا.";

    if (hasPdfFail && !hasCsvFail) {
      details = "We couldn't extract data from this PDF. Some bank PDFs use image-based formats.";
      detailsAr = "ا درا رأ اباات   PDF. بعض اشات ت بصغة صر.";
      suggestions.push("Try downloading CSV instead of PDF from your bank app");
      suggestionsAr.push("حا تز ش CSV بد PDF  تطب ب");
    }

    if (hasCsvFail || hasHeaderIssue) {
      suggestions.push("Select your bank manually below and try again");
      suggestionsAr.push("اختر ب دا تحت جرب رة ثاة");
    }

    if (hasColumnIssue) {
      suggestions.push("Make sure the file has: Date, Description, Amount columns");
      suggestionsAr.push("تأد إ ا : اتارخ اص ابغ");
    }

    suggestions.push("Or copy-paste your transactions text directly");
    suggestionsAr.push("أ اسخ اص ص اعات باشرة");

    return {
      type: "no_transactions",
      message: "Couldn't find any transactions",
      messageAr: "ا درا  أ عات",
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
    setAnalyzeStatus(ar ? "رأ اات..." : "Reading files...");
    window.scrollTo({ top: 0, behavior: "smooth" });

    const start = Date.now();
    timerRef.current = setInterval(() => {
      setAnalyzeTimer(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    try {
      // ── Try AI analysis first (Claude API) ──
      setAnalyzeStatus(ar ? "اذاء ااصطاع ح ش..." : "AI is analyzing your statement...");

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
      setAnalyzeStatus(ar ? "جرب طرة ثاة..." : "Trying alternative method...");

      let allTx: Transaction[] = [];
      const failedFiles: string[] = [];
      let allWarnings: string[] = [];

      for (const file of files) {
        try {
          setAnalyzeStatus(ar ? `رأ ${file.name}...` : `Reading ${file.name}...`);
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

      setAnalyzeStatus(ar ? "بحث ع ااشتراات اخة..." : "Looking for hidden subscriptions...");
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
        messageAr: "صار خطأ غر تع",
        details: "An unexpected error occurred.",
        detailsAr: "صار خطأ غر تع أثاء عاجة .",
        suggestions: ["Try uploading the file again"],
        suggestionsAr: ["جرب ارع ا رة ثاة"],
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
        <PaywallModal locale={locale} onClose={() => setShowPaywall(false)} />
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
                {ar ? "عة" : "transactions"}
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
                {ar ? "تربا خصا — ا تطع  اصحة" : "Almost there – stay on this page"}
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
                  {ar ? `ا ${confirmed.length} اشتراات ؤدة` : `Found ${confirmed.length} clear subscriptions`}
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: "#1A3A35" }}>
                  {ar ? `ساعدا تعر ع ${suspicious.length} إضاة` : `Help identify ${suspicious.length} more`}
                </h1>
                <div className="h-1 rounded-full mb-6" style={{ background: "#C5DDD9" }}>
                  <div className="h-1 rounded-full" style={{ width: "60%", background: "#1A3A35" }} />
                </div>
                <p className="text-sm mb-8" style={{ color: "#4A6862" }}>
                  {ar
                    ? "ا بعض اعات اتررة  تأد ا. ساعدا ضا جع:"
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
                        {sub.amount.toFixed(0)} {ar ? "را/شر" : "SAR/monthly"}
                      </span>
                    </div>
                    {sub.rawDescription && (
                      <p className="text-xs mb-3" style={{ color: "#8AADA8" }}>{sub.rawDescription}</p>
                    )}
                    <div className="flex gap-2.5">
                      {(["subscription", "not", "unknown"] as const).map((choice) => {
                        const labels = {
                          subscription: ar ? "اشترا" : "Subscription",
                          not: ar ? " اشترا" : "Not a sub",
                          unknown: ar ? "ا أدر" : "Don't know",
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
                  {ar ? "ش ترر" : "Show my report"} <ArrowRight size={16} strokeWidth={1.5} />
                </button>
                <button
                  onClick={handleSkipIdentify}
                  className="btn-ghost"
                >
                  {ar ? `تخط (${confirmed.length})` : `Skip (${confirmed.length})`}
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
                    ? `تصر ${report.totalYearly.toFixed(0)} را/سة`
                    : `You're spending ${report.totalYearly.toFixed(0)} SAR/year`}
                </h1>
                <p className="text-sm mb-4" style={{ color: "#8AADA8" }}>
                  {ar ? ` ${subs.length} اشترا` : `across ${subs.length} subscriptions`}
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
                        {sub.yearlyEquivalent.toFixed(0)} {ar ? "را/سة" : "SAR/yr"}
                      </span>
                      {info?.cancelUrl ? (
                        <a
                          href={info.cancelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-sm no-underline hover:underline flex-shrink-0"
                          style={{ color: "#00A651" }}
                        >
                          {ar ? "اغ" : "Cancel"} <ArrowRight size={12} strokeWidth={1.5} className="inline" />
                        </a>
                      ) : (
                        <span className="font-bold text-sm flex-shrink-0" style={{ color: "#00A651" }}>
                          {ar ? "اغ" : "Cancel"} <ArrowRight size={12} strokeWidth={1.5} className="inline" />
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
                      {sub.yearlyEquivalent.toFixed(0)} {ar ? "را/سة" : "SAR/yr"}
                    </span>
                    <Lock size={14} strokeWidth={1.5} style={{ color: "#C5DDD9" }} className="flex-shrink-0" />
                  </div>
                ))}

                {hidden.length > 0 && (
                  <div className="px-5 py-3 text-center text-sm" style={{ background: "#EDF5F3", color: "#8AADA8" }}>
                    + {hidden.length} {ar ? "إضاة" : "more"} ({hiddenYearly.toFixed(0)} {ar ? "را/سة" : "SAR/yr"})
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
                      ? `ادع  را ر ${hiddenYearly.toFixed(0)} را/سة — ع ${Math.round(hiddenYearly / 49)}x عائد`
                      : `Pay 49 SAR, save up to ${hiddenYearly.toFixed(0)} SAR/yr — that's a ${Math.round(hiddenYearly / 49)}x return`}
                  </p>
                  <button
                    onClick={() => setShowPaywall(true)}
                    className="btn-primary w-full text-base py-4 mb-3"
                  >
                    {ar
                      ? `اش  ${subs.length} اشترا —  را`
                      : `Unlock all ${subs.length} subscriptions — 49 SAR`}
                  </button>
                  <p className="text-xs text-center mb-8" style={{ color: "#8AADA8" }}>
                    {ar
                      ? "دعة احدة · بد حساب · ضا استرداد ا"
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
                  {ar ? "ابدأ  جدد" : "Start Over"}
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
                  <Shield size={12} strokeWidth={1.5} /> {ar ? "تتبع اشتراات اشخص" : "Your personal subscription tracker"}
                </span>
                <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 max-w-3xl mx-auto leading-[1.1]" style={{ color: "#1A3A35" }}>
                  {ar
                    ? "اعر  ترح س  شر"
                    : "See exactly where your money goes each month"}
                </h1>
                <p className="text-lg max-w-[600px] mx-auto mb-12 leading-relaxed" style={{ color: "#4A6862" }}>
                  {ar
                    ? "ارع ش حساب اب  ثا جب   اشتراات اشرة ع رابط اغاء باشر  خدة."
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
                        placeholder={ar ? "اص ص ش احساب ا..." : "Paste your statement text here..."}
                        className="w-full h-24 p-3 rounded-xl border border-[#E5EFED] text-sm bg-white resize-none focus:outline-none focus:border-[#00A651]" style={{ color: "#1A3A35" }}
                      />
                      <button
                        onClick={handlePasteAnalyze}
                        disabled={!pasteText.trim()}
                        className="btn-primary mt-2 text-sm disabled:opacity-50"
                      >
                        {ar ? "ح اص" : "Analyze text"}
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
                {ar ? "تب تغ اشترا؟" : "Want to cancel a subscription?"}
              </h2>
              <p className="text-sm mb-6" style={{ color: "#8AADA8" }}>
                {ar ? "عدا اثر   د اغاء خطة بخطة" : "200+ step-by-step cancellation guides"}
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
                {ar ? "ابحث  أدة اإغاء" : "Search cancel guides"}
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
                <Zap size={12} strokeWidth={1.5} /> {ar ? " ع" : "How it works"}
              </span>
              <h2 className="section-title">
                {ar ? "س سرع اضح" : "Simple, fast, and clear"}
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
                {ar ? "اا عا" : "What users say"}
              </span>
              <h2 className="section-title mb-12">
                {ar ? "اس جربا ا س" : "People who tried Yalla Cancel"}
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
                <span className="section-label">{ar ? "أسئة شائعة" : "FAQ"}</span>
                <h2 className="section-title">{ar ? "عد سؤا؟" : "Got a question?"}</h2>
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
                    {ar ? "اداة جاة ش ااشتراات اسة" : "Free tool to find forgotten subscriptions"}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-10 gap-y-8">
                  <div>
                    <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: "#4A6862" }}>
                      {ar ? "اخدة" : "Product"}
                    </p>
                    <div className="flex flex-col gap-2">
                      <a href="/" className="text-sm no-underline transition-colors" style={{ color: "#8AADA8" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#C5DDD9")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#8AADA8")}
                      >
                        {ar ? "ش ااشتراات" : "Subscription Scanner"}
                      </a>
                      <a href="/guides" className="text-sm no-underline transition-colors" style={{ color: "#8AADA8" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#C5DDD9")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#8AADA8")}
                      >
                        {ar ? "ادة ااغاء" : "Cancel Guides"}
                      </a>
                      <a href="/transparency" className="text-sm no-underline transition-colors" style={{ color: "#8AADA8" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#C5DDD9")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#8AADA8")}
                      >
                        {ar ? "اشاة" : "Transparency"}
                      </a>
                      <a href="/blog" className="text-sm no-underline transition-colors" style={{ color: "#8AADA8" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#C5DDD9")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#8AADA8")}
                      >
                        {ar ? "ااات" : "Articles"}
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: "#4A6862" }}>
                      {ar ? "ادة شائعة" : "Popular Guides"}
                    </p>
                    <div className="flex flex-col gap-2">
                      {[
                        { slug: "cancel-netflix", label: ar ? "اغاء Netflix" : "Cancel Netflix" },
                        { slug: "cancel-spotify", label: ar ? "اغاء Spotify" : "Cancel Spotify" },
                        { slug: "cancel-shahid", label: ar ? "اغاء شاد" : "Cancel Shahid" },
                        { slug: "cancel-adobe", label: ar ? "اغاء Adobe" : "Cancel Adobe" },
                        { slug: "cancel-chatgpt", label: ar ? "اغاء ChatGPT" : "Cancel ChatGPT" },
                        { slug: "cancel-amazon-prime", label: ar ? "اغاء Amazon Prime" : "Cancel Amazon Prime" },
                        { slug: "cancel-disney-plus", label: ar ? "اغاء Disney+" : "Cancel Disney+" },
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
                      {ar ? "ازد  اأدة" : "More Guides"}
                    </p>
                    <div className="flex flex-col gap-2">
                      {[
                        { slug: "cancel-stc", label: ar ? "اغاء stc" : "Cancel stc" },
                        { slug: "cancel-youtube-premium", label: ar ? "اغاء YouTube Premium" : "Cancel YouTube Premium" },
                        { slug: "cancel-icloud", label: ar ? "اغاء iCloud" : "Cancel iCloud" },
                        { slug: "cancel-microsoft-365", label: ar ? "اغاء Microsoft 365" : "Cancel Microsoft 365" },
                        { slug: "cancel-nordvpn", label: ar ? "اغاء NordVPN" : "Cancel NordVPN" },
                        { slug: "cancel-linkedin-premium", label: ar ? "اغاء LinkedIn" : "Cancel LinkedIn" },
                        { slug: "cancel-apple-tv-plus", label: ar ? "اغاء Apple TV+" : "Cancel Apple TV+" },
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
                      {ar ? "ب دعة" : "Supported Banks"}
                    </p>
                    <div className="flex flex-col gap-2">
                      {["اراجح", "اا", "ب اراض", "اااء", "اباد", "ساب"].map((bank) => (
                        <span key={bank} className="text-sm" style={{ color: "#8AADA8" }}>{bank}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: "#4A6862" }}>
                      {ar ? "ااات" : "Articles"}
                    </p>
                    <div className="flex flex-col gap-2">
                      {[
                        { slug: "kam-yisrif-sudi-ishtirakaat", label: ar ? " صر اسعد ع ااشتراات؟" : "Saudi Spending on Subscriptions" },
                        { slug: "kif-talgi-ishtirakaat-mukhfiya", label: ar ? " تتش ااشتراات اخة؟" : "How to Find Hidden Subscriptions" },
                        { slug: "dark-patterns-tatbikat", label: ar ? " اتطبات تخ تدع" : "How Apps Trick You Into Paying" },
                        { slug: "tawfir-floos-ishtirakaat", label: ar ? " طر تر س ااشتراات" : "5 Ways to Save on Subscriptions" },
                        { slug: "trial-trap-tajriba-majaniya", label: ar ? "خ اتجربة اجاة" : "The Free Trial Trap" },
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
                  {ar ? "صع بحب  اسعدة" : "Made with love in Saudi Arabia"}
                </p>
                <p className="text-xs" style={{ color: "#4A6862" }}>
                  {ar ? "جع اح حظة ©  ا س" : "© 2025 Yalla Cancel. All rights reserved."}
                </p>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
