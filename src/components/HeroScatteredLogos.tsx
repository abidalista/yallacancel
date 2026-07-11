"use client";

import { motion } from "framer-motion";
import ServiceBrandIcon from "@/components/ServiceBrandIcon";

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
  { name: "Netflix", domain: "netflix.com", top: "8%", right: "6%", rotate: 12, size: "lg", delay: 0 },
  { name: "Shahid", domain: "shahid.mbc.net", top: "14%", right: "18%", rotate: -8, size: "md", delay: 0.3 },
  { name: "Apple", domain: "apple.com", top: "10%", left: "5%", rotate: -14, size: "lg", delay: 0.5 },
  { name: "Spotify", domain: "spotify.com", top: "22%", left: "12%", rotate: 10, size: "md", delay: 0.8 },
  { name: "YouTube", domain: "youtube.com", top: "28%", right: "4%", rotate: -6, size: "md", delay: 1 },
  { name: "Adobe", domain: "adobe.com", top: "38%", right: "10%", rotate: 14, size: "sm", delay: 0.6 },
  { name: "ChatGPT", domain: "openai.com", top: "44%", left: "3%", rotate: -10, size: "md", delay: 1.2 },
  { name: "Amazon", domain: "amazon.sa", top: "52%", left: "14%", rotate: 8, size: "sm", delay: 1.5 },
  { name: "Disney+", domain: "disneyplus.com", top: "55%", right: "16%", rotate: -12, size: "sm", delay: 0.9 },
  { name: "STC", domain: "stc.com.sa", top: "68%", right: "7%", rotate: 6, size: "md", delay: 1.8 },
  { name: "Hungerstation", domain: "hungerstation.com", top: "72%", left: "6%", rotate: -5, size: "sm", delay: 2 },
  { name: "iCloud", domain: "icloud.com", top: "78%", right: "20%", rotate: 9, size: "sm", delay: 2.2 },
];

const PILL_SIZE = {
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-16 h-16",
} as const;

const ICON_SIZE = {
  sm: "sm" as const,
  md: "md" as const,
  lg: "lg" as const,
};

function LogoPill({ logo }: { logo: ScatteredLogo }) {
  return (
    <motion.div
      className={`hero-logo-pill absolute flex items-center justify-center ${PILL_SIZE[logo.size]}`}
      style={{
        top: logo.top,
        left: logo.left,
        right: logo.right,
        rotate: `${logo.rotate}deg`,
      }}
      initial={{ opacity: 0, scale: 0.55 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -8, 0],
      }}
      transition={{
        opacity: { duration: 0.55, delay: logo.delay * 0.12 },
        scale: { duration: 0.45, delay: logo.delay * 0.12, type: "spring", stiffness: 220 },
        y: { duration: 5 + logo.delay * 0.5, repeat: Infinity, ease: "easeInOut", delay: logo.delay },
      }}
      title={logo.name}
    >
      <ServiceBrandIcon domain={logo.domain} size={ICON_SIZE[logo.size]} />
    </motion.div>
  );
}

export default function HeroScatteredLogos() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden md:block" aria-hidden>
      {LOGOS.map((logo) => (
        <LogoPill key={logo.name} logo={logo} />
      ))}
    </div>
  );
}

export function HeroLogoStrip() {
  const strip = LOGOS.slice(0, 8);
  return (
    <div className="flex flex-wrap justify-center gap-2.5 mb-8 md:hidden" aria-hidden>
      {strip.map((logo, i) => (
        <motion.div
          key={logo.name}
          className="hero-logo-pill w-10 h-10 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 + i * 0.04, duration: 0.35 }}
          style={{ rotate: `${logo.rotate * 0.5}deg` }}
          title={logo.name}
        >
          <ServiceBrandIcon domain={logo.domain} size="sm" />
        </motion.div>
      ))}
    </div>
  );
}
