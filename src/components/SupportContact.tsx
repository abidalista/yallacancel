"use client";

import { Mail } from "lucide-react";
import { SUPPORT_MAILTO } from "@/lib/format";

interface SupportContactProps {
  locale: "ar" | "en";
  /** Dark footer on mint landing */
  variant?: "default" | "footer" | "muted";
  className?: string;
}

export default function SupportContact({
  locale,
  variant = "default",
  className = "",
}: SupportContactProps) {
  const ar = locale === "ar";

  const label =
    variant === "footer"
      ? ar
        ? "تواصل معنا"
        : "Contact support"
      : ar
        ? "مشكلة؟ راسلنا"
        : "Problem? Email us";

  if (variant === "footer") {
    return (
      <a
        href={SUPPORT_MAILTO}
        className={`text-sm no-underline transition-colors hover:underline ${className}`}
        style={{ color: "#8AADA8" }}
      >
        {label}
      </a>
    );
  }

  return (
    <a
      href={SUPPORT_MAILTO}
      className={`inline-flex items-center justify-center gap-1.5 no-underline transition-colors ${
        variant === "muted"
          ? "text-[13px] text-slate-500 hover:text-[#00A651]"
          : "text-sm text-slate-600 hover:text-[#00A651]"
      } ${className}`}
    >
      <Mail size={14} strokeWidth={1.5} className="flex-shrink-0" />
      <span>{label}</span>
    </a>
  );
}
