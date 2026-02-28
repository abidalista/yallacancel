"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Lock, Clock, RotateCcw, Loader2,
} from "lucide-react";
import Header from "@/components/Header";
import AuditReport from "@/components/AuditReport";
import PaywallModal from "@/components/PaywallModal";
import SpendingBreakdownComponent from "@/components/SpendingBreakdown";
import {
  parseCSVRobust, detectBank,
  analyzeTransactions,
  analyzeSpending,
} from "@/lib/services";
import type { SpendingBreakdown as SpendingData } from "@/lib/services";
import { AuditReport as Report, SubscriptionStatus } from "@/lib/types";
import { getCancelInfo } from "@/lib/cancel-db";
import { SAMPLE_REPORT, SAMPLE_SPENDING } from "@/lib/sample-data";

type Step = "analyzing" | "identify" | "results";

export default function SampleReportPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const ar = locale === "ar";

  const [step, setStep] = useState<Step>("analyzing");
  const [report, setReport] = useState<Report | null>(null);
  const [spendingData, setSpendingData] = useState<SpendingData | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [analyzeTimer, setAnalyzeTimer] = useState(0);
  const [txCount, setTxCount] = useState(0);
  const [analyzeStatus, setAnalyzeStatus] = useState("");

  // Set document direction
  useEffect(() => {
    document.documentElement.dir = ar ? "rtl" : "ltr";
    document.documentElement.lang = ar ? "ar" : "en";
  }, [ar]);

  // Load sample data on mount
  useEffect(() => {
    let cancelled = false;
    async function loadSampleData() {
      setStep("analyzing");
      setAnalyzeTimer(0);
      setTxCount(0);
      setAnalyzeStatus(ar ? "نقرأ الملفات..." : "Reading files...");

      const start = Date.now();
      const timer = setInterval(() => {
        if (!cancelled) setAnalyzeTimer(Math.floor((Date.now() - start) / 1000));
      }, 1000);

      try {
        const res = await fetch("/test-statement.csv");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (!text || text.length < 50) throw new Error("Empty");
        clearInterval(timer);

        const bankId = detectBank(text);
        const parsed = parseCSVRobust(text, bankId);
        if (parsed.transactions.length === 0) throw new Error("No transactions");

        if (!cancelled) {
          setTxCount(parsed.transactions.length);
          setAnalyzeStatus(ar ? "نبحث عن الاشتراكات المخفية..." : "Looking for hidden subscriptions...");
        }
        await new Promise(r => setTimeout(r, 1200));

        const result = analyzeTransactions(parsed.transactions);
        const spending = analyzeSpending(parsed.transactions);

        if (!cancelled) {
          setReport(result);
          setSpendingData(spending);
          const suspicious = result.subscriptions.filter(s => s.confidence === "suspicious");
          setStep(suspicious.length > 0 ? "identify" : "results");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch {
        clearInterval(timer);
        if (!cancelled) {
          setTxCount(72);
          setAnalyzeStatus(ar ? "نبحث عن الاشتراكات المخفية..." : "Looking for hidden subscriptions...");
        }
        await new Promise(r => setTimeout(r, 1500));
        if (!cancelled) {
          setReport({ ...SAMPLE_REPORT });
          setSpendingData({ ...SAMPLE_SPENDING });
          setStep("results");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    }
    loadSampleData();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-[#EDF5F3]">
      <Header
        locale={locale}
        onLocaleChange={setLocale}
        onLogoClick={() => router.push("/")}
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
    </div>
  );
}
