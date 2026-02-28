"use client";

import { motion } from "framer-motion";
import { ExternalLink, FileText, AlertTriangle } from "lucide-react";
import { Subscription, SubscriptionStatus } from "@/lib/types";
import { getCancelInfo, CancelDifficulty } from "@/lib/cancel-db";
import MerchantLogo from "@/components/MerchantLogo";

const FREQ_LABELS: Record<string, { ar: string; en: string }> = {
  weekly:    { ar: "أسبع",    en: "Weekly" },
  monthly:   { ar: "شر",      en: "Monthly" },
  quarterly: { ar: "ربع س", en: "Quarterly" },
  yearly:    { ar: "س",      en: "Yearly" },
};

const DIFFICULTY_CONFIG: Record<CancelDifficulty, { ar: string; en: string; cls: string }> = {
  easy: { ar: "س", en: "Easy", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  hard: { ar: "صعب", en: "Hard", cls: "bg-red-50 text-red-600 border-red-200" },
};

interface SubscriptionCardProps {
  sub: Subscription;
  locale: "ar" | "en";
  privacyMode: boolean;
  onStatusChange: (id: string, status: SubscriptionStatus) => void;
  index?: number;
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
  index = 0,
}: SubscriptionCardProps) {
  const ar = locale === "ar";
  const freq = FREQ_LABELS[sub.frequency];
  const cancelInfo = getCancelInfo(sub.name);
  const difficulty = cancelInfo?.difficulty || "easy";
  const diffCfg = DIFFICULTY_CONFIG[difficulty];
  const domain = cancelInfo?.domain || "";
  const hasCancelLink = cancelInfo?.cancelUrl;
  const hasGuide = cancelInfo?.guideSlug;
  const darkPattern = cancelInfo?.darkPattern;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bento-card overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <MerchantLogo name={sub.name} domain={domain} size={44} />

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`font-bold text-base ${privacyMode ? "blur-sm" : ""}`} style={{ color: "#1A3A35" }}>
                {sub.name}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffCfg.cls}`}>
                {ar ? diffCfg.ar : diffCfg.en}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#E5EFED", color: "#4A6862" }}>
                {ar ? freq?.ar : freq?.en}
              </span>
            </div>

            {/* Amount — always left-aligned */}
            <div className="flex items-baseline gap-3 mb-1.5" dir="ltr" style={{ textAlign: "left" }}>
              <span className="text-xl font-extrabold" style={{ color: "#1A3A35" }}>
                {sub.amount.toLocaleString(ar ? "ar-SA" : "en-SA")} <span className="text-xs font-semibold" style={{ color: "#8AADA8" }}>{ar ? "را" : "SAR"}</span>
              </span>
              <span className="text-xs" style={{ color: "#8AADA8" }}>
                = {sub.monthlyEquivalent.toFixed(0)} {ar ? "را/شر" : "SAR/mo"} = {sub.yearlyEquivalent.toFixed(0)} {ar ? "را/سة" : "SAR/yr"}
              </span>
            </div>

            {/* Meta — always left-aligned */}
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs" dir="ltr" style={{ textAlign: "left", color: "#8AADA8" }}>
              <span>
                {ar ? "آخر خص:" : "Last:"}{" "}
                <span className={privacyMode ? "blur-sm" : ""}>
                  {formatDate(sub.lastCharge, locale)}
                </span>
              </span>
              {sub.firstCharge && sub.firstCharge !== sub.lastCharge && (
                <span>
                  {ar ? "أ خص:" : "First:"}{" "}
                  <span className={privacyMode ? "blur-sm" : ""}>
                    {formatDate(sub.firstCharge, locale)}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dark pattern warning */}
        {darkPattern && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2.5 flex items-start gap-2.5">
            <AlertTriangle size={14} strokeWidth={1.5} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 font-medium leading-relaxed">{darkPattern}</p>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="px-5 py-3 flex items-center gap-2.5" style={{ borderTop: "1px solid #E5EFED", background: "#EDF5F3" }}>
        {hasCancelLink && (
          <a
            href={cancelInfo!.cancelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-all hover:-translate-y-0.5 no-underline"
          >
            <ExternalLink size={12} strokeWidth={1.5} />
            {ar ? "اغ اآ" : "Cancel Now"}
          </a>
        )}

        {hasGuide && (
          <a
            href={`/${cancelInfo!.guideSlug}.html`}
            className="inline-flex items-center gap-1.5 bg-white text-xs font-bold px-4 py-2 rounded-full transition-all no-underline hover:-translate-y-0.5"
            style={{ border: "1px solid #E5EFED", color: "#4A6862" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#00A651"; e.currentTarget.style.color = "#1A3A35"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5EFED"; e.currentTarget.style.color = "#4A6862"; }}
          >
            <FileText size={12} strokeWidth={1.5} />
            {ar ? "د اإغاء" : "Cancel Guide"}
          </a>
        )}

        <div className="flex-1" />

        <div className="flex gap-1.5">
          <button
            onClick={() => onStatusChange(sub.id, "keep")}
            className="text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all"
            style={sub.status === "keep"
              ? { background: "#10B981", color: "white", borderColor: "#10B981" }
              : { background: "white", color: "#8AADA8", borderColor: "#E5EFED" }}
          >
            {ar ? "خ" : "Keep"}
          </button>
          <button
            onClick={() => onStatusChange(sub.id, "cancel")}
            className="text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all"
            style={sub.status === "cancel"
              ? { background: "#EF4444", color: "white", borderColor: "#EF4444" }
              : { background: "white", color: "#8AADA8", borderColor: "#E5EFED" }}
          >
            {ar ? "اغ" : "Cancel"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
