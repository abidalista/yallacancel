"use client";

interface HeaderProps {
  locale: "ar" | "en";
  onLocaleChange: (l: "ar" | "en") => void;
  onLogoClick?: () => void;
}

export default function Header({ locale, onLocaleChange, onLogoClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-[var(--color-border)] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-xl font-black text-[var(--color-primary)] tracking-tight">
            Yalla Cancel
          </span>
        </button>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs"
          >
            {locale === "ar" ? "مفتوح المصدر" : "Open Source"}
          </a>
          <button
            onClick={() => onLocaleChange(locale === "ar" ? "en" : "ar")}
            className="btn-ghost text-xs font-semibold"
          >
            {locale === "ar" ? "EN" : "ع"}
          </button>
        </div>
      </div>
    </header>
  );
}
