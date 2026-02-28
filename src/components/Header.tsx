"use client";

import { Globe } from "lucide-react";

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
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={onLogoClick} className="nav-logo">
          yallacancel
        </button>

        <div className="flex items-center gap-3">
          <a
            href="/guides"
            className="text-xs sm:text-sm font-bold no-underline transition-colors"
            style={{ color: "#4A6862" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1A3A35"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#4A6862"; }}
          >
            {locale === "ar" ? "أدلة الإلغاء" : "Cancel Guides"}
          </a>
          <a
            href="/blog"
            className="text-xs sm:text-sm font-bold no-underline transition-colors"
            style={{ color: "#4A6862" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1A3A35"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#4A6862"; }}
          >
            {locale === "ar" ? "المدونة" : "Blog"}
          </a>
          <button
            onClick={() => onLocaleChange(locale === "ar" ? "en" : "ar")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full transition-all"
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
            <Globe size={14} strokeWidth={1.5} />
            {locale === "ar" ? "EN" : "ع"}
          </button>
        </div>
      </div>
    </header>
  );
}
