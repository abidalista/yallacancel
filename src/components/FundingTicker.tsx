"use client";

const FUNDING_NEWS = [
  { company: "Aya", amount: "26M SAR", round: "Series A", led: "RAED Ventures" },
  { company: "Tamara", amount: "$340M", round: "Series D", led: "SNB Capital" },
  { company: "Salla", amount: "$130M", round: "Series C", led: "Investcorp" },
  { company: "Foodics", amount: "$170M", round: "Series C", led: "Prosus & STV" },
  { company: "Lean Technologies", amount: "$33M", round: "Series B", led: "General Atlantic" },
];

interface FundingTickerProps {
  locale: "ar" | "en";
}

export default function FundingTicker({ locale }: FundingTickerProps) {
  const ar = locale === "ar";
  const items = FUNDING_NEWS.map((n) =>
    ar
      ? `${n.company} أغلقت ${n.round} بقيمة ${n.amount}`
      : `${n.company} closed ${n.amount} ${n.round}`
  );

  const repeated = [...items, ...items];

  return (
    <div className="bg-[#112920] text-[#C5DDD9]/80 text-[11px] font-semibold overflow-hidden whitespace-nowrap h-7 flex items-center">
      <div className="ticker-track flex gap-8">
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
