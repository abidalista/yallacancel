"use client";

import { useState } from "react";
import { logoSources, logoInitial } from "@/lib/logo";

interface BrandLogoProps {
  domain: string;
  alt: string;
  name?: string;
  className?: string;
  fallbackClassName?: string;
}

export default function BrandLogo({
  domain,
  alt,
  name,
  className = "w-5 h-5 rounded-sm object-contain",
  fallbackClassName = "w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold bg-[#E8F7EE] text-[#00A651]",
}: BrandLogoProps) {
  const sources = logoSources(domain);
  const [idx, setIdx] = useState(0);

  if (idx >= sources.length) {
    return (
      <span className={fallbackClassName} aria-hidden>
        {logoInitial(domain, name || alt)}
      </span>
    );
  }

  return (
    <img
      src={sources[idx]}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setIdx((i) => i + 1)}
    />
  );
}
