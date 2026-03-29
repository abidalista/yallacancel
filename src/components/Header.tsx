"use client";

import { Globe } from "lucide-react";
import posthog from "posthog-js";

interface HeaderProps {
  locale: "ar" | "en";
  onLocaleChange: (l: "ar" | "en") => void;
  onLogoClick?: () => void;
}

export default function Header({ locale, onLocaleChange, onLogoClick }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(237,245,243,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid #C9E0DA",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        <button onClick={onLogoClick} className="nav-logo text-xl sm:text-[1.6rem] flex-shrink-0">
          yallacancel
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/guides"
            className="text-[11px] sm:text-sm font-bold no-underline transition-colors whitespace-nowrap"
            style={{ color: "#4A6862" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1A3A35"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#4A6862"; }}
          >
            {locale === "ar" ? "أدلة الإلغاء" : "Guides"}
          </a>
          <a
            href="/blog"
            className="text-[11px] sm:text-sm font-bold no-underline transition-colors whitespace-nowrap"
            style={{ color: "#4A6862" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1A3A35"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#4A6862"; }}
          >
            {locale === "ar" ? "المقالات" : "Articles"}
          </a>
          <button
            onClick={() => {
              const next = locale === "ar" ? "en" : "ar";
              posthog.capture("language_switched", { from: locale, to: next });
              onLocaleChange(next);
            }}
            className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full transition-all flex-shrink-0"
            style={{ border: "1.5px solid #C5DDD9", color: "#4A6862", background: "white" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#1A3A35";
              (e.currentTarget as HTMLButtonElement).style.color = "#1A3A35";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#C5DDD9";
              (e.currentTarget as HTMLButtonElement).style.color = "#4A6862";
            }}
          >
            <Globe size={13} strokeWidth={1.5} />
            {locale === "ar" ? "EN" : "ع"}
          </button>
        </div>
      </div>
    </header>
  );
}
