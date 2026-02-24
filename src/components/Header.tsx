"use client";

interface HeaderProps {
  locale: "ar" | "en";
  onLocaleChange: (l: "ar" | "en") => void;
  onLogoClick?: () => void;
}

export default function Header({ locale, onLocaleChange, onLogoClick }: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(15,23,42,0.35)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">
        <button onClick={onLogoClick} className="nav-logo">
          yalla<span className="accent">cancel</span>
        </button>

        <button
          onClick={() => onLocaleChange(locale === "ar" ? "en" : "ar")}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
          style={{
            background: "rgba(255,255,255,0.08)",
            borderColor: "rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {locale === "ar" ? "EN" : "ع"}
        </button>
      </div>
    </header>
  );
}
