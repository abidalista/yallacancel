"use client";

import { SpendingBreakdown as SpendingData, SpendingCategory } from "@/lib/spending";

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
  "Transfers": "#6366F1",
  "Housing": "#EC4899",
  "Subscriptions": "#F59E0B",
  "Health": "#14B8A6",
  "Education": "#A855F7",
  "Other": "#94A3B8",
};

function formatMonth(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}

export default function SpendingBreakdown({ data, locale }: Props) {
  const ar = locale === "ar";

  if (data.categories.length === 0) return null;

  const dateLabel = data.dateRange.from && data.dateRange.to
    ? `${formatMonth(data.dateRange.from)} – ${formatMonth(data.dateRange.to)}`
    : "";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0F172A" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/8">
        <div className="flex items-center gap-2 mb-1">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-[#4A7BF7]">
            <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3 className="text-base font-black text-white">
            {ar ? "تحليل الإنفاق" : "Spending Breakdown"}
          </h3>
          {dateLabel && (
            <span className="text-xs text-white/40 font-medium">{dateLabel}</span>
          )}
        </div>
        <p className="text-sm text-white/50">
          {ar
            ? `${data.totalSpend.toLocaleString()} ر.س إجمالي (~${data.monthlyAvg.toLocaleString()} ر.س/شهر) من ${data.transactionCount.toLocaleString()} عملية`
            : `${data.totalSpend.toLocaleString()} SAR total (~${data.monthlyAvg.toLocaleString()} SAR/mo) across ${data.transactionCount.toLocaleString()} transactions`}
        </p>
      </div>

      {/* Category table */}
      <div className="px-6 py-4">
        <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
          {ar ? "وين تروح فلوسك" : "Where it goes"}
        </p>

        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-white/30 uppercase tracking-wider pb-2 border-b border-white/8">
          <div className="col-span-4">{ar ? "الفئة" : "Category"}</div>
          <div className="col-span-3 text-left">{ar ? "المجموع" : "Total"}</div>
          <div className="col-span-2 text-center">%</div>
          <div className="col-span-3 text-left">{ar ? "المعدل/شهر" : "Monthly Avg"}</div>
        </div>

        {/* Rows */}
        {data.categories.map((cat, i) => {
          const color = CATEGORY_COLORS[cat.nameEn] || "#94A3B8";
          return (
            <div
              key={cat.nameEn}
              className="grid grid-cols-12 gap-2 items-center py-2.5 border-b border-white/5 last:border-0"
            >
              {/* Category name */}
              <div className="col-span-4 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                <span className="text-sm font-semibold text-white/85 truncate">
                  {ar ? cat.name : cat.nameEn}
                </span>
              </div>

              {/* Total */}
              <div className="col-span-3">
                <span className="text-sm font-bold text-white/90">
                  {cat.total.toLocaleString()}
                </span>
                <span className="text-[10px] text-white/40 mr-1 ml-1">{ar ? "ر.س" : "SAR"}</span>
              </div>

              {/* Percentage bar */}
              <div className="col-span-2 flex items-center gap-1.5">
                <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(cat.percent, 100)}%`, background: color }}
                  />
                </div>
                <span className="text-xs font-bold text-white/50 w-8 text-left">{cat.percent}%</span>
              </div>

              {/* Monthly avg */}
              <div className="col-span-3">
                <span className="text-sm text-white/70">
                  {cat.monthlyAvg.toLocaleString()}
                </span>
                <span className="text-[10px] text-white/40 mr-1 ml-1">{ar ? "ر.س/شهر" : "/mo"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key takeaways */}
      {data.takeaways.length > 0 && (
        <div className="px-6 pb-6 pt-2">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
            {ar ? "ملاحظات مهمة" : "Key takeaways"}
          </p>
          <div className="space-y-2.5">
            {data.takeaways.map((t, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4A7BF7] mt-1.5 flex-shrink-0" />
                <p
                  className="text-sm text-white/70 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: ar ? t.ar : t.en }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
