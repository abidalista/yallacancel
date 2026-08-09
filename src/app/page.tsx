"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Zap, Link2, BarChart3, FileText,
  Lock, ChevronDown, ChevronUp, Clock, CheckCircle2,
  RotateCcw, Upload, Eye,
} from "lucide-react";
import Header from "@/components/Header";
import HeroScatteredLogos, { HeroLogoStrip } from "@/components/HeroScatteredLogos";
import AddToHomeScreen from "@/components/AddToHomeScreen";
import UploadZone from "@/components/UploadZone";
import PaywallModal from "@/components/PaywallModal";
import ConfirmUnsure from "@/components/ConfirmUnsure";
import SupportContact from "@/components/SupportContact";
import {
  parseCSVRobust, detectBank,
  parsePDFRobust,
  analyzeTransactions,
  analyzeSpending,
  analyzeStatementsWithAI,
  mergeSubscriptionReports,
  buildServerUploadFiles,
} from "@/lib/services";
import type { SpendingBreakdown as SpendingData } from "@/lib/services";
import { AuditReport as Report, Subscription, Transaction, BankId } from "@/lib/types";
import { getCancelInfo } from "@/lib/cancel-db";
import BrandLogo from "@/components/BrandLogo";
import { formatInt, formatHeadlineYearly, formatPriceOnce, fileCountLabel, subscriptionCountLabel, truncateFilename } from "@/lib/format";
import Ltr from "@/components/Ltr";
import {
  storeScanSession,
  getPendingScanFiles,
  clearScanSession,
  getTeaserReport,
  getTeaserSpending,
  isClaudeScan,
  type ScanEngine,
} from "@/lib/scan-session";
import {
  savePaymentReceipt,
  isReportUnlocked,
  saveReportData,
  clearPaymentState,
} from "@/lib/payment-store";
import { verifyPaymentReceipt } from "@/lib/verify-payment";

type Step = "landing" | "uploading" | "analyzing" | "confirm" | "results";
type ReportTier = "teaser" | "full";

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

const AR_PRICE = "49 ريال";

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
  {
    headlineAr: "382 ريال/شهر",
    headlineEn: "382 Riyal/mo",
    bodyAr: "متوسط صرف السعودي على الاشتراكات",
    bodyEn: "Average spend of the Saudi on subscriptions",
  },
  {
    headlineAr: "3 اشتراكات",
    headlineEn: "3 subscriptions",
    bodyAr: "ينساها معظم الناس وما زالت تُخصم",
    bodyEn: "Most people forget · still get charged",
  },
  {
    headlineAr: "90 ثانية",
    headlineEn: "90 seconds",
    bodyAr: "تكفي لمسح كشفك وإيجاد الكل",
    bodyEn: "To scan your statement and find them all",
  },
];

const STEPS = [
  {
    num: "1",
    icon: Upload,
    titleAr: "ارفع كشف حسابك",
    titleEn: "Upload your statement",
    descAr: "نزّل كشف حسابك من تطبيق بنكك (CSV أو PDF). أو جرّب بمثال جاهز بدون ملف.",
    descEn: "Download your statement from your banking app (CSV or PDF). Or try the demo · no file needed.",
  },
  {
    num: "2",
    icon: Eye,
    titleAr: "شوف كل اشتراكاتك",
    titleEn: "See every subscription",
    descAr: "معاينة مجانية سريعة تطلع أقوى الاشتراكات المتكررة. التقرير الكامل بـ 49 SAR يشمل تحليل AI لكل ملفاتك.",
    descEn: "Free quick preview surfaces your top recurring charges. Full report for 49 SAR includes AI analysis across all files.",
  },
  {
    num: "3",
    icon: Link2,
    titleAr: "الغي بضغطة زر",
    titleEn: "Cancel in one click",
    descAr: "لكل اشتراك رابط إلغاء مباشر. اضغط وألغي · بدون دوخة أو بحث.",
    descEn: "Every subscription has a direct cancel link. Click and cancel · no searching or runaround.",
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
    a: "نقرأ CSV و PDF على السيرفر (Claude + LlamaParse). ما نخزن ملفاتك بعد التحليل.",
  },
  {
    q: "أي بنوك تدعمون؟",
    a: "ندعم البنوك السعودية (الراجحي، الأهلي، الرياض، وغيرها) بالإضافة إلى Revolut و Crypto.com. CSV أوضح من PDF.",
  },
  {
    q: "كيف أنزّل كشف حسابي؟",
    a: "افتح تطبيق بنكك → الحسابات → كشف الحساب → اختر آخر 3 إلى 6 أشهر → نزّله كـ CSV أو PDF.",
  },
  {
    q: "هل الأداة مجانية؟",
    a: "الفحص مجاني ويطلع لك الاشتراكات. فتح القائمة كاملة وروابط الإلغاء بـ 49 ريال مرة واحدة.",
  },
  {
    q: "هل يلا كانسل يلغي الاشتراكات عني؟",
    a: "حالياً نوفر لك تقرير تفصيلي مع روابط إلغاء مباشرة. الإلغاء نفسه تسويه بنفسك عبر الرابط · عادة يأخذ أقل من دقيقة لكل اشتراك.",
  },
  {
    q: "كيف أتواصل معكم؟",
    a: "اضغط «تواصل معنا» في أسفل الصفحة — يفتح بريدك مباشرة. نرد عادة خلال يوم عمل.",
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
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [reportTier, setReportTier] = useState<ReportTier>("teaser");
  const [parsedFileCount, setParsedFileCount] = useState(0);
  const [failedScanFiles, setFailedScanFiles] = useState<string[]>([]);
  const [totalScanFiles, setTotalScanFiles] = useState(0);
  const [aiProgress, setAiProgress] = useState<{ current: number; total: number } | null>(null);
  const [unsureSubs, setUnsureSubs] = useState<Subscription[]>([]);
  const [clearCount, setClearCount] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [baseReport, setBaseReport] = useState<Report | null>(null);
  const heroRef = useRef<HTMLElement>(null);


  const ar = locale === "ar";

  useEffect(() => {
    document.documentElement.setAttribute("dir", ar ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", locale);
  }, [locale, ar]);

  useEffect(() => {
    if (isReportUnlocked()) {
      setIsUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (step !== "analyzing" && step !== "uploading") return;
    setElapsedSec(0);
    const id = window.setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [step]);

  function rebuildReport(subs: Subscription[], template: Report): Report {
    const sorted = [...subs].sort((a, b) => b.monthlySar - a.monthlySar);
    const totalMonthly = sorted.reduce((sum, s) => sum + s.monthlySar, 0);
    return {
      ...template,
      subscriptions: sorted,
      totalMonthly: Math.round(totalMonthly * 100) / 100,
      totalYearly: Math.round(totalMonthly * 12 * 100) / 100,
    };
  }

  function finishTeaser(
    finalReport: Report,
    spending: SpendingData | null,
    files: File[],
    failed: string[],
    engine: ScanEngine = "local"
  ) {
    storeScanSession(files, finalReport, spending, failed, engine);
    setReport(finalReport);
    setSpendingData(spending);
    setReportTier("teaser");
    setUnsureSubs([]);
    setStep("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function parseFile(
    file: File,
    bankOverride?: BankId
  ): Promise<{
    transactions: Transaction[];
    warnings: string[];
    identifiedCount: number;
    rawText?: string;
  }> {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") {
      const result = await parsePDFRobust(file);
      return {
        transactions: result.transactions,
        warnings: result.warnings,
        identifiedCount: result.transactions.length,
        rawText: result.rawText,
      };
    } else {
      const text = await file.text();
      const bankId = bankOverride || detectBank(text);
      const result = parseCSVRobust(text, bankId);
      // All data rows in the file (JFC-style "transactions identified")
      const dataRows = Math.max(0, (result.rawLineCount || 0) - 1);
      return {
        transactions: result.transactions,
        warnings: result.warnings,
        identifiedCount: Math.max(dataRows, result.transactions.length),
      };
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

    suggestions.push("Or copy and paste your transactions text directly");
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
    setStep("uploading");
    setTxCount(0);
    setAiProgress(null);
    setParsedFileCount(0);
    setFailedScanFiles([]);
    setTotalScanFiles(files.length);
    setReportTier("teaser");
    setIsUnlocked(false);
    setUnsureSubs([]);
    setAnalyzeStatus(ar ? "جاري رفع الملفات..." : "Uploading files...");
    window.scrollTo({ top: 0, behavior: "smooth" });

    const uploadStarted = Date.now();

    try {
      let allTx: Transaction[] = [];
      let failedFiles: string[] = [];
      let allWarnings: string[] = [];
      let successFileCount = 0;
      let identifiedTotal = 0;
      const pdfTexts: Record<string, string> = {};

      // Parse while the uploading screen is showing
      for (const file of files) {
        try {
          const { transactions, warnings, identifiedCount, rawText } = await parseFile(
            file,
            bankOverride || undefined
          );
          if (rawText) pdfTexts[file.name] = rawText;
          allWarnings = allWarnings.concat(warnings);
          identifiedTotal += identifiedCount;
          if (transactions.length === 0) {
            failedFiles.push(file.name);
          } else {
            allTx = allTx.concat(transactions);
            successFileCount += 1;
            setParsedFileCount(successFileCount);
          }
        } catch (err) {
          console.error(`Failed to parse ${file.name}:`, err);
          failedFiles.push(file.name);
          allWarnings.push("file_exception");
        }
      }

      // Hold "Uploading files..." at least ~3s (JFC pacing)
      const uploadElapsed = Date.now() - uploadStarted;
      await new Promise((r) => setTimeout(r, Math.max(0, 3000 - uploadElapsed)));

      // CSV + PDF: server reads all files (LlamaParse for PDF, Claude audit).
      // Local parse = fallback if server fails or returns empty.
      const identified = Math.max(identifiedTotal, allTx.length);
      const localReport =
        allTx.length > 0
          ? {
              ...analyzeTransactions(allTx),
              analyzedTransactions: identified,
            }
          : null;

      setTxCount(identified || files.length);
      setStep("analyzing");
      setParsedFileCount(successFileCount);
      setFailedScanFiles(failedFiles);
      setTotalScanFiles(files.length);
      setAiProgress(null);
      setAnalyzeStatus(ar ? "فحص عميق يبدأ الآن..." : "Deep scan starting...");

      const spending = allTx.length > 0 ? analyzeSpending(allTx) : null;
      setSpendingData(spending);
      setAnalyzeStatus(
        ar ? "نفحص الاشتراكات المتكررة..." : "Scanning for recurring subscriptions..."
      );

      const hasPdf = files.some((f) => /\.pdf$/i.test(f.name));
      const localCount = localReport?.subscriptions.length ?? 0;
      const scanStarted = Date.now();

      // CSV-only with local hits → instant (skip 60–90s server wait)
      let result: Report;
      let engine: ScanEngine;
      let scanFailedFiles = failedFiles;

      if (!hasPdf && localReport && localCount > 0) {
        result = localReport;
        engine = "local";
      } else {
        const serverFiles = buildServerUploadFiles(files, pdfTexts);
        const aiResult = await analyzeStatementsWithAI(serverFiles);

        if (aiResult.success) {
          if (aiResult.fileErrors?.length) {
            scanFailedFiles = aiResult.fileErrors.map(
              (e) => e.split(":")[0]?.trim() || e
            );
          }
          const claudeCount = aiResult.report.subscriptions.length;

          if (claudeCount > 0 && localCount > 0) {
            result = mergeSubscriptionReports(aiResult.report, localReport!);
            engine = "claude";
          } else if (claudeCount > 0) {
            result = aiResult.report;
            engine = "claude";
          } else if (localReport && localCount > 0) {
            result = localReport;
            engine = "local";
          } else if (localReport) {
            result = localReport;
            engine = "local";
          } else {
            result = aiResult.report;
            engine = "claude";
          }

          if (aiResult.report.analyzedTransactions > 0) {
            setTxCount(aiResult.report.analyzedTransactions);
          } else if (identified > 0) {
            setTxCount(identified);
          }
        } else if (localReport) {
          console.warn("[scan] Server failed, local fallback:", aiResult.error);
          result = localReport;
          engine = "local";
          setTxCount(identified);
        } else {
          console.error("[scan] Server and local both failed:", aiResult.error);
          setParseError({
            type: "file_error",
            message: "Could not analyze files",
            messageAr: "ما قدرنا نحلل الملفات",
            details:
              aiResult.error?.includes("404") || aiResult.error?.includes("not_found")
                ? "AI scan is temporarily unavailable. Try again in a minute."
                : aiResult.error || "Try CSV or PDF again.",
            detailsAr:
              aiResult.error?.includes("404") || aiResult.error?.includes("not_found")
                ? "الفحص بالذكاء الاصطناعي مو متاح حالياً. جرب بعد دقيقة."
                : "جرب مرة ثانية — CSV أو PDF من تطبيق البنك.",
            suggestions: ["Use CSV if PDF fails", "Try again in a minute"],
            suggestionsAr: ["جرّب CSV لو PDF ما انقرأ", "جرب بعد دقيقة"],
            showBankSelector: false,
            showPasteInput: true,
            failedFiles,
            warnings: ["server_and_local_failed"],
          });
          setRetryFiles(files);
          setStep("landing");
          return;
        }
      }

      setBaseReport(result);

      const scanElapsed = Date.now() - scanStarted;
      await new Promise((r) => setTimeout(r, Math.max(0, 2500 - scanElapsed)));

      setFailedScanFiles(scanFailedFiles);
      storeScanSession(files, result, spending, scanFailedFiles, engine);

      const clear = result.subscriptions.filter((s) => s.confidence === "confirmed");
      const unsure = result.subscriptions.filter((s) => s.confidence === "suspicious");

      if (unsure.length > 0) {
        setClearCount(clear.length);
        setUnsureSubs(unsure);
        setReport(rebuildReport(clear, result));
        setStep("confirm");
      } else {
        finishTeaser(result, spending, files, scanFailedFiles, engine);
      }
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

  async function handlePaymentSuccess(receiptId: string) {
    setShowPaywall(false);

    const valid = await verifyPaymentReceipt(receiptId);
    if (!valid) {
      setStep("results");
      setParseError({
        type: "file_error",
        message: "Payment could not be verified",
        messageAr: "ما قدرنا نتحقق من الدفع",
        details: "Please try again or use Contact support below.",
        detailsAr: "جرب مرة ثانية أو اضغط «تواصل معنا» تحت.",
        suggestions: [],
        suggestionsAr: [],
        showBankSelector: false,
        showPasteInput: false,
        failedFiles: [],
        warnings: ["payment_verify_failed"],
      });
      return;
    }

    setParseError(null);
    savePaymentReceipt(receiptId);
    setIsUnlocked(true);
    setReportTier("full");

    // Free scan was local — pay = unblur + Claude upgrade
    if (isClaudeScan()) {
      const full = getTeaserReport() || baseReport || report;
      if (full) {
        setReport(full);
        saveReportData(full, spendingData);
      }
      setStep("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Rare fallback if session lost Claude flag
    setAnalyzeStatus(ar ? "فحص عميق يبدأ الآن..." : "Deep scan starting...");
    setStep("analyzing");
    setAiProgress(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const files = getPendingScanFiles();
    if (files.length === 0) {
      setStep("results");
      return;
    }

    try {
      const aiResult = await analyzeStatementsWithAI(files);
      setAiProgress(null);

      if (aiResult.success) {
        const aiReport = aiResult.report;
        const clear = aiReport.subscriptions.filter((s) => s.confidence === "confirmed");
        const unsure = aiReport.subscriptions.filter((s) => s.confidence === "suspicious");
        setBaseReport(aiReport);
        setSpendingData(null);
        storeScanSession(files, aiReport, null, [], "claude");

        if (unsure.length > 0) {
          setClearCount(clear.length);
          setUnsureSubs(unsure);
          setReport(rebuildReport(clear, aiReport));
          setStep("confirm");
        } else {
          setReport(aiReport);
          saveReportData(aiReport, null);
          setStep("results");
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      console.warn("[unlock] AI failed, showing local full report:", aiResult.error);
      const teaser = getTeaserReport();
      const spending = getTeaserSpending();
      if (teaser) setReport(teaser);
      if (spending) setSpendingData(spending);
      if (teaser) saveReportData(teaser, spending);
    } catch (err) {
      console.error("[unlock] AI error:", err);
    }

    setStep("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  function handleStartOver() {
    setStep("landing");
    setReport(null);
    setBaseReport(null);
    setSpendingData(null);
    setParseError(null);
    setManualBankId(null);
    setPasteText("");
    setRetryFiles([]);
    setTxCount(0);
    setParsedFileCount(0);
    setFailedScanFiles([]);
    setTotalScanFiles(0);
    setAiProgress(null);
    setUnsureSubs([]);
    setClearCount(0);
    setReportTier("teaser");
    setIsUnlocked(false);
    clearScanSession();
    clearPaymentState();
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

      <AddToHomeScreen locale={locale} />

      {showPaywall && (
        <PaywallModal
          locale={locale}
          onClose={() => setShowPaywall(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* ── UPLOADING ── */}
      <AnimatePresence>
        {step === "uploading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen px-6 pt-24 pb-16 bg-white"
          >
            <div className="max-w-[520px] mx-auto">
              <div
                className="rounded-2xl bg-white text-center py-16 px-6"
                style={{ border: "2px dashed #00A65166" }}
              >
                <div className="flex justify-center gap-2 mb-6">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-[#00A651]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <p className="font-bold text-slate-800 mb-4">
                  {ar ? "جاري رفع الملفات..." : "Uploading files..."}
                </p>
                <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-500">
                  <Lock size={12} strokeWidth={1.5} />
                  {ar ? "ملفاتك ما تنحفظ" : "Your files are never stored."}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ANALYZING (JFC: only the seconds counter, centered) ── */}
      <AnimatePresence>
        {step === "analyzing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen px-6 pt-24 pb-16 bg-white"
          >
            <div className="max-w-[520px] mx-auto">
              <div
                className="rounded-2xl bg-white text-center py-16 px-6 flex flex-col items-center"
                style={{ border: "2px dashed #00A65166" }}
              >
                <p className="text-sm font-medium text-slate-600 mb-8 max-w-xs">
                  {analyzeStatus ||
                    (ar ? "فحص عميق يبدأ الآن..." : "Deep scan starting...")}
                </p>
                <p className="text-6xl sm:text-7xl font-extrabold tracking-tight text-[#00A651] tabular-nums ltr-always leading-none mb-8">
                  {elapsedSec}s
                </p>
                <div className="inline-flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-400">
                  <Clock size={12} strokeWidth={1.5} />
                  {ar ? "تقريباً خلصنا · ابقَ في الصفحة" : "Almost there · stay on this page"}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONFIRM UNSURE ── */}
      {step === "confirm" && unsureSubs.length > 0 && (
        <ConfirmUnsure
          locale={locale}
          clearCount={clearCount}
          unsure={unsureSubs}
          onComplete={(kept) => {
            const template = baseReport || report;
            if (!template) return;
            const clear = template.subscriptions.filter((s) => s.confidence === "confirmed");
            const merged = rebuildReport(
              [
                ...clear,
                ...kept.map((s) => ({
                  ...s,
                  confidence: "confirmed" as const,
                  userConfirmed: true,
                })),
              ],
              template
            );
            const files = getPendingScanFiles();
            finishTeaser(merged, spendingData, files, failedScanFiles, isClaudeScan() ? "claude" : "local");
          }}
          onSkip={() => {
            const template = baseReport || report;
            if (!template) return;
            // Never dump an empty list: if nothing was "clear", keep unsure as the result set
            const clear = template.subscriptions.filter((s) => s.confidence === "confirmed");
            const fallback =
              clear.length > 0
                ? clear
                : unsureSubs.map((s) => ({
                    ...s,
                    confidence: "confirmed" as const,
                    userConfirmed: false,
                  }));
            const clearOnly = rebuildReport(fallback, template);
            const files = getPendingScanFiles();
            finishTeaser(clearOnly, spendingData, files, failedScanFiles, isClaudeScan() ? "claude" : "local");
          }}
        />
      )}

      {/* ── RESULTS (JFC-inspired · mint + Arabic) ── */}
      {step === "results" && report && (() => {
        const subs = report.subscriptions;
        const FREE_VISIBLE = 3;
        const showFull = isUnlocked || reportTier === "full";
        const visible = showFull ? subs : subs.slice(0, FREE_VISIBLE);
        const hidden = showFull ? [] : subs.slice(FREE_VISIBLE);
        const hiddenYearlySar = hidden.reduce((sum, sub) => sum + sub.monthlySar * 12, 0);
        const needsPaywall = !showFull && hidden.length > 0;

        const cancelLabel = (
          <>
            {ar ? "الغي" : "Cancel"}{" "}
            <span aria-hidden>{ar ? "←" : "→"}</span>
          </>
        );

        function SubRow({
          sub,
          index,
          locked,
        }: {
          sub: Subscription;
          index: number;
          locked?: boolean;
        }) {
          const info = getCancelInfo(sub.name);
          const yearlySar = sub.monthlySar * 12;

          return (
            <div
              className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto_4.5rem] items-center gap-x-3 px-4 sm:px-5 py-[15px] border-b border-slate-100 last:border-b-0"
            >
              <Ltr className="text-[13px] text-slate-400 tabular-nums">{index}.</Ltr>
              {locked ? (
                <span
                  className="block h-[15px] w-[72%] max-w-[11rem] rounded-[4px] bg-slate-300/90 select-none"
                  aria-label={ar ? "مخفي" : "Hidden"}
                />
              ) : (
                <span className="font-semibold text-[15px] text-slate-900 truncate" dir="auto">
                  {sub.name}
                </span>
              )}
              <Ltr className="font-semibold text-[15px] text-slate-900 tabular-nums whitespace-nowrap">
                {formatHeadlineYearly(yearlySar, ar)}
              </Ltr>
              {locked ? (
                <Lock size={15} strokeWidth={1.75} className="text-slate-300 justify-self-end" />
              ) : info?.cancelUrl ? (
                <a
                  href={info.cancelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00A651] font-semibold text-sm no-underline hover:underline whitespace-nowrap justify-self-end"
                >
                  {cancelLabel}
                </a>
              ) : (
                <span className="text-[#00A651] font-semibold text-sm whitespace-nowrap justify-self-end">
                  {cancelLabel}
                </span>
              )}
            </div>
          );
        }

        return (
          <div className="min-h-screen bg-white pt-24 pb-20 px-6">
            <div className="max-w-[560px] mx-auto">
              {parseError?.warnings.includes("payment_verify_failed") && (
                <div className="mb-8 rounded-xl border border-red-100 bg-red-50 p-4 text-center">
                  <p className="font-bold text-red-700 mb-1">
                    {ar ? parseError.messageAr : parseError.message}
                  </p>
                  <p className="text-sm text-red-600 mb-3">
                    {ar ? parseError.detailsAr : parseError.details}
                  </p>
                  <SupportContact locale={locale} variant="muted" />
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <h1 className="text-[2rem] sm:text-[2.75rem] font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-1.5">
                  {subs.length === 0 ? (
                    ar ? "ما لقينا اشتراكات واضحة" : "No clear subscriptions found"
                  ) : ar ? (
                    <>تصرف <Ltr>{formatHeadlineYearly(report.totalYearly, true)}</Ltr></>
                  ) : (
                    <>You&apos;re spending <Ltr>{formatHeadlineYearly(report.totalYearly, false)}</Ltr></>
                  )}
                </h1>
                {subs.length > 0 && (
                  <p className="text-[15px] text-slate-500 mb-0">
                    {ar
                      ? `عبر ${subscriptionCountLabel(subs.length, true)}`
                      : `across ${subscriptionCountLabel(subs.length, false)}`}
                  </p>
                )}
                <div className="mt-5 border-t border-dashed border-[#00A651]/55" />

                {failedScanFiles.length > 0 && (
                  <p className="mt-4 text-[13px] text-slate-500 leading-relaxed">
                    {ar ? (
                      <>
                        ملاحظة: {fileCountLabel(failedScanFiles.length, true)} ما انقرأ (
                        <bdi dir="ltr" className="ltr-always text-xs">
                          {truncateFilename(failedScanFiles[0], 28)}
                        </bdi>
                        {failedScanFiles.length > 1 ? ` +${failedScanFiles.length - 1}` : ""}
                        ). جرّب CSV لو تقدر.
                      </>
                    ) : (
                      <>
                        Note: {fileCountLabel(failedScanFiles.length, false)} not read (
                        <bdi dir="ltr" className="ltr-always text-xs">
                          {truncateFilename(failedScanFiles[0], 28)}
                        </bdi>
                        {failedScanFiles.length > 1 ? ` +${failedScanFiles.length - 1}` : ""}
                        ). Try CSV if you can.
                      </>
                    )}
                  </p>
                )}
              </motion.div>

              {subs.length === 0 && (
                <div className="mt-8 text-center space-y-2">
                  <p className="text-slate-600 text-[15px] leading-relaxed">
                    {ar
                      ? "ما لقينا اشتراكات واضحة في هالملفات."
                      : "No clear subscriptions in these files."}
                  </p>
                  {txCount > 0 && (
                    <p className="text-sm text-slate-400">
                      {ar
                        ? `قرأنا ${formatInt(txCount)} عملية · بدون نمط اشتراك واضح.`
                        : `Read ${formatInt(txCount)} transactions · no clear subscription pattern.`}
                    </p>
                  )}
                  {failedScanFiles.length > 0 && (
                    <p className="text-sm text-slate-400">
                      {ar
                        ? "ارفع نفس الملفات كـ CSV من تطبيق البنك إذا قدرت."
                        : "Re-download the same statements as CSV from your bank app if you can."}
                    </p>
                  )}
                </div>
              )}

              {subs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                  className="mt-6 border border-slate-200 rounded-xl overflow-hidden bg-white"
                >
                  {visible.map((sub, i) => (
                    <SubRow key={sub.id} sub={sub} index={i + 1} />
                  ))}
                  {hidden.map((sub, i) => (
                    <SubRow key={sub.id} sub={sub} index={FREE_VISIBLE + i + 1} locked />
                  ))}
                  {hidden.length > 0 && (
                    <div className="px-4 sm:px-5 py-3 bg-slate-50 text-[13px] text-slate-500 flex items-center justify-center gap-1.5">
                      <span>
                        + {hidden.length} {ar ? "إضافية" : "more"} (
                        <Ltr>{formatHeadlineYearly(hiddenYearlySar, ar)}</Ltr>)
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {needsPaywall && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                  className="mt-10 text-center"
                >
                  <p className="text-[15px] text-slate-900 mb-5">
                    {ar
                      ? `روابط إلغاء مباشرة لجميع الـ ${subs.length} اشتراكات.`
                      : `Direct cancel links for all ${subs.length} subscriptions.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPaywall(true)}
                    className="btn-primary w-full max-w-none rounded-xl py-4 text-base tracking-tight"
                  >
                    {ar ? `افتح — ${formatPriceOnce(true)}` : `Unlock — ${formatPriceOnce(false)}`}
                  </button>
                  <p className="text-[12px] text-slate-400 mt-3">
                    {ar ? "دفعة واحدة. بدون حساب." : "One-time. No account needed."}
                  </p>
                </motion.div>
              )}

              {showFull && (
                <div className="mt-10 text-center">
                  <SupportContact locale={locale} variant="muted" />
                </div>
              )}

              <div className="text-center mt-12">
                <button type="button" onClick={handleStartOver} className="btn-ghost text-sm">
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
          {/* Hero — compact first viewport (JFC-style: headline + box + files without scroll) */}
          <section ref={heroRef} className="hero-gradient relative overflow-hidden pt-20 pb-8 px-6 lg:pt-16 lg:pb-6">
            <HeroScatteredLogos />
            <div className="max-w-[900px] mx-auto text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className="section-label inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full mb-3">
                  <Shield size={11} strokeWidth={1.5} /> {ar ? "متتبع اشتراكاتك الشخصي" : "Your personal subscription tracker"}
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-[2.35rem] font-extrabold tracking-tight mb-2 max-w-2xl mx-auto leading-[1.15]" style={{ color: "#1A3A35" }}>
                  {ar
                    ? "اعرف وين تروح فلوسك كل شهر"
                    : "See exactly where your money goes each month"}
                </h1>
                <p className="text-sm sm:text-[15px] max-w-[520px] mx-auto mb-5 leading-relaxed" style={{ color: "#4A6862" }}>
                  {ar
                    ? "ارفع كشف حسابك البنكي وفي ثواني نجيب لك كل اشتراكاتك الشهرية مع رابط الغاء مباشر لكل خدمة."
                    : "Upload your bank statement and in seconds we'll list every subscription you're paying for with a direct cancel link for each one."}
                </p>
              </motion.div>

              <HeroLogoStrip />

              {/* Upload zone */}
              <UploadZone
                locale={locale}
                onScan={(files) => handleScan(files)}
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
                      {(["alrajhi", "snb", "riyadbank", "albilad", "alinma", "sabb", "bsf", "anb", "revolut", "cryptocom", "other"] as BankId[]).map((bankId) => (
                        <button
                          key={bankId}
                          onClick={() => handleRetryWithBank(bankId)}
                          className="text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 hover:border-[#00A651] hover:text-[#00A651] transition-all bg-white"
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
                        className="w-full h-24 p-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white resize-none focus:outline-none focus:border-[#00A651]"
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

              {/* Supported banks — text pills only (no broken logo assets) */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {BANKS.map((bank) => (
                  <span
                    key={bank.name}
                    className="inline-flex items-center bg-white border border-[#E5EFED] rounded-full px-3 py-1 text-[11px] font-medium"
                    style={{ color: "#4A6862" }}
                  >
                    {bank.name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-[#E8F7EE]/60 py-16 px-6 border-y border-[#E5EFED]/50">
            <div className="max-w-[900px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PROBLEM_STATS.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white border border-[#E5EFED] rounded-[24px] shadow-sm text-center py-8 px-4"
                >
                  <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight text-[#00A651] mb-3 ${ar ? "" : "ltr-always"}`}>
                    {ar ? stat.headlineAr : stat.headlineEn}
                  </div>
                  <p className="text-[15px] text-slate-600 leading-relaxed max-w-[220px] mx-auto">
                    {ar ? stat.bodyAr : stat.bodyEn}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* How it works · 3 steps */}
          <section className="bg-white py-20 px-6">
            <div className="max-w-[800px] mx-auto text-center">
              <span className="section-label">
                <Zap size={12} strokeWidth={1.5} /> {ar ? "كيف يعمل" : "How it works"}
              </span>
              <h2 className="section-title">
                {ar ? "3 خطوات بس" : "Just 3 steps"}
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
                      <div className="w-10 h-10 rounded-full bg-[#00A651] text-white flex items-center justify-center text-lg font-extrabold mx-auto mb-4">
                        {step.num}
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-[#E8F7EE] flex items-center justify-center mx-auto mb-3">
                        <Icon size={20} strokeWidth={1.5} className="text-[#00A651]" />
                      </div>
                      <h3 className="font-bold text-base text-slate-800 mb-2">{ar ? step.titleAr : step.titleEn}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{ar ? step.descAr : step.descEn}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Result preview · show value before upload */}
          <section className="bg-[#EDF5F3] py-16 px-6">
            <div className="max-w-[600px] mx-auto text-center">
              <span className="section-label">
                <BarChart3 size={12} strokeWidth={1.5} /> {ar ? "هذا اللي بتشوفه" : "Here's what you'll get"}
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 mb-8">
                {ar ? "تقرير كامل · مثل هذا بالضبط" : "A full audit · exactly like this"}
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
                      <span className="font-extrabold text-sm text-slate-900 ltr-always">{item.amount}</span>
                      <span className="text-xs text-slate-400 ml-1 ltr-always">SAR</span>
                    </div>
                  </div>
                ))}
                <div className="border-t border-dashed border-slate-200 mt-2 pt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{ar ? "+11 اشتراك آخر..." : "+11 more subscriptions..."}</span>
                  <span className="text-xs font-bold text-[#00A651] ltr-always">15,219 SAR/yr</span>
                </div>
              </motion.div>
              <p className="text-xs text-slate-400 mt-4">
                {ar
                  ? "مع روابط إلغاء مباشرة لكل اشتراك"
                  : "With direct cancel links for every subscription"}
              </p>
            </div>
          </section>

          {/* Subscription chips */}
          <section className="bg-[#F5FAF8] py-16 px-6">
            <div className="max-w-[800px] mx-auto text-center">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 mb-6">
                {ar ? "نكتشف أكثر من 120 خدمة" : "We detect 120+ services"}
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

          {/* Testimonials · add real ones here when available */}
          {TESTIMONIALS.length > 0 && (
          <section className="bg-gradient-to-b from-[#EDF5F3] to-white py-20 px-6">
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
                      <div className="w-9 h-9 rounded-full bg-[#E5EFED] flex items-center justify-center text-sm font-bold text-[#00A651]">
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
                      <th className="text-right px-4 py-4 font-bold text-slate-500 text-xs w-[38%]" />
                      <th className="px-3 py-4 text-center w-[31%]">
                        <div className="flex flex-col items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/logo-yallacancel.svg"
                            alt="YallaCancel"
                            className="h-5 w-auto max-w-[120px]"
                          />
                          <span className="font-bold text-[#00A651] text-xs">
                            {ar ? "يلا كانسل" : "YallaCancel"}
                          </span>
                        </div>
                      </th>
                      <th className="px-3 py-4 text-center font-bold text-slate-400 text-xs w-[31%]">
                        {ar ? "يدوياً" : "Manually"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        labelAr: "وقت البحث",
                        labelEn: "Time to find",
                        ycAr: "✅ 90 ثانية",
                        ycEn: "✅ 90 seconds",
                        manAr: "❌ 3-4 ساعات",
                        manEn: "❌ 3-4 hours",
                      },
                      {
                        labelAr: "الاشتراكات المكتشفة",
                        labelEn: "Subscriptions found",
                        ycAr: "✅ كلها",
                        ycEn: "✅ All of them",
                        manAr: "❌ بعضها يفوتك",
                        manEn: "❌ Easy to miss some",
                      },
                      {
                        labelAr: "روابط إلغاء",
                        labelEn: "Cancel links",
                        ycAr: "✅ مباشرة",
                        ycEn: "✅ Direct links",
                        manAr: "❌ تدور بنفسك",
                        manEn: "❌ Search yourself",
                      },
                      {
                        labelAr: "يفهم بنوك سعودية",
                        labelEn: "Saudi bank support",
                        ycAr: "✅ 9 بنوك",
                        ycEn: "✅ 9 banks",
                        manAr: "❌ ما يفهم صيغ البنوك",
                        manEn: "❌ No SA bank formats",
                      },
                      {
                        labelAr: "خصوصية",
                        labelEn: "Privacy",
                        ycAr: "✅ على جهازك",
                        ycEn: "✅ On your device",
                        manAr: "❌ مجهود يدوي طويل",
                        manEn: "❌ Hours of manual work",
                      },
                      {
                        labelAr: "السعر",
                        labelEn: "Price",
                        ycAr: "✅ 49 Riyal مرة واحدة",
                        ycEn: "✅ 49 Riyal once",
                        manAr: "❌ وقتك + مجهودك",
                        manEn: "❌ Your time + effort",
                      },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-slate-50 last:border-0">
                        <td className="text-right px-4 py-3.5 font-medium text-slate-700 text-[13px]">
                          {ar ? row.labelAr : row.labelEn}
                        </td>
                        <td className="px-3 py-3.5 text-center font-bold text-[#00A651] text-[13px]">
                          {ar ? row.ycAr : row.ycEn}
                        </td>
                        <td className="px-3 py-3.5 text-center text-slate-400 text-[13px]">
                          {ar ? row.manAr : row.manEn}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="bg-[#EDF5F3] py-20 px-6 scroll-mt-20">
            <div className="max-w-[500px] mx-auto text-center">
              <span className="section-label">
                <Zap size={12} strokeWidth={1.5} /> {ar ? "سعر واحد. بدون اشتراك." : "One price. No subscription."}
              </span>
              <h2 className="section-title mb-2">
                {ar ? AR_PRICE : "49 SAR"}
              </h2>
              <p className="text-sm text-slate-400 mb-8">
                {ar ? "دفعة واحدة · مو اشتراك شهري. وتقدر تسترجع فلوسك كاملة." : "One time payment · not a monthly subscription. Full money back guarantee."}
              </p>
              <div className="bento-card p-6 text-right mb-6">
                {[
                  { ar: "تحليل غير محدود · كل بنوكك وبطاقاتك", en: "Unlimited analysis · all your banks and cards" },
                  { ar: "روابط إلغاء مباشرة لـ 50+ خدمة سعودية", en: "Direct cancel links for 50+ Saudi services" },
                  { ar: "تقرير PDF بالعربي تحتفظ فيه", en: "Arabic PDF report you can keep" },
                  { ar: "قوالب رسائل إلغاء جاهزة", en: "Ready-to-send cancellation message templates" },
                  { ar: "تحديثات مدى الحياة", en: "Lifetime updates" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <CheckCircle2 size={16} strokeWidth={1.5} className="text-[#00A651] flex-shrink-0" />
                    <span className="text-sm text-slate-700">{ar ? item.ar : item.en}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowPaywall(true)}
                className="btn-primary w-full text-base py-4 mb-3"
              >
                {ar ? `حلل كشف حسابك، ${AR_PRICE}` : "Analyze your statement · 49 SAR"}
              </button>
              <p className="text-xs text-slate-400">
                {ar ? "يقبل مدى · فيزا · ماستركارد · ضمان استرداد كامل" : "Accepts mada · Visa · Mastercard · Full refund guarantee"}
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-[#EDF5F3] py-20 px-6">
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
          <section className="bg-gradient-to-br from-[#1A3A35] to-[#0F2A26] py-14 px-6 text-center">
            <div className="max-w-[600px] mx-auto">
              <h2 className="text-2xl font-extrabold text-white mb-3">
                {ar ? "كل شهر تأخره = فلوس تخسرها" : "Every month you wait = money lost"}
              </h2>
              <p className="text-base text-white/70 mb-6">
                {ar ? "90 ثانية تفصلك عن معرفة كم تدفع على اشتراكات ناسيها." : "90 seconds between you and knowing how much you pay on forgotten subscriptions."}
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-2 bg-white text-[#1A3A35] px-8 py-3.5 rounded-full font-bold text-sm no-underline transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer border-none"
              >
                <Upload size={16} strokeWidth={1.5} />
                {ar ? "حلل كشف حسابك الآن" : "Analyze your statement now"}
              </button>
              <div className="mt-4">
                <a
                  href="/guides"
                  className="text-xs text-white/50 hover:text-white/80 transition-colors no-underline"
                >
                  {ar ? "أو تصفح 200+ دليل إلغاء مجاني" : "Or browse 200+ free cancellation guides"}
                </a>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 px-6" style={{ background: "#112920" }}>
            <div className="max-w-[1100px] mx-auto text-center">
              <div className="nav-logo justify-center mb-2" style={{ color: "#C5DDD9" }}>
                yallacancel
              </div>
              <p className="text-lg font-bold mb-4" style={{ color: "#C5DDD9" }}>
                {ar ? "اكتشف. الغي. وفّر." : "Find it. Cancel it. Save."}
              </p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-6">
                <a href="#pricing" className="text-sm no-underline transition-colors" style={{ color: "#8AADA8" }}>
                  {ar ? "الأسعار" : "Pricing"}
                </a>
                <a href="/guides" className="text-sm no-underline transition-colors" style={{ color: "#8AADA8" }}>
                  {ar ? "أدلة الإلغاء" : "Cancel Guides"}
                </a>
                <SupportContact locale={locale} variant="footer" />
              </div>
              <p className="text-xs mb-1" style={{ color: "#8AADA8" }}>
                {ar ? `${AR_PRICE} مرة واحدة، بدون اشتراك، ضمان استرداد كامل` : "49 SAR one-time · No subscription · Full refund guarantee"}
              </p>
              <p className="text-xs" style={{ color: "#4A6862" }}>
                © {new Date().getFullYear()} YallaCancel · {ar ? "صُنع بحب في السعودية 🇸🇦" : "Made with love in Saudi Arabia 🇸🇦"}
              </p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
