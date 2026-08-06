/**
 * Shared Whop payment verification helpers.
 * Keep in sync with functions/api/verify-payment.ts (Cloudflare Pages).
 */

export const WHOP_PAYMENTS_API = "https://api.whop.com/api/v1/payments";

/** True when Whop confirms the charge landed. Prefer substatus (Whop docs). */
export function isWhopPaymentSuccessful(payment: {
  status?: string | null;
  substatus?: string | null;
}): boolean {
  if (payment.substatus === "succeeded") return true;
  // Lifecycle field can also settle to paid
  if (payment.status === "paid") return true;
  return false;
}

/** Still settling — client should retry (Whop returns this right after checkout). */
export function isWhopPaymentPending(payment: {
  status?: string | null;
  substatus?: string | null;
}): boolean {
  if (isWhopPaymentSuccessful(payment)) return false;
  if (
    payment.substatus === "pending" ||
    payment.substatus === "incomplete" ||
    payment.substatus === "drafted"
  ) {
    return true;
  }
  // No friendly substatus yet — lifecycle still open/pending
  if (
    !payment.substatus &&
    (payment.status === "pending" || payment.status === "open" || payment.status === "draft")
  ) {
    return true;
  }
  return false;
}
