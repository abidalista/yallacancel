/**
 * Local brand marks for the hero — no images, no network, always renders instantly.
 */

interface BrandStyle {
  bg: string;
  fg: string;
  mark: string;
}

const BRANDS: Record<string, BrandStyle> = {
  "netflix.com": { bg: "#E50914", fg: "#FFFFFF", mark: "N" },
  "shahid.mbc.net": { bg: "#00C853", fg: "#FFFFFF", mark: "S" },
  "apple.com": { bg: "#1D1D1F", fg: "#FFFFFF", mark: "A" },
  "spotify.com": { bg: "#1DB954", fg: "#FFFFFF", mark: "♫" },
  "youtube.com": { bg: "#FF0000", fg: "#FFFFFF", mark: "▶" },
  "adobe.com": { bg: "#FF0000", fg: "#FFFFFF", mark: "A" },
  "openai.com": { bg: "#10A37F", fg: "#FFFFFF", mark: "AI" },
  "amazon.sa": { bg: "#FF9900", fg: "#1A1A1A", mark: "a" },
  "amazon.com": { bg: "#FF9900", fg: "#1A1A1A", mark: "a" },
  "disneyplus.com": { bg: "#113CCF", fg: "#FFFFFF", mark: "D+" },
  "stc.com.sa": { bg: "#4F008C", fg: "#FFFFFF", mark: "stc" },
  "hungerstation.com": { bg: "#FF6B00", fg: "#FFFFFF", mark: "H" },
  "icloud.com": { bg: "#3693F3", fg: "#FFFFFF", mark: "☁" },
};

const SIZE_CLASS = {
  sm: "w-7 h-7 text-[9px]",
  md: "w-8 h-8 text-[10px]",
  lg: "w-10 h-10 text-xs",
} as const;

interface ServiceBrandIconProps {
  domain: string;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}

export default function ServiceBrandIcon({
  domain,
  size = "md",
  className = "",
}: ServiceBrandIconProps) {
  const brand =
    BRANDS[domain] ?? {
      bg: "#00A651",
      fg: "#FFFFFF",
      mark: domain.split(".")[0].charAt(0).toUpperCase(),
    };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl font-extrabold leading-none select-none ${SIZE_CLASS[size]} ${className}`}
      style={{ backgroundColor: brand.bg, color: brand.fg }}
      aria-hidden
    >
      {brand.mark}
    </span>
  );
}
