"use client";

import { motion } from "framer-motion";
import { faviconUrl, logoUrl } from "@/lib/logo";

interface ScatteredLogo {
  name: string;
  domain: string;
  top: string;
  left?: string;
  right?: string;
  rotate: number;
  size: "sm" | "md" | "lg";
  delay: number;
}

const LOGOS: ScatteredLogo[] = [
  { name: "Netflix", domain: "netflix.com", top: "6%", left: "3%", rotate: -14, size: "lg", delay: 0 },
  { name: "Shahid", domain: "shahid.mbc.net", top: "12%", right: "4%", rotate: 10, size: "lg", delay: 0.4 },
  { name: "Spotify", domain: "spotify.com", top: "28%", left: "1%", rotate: 8, size: "md", delay: 0.8 },
  { name: "YouTube", domain: "youtube.com", top: "22%", right: "2%", rotate: -6, size: "md", delay: 1.1 },
  { name: "Disney+", domain: "disneyplus.com", top: "42%", left: "5%", rotate: -10, size: "sm", delay: 0.6 },
  { name: "Adobe", domain: "adobe.com", top: "48%", right: "6%", rotate: 12, size: "md", delay: 1.4 },
  { name: "ChatGPT", domain: "openai.com", top: "62%", left: "2%", rotate: 6, size: "sm", delay: 1.8 },
  { name: "Apple", domain: "apple.com", top: "58%", right: "3%", rotate: -8, size: "md", delay: 0.2 },
  { name: "Amazon", domain: "amazon.sa", top: "74%", left: "7%", rotate: -5, size: "sm", delay: 1.6 },
  { name: "STC", domain: "stc.com.sa", top: "70%", right: "5%", rotate: 9, size: "sm", delay: 2 },
  { name: "Hungerstation", domain: "hungerstation.com", top: "34%", left: "8%", rotate: -12, size: "sm", delay: 2.2 },
  { name: "Anghami", domain: "anghami.com", top: "36%", right: "8%", rotate: 7, size: "sm", delay: 0.9 },
  { name: "PlayStation", domain: "playstation.com", top: "82%", right: "9%", rotate: -11, size: "sm", delay: 1.3 },
  { name: "OSN+", domain: "osn.com", top: "85%", left: "4%", rotate: 14, size: "sm", delay: 2.4 },
];

const SIZE_CLASS = {
  sm: "w-9 h-9 p-1.5",
  md: "w-11 h-11 p-2",
  lg: "w-14 h-14 p-2.5",
} as const;

const IMG_SIZE = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
} as const;

function LogoPill({ logo }: { logo: ScatteredLogo }) {
  return (
    <motion.div
      className={`hero-logo-pill absolute flex items-center justify-center ${SIZE_CLASS[logo.size]}`}
      style={{
        top: logo.top,
        left: logo.left,
        right: logo.right,
        rotate: `${logo.rotate}deg`,
      }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -10, 0],
      }}
      transition={{
        opacity: { duration: 0.6, delay: logo.delay * 0.15 },
        scale: { duration: 0.5, delay: logo.delay * 0.15, type: "spring", stiffness: 200 },
        y: { duration: 4 + logo.delay, repeat: Infinity, ease: "easeInOut", delay: logo.delay },
      }}
      title={logo.name}
    >
      <img
        src={logoUrl(logo.domain)}
        alt=""
        className={`${IMG_SIZE[logo.size]} object-contain`}
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.dataset.fallback) {
            img.dataset.fallback = "1";
            img.src = faviconUrl(logo.domain);
          }
        }}
      />
    </motion.div>
  );
}

export default function HeroScatteredLogos() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block" aria-hidden>
      {LOGOS.map((logo) => (
        <LogoPill key={logo.name} logo={logo} />
      ))}
    </div>
  );
}

export function HeroLogoStrip() {
  const strip = LOGOS.slice(0, 10);
  return (
    <div className="flex flex-wrap justify-center gap-2.5 mb-10 lg:hidden" aria-hidden>
      {strip.map((logo, i) => (
        <motion.div
          key={logo.name}
          className="hero-logo-pill w-10 h-10 p-2 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.04, duration: 0.35 }}
          style={{ rotate: `${logo.rotate * 0.6}deg` }}
        >
          <img
            src={logoUrl(logo.domain)}
            alt=""
            className="w-5 h-5 object-contain"
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.dataset.fallback) {
                img.dataset.fallback = "1";
                img.src = faviconUrl(logo.domain);
              }
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
