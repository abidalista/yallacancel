"use client";

import { motion } from "framer-motion";
import { BankId } from "@/lib/types";
import { Locale, t, TranslationKey } from "@/lib/i18n";

interface BankSelectorProps {
  locale: Locale;
  selectedBank: BankId | null;
  onSelect: (bank: BankId) => void;
}

const banks: { id: BankId; key: TranslationKey; color: string }[] = [
  { id: "alrajhi", key: "alRajhi", color: "#004B87" },
  { id: "snb", key: "snb", color: "#003D2E" },
  { id: "riyadbank", key: "riyadBank", color: "#0066B3" },
  { id: "albilad", key: "alBilad", color: "#8B6914" },
  { id: "alinma", key: "alinma", color: "#6B2D8B" },
  { id: "sabb", key: "sabb", color: "#007A3D" },
  { id: "bsf", key: "bsf", color: "#1E3A5F" },
  { id: "anb", key: "anb", color: "#C8102E" },
  { id: "other", key: "otherBank", color: "#6B7280" },
];

export default function BankSelector({
  locale,
  selectedBank,
  onSelect,
}: BankSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <h3 className="text-lg font-bold text-slate-700 mb-4">
        {t(locale, "selectBank")}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {banks.map((bank) => (
          <button
            key={bank.id}
            onClick={() => onSelect(bank.id)}
            className={`p-3 rounded-[20px] border-2 transition-all text-sm font-medium ${
              selectedBank === bank.id
                ? "border-indigo-400 bg-indigo-50 shadow-sm"
                : "border-slate-100 hover:border-indigo-200 hover:shadow-sm bg-white"
            }`}
          >
            <div
              className="w-8 h-8 rounded-xl mb-2 mx-auto flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: bank.color }}
            >
              {t(locale, bank.key).charAt(0)}
            </div>
            <span className="block text-center text-xs text-slate-600">
              {t(locale, bank.key)}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
