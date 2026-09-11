import posthog from "posthog-js";

/**
 * Public project token (safe in the client). Env wins at build time;
 * baked fallback keeps Cloudflare Pages tracking if the secret is missing.
 */
const BAKED_POSTHOG_KEY = "phc_tGJyce6PvgOFIhFktMuuDeKoTvSbgQwdZVPGYOozCD5";

export const POSTHOG_EVENTS = {
  LANDING_VIEW: "landing_view",
  UPLOAD_START: "upload_start",
  PREVIEW_SHOWN: "preview_shown",
  PAYWALL_VIEW: "paywall_view",
  CHECKOUT_START: "checkout_start",
  PURCHASE_SUCCESS: "purchase_success",
  PURCHASE_FAIL: "purchase_fail",
  FILE_UPLOADED: "file_uploaded",
  SAMPLE_DATA_TRIED: "sample_data_tried",
  ANALYSIS_STARTED: "analysis_started",
  ANALYSIS_COMPLETED: "analysis_completed",
  ANALYSIS_FAILED: "analysis_failed",
  PAYWALL_VIEWED: "paywall_viewed",
  CHECKOUT_STARTED: "checkout_started",
  PAYMENT_COMPLETED: "payment_completed",
  PAYMENT_FAILED: "payment_failed",
  PAYWALL_DISMISSED: "paywall_dismissed",
  PRICING_CTA_CLICKED: "pricing_cta_clicked",
} as const;

export function getPostHogKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_KEY ||
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
    BAKED_POSTHOG_KEY
  );
}

export function getPostHogHost(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";
}

let initialized = false;

export function initPostHog(): void {
  if (typeof window === "undefined" || initialized) return;
  const key = getPostHogKey();
  if (!key) return;

  posthog.init(key, {
    api_host: getPostHogHost(),
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
  });
  initialized = true;
}

export const initAnalytics = initPostHog;

export function track(
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void {
  if (typeof window === "undefined") return;
  try {
    if (!initialized) initPostHog();
    if (!getPostHogKey()) return;
    posthog.capture(event, properties);
  } catch {
    // Analytics must never break checkout.
  }
}
