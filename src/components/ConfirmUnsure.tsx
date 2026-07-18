"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Subscription } from "@/lib/types";
import { formatSubCost } from "@/lib/format";

type Verdict = "yes" | "no" | "unknown";

interface ConfirmUnsureProps {
  locale: "ar" | "en";
  clearCount: number;
  unsure: Subscription[];
  onComplete: (kept: Subscription[]) => void;
  onSkip: () => void;
}

export default function ConfirmUnsure({
  locale,
  clearCount,
  unsure,
  onComplete,
  onSkip,
}: ConfirmUnsureProps) {
  const ar = locale === "ar";
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>(() =>
    Object.fromEntries(unsure.map((s) => [s.id, "unknown" as Verdict]))
  );

  function setVerdict(id: string, v: Verdict) {
    setVerdicts((prev) => ({ ...prev, [id]: v }));
  }

  function handleSeeTotal() {
    const kept = unsure.filter((s) => verdicts[s.id] === "yes");
    onComplete(kept);
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-6">
      <div className="max-w-[640px] mx-auto">
        <p className="text-sm font-bold text-[#00A651] mb-2">
          {ar
            ? `لقينا ${clearCount} اشتراكات واضحة`
            : `Found ${clearCount} clear subscriptions`}
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
          {ar
            ? `ساعدنا نحدد ${unsure.length} إضافية`
            : `Help identify ${unsure.length} more`}
        </h1>
        <div className="border-t border-dashed border-[#00A651]/40 mb-4" />
        <p className="text-[15px] text-slate-500 mb-8 leading-relaxed">
          {ar
            ? "لقينا خصومات متكررة مو متأكدين منها. ساعدنا نضيفها للمجموع:"
            : "We found some recurring charges we're not sure about. Help us include them in your total:"}
        </p>

        <div className="space-y-4 mb-8">
          {unsure.map((sub, i) => {
            const verdict = verdicts[sub.id] ?? "unknown";
            const raw =
              sub.rawDescription ||
              sub.transactions.map((t) => t.description).filter(Boolean).slice(0, 2).join(" / ") ||
              sub.name;

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-slate-200 rounded-xl p-5 bg-white"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 text-right flex-1">
                    <div className="flex items-center gap-2 flex-wrap justify-start">
                      <span className="font-bold text-slate-900">{sub.name}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        x{sub.occurrences}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 break-words" dir="ltr">
                      {raw}
                    </p>
                    {sub.aiDescription && (
                      <p className="text-xs text-slate-500 italic mt-1">{sub.aiDescription}</p>
                    )}
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 whitespace-nowrap flex-shrink-0">
                    {formatSubCost(sub.monthlyEquivalent, ar)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {(
                    [
                      { id: "yes" as const, ar: "اشتراك", en: "Subscription" },
                      { id: "no" as const, ar: "مو اشتراك", en: "Not a subscription" },
                      { id: "unknown" as const, ar: "ما أدري", en: "Don't know" },
                    ] as const
                  ).map((btn) => {
                    const active = verdict === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setVerdict(sub.id, btn.id)}
                        className={`text-sm font-bold px-3.5 py-2 rounded-full border transition-all ${
                          active
                            ? "bg-[#00A651] border-[#00A651] text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:border-[#00A651]"
                        }`}
                      >
                        {ar ? btn.ar : btn.en}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-xs text-slate-400 text-center mb-4">
          {ar
            ? "خذ وقتك · ما تقدر تعدّل بعدين"
            : "Take your time · you can't edit these later"}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" className="btn-primary flex-1 py-4" onClick={handleSeeTotal}>
            {ar ? "شوف المجموع ←" : "See your total →"}
          </button>
          <button type="button" className="btn-ghost flex-shrink-0 px-5" onClick={onSkip}>
            {ar
              ? `تخطّى · استخدم ${clearCount} الواضحة`
              : `Skip, use ${clearCount} found`}
          </button>
        </div>
      </div>
    </div>
  );
}
