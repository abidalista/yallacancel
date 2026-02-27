"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";
import AuditReport from "@/components/AuditReport";
import PaywallModal from "@/components/PaywallModal";
import SpendingBreakdownComponent from "@/components/SpendingBreakdown";
import { parseCSV, parseCSVRobust, detectBank } from "@/lib/banks";
import type { ParseResult } from "@/lib/banks";
import { parsePDF, parsePDFRobust } from "@/lib/pdf-parser";
import type { PDFParseResult } from "@/lib/pdf-parser";
import { analyzeTransactions } from "@/lib/analyzer";
import { analyzeSpending } from "@/lib/spending";
import { AuditReport as Report, Subscription, SubscriptionStatus, Transaction, BankId } from "@/lib/types";
import { SpendingBreakdown as SpendingData } from "@/lib/spending";
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

const FAV = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

const BANKS = [
  { name: "الراجحي", logo: FAV("alrajhibank.com.sa") },
  { name: "الأهلي", logo: FAV("alahli.com") },
  { name: "بنك الرياض", logo: FAV("riyadbank.com") },
  { name: "البلاد", logo: FAV("bankalbilad.com") },
  { name: "الإنماء", logo: FAV("alinma.com") },
  { name: "الأول (ساب)", logo: FAV("sabb.com") },
  { name: "الفرنسي", logo: FAV("alfransi.com.sa") },
  { name: "العربي الوطني", logo: FAV("anb.com.sa") },
  { name: "stc pay", logo: FAV("stcpay.com.sa") },
];

const PROBLEM_STATS = [
  { num: "٣٨٢ ريال", text: "متوسط إنفاق السعودي على الاشتراكات شهرياً" },
  { num: "٧٣٪", text: "من السعوديين ناسين على الأقل اشتراك واحد" },
  { num: "٤,٥٨٤ ريال", text: "متوسط التوفير المحتمل سنوياً" },
];

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    title: "خصوصية كاملة",
    desc: "كل التحليل يتم على جهازك — ما نحتفظ بأي بيانات.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    title: "يفهم بنكك",
    desc: "يقرأ كشوفات ٩ بنوك سعودية ويفكك الرموز الغريبة تلقائياً.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    title: "نتيجة في ثوانٍ",
    desc: "ارفع الكشف وخلال ثوانٍ تشوف كل اشتراكاتك مع روابط الإلغاء.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    title: "تقرير تفصيلي",
    desc: "نوريك المبلغ الشهري والسنوي ونقترح لك وش تلغي ووش تخلي.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    title: "روابط إلغاء مباشرة",
    desc: "لكل اشتراك رابط مباشر يوديك صفحة الإلغاء — بدون دوخة.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    title: "أدلة إلغاء خطوة بخطوة",
    desc: "٢٠٠+ دليل إلغاء مفصّل لأشهر الخدمات في السعودية والعالم.",
  },
];

const SUB_CHIPS = [
  { name: "Netflix", logo: FAV("netflix.com") },
  { name: "Spotify", logo: FAV("spotify.com") },
  { name: "شاهد", logo: FAV("shahid.mbc.net") },
  { name: "Disney+", logo: FAV("disneyplus.com") },
  { name: "YouTube", logo: FAV("youtube.com") },
  { name: "Apple", logo: FAV("apple.com") },
  { name: "Amazon", logo: FAV("amazon.sa") },
  { name: "Adobe", logo: FAV("adobe.com") },
  { name: "ChatGPT", logo: FAV("openai.com") },
  { name: "iCloud", logo: FAV("icloud.com") },
  { name: "هنقرستيشن", logo: FAV("hungerstation.com") },
  { name: "stc", logo: FAV("stc.com.sa") },
  { name: "موبايلي", logo: FAV("mobily.com.sa") },
  { name: "Xbox", logo: FAV("xbox.com") },
  { name: "PlayStation", logo: FAV("playstation.com") },
];

const DECODER_ITEMS = [
  { code: "NFLX.COM", name: "Netflix", desc: "اشتراك Netflix الشهري" },
  { code: "APPLE.COM/BILL", name: "Apple", desc: "iCloud+ أو Apple Music أو App Store" },
  { code: "SPOTIFY AB", name: "Spotify", desc: "اشتراك Spotify Premium" },
  { code: "OPENAI *CHATGPT", name: "ChatGPT Plus", desc: "اشتراك ChatGPT Plus الشهري" },
  { code: "GOOG*YOUTUBE", name: "YouTube Premium", desc: "اشتراك YouTube Premium أو Music" },
  { code: "ADOBE SYSTEMS", name: "Adobe", desc: "Creative Cloud أو Acrobat Pro" },
  { code: "AMZN MKTP SA", name: "Amazon", desc: "مشتريات Amazon.sa أو Prime" },
  { code: "SHAHID.MBC", name: "شاهد VIP", desc: "اشتراك منصة شاهد" },
  { code: "MSFT *XBOX", name: "Xbox / Microsoft", desc: "Game Pass أو Microsoft 365" },
  { code: "HUNGERSTATION", name: "هنقرستيشن", desc: "Hungerstation Pro الشهري" },
  { code: "CALM.COM", name: "Calm", desc: "تطبيق التأمل والنوم Calm" },
  { code: "DROPBOX INC", name: "Dropbox", desc: "اشتراك Dropbox Plus أو Business" },
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

const GUIDE_CHIPS = [
  // Saudi services
  { name: "stc", slug: "cancel-stc", domain: "stc.com.sa" },
  { name: "موبايلي", slug: "cancel-mobily", domain: "mobily.com.sa" },
  { name: "زين", slug: "cancel-zain", domain: "sa.zain.com" },
  { name: "هنقرستيشن", slug: "cancel-hungerstation-pro", domain: "hungerstation.com" },
  { name: "جاهز", slug: "cancel-jahez-plus", domain: "jahez.net" },
  { name: "كريم", slug: "cancel-careem-plus", domain: "careem.com" },
  { name: "نون VIP", slug: "cancel-noon-vip", domain: "noon.com" },
  { name: "تمارا", slug: "cancel-tamara", domain: "tamara.co" },
  { name: "تابي", slug: "cancel-tabby", domain: "tabby.ai" },
  { name: "نانا", slug: "cancel-nana-direct", domain: "nana.sa" },
  { name: "stc pay", slug: "cancel-stc-pay", domain: "stcpay.com.sa" },
  { name: "جوّي", slug: "cancel-jawwy", domain: "jawwy.sa" },
  // Streaming
  { name: "Netflix", slug: "cancel-netflix", domain: "netflix.com" },
  { name: "شاهد", slug: "cancel-shahid", domain: "shahid.mbc.net" },
  { name: "Disney+", slug: "cancel-disney-plus", domain: "disneyplus.com" },
  { name: "YouTube Premium", slug: "cancel-youtube-premium", domain: "youtube.com" },
  { name: "Apple TV+", slug: "cancel-apple-tv-plus", domain: "apple.com" },
  { name: "Amazon Prime", slug: "cancel-amazon-prime", domain: "amazon.sa" },
  { name: "OSN+", slug: "cancel-osn-plus", domain: "osnplus.com" },
  { name: "Spotify", slug: "cancel-spotify", domain: "spotify.com" },
  { name: "Apple Music", slug: "cancel-apple-music", domain: "apple.com" },
  { name: "أنغامي", slug: "cancel-anghami", domain: "anghami.com" },
  { name: "Paramount+", slug: "cancel-paramount-plus", domain: "paramountplus.com" },
  { name: "Max HBO", slug: "cancel-max-hbo", domain: "max.com" },
  { name: "beIN", slug: "cancel-bein-connect", domain: "bein.com" },
  // Productivity & Tech
  { name: "ChatGPT Plus", slug: "cancel-chatgpt", domain: "openai.com" },
  { name: "Adobe", slug: "cancel-adobe", domain: "adobe.com" },
  { name: "Microsoft 365", slug: "cancel-microsoft-365", domain: "microsoft.com" },
  { name: "iCloud+", slug: "cancel-icloud", domain: "icloud.com" },
  { name: "Dropbox", slug: "cancel-dropbox", domain: "dropbox.com" },
  { name: "Notion", slug: "cancel-notion", domain: "notion.so" },
  { name: "Canva Pro", slug: "cancel-canva-pro", domain: "canva.com" },
  { name: "Grammarly", slug: "cancel-grammarly", domain: "grammarly.com" },
  { name: "GitHub Copilot", slug: "cancel-github-copilot", domain: "github.com" },
  { name: "Figma", slug: "cancel-figma-pro", domain: "figma.com" },
  { name: "Slack", slug: "cancel-slack-pro", domain: "slack.com" },
  { name: "Zoom", slug: "cancel-zoom", domain: "zoom.us" },
  // Gaming & VPN
  { name: "Xbox Game Pass", slug: "cancel-xbox-game-pass", domain: "xbox.com" },
  { name: "PlayStation+", slug: "cancel-playstation-plus", domain: "playstation.com" },
  { name: "NordVPN", slug: "cancel-nordvpn", domain: "nordvpn.com" },
  { name: "ExpressVPN", slug: "cancel-expressvpn", domain: "expressvpn.com" },
  // Health & Lifestyle
  { name: "Headspace", slug: "cancel-headspace", domain: "headspace.com" },
  { name: "Calm", slug: "cancel-calm", domain: "calm.com" },
  { name: "Duolingo+", slug: "cancel-duolingo-plus", domain: "duolingo.com" },
  // Social & Other
  { name: "LinkedIn Premium", slug: "cancel-linkedin-premium", domain: "linkedin.com" },
  { name: "X Premium", slug: "cancel-x-premium", domain: "x.com" },
  { name: "Snapchat+", slug: "cancel-snapchat-plus", domain: "snapchat.com" },
  { name: "Telegram Premium", slug: "cancel-telegram-premium", domain: "telegram.org" },
  { name: "Google One", slug: "cancel-google-one", domain: "one.google.com" },
  { name: "Masterclass", slug: "cancel-masterclass", domain: "masterclass.com" },
];

export default function HomePage() {
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [step, setStep] = useState<Step>("landing");
  const [report, setReport] = useState<Report | null>(null);
  const [parseError, setParseError] = useState<ParseError | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [stickyCta, setStickyCta] = useState(false);
  const [txCount, setTxCount] = useState(0);
  const [analyzeTimer, setAnalyzeTimer] = useState(0);
  const [analyzeStatus, setAnalyzeStatus] = useState("");
  const [spendingData, setSpendingData] = useState<SpendingData | null>(null);
  const [manualBankId, setManualBankId] = useState<BankId | null>(null);
  const [showPasteInput, setShowPasteInput] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [retryFiles, setRetryFiles] = useState<File[]>([]);
  const heroRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ar = locale === "ar";

  useEffect(() => {
    document.documentElement.setAttribute("dir", ar ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", locale);
  }, [locale, ar]);

  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (heroRef.current) {
            const heroBottom = heroRef.current.getBoundingClientRect().bottom;
            setStickyCta(heroBottom < 0);
          }
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

    let type: ParseError["type"] = "no_transactions";
    let message = "Couldn't find any transactions";
    let messageAr = "ما قدرنا نلقى أي عمليات";
    let details = "The file format wasn't recognized. This usually means the columns or layout don't match what we expect.";
    let detailsAr = "صيغة الملف ما تعرفنا عليها. هذا عادة يعني إن الأعمدة أو التنسيق مختلف عن المتوقع.";
    const suggestions: string[] = [];
    const suggestionsAr: string[] = [];

    if (hasPdfFail && !hasCsvFail) {
      details = "We couldn't extract transaction data from this PDF. Some bank PDFs use image-based formats that we can't read yet.";
      detailsAr = "ما قدرنا نقرأ بيانات العمليات من ملف PDF. بعض كشوفات البنوك تكون بصيغة صور ما نقدر نقرأها حالياً.";
      suggestions.push("Try downloading a CSV version instead of PDF from your bank app");
      suggestionsAr.push("حاول تنزل كشف CSV بدل PDF من تطبيق بنكك");
      suggestions.push("Make sure the PDF is a bank statement (not a screenshot or scan)");
      suggestionsAr.push("تأكد إن الملف كشف حساب (مو صورة أو مسح ضوئي)");
    }

    if (hasCsvFail || hasHeaderIssue) {
      details = "The CSV columns didn't match any known bank format. Try selecting your bank manually below.";
      detailsAr = "أعمدة ملف CSV ما تطابقت مع أي بنك معروف. جرب تختار بنكك يدوياً تحت.";
      suggestions.push("Select your bank manually below and try again");
      suggestionsAr.push("اختر بنكك يدوياً تحت وجرب مرة ثانية");
    }

    if (hasColumnIssue) {
      suggestions.push("Make sure the file has columns for: Date, Description, Amount");
      suggestionsAr.push("تأكد إن الملف فيه أعمدة: التاريخ، الوصف، المبلغ");
    }

    // Always suggest paste as alternative
    suggestions.push("Or copy-paste your transactions text directly");
    suggestionsAr.push("أو انسخ والصق نص العمليات مباشرة");

    return {
      type,
      message,
      messageAr,
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

    // Start timer
    const start = Date.now();
    timerRef.current = setInterval(() => {
      setAnalyzeTimer(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    try {
      let allTx: Transaction[] = [];
      let failedFiles: string[] = [];
      let allWarnings: string[] = [];

      for (const file of files) {
        try {
          setAnalyzeStatus(
            ar ? `نقرأ ${file.name}...` : `Reading ${file.name}...`
          );
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

      // Check if there are suspicious subscriptions to identify
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
        details: "An unexpected error occurred while processing your file.",
        detailsAr: "صار خطأ غير متوقع أثناء معالجة ملفك.",
        suggestions: ["Try uploading the file again", "Try a different file format (CSV instead of PDF)"],
        suggestionsAr: ["جرب ارفع الملف مرة ثانية", "جرب صيغة ملف مختلفة (CSV بدل PDF)"],
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

    // Create a fake CSV file from the pasted text
    const blob = new Blob([pasteText], { type: "text/csv" });
    const file = new File([blob], "pasted-data.csv", { type: "text/csv" });
    setShowPasteInput(false);
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
        details: "The test file couldn't be fetched. Try uploading your own file.",
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
    // Remove user-rejected subs, keep confirmed+unknown
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
    setShowPasteInput(false);
    setPasteText("");
    setRetryFiles([]);
    setTxCount(0);
    setAnalyzeTimer(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen">
      <Header
        locale={locale}
        onLocaleChange={setLocale}
        onLogoClick={() => { setStep("landing"); setReport(null); scrollToTop(); }}
      />

      {showPaywall && (
        <PaywallModal locale={locale} onClose={() => setShowPaywall(false)} />
      )}

      {/* ── ANALYZING — matches JustCancel timer screen ── */}
      {step === "analyzing" && (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20"
          style={{ background: "linear-gradient(135deg, #0F172A 0%, #1a2744 50%, #0d2618 100%)" }}
        >
          <div className="w-full max-w-[500px] rounded-2xl border-2 border-dashed border-[#4A7BF7]/40 py-16 px-8 text-center">
            <div className="text-5xl sm:text-6xl font-black text-white mb-2">
              {txCount.toLocaleString()}
            </div>
            <div className="text-sm text-white/50 mb-6">
              {ar ? "عملية" : "transactions"}
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#4A7BF7]" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
              <span className="text-sm text-white/70">{analyzeStatus}</span>
            </div>
            <div className="text-lg font-bold text-white/40 mb-6">
              {analyzeTimer}s
            </div>
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-2 text-xs text-white/50">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              {ar ? "تقريباً خلصنا — لا تطلع من الصفحة" : "Almost there – stay on this page"}
            </div>
          </div>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
        </div>
      )}

      {/* ── IDENTIFY — help identify suspicious charges ── */}
      {step === "identify" && report && (() => {
        const confirmed = report.subscriptions.filter((s) => s.confidence === "confirmed");
        const suspicious = report.subscriptions.filter((s) => s.confidence === "suspicious");
        return (
          <div className="min-h-screen bg-white pt-24 pb-16 px-6">
            <div className="max-w-[700px] mx-auto">
              <p className="text-[var(--color-primary)] font-bold text-sm mb-2">
                {ar ? `لقينا ${confirmed.length} اشتراكات مؤكدة` : `Found ${confirmed.length} clear subscriptions`}
              </p>
              <h1 className="text-3xl font-black text-[var(--color-text-primary)] mb-2">
                {ar ? `ساعدنا نتعرف على ${suspicious.length} إضافية` : `Help identify ${suspicious.length} more`}
              </h1>
              <div className="h-1 bg-[#4A7BF7]/20 rounded-full mb-6">
                <div className="h-1 bg-[#4A7BF7] rounded-full" style={{ width: "60%" }} />
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-8">
                {ar
                  ? "لقينا بعض العمليات المتكررة مو متأكدين منها. ساعدنا نضيفها لمجموعك:"
                  : "We found some recurring charges we're not sure about. Help us include them in your total:"}
              </p>

              <div className="space-y-4 mb-8">
                {suspicious.map((sub) => (
                  <div key={sub.id} className="border border-[var(--color-border)] rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <span className="font-bold text-base">{sub.name}</span>
                        {sub.occurrences > 1 && (
                          <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md mr-2 ml-2">
                            x{sub.occurrences}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-base text-[var(--color-text-primary)]">
                        {sub.amount.toFixed(0)} {ar ? "ريال/شهر" : "SAR/monthly"}
                      </span>
                    </div>
                    {sub.rawDescription && (
                      <p className="text-xs text-[var(--color-text-muted)] mb-3">{sub.rawDescription}</p>
                    )}
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => handleIdentifyConfirm(sub.id, "subscription")}
                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                          sub.userConfirmed && sub.confidence === "confirmed"
                            ? "bg-[#4A7BF7] text-white"
                            : "bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[#4A7BF7] hover:text-[#4A7BF7]"
                        }`}
                      >
                        {ar ? "اشتراك" : "Subscription"}
                      </button>
                      <button
                        onClick={() => handleIdentifyConfirm(sub.id, "not")}
                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                          sub.userConfirmed && sub.status === "keep"
                            ? "bg-gray-700 text-white"
                            : "bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-gray-400"
                        }`}
                      >
                        {ar ? "مو اشتراك" : "Not a subscription"}
                      </button>
                      <button
                        onClick={() => handleIdentifyConfirm(sub.id, "unknown")}
                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                          sub.userConfirmed && sub.confidence === "suspicious" && sub.status !== "keep"
                            ? "bg-gray-700 text-white"
                            : "bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-gray-400"
                        }`}
                      >
                        {ar ? "ما أدري" : "Don't know"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-center text-[var(--color-text-muted)] mb-5">
                {ar ? "خذ وقتك — ما تقدر تعدل بعدين." : "Take your time — you can't edit these later."}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleFinishIdentify}
                  className="flex-1 bg-[var(--color-dark)] text-white font-bold text-sm py-3.5 rounded-xl transition-all hover:-translate-y-0.5"
                >
                  {ar ? "شوف المجموع ←" : "See your total →"}
                </button>
                <button
                  onClick={handleSkipIdentify}
                  className="border border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold text-sm px-6 py-3.5 rounded-xl transition-all hover:bg-[var(--color-surface)]"
                >
                  {ar ? `تخطى، استخدم ${confirmed.length}` : `Skip, use ${confirmed.length} found`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── RESULTS — spending total + numbered list + paywall ── */}
      {step === "results" && report && (() => {
        const subs = report.subscriptions;
        const FREE_VISIBLE = 3;
        const visible = subs.slice(0, FREE_VISIBLE);
        const hidden = subs.slice(FREE_VISIBLE);
        const hiddenYearly = hidden.reduce((s, sub) => s + sub.yearlyEquivalent, 0);
        const hiddenMonthly = hidden.reduce((s, sub) => s + sub.monthlyEquivalent, 0);

        return (
          <div className="min-h-screen bg-white pt-24 pb-16 px-6">
            <div className="max-w-[700px] mx-auto">
              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-text-primary)] mb-1">
                {ar
                  ? `تصرف ${report.totalYearly.toFixed(0)} ريال/سنة`
                  : `You're spending ${report.totalYearly.toFixed(0)} SAR/year`}
              </h1>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                {ar
                  ? `من ${subs.length} اشتراك`
                  : `across ${subs.length} subscriptions`}
              </p>
              <div className="h-1 bg-[#4A7BF7]/20 rounded-full mb-8">
                <div className="h-1 bg-[#4A7BF7] rounded-full w-full" />
              </div>

              {/* Subscription list */}
              <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden mb-6">
                {visible.map((sub, i) => {
                  const info = getCancelInfo(sub.name);
                  return (
                    <div key={sub.id} className="flex items-center px-5 py-4 border-b border-[var(--color-border)]">
                      <span className="text-sm text-[var(--color-text-muted)] w-8 flex-shrink-0">{i + 1}.</span>
                      <span className="font-bold text-sm flex-1">{sub.name}</span>
                      <span className="font-bold text-sm mr-4 ml-4">
                        {sub.yearlyEquivalent.toFixed(0)} {ar ? "ريال/سنة" : "SAR/yr"}
                      </span>
                      {info?.cancelUrl ? (
                        <a
                          href={info.cancelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#4A7BF7] font-bold text-sm no-underline hover:underline flex-shrink-0"
                        >
                          {ar ? "الغي ←" : "Cancel →"}
                        </a>
                      ) : (
                        <span className="text-[#4A7BF7] font-bold text-sm flex-shrink-0">
                          {ar ? "الغي ←" : "Cancel →"}
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Blurred/locked rows */}
                {hidden.map((sub, i) => (
                  <div key={sub.id} className="flex items-center px-5 py-4 border-b border-[var(--color-border)]">
                    <span className="text-sm text-[var(--color-text-muted)] w-8 flex-shrink-0">{FREE_VISIBLE + i + 1}.</span>
                    <span className="font-bold text-sm flex-1 blur-sm select-none">{sub.name}</span>
                    <span className="font-bold text-sm mr-4 ml-4">
                      {sub.yearlyEquivalent.toFixed(0)} {ar ? "ريال/سنة" : "SAR/yr"}
                    </span>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-[var(--color-text-muted)] flex-shrink-0">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                ))}

                {/* Footer row */}
                {hidden.length > 0 && (
                  <div className="px-5 py-3 bg-[var(--color-surface)] text-center text-sm text-[var(--color-text-muted)]">
                    + {hidden.length} {ar ? "إضافية" : "more"} ({hiddenYearly.toFixed(0)} {ar ? "ريال/سنة" : "SAR/yr"})
                  </div>
                )}
              </div>

              {/* Paywall pitch */}
              {hidden.length > 0 && (
                <>
                  <p className="text-center text-[var(--color-primary)] font-bold text-base mb-4">
                    {ar
                      ? `ادفع ٤٩ ريال، ووفر ${hiddenYearly.toFixed(0)} ريال/سنة — يعني ${Math.round(hiddenYearly / 49)}x عائد`
                      : `Pay 49 SAR, save up to ${hiddenYearly.toFixed(0)} SAR/yr — that's a ${Math.round(hiddenYearly / 49)}x return`}
                  </p>
                  <button
                    onClick={() => setShowPaywall(true)}
                    className="w-full bg-[var(--color-primary)] text-white font-bold text-base py-4 rounded-xl transition-all hover:-translate-y-0.5 mb-3"
                    style={{ boxShadow: "0 4px 24px rgba(0,166,81,0.35)" }}
                  >
                    {ar
                      ? `اكشف كل ${subs.length} اشتراك — ٤٩ ريال`
                      : `Unlock all ${subs.length} subscriptions — 49 SAR`}
                  </button>
                  <p className="text-xs text-center text-[var(--color-text-muted)] mb-6">
                    {ar
                      ? "دفعة واحدة · بدون حساب · ضمان استرداد كامل"
                      : "One-time payment · No account needed · 100% money-back guarantee"}
                  </p>

                  {/* Warning banner */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-center mb-6">
                    <span className="text-sm text-red-600 font-semibold">
                      {ar
                        ? `تخسر ${hiddenMonthly.toFixed(0)} ريال/شهر على ${hidden.length} اشتراكات مخفية`
                        : `You're losing ${hiddenMonthly.toFixed(0)} SAR/mo to ${hidden.length} hidden subscriptions`}
                    </span>
                  </div>

                  {/* What you get */}
                  <div className="border border-[var(--color-border)] rounded-xl p-5 text-center space-y-2 mb-8">
                    {[
                      ar ? `روابط إلغاء لكل ${subs.length} اشتراك` : `Cancel links for all ${subs.length} subscriptions`,
                      ar ? "تحذيرات الخدع (Dark Patterns) وكيف تتجاوزها" : "Dark pattern warnings + how to beat them",
                      ar ? "شرح خطوة بخطوة للإلغاءات الصعبة" : "Step-by-step instructions for hard cancellations",
                    ].map((t) => (
                      <p key={t} className="text-sm text-[var(--color-text-secondary)]">
                        <span className="text-[var(--color-primary)] font-bold mr-1 ml-1">&#10003;</span>
                        {t}
                      </p>
                    ))}
                  </div>
                </>
              )}

              {/* If all visible (no paywall needed) — show full report */}
              {hidden.length === 0 && (
                <AuditReport
                  report={report}
                  locale={locale}
                  onStatusChange={handleStatusChange}
                  onStartOver={handleStartOver}
                  onUpgradeClick={() => setShowPaywall(true)}
                />
              )}

              {/* Spending Breakdown — premium deep-dive */}
              {spendingData && spendingData.categories.length > 0 && (
                <div className="mt-8 mb-8">
                  {hidden.length > 0 ? (
                    <>
                      {/* Teaser: show header + first 3 categories, blur the rest */}
                      <div className="relative">
                        <SpendingBreakdownComponent data={{
                          ...spendingData,
                          categories: spendingData.categories.slice(0, 3),
                          takeaways: [],
                        }} locale={locale} />
                        {/* Blurred overlay for remaining categories */}
                        <div className="relative -mt-1 rounded-b-2xl overflow-hidden" style={{ background: "#0F172A" }}>
                          <div className="blur-sm select-none pointer-events-none px-6 py-4 space-y-3">
                            {spendingData.categories.slice(3, 7).map((cat) => (
                              <div key={cat.nameEn} className="flex items-center gap-3 text-sm text-white/50">
                                <div className="w-2.5 h-2.5 rounded-sm bg-white/20" />
                                <span className="flex-1">{ar ? cat.name : cat.nameEn}</span>
                                <span>{cat.total.toLocaleString()} {ar ? "ريال" : "SAR"}</span>
                                <span>{cat.percent}%</span>
                              </div>
                            ))}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-white/50 mx-auto mb-2">
                                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              <p className="text-xs font-bold text-white/60">
                                {ar ? "اكشف التحليل الكامل" : "Unlock full analysis"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <SpendingBreakdownComponent data={spendingData} locale={locale} />
                  )}
                </div>
              )}

              {/* Testimonials */}
              <div className="border-t border-[var(--color-border)] pt-8 mb-8 space-y-3">
                {TESTIMONIALS.slice(0, 2).map((t) => (
                  <p key={t.name} className="text-xs text-center text-[var(--color-text-muted)] italic">
                    &ldquo;{t.quote.slice(0, 80)}...&rdquo; — {t.name}
                  </p>
                ))}
              </div>

              {/* Start over */}
              <div className="text-center">
                <button
                  onClick={handleStartOver}
                  className="border border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold text-sm px-8 py-3 rounded-xl transition-all hover:bg-[var(--color-surface)]"
                >
                  {ar ? "ابدأ من جديد" : "Start Over"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── LANDING ── */}
      {step === "landing" && (
        <>
          {/* ══════ HERO ══════ */}
          <section
            ref={heroRef}
            className="relative flex flex-col items-center justify-center px-6 py-20 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1a2744 50%, #0d2618 100%)",
              minHeight: "calc(100vh - 64px)",
              paddingTop: "100px",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(0,166,81,0.13) 0%, transparent 65%)" }}
            />
            <div className="relative z-10 w-full max-w-[680px]">
              <div className="text-center mb-9">
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-3.5">
                  {ar ? (
                    <>اشتراكاتك.. <em className="not-italic text-[var(--color-primary)]">تحت السيطرة.</em></>
                  ) : (
                    <>Your subscriptions.. <em className="not-italic text-[var(--color-primary)]">under control.</em></>
                  )}
                </h1>
                <p className="text-base text-white/60 leading-relaxed max-w-[380px] mx-auto">
                  {ar
                    ? "لا تترك تطبيقاتك تسحب من رصيدك. تابع والغي اشتراكاتك من مكان واحد."
                    : "Don't let apps drain your balance. Track and cancel subscriptions from one place."}
                </p>
              </div>

              {parseError && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
                  <p className="font-bold text-red-400 mb-1 text-center">
                    {ar ? parseError.messageAr : parseError.message}
                  </p>
                  <p className="text-sm text-red-400/70 text-center mb-3">
                    {ar ? parseError.detailsAr : parseError.details}
                  </p>

                  {/* Suggestions */}
                  <ul className="space-y-1.5 mb-4">
                    {(ar ? parseError.suggestionsAr : parseError.suggestions).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                        <span className="text-yellow-400 mt-0.5 flex-shrink-0">&#9679;</span>
                        {s}
                      </li>
                    ))}
                  </ul>

                  {/* Bank selector */}
                  {parseError.showBankSelector && (
                    <div className="mb-4">
                      <p className="text-xs font-bold text-white/70 mb-2">
                        {ar ? "اختر بنكك:" : "Select your bank:"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {BANKS.map((bank, idx) => {
                          const bankIds: BankId[] = ["alrajhi", "snb", "riyadbank", "albilad", "alinma", "sabb", "bsf", "anb", "other"];
                          const bid = bankIds[idx] || "other";
                          return (
                            <button
                              key={bank.name}
                              onClick={() => handleRetryWithBank(bid)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                manualBankId === bid
                                  ? "bg-[var(--color-primary)] text-white"
                                  : "bg-white/10 border border-white/15 text-white/70 hover:border-white/30 hover:text-white"
                              }`}
                            >
                              <img src={bank.logo} alt={bank.name} className="w-4 h-4 rounded" />
                              {bank.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Paste input toggle */}
                  {parseError.showPasteInput && !showPasteInput && (
                    <button
                      onClick={() => setShowPasteInput(true)}
                      className="w-full border border-white/15 hover:border-white/30 text-white/60 hover:text-white font-semibold text-xs py-2.5 rounded-xl transition-all bg-white/5 hover:bg-white/10"
                    >
                      {ar ? "أو انسخ والصق نص العمليات" : "Or paste your transaction text"}
                    </button>
                  )}

                  {/* Paste input area */}
                  {showPasteInput && (
                    <div className="mt-3">
                      <textarea
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        placeholder={ar
                          ? "انسخ العمليات من كشف حسابك والصقها هنا...\nمثال:\n01/01/2026  NFLX.COM  45.00\n01/01/2026  SPOTIFY AB  27.00"
                          : "Paste your transactions here...\nExample:\n01/01/2026  NFLX.COM  45.00\n01/01/2026  SPOTIFY AB  27.00"
                        }
                        className="w-full bg-white/5 border border-white/15 rounded-xl p-3 text-sm text-white/80 placeholder:text-white/25 focus:border-[var(--color-primary)] focus:outline-none resize-none"
                        rows={6}
                        dir="ltr"
                      />
                      <button
                        onClick={handlePasteAnalyze}
                        disabled={!pasteText.trim()}
                        className="mt-2 w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:hover:bg-[var(--color-primary)] text-white font-bold text-sm py-3 rounded-xl transition-all"
                      >
                        {ar ? "حلّل النص" : "Analyze text"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <UploadZone
                locale={locale}
                onScan={(files) => {
                  setParseError(null);
                  setManualBankId(null);
                  setShowPasteInput(false);
                  handleScan(files);
                }}
                onTestClick={handleTestStatement}
              />

              <div className="mt-5 text-center">
                <span className="inline-flex items-center gap-2 bg-[var(--color-primary)]/12 border border-[var(--color-primary)]/28 rounded-full px-4 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
                  {ar ? "يدعم جميع البنوك السعودية · بدون تسجيل دخول" : "Supports all Saudi banks · No login required"}
                </span>
              </div>
            </div>
          </section>

          {/* ══════ BANK LOGOS ══════ */}
          <section className="bg-white py-10 px-8">
            <div className="max-w-[1200px] mx-auto">
              <p className="text-xs font-bold text-center text-[var(--color-text-muted)] uppercase tracking-widest mb-6">
                {ar ? "يدعم جميع البنوك السعودية" : "Supports all Saudi banks"}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {BANKS.map((bank) => (
                  <div
                    key={bank.name}
                    className="flex items-center gap-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 transition-all hover:border-[var(--color-primary)]"
                  >
                    <img src={bank.logo} alt={bank.name} className="w-6 h-6 rounded object-contain" />
                    <span className="text-sm font-semibold text-[var(--color-text-secondary)]">{bank.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════ CANCEL GUIDES ══════ */}
          <section className="bg-[var(--color-surface)] py-16 px-8">
            <div className="max-w-[1100px] mx-auto text-center">
              <span className="section-label">{ar ? "أدلة الإلغاء" : "Cancel Guides"}</span>
              <h2 className="section-title">{ar ? "٢٠٠+ دليل إلغاء خطوة بخطوة" : "200+ step-by-step cancel guides"}</h2>
              <p className="section-sub">
                {ar ? "اختر الخدمة اللي تبغى تلغيها ونوريك الطريقة بالتفصيل." : "Pick the service you want to cancel and we'll show you how."}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 mt-10">
                {GUIDE_CHIPS.map((g) => (
                  <a
                    key={g.slug}
                    href={`/${g.slug}.html`}
                    className="flex items-center gap-2.5 bg-white border border-[var(--color-border)] rounded-xl px-4 py-3 transition-all hover:border-[var(--color-primary)] hover:-translate-y-0.5 hover:shadow-md text-sm font-semibold no-underline text-[var(--color-text-primary)]"
                  >
                    <img src={FAV(g.domain)} alt="" className="w-5 h-5 rounded flex-shrink-0" />
                    <span className="truncate">{g.name}</span>
                  </a>
                ))}
              </div>
              <div className="mt-8">
                <a
                  href="/guides/"
                  className="inline-flex items-center gap-2 bg-[var(--color-dark)] text-white px-8 py-3.5 rounded-xl font-bold text-sm no-underline transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {ar ? "شوف كل الأدلة (٢٠٠+)" : "See all guides (200+)"}
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
              </div>
            </div>
          </section>

          {/* ══════ PROBLEM STATS ══════ */}
          <section className="bg-[var(--color-surface)] py-20 px-8">
            <div className="max-w-[900px] mx-auto text-center">
              <span className="section-label">{ar ? "المشكلة" : "The Problem"}</span>
              <h2 className="section-title">
                {ar ? "اشتراكاتك تسحب فلوسك وأنت ما تدري" : "Subscriptions drain your money silently"}
              </h2>
              <p className="section-sub">
                {ar
                  ? "في المعدّل، السعودي يصرف أكثر من ٤,٥٠٠ ريال سنوياً على اشتراكات — وأغلبها ما يستخدمها."
                  : "On average, Saudis spend over 4,500 SAR/year on subscriptions — most of which go unused."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {PROBLEM_STATS.map((s) => (
                  <div
                    key={s.num}
                    className="bg-white border border-[var(--color-border)] rounded-2xl p-7 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="text-2xl font-black text-[var(--color-primary)] mb-1">{s.num}</div>
                    <div className="text-sm text-[var(--color-text-secondary)]">{s.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════ HOW IT WORKS ══════ */}
          <section className="bg-white py-20 px-8">
            <div className="max-w-[1100px] mx-auto text-center">
              <span className="section-label">{ar ? "كيف يشتغل" : "How it works"}</span>
              <h2 className="section-title">{ar ? "ثلاث خطوات وبس" : "Just three steps"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
                {[
                  { n: "١", title: ar ? "ارفع الكشف" : "Upload statement", desc: ar ? "نزّل كشف حسابك من تطبيق بنكك وارفعه هنا." : "Download your bank statement and upload it here." },
                  { n: "٢", title: ar ? "نحلّل لك" : "We analyze it", desc: ar ? "نكتشف كل الاشتراكات المتكررة ونفكك الرموز." : "We detect all recurring subscriptions and decode them." },
                  { n: "٣", title: ar ? "الغي ووفّر" : "Cancel & save", desc: ar ? "اختار اللي تبي تلغيه واتبع الخطوات." : "Pick what to cancel and follow the steps." },
                ].map((s) => (
                  <div
                    key={s.n}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 text-center relative transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-[var(--color-primary)]"
                  >
                    <div className="absolute -top-4 right-6 w-10 h-10 bg-[var(--color-primary)] text-white rounded-xl flex items-center justify-center font-black text-sm shadow-md">
                      {s.n}
                    </div>
                    <div className="mt-4">
                      <h3 className="font-black text-lg mb-2">{s.title}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════ FEATURES ══════ */}
          <section className="bg-white py-20 px-8">
            <div className="max-w-[1100px] mx-auto text-center">
              <span className="section-label">{ar ? "المميزات" : "Features"}</span>
              <h2 className="section-title">{ar ? "كل اللي تحتاجه في مكان واحد" : "Everything you need in one place"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                {FEATURES.map((f) => (
                  <div
                    key={f.title}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 text-right transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-[var(--color-primary)]"
                  >
                    <div className="w-12 h-12 bg-[var(--color-primary-bg)] rounded-xl flex items-center justify-center text-[var(--color-primary)] mb-5">
                      {f.icon}
                    </div>
                    <h3 className="font-black text-base mb-2">{f.title}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════ REPORT SHOWCASE ══════ */}
          <section className="py-20 px-8 overflow-hidden" style={{ background: "var(--color-dark)" }}>
            <div className="max-w-[1100px] mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className={ar ? "text-right" : "text-left"}>
                  <span className="section-label" style={{ color: "var(--color-primary)" }}>{ar ? "التقرير" : "The Report"}</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4">
                    {ar ? "شفت كشف حسابك؟ نوريك كل اشتراك مخفي." : "See every hidden subscription in your statement."}
                  </h2>
                  <p className="text-base text-white/55 leading-relaxed mb-8">
                    {ar
                      ? "ارفع كشف حسابك وفي ثوانٍ نطلع لك تقرير واضح: كل اشتراك، المبلغ الشهري والسنوي، ورابط إلغاء مباشر."
                      : "Upload your statement and in seconds get a clear report: every subscription, monthly & yearly cost, and a direct cancel link."}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      ar ? "المبلغ الشهري والسنوي لكل اشتراك" : "Monthly & yearly cost per subscription",
                      ar ? "رابط إلغاء مباشر لكل خدمة" : "Direct cancel link for every service",
                      ar ? "تصنيف: خلّيه أو ألغيه" : "Classify: keep or cancel",
                      ar ? "إجمالي التوفير المتوقع" : "Total estimated savings",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-white/75">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--color-primary)] flex-shrink-0"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button onClick={scrollToTop} className="btn-primary">
                    {ar ? "جرّب الحين مجاناً" : "Try it free now"}
                  </button>
                </div>
                {/* Phone mockup */}
                <div className="flex justify-center">
                  <div
                    className="relative w-[280px] sm:w-[300px] rounded-[2.5rem] p-3"
                    style={{
                      background: "linear-gradient(145deg, #1e293b, #0f172a)",
                      border: "3px solid rgba(255,255,255,0.08)",
                      boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                    }}
                  >
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#0f172a] rounded-b-2xl" />
                    {/* Screen */}
                    <div className="bg-white rounded-[2rem] overflow-hidden">
                      <div className="bg-[var(--color-dark)] px-4 py-3 text-center">
                        <div className="nav-logo text-sm mb-0">yalla<span className="accent">cancel</span></div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-xs font-black text-[var(--color-dark)] mb-1">{ar ? "تقرير اشتراكاتك" : "Your Subscription Report"}</div>
                        <div className="text-[10px] text-[var(--color-text-muted)] mb-3">{ar ? "حللنا ١٢٤ عملية — ٦ اشتراكات" : "124 transactions — 6 subscriptions"}</div>
                        {/* Sample subscriptions */}
                        {[
                          { name: "Netflix", cost: "٤٥ ريال/شهر", color: "#E50914" },
                          { name: "Spotify", cost: "٢٧ ريال/شهر", color: "#1DB954" },
                          { name: "iCloud+", cost: "١٥ ريال/شهر", color: "#3693F5" },
                          { name: "Adobe CC", cost: "١٩٩ ريال/شهر", color: "#FF0000", warn: true },
                          { name: "Calm", cost: "١٩ ريال/شهر", color: "#4A90D9", warn: true },
                        ].map((sub) => (
                          <div key={sub.name} className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[8px] font-bold" style={{ background: sub.color }}>
                                {sub.name[0]}
                              </div>
                              <div>
                                <div className="text-[10px] font-bold">{sub.name}</div>
                                <div className="text-[8px] text-[var(--color-text-muted)]">{sub.cost}</div>
                              </div>
                            </div>
                            {sub.warn ? (
                              <span className="text-[8px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-bold">{ar ? "الغي" : "Cancel"}</span>
                            ) : (
                              <span className="text-[8px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold">{ar ? "خلّيه" : "Keep"}</span>
                            )}
                          </div>
                        ))}
                        <div className="mt-3 bg-[var(--color-primary-bg)] rounded-xl p-2.5 text-center">
                          <div className="text-[10px] text-[var(--color-text-muted)]">{ar ? "التوفير المتوقع" : "Estimated savings"}</div>
                          <div className="text-base font-black text-[var(--color-primary)]">٢,٦١٦ {ar ? "ريال/سنة" : "SAR/yr"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════ SUBS WE DETECT ══════ */}
          <section className="bg-[var(--color-surface)] py-20 px-8">
            <div className="max-w-[1100px] mx-auto text-center">
              <span className="section-label">{ar ? "نكتشف اشتراكاتك" : "We detect your subscriptions"}</span>
              <h2 className="section-title">{ar ? "نعرف أكثر من ٢٠٠ خدمة" : "We know 200+ services"}</h2>
              <div className="flex flex-wrap justify-center gap-3 mt-10">
                {SUB_CHIPS.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-2.5 bg-white border border-[var(--color-border)] rounded-xl px-5 py-3 transition-all hover:border-[var(--color-primary)] hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <img src={s.logo} alt={s.name} className="w-6 h-6 rounded-md" />
                    <span className="text-sm font-semibold">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════ DESCRIPTOR DECODER ══════ */}
          <section className="bg-white py-20 px-8">
            <div className="max-w-[1100px] mx-auto">
              <div className="text-center mb-12">
                <span className="section-label">{ar ? "رموز كشف الحساب" : "Bank Descriptor Decoder"}</span>
                <h2 className="section-title">{ar ? "شفت رمز غريب في كشف حسابك؟" : "Weird code in your statement?"}</h2>
                <p className="section-sub">
                  {ar
                    ? "البنوك تكتب أسماء الشركات بطريقة غير مفهومة — نفكك لك أكثر الرموز اللي تطلع في كشوفات السعودية."
                    : "Banks write company names in confusing ways — we decode the most common ones in Saudi statements."}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {DECODER_ITEMS.map((d) => (
                  <div key={d.code} className="decoder-card">
                    <div className="decoder-code">{d.code}</div>
                    <div>
                      <div className="font-bold text-sm">{d.name}</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">{d.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                  {ar ? "ما لقيت الرمز اللي عندك؟ ارفع كشف حسابك ونعرفه لك تلقائياً" : "Didn't find your code? Upload your statement and we'll decode it automatically"}
                </p>
                <button onClick={scrollToTop} className="btn-primary">
                  {ar ? "ارفع كشفك وافهم كل رمز" : "Upload and decode every charge"}
                </button>
              </div>
            </div>
          </section>

          {/* ══════ TESTIMONIALS ══════ */}
          <section className="bg-[var(--color-surface)] py-20 px-8">
            <div className="max-w-[1100px] mx-auto text-center">
              <span className="section-label">{ar ? "آراء المستخدمين" : "Testimonials"}</span>
              <h2 className="section-title">{ar ? "اللي جربوه عجبهم" : "Users love it"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
                {TESTIMONIALS.map((t) => (
                  <div
                    key={t.name}
                    className="bg-white border border-[var(--color-border)] rounded-2xl p-6 text-right transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="text-[var(--color-warning)] text-sm mb-4 tracking-widest">★★★★★</div>
                    <p className="text-sm text-[var(--color-text-primary)] leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--color-primary-bg)] rounded-full flex items-center justify-center font-black text-sm text-[var(--color-primary)]">
                        {t.initial}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{t.name}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{t.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════ FAQ ══════ */}
          <section className="bg-white py-20 px-8">
            <div className="max-w-[720px] mx-auto">
              <div className="text-center mb-12">
                <span className="section-label">{ar ? "أسئلة شائعة" : "FAQ"}</span>
                <h2 className="section-title">{ar ? "أسئلة شائعة" : "Frequently Asked Questions"}</h2>
              </div>
              <div className="space-y-3">
                {FAQ_ITEMS.map((faq, i) => (
                  <div
                    key={i}
                    className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-6 py-4 font-bold text-sm text-right transition-colors hover:bg-[var(--color-surface)]"
                    >
                      {faq.q}
                      <span
                        className="text-xl text-[var(--color-text-muted)] transition-transform"
                        style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0)" }}
                      >
                        ▾
                      </span>
                    </button>
                    <div
                      className="overflow-hidden transition-all"
                      style={{
                        maxHeight: openFaq === i ? "300px" : "0",
                        padding: openFaq === i ? "0 24px 20px" : "0 24px",
                      }}
                    >
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════ CTA ══════ */}
          <section className="py-20 px-8 text-center" style={{ background: "var(--color-primary)" }}>
            <div className="max-w-[600px] mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
                {ar ? "جاهز تكتشف اشتراكاتك المخفية؟" : "Ready to find your hidden subscriptions?"}
              </h2>
              <p className="text-base text-white/85 mb-8">
                {ar ? "ارفع كشف حسابك واعرف وين فلوسك رايحة — مجاناً." : "Upload your bank statement and find out where your money goes — free."}
              </p>
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-2.5 bg-white text-[var(--color-primary-dark)] px-10 py-4 rounded-xl font-black text-base border-none cursor-pointer transition-all hover:-translate-y-0.5"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
              >
                {ar ? "ابدأ الحين" : "Start now"}
              </button>
              <p className="mt-4 text-xs text-white/60">
                {ar ? "بدون تسجيل دخول · بدون بطاقة ائتمان · النتيجة في ثوانٍ" : "No sign-up · No credit card · Results in seconds"}
              </p>
            </div>
          </section>

          {/* ══════ MEGA FOOTER ══════ */}
          <footer className="py-20 px-8 pb-10" style={{ background: "var(--color-dark)", color: "white" }}>
            <div className="max-w-[1200px] mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-10 mb-16">
                {/* Brand column */}
                <div className="col-span-2 sm:col-span-3 lg:col-span-2">
                  <div className="nav-logo text-xl mb-3">yalla<span className="accent">cancel</span></div>
                  <p className="text-sm text-white/50 leading-relaxed mb-5 max-w-[320px]">
                    {ar ? "أداة سعودية تساعدك تكتشف اشتراكاتك المخفية وتوفر فلوسك. ارفع كشف حسابك ونوريك كل اشتراك مع رابط إلغاء مباشر." : "A Saudi tool that helps you find hidden subscriptions and save money. Upload your statement and we show every subscription with a direct cancel link."}
                  </p>
                </div>

                {/* Tools / الأدوات */}
                <div>
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">{ar ? "الأدوات" : "Tools"}</h4>
                  <ul className="space-y-2.5 text-sm text-white/65 list-none p-0">
                    <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "تحليل الكشف" : "Statement Analyzer"}</a></li>
                    <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "فك رموز البنك" : "Descriptor Decoder"}</a></li>
                    <li><a href="/guides/" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "أدلة الإلغاء" : "Cancel Guides"}</a></li>
                    <li><a href="/blog/" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "المدونة" : "Blog"}</a></li>
                    <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "حاسبة الاشتراكات" : "Subscription Calculator"}</a></li>
                  </ul>
                </div>

                {/* Popular cancel guides / أدلة إلغاء شائعة */}
                <div>
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">{ar ? "أدلة إلغاء شائعة" : "Popular Guides"}</h4>
                  <ul className="space-y-2.5 text-sm text-white/65 list-none p-0">
                    <li><a href="/cancel-netflix.html" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "إلغاء Netflix" : "Cancel Netflix"}</a></li>
                    <li><a href="/cancel-spotify.html" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "إلغاء Spotify" : "Cancel Spotify"}</a></li>
                    <li><a href="/cancel-shahid.html" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "إلغاء شاهد" : "Cancel Shahid"}</a></li>
                    <li><a href="/cancel-adobe.html" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "إلغاء Adobe" : "Cancel Adobe"}</a></li>
                    <li><a href="/cancel-chatgpt.html" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "إلغاء ChatGPT" : "Cancel ChatGPT"}</a></li>
                    <li><a href="/cancel-youtube-premium.html" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "إلغاء YouTube" : "Cancel YouTube"}</a></li>
                    <li><a href="/cancel-disney-plus.html" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "إلغاء Disney+" : "Cancel Disney+"}</a></li>
                    <li><a href="/cancel-amazon-prime.html" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "إلغاء Amazon Prime" : "Cancel Amazon Prime"}</a></li>
                    <li><a href="/cancel-icloud.html" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "إلغاء iCloud+" : "Cancel iCloud+"}</a></li>
                    <li><a href="/cancel-microsoft-365.html" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "إلغاء Microsoft 365" : "Cancel Microsoft 365"}</a></li>
                    <li><a href="/guides/" className="hover:text-[var(--color-primary)] transition-colors no-underline font-semibold">{ar ? "شوف كل ٢٠١ دليل →" : "See all 201 guides →"}</a></li>
                  </ul>
                </div>

                {/* Company / الشركة */}
                <div>
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">{ar ? "الشركة" : "Company"}</h4>
                  <ul className="space-y-2.5 text-sm text-white/65 list-none p-0">
                    <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "عن يلا كانسل" : "About Us"}</a></li>
                    <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "أسئلة شائعة" : "FAQ"}</a></li>
                    <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "سياسة الخصوصية" : "Privacy Policy"}</a></li>
                    <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "الشروط والأحكام" : "Terms of Service"}</a></li>
                    <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors no-underline">{ar ? "تواصل معنا" : "Contact Us"}</a></li>
                  </ul>

                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 mt-8">{ar ? "البنوك المدعومة" : "Supported Banks"}</h4>
                  <ul className="space-y-2.5 text-sm text-white/65 list-none p-0">
                    <li><span className="text-white/50">{ar ? "الراجحي" : "Al Rajhi"}</span></li>
                    <li><span className="text-white/50">{ar ? "الأهلي" : "SNB"}</span></li>
                    <li><span className="text-white/50">{ar ? "بنك الرياض" : "Riyad Bank"}</span></li>
                    <li><span className="text-white/50">{ar ? "البلاد" : "Bank Albilad"}</span></li>
                    <li><span className="text-white/50">{ar ? "الإنماء" : "Alinma"}</span></li>
                    <li><span className="text-white/50">{ar ? "ساب" : "SABB"}</span></li>
                    <li><span className="text-white/50">{ar ? "الفرنسي" : "BSF"}</span></li>
                    <li><span className="text-white/50">{ar ? "العربي الوطني" : "ANB"}</span></li>
                    <li><span className="text-white/50">{ar ? "stc pay" : "stc pay"}</span></li>
                  </ul>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="border-t border-white/8 pt-6 flex flex-wrap justify-between items-center gap-4">
                <p className="text-xs text-white/30">&copy; ٢٠٢٦ Yalla Cancel — {ar ? "صنع في السعودية" : "Made in Saudi Arabia"}</p>
                <div className="flex gap-6">
                  <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors no-underline">{ar ? "سياسة الخصوصية" : "Privacy"}</a>
                  <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors no-underline">{ar ? "الشروط والأحكام" : "Terms"}</a>
                  <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors no-underline">{ar ? "تواصل معنا" : "Contact"}</a>
                </div>
              </div>
            </div>
          </footer>

          {/* ══════ STICKY CTA BAR ══════ */}
          <div className={`sticky-cta ${stickyCta ? "visible" : ""}`}>
            <div className="max-w-[680px] mx-auto flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-white/70 hidden sm:inline">
                {ar ? "اكتشف اشتراكاتك المخفية الحين" : "Discover your hidden subscriptions now"}
              </span>
              <button
                onClick={scrollToTop}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-[var(--color-primary-hover)]"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {ar ? "ارفع كشفك مجاناً" : "Upload free"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
