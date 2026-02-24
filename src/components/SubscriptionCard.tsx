"use client";

import { Subscription, SubscriptionStatus } from "@/lib/types";

const FREQ_LABELS: Record<string, { ar: string; en: string }> = {
  weekly:    { ar: "أسبوعي",    en: "Weekly" },
  monthly:   { ar: "شهري",      en: "Monthly" },
  quarterly: { ar: "ربع سنوي", en: "Quarterly" },
  yearly:    { ar: "سنوي",      en: "Yearly" },
};

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  { badge: string; label: { ar: string; en: string }; border: string }
> = {
  cancel:      { badge: "badge-cancel",      label: { ar: "يُلغى",    en: "Cancel" },  border: "border-red-200 bg-red-50/40" },
  keep:        { badge: "badge-keep",        label: { ar: "يُبقى",    en: "Keep" },    border: "border-green-200 bg-green-50/40" },
  investigate: { badge: "badge-investigate", label: { ar: "مراجعة",   en: "Review" },  border: "border-amber-200 bg-amber-50/30" },
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
  const cfg = STATUS_CONFIG[sub.status];
  const freq = FREQ_LABELS[sub.frequency];

  const actions: { status: SubscriptionStatus; ar: string; en: string; cls: string }[] = [
    { status: "cancel",      ar: "🚫 ألغِه",   en: "🚫 Cancel",  cls: "hover:bg-red-50 hover:border-red-300 hover:text-red-700" },
    { status: "keep",        ar: "✅ خلّيه",    en: "✅ Keep",    cls: "hover:bg-green-50 hover:border-green-300 hover:text-green-700" },
    { status: "investigate", ar: "🔍 راجع",    en: "🔍 Review",  cls: "hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700" },
  ];

  return (
    <div className={`card border-2 ${cfg.border} transition-all`}>
      <div className="flex items-start justify-between gap-3">
        {/* Left: name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`font-bold text-base ${privacyMode ? "privacy-blur" : ""}`}
              title={privacyMode ? (ar ? "اضغط للإظهار" : "Click to reveal") : ""}
            >
              {sub.name}
            </span>
            <span className={`badge ${cfg.badge}`}>
              {ar ? cfg.label.ar : cfg.label.en}
            </span>
            <span className="badge bg-gray-100 text-gray-600">
              {ar ? freq?.ar : freq?.en}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-[var(--color-text-muted)]">
            <span>
              {ar ? "آخر خصم:" : "Last charge:"}{" "}
              <span className={privacyMode ? "privacy-blur" : ""}>
                {formatDate(sub.lastCharge, locale)}
              </span>
            </span>
            <span>
              {ar ? "عدد المرات:" : "Occurrences:"} {sub.occurrences}
            </span>
          </div>
        </div>

        {/* Right: amount */}
        <div className="text-right flex-shrink-0">
          <div className="font-black text-xl text-[var(--color-text-primary)]">
            {sub.amount.toLocaleString(ar ? "ar-SA" : "en-SA")}{" "}
            <span className="text-sm font-medium text-[var(--color-text-muted)]">
              {ar ? "ر.س" : "SAR"}
            </span>
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {sub.monthlyEquivalent.toFixed(1)}{" "}
            {ar ? "ر.س/شهر" : "SAR/mo"}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
        {actions.map((a) => (
          <button
            key={a.status}
            onClick={() => onStatusChange(sub.id, a.status)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-all ${a.cls} ${
              sub.status === a.status ? "ring-2 ring-offset-1 ring-current" : ""
            }`}
          >
            {ar ? a.ar : a.en}
          </button>
        ))}
      </div>
    </div>
  );
}
