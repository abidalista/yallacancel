"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { SpendingBreakdown as SpendingData } from "@/lib/services";

interface Props {
  data: SpendingData;
  locale: "ar" | "en";
}

const CATEGORY_COLORS: Record<string, string> = {
  "Food Delivery": "#F97316",
  "Eating Out": "#EF4444",
  "Groceries": "#22C55E",
  "Shopping": "#8B5CF6",
  "Transport": "#3B82F6",
  "Telecom": "#06B6D4",
  "Transfers": "#00A651",
  "Housing": "#EC4899",
  "Subscriptions": "#1A3A35",
  "Health": "#14B8A6",
  "Education": "#A855F7",
  "Other": "#8AADA8",
};

function formatMonth(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}

export default function SpendingBreakdownComponent({ data, locale }: Props) {
  const ar = locale === "ar";

  if (data.categories.length === 0) return null;

  const dateLabel = data.dateRange.from && data.dateRange.to
    ? `${formatMonth(data.dateRange.from)} – ${formatMonth(data.dateRange.to)}`
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bento-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid #E5EFED" }}>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={18} strokeWidth={1.5} style={{ color: "#00A651" }} />
          <h3 className="text-base font-extrabold" style={{ color: "#1A3A35" }}>
            {ar ? "تح اإا" : "Spending Breakdown"}
          </h3>
          {dateLabel && (
            <span className="text-xs font-medium" style={{ color: "#8AADA8" }}>{dateLabel}</span>
          )}
        </div>
        <p className="text-sm" style={{ color: "#4A6862" }}>
          {ar
            ? `${data.totalSpend.toLocaleString()} را إجا (~${data.monthlyAvg.toLocaleString()} را/شر)  ${data.transactionCount.toLocaleString()} عة`
            : `${data.totalSpend.toLocaleString()} SAR total (~${data.monthlyAvg.toLocaleString()} SAR/mo) across ${data.transactionCount.toLocaleString()} transactions`}
        </p>
      </div>

      {/* Category table */}
      <div className="px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#8AADA8" }}>
          {ar ? " ترح س" : "Where it goes"}
        </p>

        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider pb-2" style={{ color: "#8AADA8", borderBottom: "1px solid #E5EFED" }}>
          <div className="col-span-4">{ar ? "ائة" : "Category"}</div>
          <div className="col-span-3 text-left">{ar ? "اجع" : "Total"}</div>
          <div className="col-span-2 text-center">%</div>
          <div className="col-span-3 text-left">{ar ? "اعد/شر" : "Monthly Avg"}</div>
        </div>

        {data.categories.map((cat) => {
          const color = CATEGORY_COLORS[cat.nameEn] || "#8AADA8";
          return (
            <div
              key={cat.nameEn}
              className="grid grid-cols-12 gap-2 items-center py-2.5 last:border-0"
              style={{ borderBottom: "1px solid #EDF5F3" }}
            >
              <div className="col-span-4 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                <span className="text-sm font-semibold truncate" style={{ color: "#1A3A35" }}>
                  {ar ? cat.name : cat.nameEn}
                </span>
              </div>

              <div className="col-span-3">
                <span className="text-sm font-bold" style={{ color: "#1A3A35" }}>
                  {cat.total.toLocaleString()}
                </span>
                <span className="text-[10px] mr-1 ml-1" style={{ color: "#8AADA8" }}>{ar ? "را" : "SAR"}</span>
              </div>

              <div className="col-span-2 flex items-center gap-1.5">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#E5EFED" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(cat.percent, 100)}%`, background: color }}
                  />
                </div>
                <span className="text-xs font-bold w-8 text-left" style={{ color: "#4A6862" }}>{cat.percent}%</span>
              </div>

              <div className="col-span-3">
                <span className="text-sm" style={{ color: "#4A6862" }}>
                  {cat.monthlyAvg.toLocaleString()}
                </span>
                <span className="text-[10px] mr-1 ml-1" style={{ color: "#8AADA8" }}>{ar ? "را/شر" : "/mo"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key takeaways */}
      {data.takeaways.length > 0 && (
        <div className="px-6 pb-6 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#8AADA8" }}>
            {ar ? "احظات ة" : "Key takeaways"}
          </p>
          <div className="space-y-2.5">
            {data.takeaways.map((t, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#00A651" }} />
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#4A6862" }}
                  dangerouslySetInnerHTML={{ __html: ar ? t.ar : t.en }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
