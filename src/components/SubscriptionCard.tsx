"use client";

import { motion } from "framer-motion";
import { ExternalLink, FileText, AlertTriangle } from "lucide-react";
import { Subscription, SubscriptionStatus } from "@/lib/types";
import { getCancelInfo, CancelDifficulty } from "@/lib/cancel-db";

const LOGO = (domain: string) =>
  `https://logo.clearbit.com/${domain}`;
const FAV = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

const FREQ_LABELS: Record<string, { ar: string; en: string }> = {
  weekly:    { ar: "أسبوعي",    en: "Weekly" },
  monthly:   { ar: "شهري",      en: "Monthly" },
  quarterly: { ar: "ربع سنوي", en: "Quarterly" },
  yearly:    { ar: "سنوي",      en: "Yearly" },
};

const DIFFICULTY_CONFIG: Record<CancelDifficulty, { ar: string; en: string; cls: string }> = {
  easy:   { ar: "سهل",   en: "Easy",   cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  medium: { ar: "متوسط", en: "Medium", cls: "bg-amber-50 text-amber-600 border-amber-200" },
  hard:   { ar: "صعب",   en: "Hard",   cls: "bg-red-50 text-red-600 border-red-200" },
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
  const difficulty = cancelInfo?.difficulty || "medium";
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
          <div className="flex-shrink-0">
            {domain ? (
              <img
                src={LOGO(domain)}
                alt={sub.name}
                className="w-11 h-11 rounded-xl bg-slate-50 p-1 object-contain"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.fallback) {
                    img.dataset.fallback = "1";
                    img.src = FAV(domain);
                  }
                }}
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-sm font-bold text-indigo-500">
                {sub.name[0]}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`font-bold text-base text-slate-800 ${privacyMode ? "blur-sm" : ""}`}>
                {sub.name}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffCfg.cls}`}>
                {ar ? diffCfg.ar : diffCfg.en}
              </span>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {ar ? freq?.ar : freq?.en}
              </span>
            </div>

            {/* Amount */}
            <div className="flex items-baseline gap-3 mb-1.5">
              <span className="text-xl font-extrabold text-slate-900">
                {sub.amount.toLocaleString(ar ? "ar-SA" : "en-SA")} <span className="text-xs font-semibold text-slate-400">{ar ? "ريال" : "SAR"}</span>
              </span>
              <span className="text-xs text-slate-400">
                = {sub.monthlyEquivalent.toFixed(0)} {ar ? "ريال/شهر" : "SAR/mo"} = {sub.yearlyEquivalent.toFixed(0)} {ar ? "ريال/سنة" : "SAR/yr"}
              </span>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
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
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2.5 flex items-start gap-2.5">
            <AlertTriangle size={14} strokeWidth={1.5} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 font-medium leading-relaxed">{darkPattern}</p>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 flex items-center gap-2.5">
        {hasCancelLink && (
          <a
            href={cancelInfo!.cancelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-all hover:-translate-y-0.5 no-underline"
          >
            <ExternalLink size={12} strokeWidth={1.5} />
            {ar ? "الغي الآن" : "Cancel Now"}
          </a>
        )}

        {hasGuide && (
          <a
            href={`/${cancelInfo!.guideSlug}.html`}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-indigo-300 text-slate-500 hover:text-indigo-600 text-xs font-bold px-4 py-2 rounded-full transition-all no-underline"
          >
            <FileText size={12} strokeWidth={1.5} />
            {ar ? "دليل الإلغاء" : "Cancel Guide"}
          </a>
        )}

        <div className="flex-1" />

        <div className="flex gap-1.5">
          <button
            onClick={() => onStatusChange(sub.id, "keep")}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
              sub.status === "keep"
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-white text-slate-400 border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
            }`}
          >
            {ar ? "خلّيه" : "Keep"}
          </button>
          <button
            onClick={() => onStatusChange(sub.id, "cancel")}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
              sub.status === "cancel"
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-slate-400 border-slate-200 hover:border-red-300 hover:text-red-600"
            }`}
          >
            {ar ? "الغيه" : "Cancel"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
