"use client";

import { Globe } from "lucide-react";

interface HeaderProps {
  locale: "ar" | "en";
  onLocaleChange: (l: "ar" | "en") => void;
  onLogoClick?: () => void;
}

export default function Header({ locale, onLocaleChange, onLogoClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={onLogoClick} className="nav-logo nav-logo-light">
          yalla<span className="accent">cancel</span>
        </button>

        <div className="flex items-center gap-3">
          <a
            href="/guides"
            className="text-xs font-semibold text-white/60 hover:text-white transition-colors no-underline hidden sm:block"
          >
            {locale === "ar" ? "أدلة الإلغاء" : "Guides"}
          </a>
          <button
            onClick={() => onLocaleChange(locale === "ar" ? "en" : "ar")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all bg-white/5"
          >
            <Globe size={14} strokeWidth={1.5} />
            {locale === "ar" ? "EN" : "ع"}
          </button>
        </div>
      </div>
    </header>
  );
}
