"use client";

import { useState } from "react";
import { AuditReport as Report, Subscription, SubscriptionStatus } from "@/lib/types";
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
    <div className="space-y-6">

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 text-center">
          <div className="text-3xl font-black text-[var(--color-text-primary)]">
            {report.subscriptions.length}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            {ar ? "اشتراك مكتشف" : "subscriptions found"}
          </div>
        </div>
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 text-center">
          <div className="text-3xl font-black text-[var(--color-text-primary)]">
            {report.totalMonthly.toFixed(0)} <span className="text-sm font-semibold text-[var(--color-text-muted)]">{ar ? "ريال" : "SAR"}</span>
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            {ar ? "المجموع الشهري" : "total per month"}
          </div>
        </div>
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 text-center">
          <div className="text-3xl font-black text-[var(--color-primary)]">
            {report.totalYearly.toFixed(0)} <span className="text-sm font-semibold text-[var(--color-primary)]/60">{ar ? "ريال" : "SAR"}</span>
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            {ar ? "المجموع السنوي" : "total per year"}
          </div>
        </div>
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 text-center">
          <div className="text-3xl font-black text-[var(--color-text-primary)]">
            {report.analyzedTransactions}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            {ar ? "عملية تم تحليلها" : "transactions analyzed"}
          </div>
        </div>
      </div>

      {/* ── Savings Banner ── */}
      {cancelSubs.length > 0 && (
        <div className="bg-[var(--color-primary)] rounded-2xl p-5 text-center text-white">
          <p className="text-sm text-white/70 mb-1">
            {ar ? "التوفير المتوقع بإلغاء الاشتراكات المختارة" : "Estimated savings from selected cancellations"}
          </p>
          <div className="text-3xl font-black">
            {(cancelMonthlySavings * 12).toFixed(0)} {ar ? "ريال/سنة" : "SAR/year"}
          </div>
          <p className="text-xs text-white/50 mt-1">
            = {cancelMonthlySavings.toFixed(0)} {ar ? "ريال/شهر" : "SAR/month"} ({cancelSubs.length} {ar ? "اشتراك" : "subscriptions"})
          </p>
        </div>
      )}

      {/* ── Tip Banner ── */}
      {report.subscriptions.length > 0 && cancelSubs.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-blue-500 flex-shrink-0 mt-0.5">
            <path d="M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div>
            <p className="text-sm font-bold text-blue-800 mb-0.5">
              {ar ? "نصيحة: راجع كل اشتراك" : "Tip: Review each subscription"}
            </p>
            <p className="text-xs text-blue-600">
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
              className={`text-xs font-bold px-3.5 py-2 rounded-lg border transition-all ${
                filter === f
                  ? "bg-[var(--color-dark)] text-white border-[var(--color-dark)]"
                  : "bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-dark)]"
              }`}
            >
              {ar ? labels[f].ar : labels[f].en} ({counts[f]})
            </button>
          );
        })}

        <div className="flex-1" />

        <button
          onClick={() => setPrivacyMode(!privacyMode)}
          className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          {privacyMode
            ? (ar ? "اظهر الأسماء" : "Show names")
            : (ar ? "اخفِ الأسماء" : "Hide names")}
        </button>
      </div>

      {/* ── Subscription List ── */}
      {report.subscriptions.length === 0 ? (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl text-center py-16 px-6">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mx-auto mb-4 text-[var(--color-text-muted)]">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="font-bold text-lg mb-2">
            {ar ? "ما لقينا اشتراكات متكررة" : "No recurring subscriptions found"}
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mb-1">
            {ar
              ? "جرب ارفع كشف حساب أطول (٢-٣ أشهر) عشان نلقى الاشتراكات المتكررة."
              : "Try uploading a longer statement (2-3 months) so we can detect recurring charges."}
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            {ar
              ? "أو جرب ملف ثاني — بعض الكشوفات تحتاج صيغة CSV بدل PDF."
              : "Or try a different file — some statements work better as CSV instead of PDF."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              sub={sub}
              locale={locale}
              privacyMode={privacyMode}
              onStatusChange={onStatusChange}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-[var(--color-text-muted)]">
              {ar ? "لا توجد اشتراكات في هذه الفئة" : "No subscriptions in this category"}
            </div>
          )}
        </div>
      )}

      {/* ── Date Range ── */}
      {report.dateRange.from && report.dateRange.to && (
        <p className="text-xs text-center text-[var(--color-text-muted)]">
          {ar ? "فترة التحليل:" : "Analysis period:"} {report.dateRange.from} — {report.dateRange.to}
        </p>
      )}
    </div>
  );
}
