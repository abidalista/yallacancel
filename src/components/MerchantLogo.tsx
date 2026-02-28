"use client";

import { useState } from "react";

/**
 * Local logo map: merchant name patterns  local file in /public/logos/
 * Patterns are matched case-insensitively against the merchant name.
 */
const LOCAL_LOGOS: [RegExp, string][] = [
  // Saudi Banks
  [/اراجح|alrajhi/i, "/logos/alrajhi.png"],
  [/اأ|اا|alahli|snb/i, "/logos/banks/alahli.png"],
  [/ب اراض|riyadbank|riyad bank/i, "/logos/banks/riyadbank.png"],
  [/اباد|albilad/i, "/logos/banks/albilad.png"],
  [/اإاء|اااء|alinma/i, "/logos/alinma.png"],
  [/ساب|sabb|sab|اأ/i, "/logos/banks/sabb.png"],
  [/ارس|alfransi|bsf/i, "/logos/banks/alfransi.png"],
  [/اعرب اط|anb/i, "/logos/anb.png"],
  [/stc pay|stcpay/i, "/logos/stcpay.png"],
  [/^stc(?!\s*pay)/i, "/logos/stc.png"],

  // Streaming & Entertainment
  [/spotify/i, "/logos/spotify.png"],
  [/netflix/i, "/logos/netflix.png"],
  [/شاد|shahid/i, "/logos/shahid.png"],
  [/disney/i, "/logos/disney.png"],
  [/youtube/i, "/logos/youtube.png"],
  [/apple\s*(tv|music|arcade)|apple/i, "/logos/apple.png"],

  // AI & Productivity
  [/chatgpt|openai/i, "/logos/chatgpt.png"],
  [/adobe|photoshop|illustrator|lightroom|creative cloud/i, "/logos/adobe.png"],
  [/microsoft|office\s*365|onedrive/i, "/logos/microsoft.png"],
  [/google\s*(one|workspace|drive)|google/i, "/logos/google.png"],
  [/telegram/i, "/logos/telegram.png"],
  [/snapchat/i, "/logos/snapchat.png"],
  [/tiktok/i, "/logos/tiktok.png"],

  // Cloud & Storage
  [/icloud/i, "/logos/icloud.png"],

  // Wellness
  [/calm/i, "/logos/calm.png"],

  // Delivery & Transport
  [/رستش|hungerstation/i, "/logos/hungerstation.png"],
  [/ر|careem/i, "/logos/careem.png"],
  [/uber/i, "/logos/uber.png"],
  [/جاز|jahez/i, "/logos/jahez.png"],
  [/رس|mrsool/i, "/logos/mrsool.png"],
  [/طبات|talabat/i, "/logos/talabat.png"],

  // Shopping
  [/amazon|ااز/i, "/logos/amazon.png"],
  [/|noon/i, "/logos/noon.png"],
  [/جرر|jarir/i, "/logos/jarir.png"],

  // Saudi Merchants
  [/بد|panda/i, "/logos/panda.png"],
  [/aramco|ارا/i, "/logos/aramco.png"],
];

/**
 * Find a local logo path for a merchant name.
 */
function findLocalLogo(name: string): string | null {
  for (const [pattern, path] of LOCAL_LOGOS) {
    if (pattern.test(name)) return path;
  }
  return null;
}

/**
 * Generate a consistent color from a string (for letter fallback).
 */
function nameToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#1A3A35", "#00A651", "#2563EB", "#7C3AED",
    "#DC2626", "#EA580C", "#0891B2", "#4F46E5",
    "#059669", "#D97706", "#9333EA", "#E11D48",
  ];
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Get the display letter for a merchant name (skips Arabic articles).
 */
function getDisplayLetter(name: string): string {
  const cleaned = name.trim().replace(/^(ا|al[\s-]?)/i, "");
  return (cleaned[0] || name[0] || "?").toUpperCase();
}

interface MerchantLogoProps {
  name: string;
  domain?: string;
  size?: number;
  className?: string;
}

export default function MerchantLogo({ name, domain, size = 44, className }: MerchantLogoProps) {
  const localPath = findLocalLogo(name);
  const [stage, setStage] = useState<"local" | "remote" | "letter">(
    localPath ? "local" : domain ? "remote" : "letter"
  );
  const [remoteSrc, setRemoteSrc] = useState(
    domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : ""
  );

  const letter = getDisplayLetter(name);
  const color = nameToColor(name);

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: size > 32 ? 12 : 6,
    flexShrink: 0,
    overflow: "hidden",
  };

  // Tier 3: Colored circle with letter
  if (stage === "letter") {
    return (
      <div
        className={className}
        style={{
          ...containerStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: color + "18", // 10% opacity
          color,
          fontSize: size * 0.4,
          fontWeight: 800,
        }}
      >
        {letter}
      </div>
    );
  }

  const src = stage === "local" ? localPath! : remoteSrc;

  return (
    <img
      src={src}
      alt={name}
      className={className}
      style={{
        ...containerStyle,
        objectFit: "contain",
        padding: size > 32 ? 4 : 2,
        background: "#EDF5F3",
      }}
      onError={() => {
        if (stage === "local" && domain) {
          // Tier 1 failed  try remote
          setStage("remote");
        } else if (stage === "local") {
          // Tier 1 failed, no domain  letter
          setStage("letter");
        } else if (stage === "remote" && remoteSrc.includes("google.com")) {
          // Google failed  try DuckDuckGo
          setRemoteSrc(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
        } else {
          // All remote failed  letter
          setStage("letter");
        }
      }}
    />
  );
}

// Re-export for use in bank logo sections
export { findLocalLogo, getDisplayLetter, nameToColor };
