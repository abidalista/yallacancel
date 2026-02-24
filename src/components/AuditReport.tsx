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

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`stat-card ${highlight ? "border-[var(--color-primary)] bg-[var(--color-primary-bg)]" : ""}`}>
      <div className={`text-2xl font-black ${highlight ? "text-[var(--color-primary)]" : "text-[var(--color-text-primary)]"}`}>
        {value}
      </div>
      <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">{label}</div>
      {sub && <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub}</div>}
    </div>
  );
}

export default function AuditReport({
  report,
  locale,
  onStatusChange,
  onStartOver,
  onUpgradeClick,
}: AuditReportProps) {
  const [privacyMode, setPrivacyMode] = useState(false);
  const ar = locale === "ar";

  const byStatus = (status: SubscriptionStatus): Subscription[] =>
    report.subscriptions.filter((s) => s.status === status);

  const cancelSubs = byStatus("cancel");
  const keepSubs = byStatus("keep");
  const investigateSubs = byStatus("investigate");

  const cancelMonthlySavings = cancelSubs.reduce(
    (sum, s) => sum + s.monthlyEquivalent,
    0
  );

  const sections: {
    title: string;
    subs: Subscription[];
    emptyMsg: string;
  }[] = [
    {
      title: ar ? "🚫 ألغِها" : "🚫 Cancel These",
      subs: cancelSubs,
      emptyMsg: ar ? "ما فيه اشتراكات للإلغاء" : "No subscriptions marked to cancel",
    },
    {
      title: ar ? "🔍 راجعها" : "🔍 Review These",
      subs: investigateSubs,
      emptyMsg: ar ? "كل الاشتراكات تم تصنيفها" : "All subscriptions categorized",
    },
    {
      title: ar ? "✅ خلّيها" : "✅ Keep These",
      subs: keepSubs,
      emptyMsg: ar ? "ما فيه اشتراكات للإبقاء" : "No subscriptions marked to keep",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label={ar ? "اشتراكات مكتشفة" : "Subscriptions found"}
          value={String(report.subscriptions.length)}
        />
        <StatCard
          label={ar ? "المجموع الشهري" : "Monthly total"}
          value={`${report.totalMonthly.toFixed(0)} ${ar ? "ر.س" : "SAR"}`}
          highlight
        />
        <StatCard
          label={ar ? "المجموع السنوي" : "Yearly total"}
          value={`${report.totalYearly.toFixed(0)} ${ar ? "ر.س" : "SAR"}`}
        />
        <StatCard
          label={ar ? "توفير محتمل/شهر" : "Potential savings/mo"}
          value={`${cancelMonthlySavings.toFixed(0)} ${ar ? "ر.س" : "SAR"}`}
          sub={ar ? "من الاشتراكات المختارة للإلغاء" : "from subscriptions to cancel"}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`btn-ghost text-xs ${privacyMode ? "bg-gray-100" : ""}`}
          >
            {privacyMode
              ? (ar ? "👁 إظهار الأسماء" : "👁 Show names")
              : (ar ? "🙈 إخفاء الأسماء" : "🙈 Hide names")}
          </button>
          <button onClick={onStartOver} className="btn-ghost text-xs">
            {ar ? "↩ ارفع كشف آخر" : "↩ Upload another"}
          </button>
        </div>

        {/* Premium CTA */}
        <button
          onClick={onUpgradeClick}
          className="btn-primary text-sm py-2 px-4"
        >
          {ar ? "📄 صدّر PDF — ترقية" : "📄 Export PDF — Upgrade"}
        </button>
      </div>

      {/* Cancel savings banner */}
      {cancelSubs.length > 0 && (
        <div className="bg-[var(--color-primary-bg)] border border-[var(--color-primary)]/30 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <div>
            <p className="font-bold text-[var(--color-primary-dark)]">
              {ar
                ? `تقدر توفر ${(cancelMonthlySavings * 12).toFixed(0)} ر.س سنوياً`
                : `You could save ${(cancelMonthlySavings * 12).toFixed(0)} SAR per year`}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {ar
                ? `بإلغاء ${cancelSubs.length} اشتراك اخترته`
                : `by cancelling the ${cancelSubs.length} subscriptions you marked`}
            </p>
          </div>
        </div>
      )}

      {/* Sections */}
      {report.subscriptions.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-bold text-lg">
            {ar ? "ما لقينا اشتراكات متكررة" : "No recurring subscriptions found"}
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {ar
              ? "جرب رفع كشف حساب أطول (٣ أشهر أو أكثر)"
              : "Try uploading a longer statement (3+ months)"}
          </p>
        </div>
      ) : (
        sections.map((section) => (
          <div key={section.title}>
            <h3 className="section-title">{section.title}</h3>
            {section.subs.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] py-2 px-1">
                {section.emptyMsg}
              </p>
            ) : (
              <div className="space-y-3">
                {section.subs.map((sub) => (
                  <SubscriptionCard
                    key={sub.id}
                    sub={sub}
                    locale={locale}
                    privacyMode={privacyMode}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Cancel links promo */}
      <div className="card border-dashed border-2 border-[var(--color-primary)]/30 bg-[var(--color-primary-bg)] text-center py-8">
        <div className="text-3xl mb-2">🔗</div>
        <p className="font-bold text-[var(--color-primary-dark)] mb-1">
          {ar
            ? "تبي روابط الإلغاء المباشرة لكل خدمة؟"
            : "Want direct cancel links for each service?"}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          {ar
            ? "مع الترقية تحصل على روابط مباشرة + خطوات إلغاء لأكثر من ٥٠ خدمة سعودية"
            : "Upgrade to get direct links + step-by-step guides for 50+ Saudi services"}
        </p>
        <button onClick={onUpgradeClick} className="btn-primary">
          {ar ? "ترقية — ٤٩ ر.س مرة واحدة" : "Upgrade — 49 SAR once"}
        </button>
      </div>
    </div>
  );
}
