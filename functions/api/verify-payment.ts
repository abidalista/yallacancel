/**
 * Cloudflare Pages Function — verify Whop payment receipt.
 * Keep logic in sync with src/app/api/verify-payment/route.ts
 * and src/lib/server/whop-payment.ts
 */

const WHOP_PAYMENTS_API = "https://api.whop.com/api/v1/payments";

function normalizeAccessCode(code: string): string {
  return code.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function isFounderReceipt(receiptId: string, token?: string): boolean {
  if (!token || !receiptId.startsWith("founder_")) return false;
  const entered = normalizeAccessCode(receiptId.slice("founder_".length));
  const expected = normalizeAccessCode(token);
  return !!expected && entered === expected;
}

function isWhopPaymentSuccessful(payment: {
  status?: string | null;
  substatus?: string | null;
}): boolean {
  if (payment.substatus === "succeeded") return true;
  if (payment.status === "paid") return true;
  return false;
}

function isWhopPaymentPending(payment: {
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
  if (
    !payment.substatus &&
    (payment.status === "pending" || payment.status === "open" || payment.status === "draft")
  ) {
    return true;
  }
  return false;
}

export async function onRequestPost(context: {
  request: Request;
  env: Record<string, string>;
}): Promise<Response> {
  try {
    const { receiptId } = await context.request.json();

    if (!receiptId || typeof receiptId !== "string") {
      return Response.json({ valid: false }, { status: 400 });
    }

    const founderToken = context.env.FOUNDER_ACCESS_TOKEN;
    if (isFounderReceipt(receiptId, founderToken)) {
      return Response.json({ valid: true });
    }

    if (
      context.env.NEXT_PUBLIC_DEV_UNLOCK === "true" &&
      (receiptId === "dev_unlock" || receiptId === "dev_test")
    ) {
      return Response.json({ valid: true });
    }

    // Real Whop receipts always start with pay_
    if (!receiptId.startsWith("pay_")) {
      return Response.json({ valid: false }, { status: 400 });
    }

    const apiKey = context.env.WHOP_API_KEY;
    if (!apiKey) {
      return Response.json({ valid: false, error: "WHOP_API_KEY not configured" }, { status: 500 });
    }

    const res = await fetch(`${WHOP_PAYMENTS_API}/${encodeURIComponent(receiptId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (res.status === 404) {
      // Payment not readable yet right after checkout
      return Response.json({ valid: false, pending: true }, { status: 202 });
    }

    if (!res.ok) {
      return Response.json({ valid: false });
    }

    const payment = await res.json();

    if (isWhopPaymentSuccessful(payment)) {
      return Response.json({ valid: true });
    }

    if (isWhopPaymentPending(payment)) {
      return Response.json({ valid: false, pending: true }, { status: 202 });
    }

    return Response.json({ valid: false });
  } catch {
    return Response.json({ valid: false }, { status: 500 });
  }
}
