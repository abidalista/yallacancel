"use client";

import { Subscription, SubscriptionStatus } from "@/lib/types";
import { getCancelInfo, CancelDifficulty } from "@/lib/cancel-db";

const FAV = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

const FREQ_LABELS: Record<string, { ar: string; en: string }> = {
  weekly:    { ar: "أسبوعي",    en: "Weekly" },
  monthly:   { ar: "شهري",      en: "Monthly" },
  quarterly: { ar: "ربع سنوي", en: "Quarterly" },
  yearly:    { ar: "سنوي",      en: "Yearly" },
};

const DIFFICULTY_CONFIG: Record<CancelDifficulty, { ar: string; en: string; cls: string }> = {
  easy:   { ar: "سهل",   en: "Easy",   cls: "bg-green-50 text-green-700 border-green-200" },
  medium: { ar: "متوسط", en: "Medium", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  hard:   { ar: "صعب",   en: "Hard",   cls: "bg-red-50 text-red-700 border-red-200" },
};

interface SubscriptionCardProps {
  sub: Subscription;
  locale: "ar" | "en";
  privacyMode: boolean;
  onStatusChange: (id: string, status: SubscriptionStatus) => void;
}

function formatDate(dateStr: string, locale: "ar" | "en") {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString(
      locale === "ar" ? "ar-SA" : "en-SA",
      { year: "numeric", month: "short", day: "numeric" }
    );
  } catch {
    return dateStr;
  }
}

export default function SubscriptionCard({
  sub,
  locale,
  privacyMode,
  onStatusChange,
}: SubscriptionCardProps) {
  const ar = locale === "ar";
  const freq = FREQ_LABELS[sub.frequency];
  const cancelInfo = getCancelInfo(sub.name);
  const difficulty = cancelInfo?.difficulty || "medium";
  const diffCfg = DIFFICULTY_CONFIG[difficulty];
  const domain = cancelInfo?.domain || "";
  const hasCancelLink = cancelInfo?.cancelUrl;
  const hasGuide = cancelInfo?.guideSlug;
  const darkPattern = cancelInfo?.darkPattern;

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden transition-all hover:shadow-md">
      {/* Main content */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            {domain ? (
              <img
                src={FAV(domain)}
                alt={sub.name}
                className="w-11 h-11 rounded-xl bg-[var(--color-surface)] p-0.5"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-[var(--color-surface)] flex items-center justify-center text-sm font-black text-[var(--color-text-muted)]">
                {sub.name[0]}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`font-bold text-base ${privacyMode ? "blur-sm" : ""}`}>
                {sub.name}
              </span>
              {/* Difficulty badge */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${diffCfg.cls}`}>
                {ar ? diffCfg.ar : diffCfg.en}
              </span>
              {/* Frequency badge */}
              <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                {ar ? freq?.ar : freq?.en}
              </span>
            </div>

            {/* Amount row */}
            <div className="flex items-baseline gap-3 mb-1.5">
              <span className="text-xl font-black text-[var(--color-text-primary)]">
                {sub.amount.toLocaleString(ar ? "ar-SA" : "en-SA")} <span className="text-xs font-semibold text-[var(--color-text-muted)]">{ar ? "ر.س" : "SAR"}</span>
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                = {sub.monthlyEquivalent.toFixed(0)} {ar ? "ر.س/شهر" : "SAR/mo"} = {sub.yearlyEquivalent.toFixed(0)} {ar ? "ر.س/سنة" : "SAR/yr"}
              </span>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-[var(--color-text-muted)]">
              <span>
                {ar ? "آخر خصم:" : "Last:"}{" "}
                <span className={privacyMode ? "blur-sm" : ""}>
                  {formatDate(sub.lastCharge, locale)}
                </span>
              </span>
              <span>
                {ar ? "مرات الخصم:" : "Charges:"} {sub.occurrences}
                {sub.occurrences === 1 && (
                  <span className="text-amber-500 font-semibold"> ({ar ? "خصم واحد" : "single charge"})</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Dark pattern warning */}
        {darkPattern && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 flex items-start gap-2.5">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-amber-500 flex-shrink-0 mt-0.5">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="text-xs text-amber-700 font-medium leading-relaxed">{darkPattern}</p>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 flex items-center gap-2.5">
        {/* Cancel link button */}
        {hasCancelLink && (
          <a
            href={cancelInfo!.cancelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5 no-underline"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
            {ar ? "ألغِ الآن" : "Cancel Now"}
          </a>
        )}

        {/* Guide link */}
        {hasGuide && (
          <a
            href={`/${cancelInfo!.guideSlug}.html`}
            className="inline-flex items-center gap-1.5 bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-xs font-bold px-4 py-2 rounded-lg transition-all no-underline"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            {ar ? "دليل الإلغاء" : "Cancel Guide"}
          </a>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Status toggles */}
        <div className="flex gap-1.5">
          <button
            onClick={() => onStatusChange(sub.id, "keep")}
            className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
              sub.status === "keep"
                ? "bg-green-500 text-white border-green-500"
                : "bg-white text-gray-400 border-gray-200 hover:border-green-300 hover:text-green-600"
            }`}
          >
            {ar ? "خلّيه" : "Keep"}
          </button>
          <button
            onClick={() => onStatusChange(sub.id, "cancel")}
            className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
              sub.status === "cancel"
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-gray-400 border-gray-200 hover:border-red-300 hover:text-red-600"
            }`}
          >
            {ar ? "ألغِه" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
