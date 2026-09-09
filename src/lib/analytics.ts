import posthog from "posthog-js";

export const POSTHOG_EVENTS = {
  LANDING_VIEW: "landing_view",
  UPLOAD_START: "upload_start",
  PREVIEW_SHOWN: "preview_shown",
  PAYWALL_VIEW: "paywall_view",
  CHECKOUT_START: "checkout_start",
  PURCHASE_SUCCESS: "purchase_success",
  PURCHASE_FAIL: "purchase_fail",
} as const;

export function getPostHogKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_KEY ||
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
    undefined
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
  });
  initialized = true;
}

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
    // Analytics must never break the product.
  }
}
