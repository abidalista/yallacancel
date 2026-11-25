/**
 * Whop checkout host + plan. Production builds always hit live Whop
 * (`whop.com`). Sandbox (`sandbox.whop.com`) is opt-in for `next dev` only.
 */

export type WhopCheckoutEnvironment = "production" | "sandbox";

/** Fallback live plan. Override with NEXT_PUBLIC_WHOP_PLAN_ID; do not invent IDs. */
export const FALLBACK_WHOP_PLAN_ID = "plan_3E0V8cxU8VYXI";

export function getWhopPlanId(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WHOP_PLAN_ID?.trim();
  return fromEnv || FALLBACK_WHOP_PLAN_ID;
}

/**
 * `@whop/checkout` iframe host:
 * - production → https://whop.com/embedded/checkout/{planId}/
 * - sandbox → https://sandbox.whop.com/embedded/checkout/{planId}/
 *
 * `next build` (Cloudflare Pages prod and preview) inlines NODE_ENV=production,
 * so this cannot return sandbox on a shipped site even if
 * NEXT_PUBLIC_WHOP_ENVIRONMENT=sandbox is set in Pages env.
 */
export function getWhopCheckoutEnvironment(): WhopCheckoutEnvironment {
  if (process.env.NODE_ENV === "production") return "production";
  if (process.env.NEXT_PUBLIC_WHOP_ENVIRONMENT === "sandbox") return "sandbox";
  return "production";
}
