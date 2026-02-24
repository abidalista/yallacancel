"use client";

import { useState, useEffect } from "react";
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

const COPY = {
  ar: {
    heroHeadline: "وين رايحة فلوسك؟",
    heroSub: "اكتشف كل الاشتراكات المخفية في كشف حسابك",
    analyzing: "جاري التحليل...",
    analyzingNote: "كل شيء يتم على جهازك",
    errorTitle: "ما قدرنا نقرأ الملف",
    errorNote: "تأكد إن الملف CSV أو PDF وجرب مرة ثانية",
    howTitle: "كيف يشتغل؟",
    step1: "ارفع الكشف",
    step1d: "نزّل كشف الحساب من تطبيق بنكك",
    step2: "نحلّل لك",
    step2d: "نكتشف كل الاشتراكات المتكررة",
    step3: "ألغِ ووفّر",
    step3d: "اختار اللي تبي تلغيه واللي تبي تخليه",
    banksTitle: "يدعم جميع البنوك السعودية",
    subsTitle: "نكتشف اشتراكات مثل",
    badge: "🇸🇦 يدعم جميع البنوك السعودية · بدون تسجيل دخول",
    privacy: "🔒 بياناتك ما تطلع من جهازك",
    footer: "Yalla Cancel · صُنع في السعودية 🇸🇦",
  },
  en: {
    heroHeadline: "Where is your money going?",
    heroSub: "Find every hidden subscription in your bank statement",
    analyzing: "Analyzing...",
    analyzingNote: "Everything stays on your device",
    errorTitle: "Couldn't read the file",
    errorNote: "Make sure the file is CSV or PDF and try again",
    howTitle: "How does it work?",
    step1: "Upload statement",
    step1d: "Download your bank statement from your banking app",
    step2: "We analyze it",
    step2d: "We detect all recurring subscriptions",
    step3: "Cancel & save",
    step3d: "Pick what to cancel and what to keep",
    banksTitle: "Supports all Saudi banks",
    subsTitle: "We detect subscriptions like",
    badge: "🇸🇦 Supports all Saudi banks · No login required",
    privacy: "🔒 Your data never leaves your device",
    footer: "Yalla Cancel · Made in Saudi Arabia 🇸🇦",
  },
};

const BANKS = [
  { ar: "الراجحي",      en: "Al Rajhi",   logo: "https://logo.clearbit.com/alrajhibank.com.sa" },
  { ar: "الأهلي",        en: "SNB",        logo: "https://logo.clearbit.com/alahli.com" },
  { ar: "بنك الرياض",    en: "Riyad Bank", logo: "https://logo.clearbit.com/riyadbank.com" },
  { ar: "البلاد",        en: "Al Bilad",   logo: "https://logo.clearbit.com/bankalbilad.com" },
  { ar: "الإنماء",       en: "Alinma",     logo: "https://logo.clearbit.com/alinma.com" },
  { ar: "ساب",           en: "SABB",       logo: "https://logo.clearbit.com/sabb.com" },
  { ar: "الفرنسي",       en: "BSF",        logo: "https://logo.clearbit.com/alfransi.com.sa" },
  { ar: "العربي الوطني", en: "ANB",        logo: "https://logo.clearbit.com/anb.com.sa" },
];

const EXAMPLE_SUBS = [
  { name: "Netflix",     logo: "https://logo.clearbit.com/netflix.com" },
  { name: "Spotify",     logo: "https://logo.clearbit.com/spotify.com" },
  { name: "شاهد",        logo: "https://logo.clearbit.com/shahid.mbc.net" },
  { name: "أنغامي",      logo: "https://logo.clearbit.com/anghami.com" },
  { name: "YouTube",     logo: "https://logo.clearbit.com/youtube.com" },
  { name: "Apple",       logo: "https://logo.clearbit.com/apple.com" },
  { name: "Amazon",      logo: "https://logo.clearbit.com/amazon.sa" },
  { name: "Adobe",       logo: "https://logo.clearbit.com/adobe.com" },
  { name: "ChatGPT",     logo: "https://logo.clearbit.com/openai.com" },
  { name: "iCloud",      logo: "https://logo.clearbit.com/icloud.com" },
];

export default function HomePage() {
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [step, setStep] = useState<Step>("landing");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [uploadsUsed, setUploadsUsed] = useState(0);

  const c = COPY[locale];
  const ar = locale === "ar";

  useEffect(() => {
    const stored = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    setUploadsUsed(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("dir", ar ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", locale);
  }, [locale, ar]);

  async function processCSV(text: string) {
    setStep("analyzing");
    setError(false);

    try {
      const transactions = parseCSV(text, "other");

      if (transactions.length === 0) {
        setError(true);
        setStep("landing");
        return;
      }

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        locale={locale}
        onLocaleChange={setLocale}
        onLogoClick={() => { setStep("landing"); setReport(null); window.scrollTo({ top: 0 }); }}
      />

      {showPaywall && (
        <PaywallModal locale={locale} onClose={() => setShowPaywall(false)} />
      )}

      <main className="flex-1">
        {/* ── RESULTS ─────────────────────────── */}
        {step === "results" && report && (
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-6">
              <h1 className="text-2xl font-black">{ar ? "تقرير اشتراكاتك" : "Your subscription report"}</h1>
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

        {/* ── ANALYZING ──────────────────────────── */}
        {step === "analyzing" && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-14 h-14 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-lg">{c.analyzing}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{c.analyzingNote}</p>
          </div>
        )}

        {/* ── LANDING ────────────────────────────── */}
        {step === "landing" && (
          <>
            {/* Hero + Upload */}
            <section className="max-w-2xl mx-auto px-4 pt-12 pb-8">
              <div className="text-center mb-6">
                <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-2">
                  {c.heroHeadline}
                </h1>
                <p className="text-lg text-[var(--color-text-secondary)]">
                  {c.heroSub}
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="font-bold text-red-700 mb-1">{c.errorTitle}</p>
                  <p className="text-sm text-red-600">{c.errorNote}</p>
                </div>
              )}

              <div className="card shadow-sm">
                <UploadZone
                  locale={locale}
                  uploadsUsed={uploadsUsed}
                  freeLimit={FREE_UPLOAD_LIMIT}
                  onFileSelect={handleFileSelect}
                  onTestClick={handleTestStatement}
                  onUpgradeClick={() => setShowPaywall(true)}
                />
              </div>

              {/* Badge — below the card */}
              <div className="text-center mt-5">
                <span className="inline-flex items-center gap-2 bg-[var(--color-primary-bg)] border border-[var(--color-primary)]/20 rounded-full px-4 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
                  {c.badge}
                </span>
              </div>
            </section>

            {/* How it works */}
            <section className="bg-white border-y border-[var(--color-border)]">
              <div className="max-w-4xl mx-auto px-4 py-12">
                <h2 className="text-xl font-black text-center mb-8">{c.howTitle}</h2>
                <div className="grid sm:grid-cols-3 gap-6">
                  {[
                    { title: c.step1, desc: c.step1d, icon: "📤" },
                    { title: c.step2, desc: c.step2d, icon: "🔍" },
                    { title: c.step3, desc: c.step3d, icon: "✂️" },
                  ].map((s) => (
                    <div key={s.icon} className="text-center">
                      <div className="w-14 h-14 bg-[var(--color-primary-bg)] rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
                        {s.icon}
                      </div>
                      <h3 className="font-bold mb-1">{s.title}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Supported banks with logos */}
            <section className="max-w-4xl mx-auto px-4 py-12">
              <h3 className="text-sm font-bold text-center text-[var(--color-text-secondary)] mb-6">
                {c.banksTitle}
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                {BANKS.map((bank) => (
                  <div
                    key={bank.en}
                    className="flex items-center gap-2 bg-white border border-[var(--color-border)] rounded-xl px-4 py-2.5"
                  >
                    <img
                      src={bank.logo}
                      alt={ar ? bank.ar : bank.en}
                      className="w-6 h-6 rounded object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                      {ar ? bank.ar : bank.en}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Example subscriptions with logos */}
            <section className="bg-white border-y border-[var(--color-border)]">
              <div className="max-w-4xl mx-auto px-4 py-10">
                <h3 className="text-sm font-bold text-center text-[var(--color-text-secondary)] mb-6">
                  {c.subsTitle}
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {EXAMPLE_SUBS.map((sub) => (
                    <div
                      key={sub.name}
                      className="flex items-center gap-2 bg-[var(--color-surface)] rounded-full px-4 py-2"
                    >
                      <img
                        src={sub.logo}
                        alt={sub.name}
                        className="w-5 h-5 rounded-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        {sub.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Privacy */}
            <section className="max-w-4xl mx-auto px-4 py-8 text-center">
              <p className="text-sm font-medium text-[var(--color-text-muted)]">{c.privacy}</p>
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-[var(--color-border)] bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center text-xs text-[var(--color-text-muted)]">
          {c.footer}
        </div>
      </footer>
    </div>
  );
}
