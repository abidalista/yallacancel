"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, TrendingDown, CalendarDays, Eye, EyeOff, Info, Search } from "lucide-react";
import { AuditReport as Report, SubscriptionStatus } from "@/lib/types";
import SubscriptionCard from "./SubscriptionCard";

interface AuditReportProps {
  report: Report;
  locale: "ar" | "en";
  onStatusChange: (id: string, status: SubscriptionStatus) => void;
  onStartOver: () => void;
  onUpgradeClick: () => void;
}

export default function AuditReport({
  report,
  locale,
  onStatusChange,
  onStartOver,
  onUpgradeClick,
}: AuditReportProps) {
  const [privacyMode, setPrivacyMode] = useState(false);
  const [filter, setFilter] = useState<"all" | SubscriptionStatus>("all");
  const ar = locale === "ar";

  const cancelSubs = report.subscriptions.filter((s) => s.status === "cancel");
  const keepSubs = report.subscriptions.filter((s) => s.status === "keep");
  const cancelMonthlySavings = cancelSubs.reduce((sum, s) => sum + s.monthlyEquivalent, 0);

  const filtered = filter === "all"
    ? report.subscriptions
    : report.subscriptions.filter((s) => s.status === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* ── Summary Bento Grid ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bento-card p-5 text-center">
          <CreditCard size={20} strokeWidth={1.5} className="mx-auto mb-2 text-indigo-500" />
          <div className="text-3xl font-extrabold tracking-tight text-slate-900">
            {report.subscriptions.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {ar ? "اشتراك مكتشف" : "subscriptions found"}
          </div>
        </div>
        <div className="bento-card p-5 text-center">
          <TrendingDown size={20} strokeWidth={1.5} className="mx-auto mb-2 text-indigo-500" />
          <div className="text-3xl font-extrabold tracking-tight text-slate-900">
            {report.totalMonthly.toFixed(0)} <span className="text-sm font-semibold text-slate-400">{ar ? "ريال" : "SAR"}</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {ar ? "المجموع الشهري" : "total per month"}
          </div>
        </div>
        <div className="bento-card p-5 text-center">
          <div className="text-3xl font-extrabold tracking-tight text-indigo-600">
            {report.totalYearly.toFixed(0)} <span className="text-sm font-semibold text-indigo-400">{ar ? "ريال" : "SAR"}</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {ar ? "المجموع السنوي" : "total per year"}
          </div>
        </div>
        <div className="bento-card p-5 text-center">
          <CalendarDays size={20} strokeWidth={1.5} className="mx-auto mb-2 text-slate-400" />
          <div className="text-3xl font-extrabold tracking-tight text-slate-900">
            {report.analyzedTransactions}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {ar ? "عملية تم تحليلها" : "transactions analyzed"}
          </div>
        </div>
      </div>

      {/* ── Savings Banner ── */}
      {cancelSubs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bento-card bg-gradient-to-br from-indigo-500 to-violet-600 p-6 text-center text-white border-0"
        >
          <p className="text-sm text-white/70 mb-1">
            {ar ? "التوفير المتوقع بإلغاء الاشتراكات المختارة" : "Estimated savings from selected cancellations"}
          </p>
          <div className="text-4xl font-extrabold tracking-tight">
            {(cancelMonthlySavings * 12).toFixed(0)} {ar ? "ريال/سنة" : "SAR/year"}
          </div>
          <p className="text-xs text-white/50 mt-1">
            = {cancelMonthlySavings.toFixed(0)} {ar ? "ريال/شهر" : "SAR/month"} ({cancelSubs.length} {ar ? "اشتراك" : "subscriptions"})
          </p>
        </motion.div>
      )}

      {/* ── Tip Banner ── */}
      {report.subscriptions.length > 0 && cancelSubs.length === 0 && (
        <div className="bento-card bg-indigo-50/50 border-indigo-100 p-4 flex items-start gap-3">
          <Info size={18} strokeWidth={1.5} className="text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-indigo-800 mb-0.5">
              {ar ? "نصيحة: راجع كل اشتراك" : "Tip: Review each subscription"}
            </p>
            <p className="text-xs text-indigo-600">
              {ar
                ? "اضغط \"الغيه\" على الاشتراكات اللي ما تحتاجها وبنحسب لك التوفير المتوقع."
                : "Click \"Cancel\" on subscriptions you don't need and we'll calculate your potential savings."}
            </p>
          </div>
        </div>
      )}

      {/* ── Filter & Controls ── */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "investigate", "cancel", "keep"] as const).map((f) => {
          const labels: Record<string, { ar: string; en: string }> = {
            all:         { ar: "الكل", en: "All" },
            investigate: { ar: "مراجعة", en: "Review" },
            cancel:      { ar: "يُلغى", en: "Cancel" },
            keep:        { ar: "يُبقى", en: "Keep" },
          };
          const counts: Record<string, number> = {
            all: report.subscriptions.length,
            investigate: report.subscriptions.filter((s) => s.status === "investigate").length,
            cancel: cancelSubs.length,
            keep: keepSubs.length,
          };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-bold px-3.5 py-2 rounded-full border transition-all ${
                filter === f
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
              }`}
            >
              {ar ? labels[f].ar : labels[f].en} ({counts[f]})
            </button>
          );
        })}

        <div className="flex-1" />

        <button
          onClick={() => setPrivacyMode(!privacyMode)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
        >
          {privacyMode ? <Eye size={14} strokeWidth={1.5} /> : <EyeOff size={14} strokeWidth={1.5} />}
          {privacyMode
            ? (ar ? "اظهر الأسماء" : "Show names")
            : (ar ? "اخفِ الأسماء" : "Hide names")}
        </button>
      </div>

      {/* ── Subscription List ── */}
      {report.subscriptions.length === 0 ? (
        <div className="bento-card text-center py-16 px-6">
          <Search size={40} strokeWidth={1.5} className="mx-auto mb-4 text-slate-300" />
          <p className="font-bold text-lg text-slate-700 mb-2">
            {ar ? "ما لقينا اشتراكات متكررة" : "No recurring subscriptions found"}
          </p>
          <p className="text-sm text-slate-400 mb-1">
            {ar
              ? "جرب ارفع كشف حساب أطول (٢-٣ أشهر) عشان نلقى الاشتراكات المتكررة."
              : "Try uploading a longer statement (2-3 months) so we can detect recurring charges."}
          </p>
          <p className="text-sm text-slate-400">
            {ar
              ? "أو جرب ملف ثاني — بعض الكشوفات تحتاج صيغة CSV بدل PDF."
              : "Or try a different file — some statements work better as CSV instead of PDF."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((sub, i) => (
            <SubscriptionCard
              key={sub.id}
              sub={sub}
              locale={locale}
              privacyMode={privacyMode}
              onStatusChange={onStatusChange}
              index={i}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400">
              {ar ? "لا توجد اشتراكات في هذه الفئة" : "No subscriptions in this category"}
            </div>
          )}
        </div>
      )}

      {/* ── Date Range ── */}
      {report.dateRange.from && report.dateRange.to && (
        <p className="text-xs text-center text-slate-400">
          {ar ? "فترة التحليل:" : "Analysis period:"} {report.dateRange.from} — {report.dateRange.to}
        </p>
      )}
    </motion.div>
  );
}
