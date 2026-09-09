import posthog from "posthog-js";

/** Public project token (safe in the client). Override via NEXT_PUBLIC_* at build time. */
const POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
  "phc_tGJyce6PvgOFIhFktMuuDeKoTvSbgQwdZVPGYOozCD5";
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

let started = false;

export function initAnalytics(): void {
  if (typeof window === "undefined" || started) return;
  if (!POSTHOG_KEY) return;
  started = true;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: "2026-05-30",
    capture_pageview: true,
    persistence: "localStorage+cookie",
  });
}

export function track(
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void {
  if (typeof window === "undefined") return;
  try {
    if (!started) initAnalytics();
    posthog.capture(event, properties);
  } catch {
    /* analytics must never break checkout */
  }
}
