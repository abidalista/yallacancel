"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";
import AuditReport from "@/components/AuditReport";
import PaywallModal from "@/components/PaywallModal";
import { parseCSV } from "@/lib/banks";
import { analyzeTransactions } from "@/lib/analyzer";
import { AuditReport as Report, SubscriptionStatus } from "@/lib/types";

const FREE_UPLOAD_LIMIT = 1;
const STORAGE_KEY = "yc_uploads_used";

type Step = "landing" | "analyzing" | "results";

const FAV = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

const BANKS = [
  { name: "الراجحي", logo: FAV("alrajhibank.com.sa") },
  { name: "الأهلي", logo: FAV("sab.com") },
  { name: "بنك الرياض", logo: FAV("riyadbank.com") },
  { name: "البلاد", logo: FAV("bankalbilad.com") },
  { name: "الإنماء", logo: FAV("alinma.com") },
  { name: "الأول (ساب)", logo: FAV("sabb.com") },
  { name: "الفرنسي", logo: FAV("banquefrancaise.com.sa") },
  { name: "العربي الوطني", logo: FAV("anb.com.sa") },
  { name: "stc pay", logo: FAV("stcpay.com.sa") },
];

const PROBLEM_STATS = [
  { num: "٣٨٢ ر.س", text: "متوسط إنفاق السعودي على الاشتراكات شهرياً" },
  { num: "٧٣٪", text: "من السعوديين ناسين على الأقل اشتراك واحد" },
  { num: "٤,٥٨٤ ر.س", text: "متوسط التوفير المحتمل سنوياً" },
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
  const [error, setError] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [uploadsUsed, setUploadsUsed] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [stickyCta, setStickyCta] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const ar = locale === "ar";

  useEffect(() => {
    const stored = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    setUploadsUsed(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("dir", ar ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", locale);
  }, [locale, ar]);

  // Sticky CTA scroll detection
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

  async function processCSV(text: string) {
    setStep("analyzing");
    setError(false);
    try {
      const transactions = parseCSV(text, "other");
      if (transactions.length === 0) { setError(true); setStep("landing"); return; }
      const result = analyzeTransactions(transactions);
      setReport(result);
      const newCount = uploadsUsed + 1;
      setUploadsUsed(newCount);
      localStorage.setItem(STORAGE_KEY, String(newCount));
      setStep("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(true);
      setStep("landing");
    }
  }

  async function handleFileSelect(file: File) {
    const text = await file.text();
    processCSV(text);
  }

  async function handleTestStatement() {
    setStep("analyzing");
    setError(false);
    try {
      const res = await fetch("/test-statement.csv");
      const text = await res.text();
      processCSV(text);
    } catch {
      setError(true);
      setStep("landing");
    }
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
    setError(false);
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

      {/* ── RESULTS ── */}
      {step === "results" && report && (
        <div className="max-w-3xl mx-auto px-4 py-8 pt-24">
          <div className="mb-6">
            <h1 className="text-2xl font-black">
              {ar ? "تقرير اشتراكاتك" : "Your subscription report"}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {ar
                ? `حللنا ${report.analyzedTransactions} عملية وطلعنا ${report.subscriptions.length} اشتراك متكرر`
                : `Analyzed ${report.analyzedTransactions} transactions, found ${report.subscriptions.length} recurring subscriptions`}
            </p>
          </div>
          <AuditReport
            report={report}
            locale={locale}
            onStatusChange={handleStatusChange}
            onStartOver={handleStartOver}
            onUpgradeClick={() => setShowPaywall(true)}
          />
        </div>
      )}

      {/* ── ANALYZING ── */}
      {step === "analyzing" && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "rgba(15,23,42,0.97)" }}
        >
          <div
            className="w-14 h-14 border-4 border-white/10 rounded-full mb-6"
            style={{
              borderTopColor: "var(--color-primary)",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p className="font-bold text-lg text-white mb-2">
            {ar ? "نحلّل كشف حسابك..." : "Analyzing your statement..."}
          </p>
          <p className="text-sm text-white/50">
            {ar ? "كل شيء يتم على جهازك" : "Everything stays on your device"}
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

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
                    ? "لا تترك تطبيقاتك تسحب من رصيدك. تابع وألغِ اشتراكاتك من مكان واحد."
                    : "Don't let apps drain your balance. Track and cancel subscriptions from one place."}
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
                  <p className="font-bold text-red-400 mb-1">
                    {ar ? "ما قدرنا نقرأ الملف" : "Couldn't read the file"}
                  </p>
                  <p className="text-sm text-red-400/70">
                    {ar ? "تأكد إن الملف CSV أو PDF وجرب مرة ثانية" : "Make sure the file is CSV or PDF and try again"}
                  </p>
                </div>
              )}

              <UploadZone
                locale={locale}
                uploadsUsed={uploadsUsed}
                freeLimit={FREE_UPLOAD_LIMIT}
                onFileSelect={handleFileSelect}
                onTestClick={handleTestStatement}
                onUpgradeClick={() => setShowPaywall(true)}
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
                  { n: "٣", title: ar ? "ألغِ ووفّر" : "Cancel & save", desc: ar ? "اختار اللي تبي تلغيه واتبع الخطوات." : "Pick what to cancel and follow the steps." },
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
                          { name: "Netflix", cost: "٤٥ ر.س/شهر", color: "#E50914" },
                          { name: "Spotify", cost: "٢٧ ر.س/شهر", color: "#1DB954" },
                          { name: "iCloud+", cost: "١٥ ر.س/شهر", color: "#3693F5" },
                          { name: "Adobe CC", cost: "١٩٩ ر.س/شهر", color: "#FF0000", warn: true },
                          { name: "Calm", cost: "١٩ ر.س/شهر", color: "#4A90D9", warn: true },
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
                              <span className="text-[8px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-bold">{ar ? "ألغِ" : "Cancel"}</span>
                            ) : (
                              <span className="text-[8px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold">{ar ? "خلّيه" : "Keep"}</span>
                            )}
                          </div>
                        ))}
                        <div className="mt-3 bg-[var(--color-primary-bg)] rounded-xl p-2.5 text-center">
                          <div className="text-[10px] text-[var(--color-text-muted)]">{ar ? "التوفير المتوقع" : "Estimated savings"}</div>
                          <div className="text-base font-black text-[var(--color-primary)]">٢,٦١٦ {ar ? "ر.س/سنة" : "SAR/yr"}</div>
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

          {/* ══════ CANCEL GUIDES ══════ */}
          <section className="bg-[var(--color-surface)] py-20 px-8">
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
                  href="/blog/"
                  className="inline-flex items-center gap-2 bg-[var(--color-dark)] text-white px-8 py-3.5 rounded-xl font-bold text-sm no-underline transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {ar ? "شوف كل ٢٠١ دليل إلغاء" : "See all 201 cancel guides"}
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                <div className="lg:col-span-2">
                  <div className="nav-logo text-xl mb-3">yalla<span className="accent">cancel</span></div>
                  <p className="text-sm text-white/50 leading-relaxed mb-5">
                    {ar ? "أداة سعودية تساعدك تكتشف اشتراكاتك المخفية وتوفر فلوسك." : "A Saudi tool that helps you find hidden subscriptions and save money."}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">{ar ? "المنتج" : "Product"}</h4>
                  <ul className="space-y-2.5 text-sm text-white/65">
                    <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">{ar ? "كيف يشتغل" : "How it works"}</a></li>
                    <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">{ar ? "المميزات" : "Features"}</a></li>
                    <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">{ar ? "ابدأ مجاناً" : "Start free"}</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">{ar ? "البنوك المدعومة" : "Supported Banks"}</h4>
                  <ul className="space-y-2.5 text-sm text-white/65">
                    <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">{ar ? "الراجحي" : "Al Rajhi"}</a></li>
                    <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">{ar ? "الأهلي" : "SNB"}</a></li>
                    <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">{ar ? "بنك الرياض" : "Riyad Bank"}</a></li>
                    <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">{ar ? "الإنماء" : "Alinma"}</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">{ar ? "أدلة الإلغاء" : "Cancel Guides"}</h4>
                  <ul className="space-y-2.5 text-sm text-white/65">
                    <li><a href="/cancel-netflix" className="hover:text-[var(--color-primary)] transition-colors">{ar ? "كيف ألغي Netflix" : "How to cancel Netflix"}</a></li>
                    <li><a href="/cancel-shahid" className="hover:text-[var(--color-primary)] transition-colors">{ar ? "كيف ألغي شاهد" : "How to cancel Shahid"}</a></li>
                    <li><a href="/cancel-spotify" className="hover:text-[var(--color-primary)] transition-colors">{ar ? "كيف ألغي Spotify" : "How to cancel Spotify"}</a></li>
                    <li><a href="/cancel-adobe" className="hover:text-[var(--color-primary)] transition-colors">{ar ? "كيف ألغي Adobe" : "How to cancel Adobe"}</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-white/8 pt-6 flex flex-wrap justify-between items-center gap-4">
                <p className="text-xs text-white/30">&copy; ٢٠٢٦ Yalla Cancel</p>
                <div className="flex gap-6">
                  <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">{ar ? "سياسة الخصوصية" : "Privacy"}</a>
                  <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">{ar ? "الشروط والأحكام" : "Terms"}</a>
                  <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">{ar ? "تواصل معنا" : "Contact"}</a>
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
