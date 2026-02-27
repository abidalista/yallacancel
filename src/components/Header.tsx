"use client";

import { Globe } from "lucide-react";

interface HeaderProps {
  locale: "ar" | "en";
  onLocaleChange: (l: "ar" | "en") => void;
  onLogoClick?: () => void;
}

export default function Header({ locale, onLocaleChange, onLogoClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={onLogoClick} className="nav-logo">
          yalla<span className="accent">cancel</span>
        </button>

        <button
          onClick={() => onLocaleChange(locale === "ar" ? "en" : "ar")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-all bg-white"
        >
          <Globe size={14} strokeWidth={1.5} />
          {locale === "ar" ? "EN" : "ع"}
        </button>
      </div>
    </header>
  );
}
