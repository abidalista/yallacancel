/**
 * POST /api/whop-webhook
 * Handles Whop payment webhook events.
 * Verifies the webhook signature and logs payment events.
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET;

function verifySignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  const hmac = createHmac("sha256", WEBHOOK_SECRET);
  hmac.update(payload);
  const expected = hmac.digest("hex");
  return expected === signature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("whop-signature") || "";

    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { action, data } = event;

    // Log the event for monitoring (no PII)
    console.log(`[whop-webhook] ${action}`, {
      id: data?.id,
      plan: data?.plan_id,
      status: data?.status,
    });

    switch (action) {
      case "payment.succeeded":
        // Payment successful — user gets access via client-side onComplete callback
        // This webhook is for server-side record keeping
        break;

      case "payment.failed":
        console.warn(`[whop-webhook] Payment failed for ${data?.id}`);
        break;

      case "membership.went_valid":
        console.log(`[whop-webhook] Membership activated: ${data?.id}`);
        break;

      case "membership.went_invalid":
        console.log(`[whop-webhook] Membership deactivated: ${data?.id}`);
        break;

      default:
        console.log(`[whop-webhook] Unhandled event: ${action}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[whop-webhook] Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
