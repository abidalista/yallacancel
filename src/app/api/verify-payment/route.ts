import { NextRequest, NextResponse } from "next/server";
import { isFounderReceipt } from "@/lib/format";
import {
  WHOP_PAYMENTS_API,
  isWhopPaymentPending,
  isWhopPaymentSuccessful,
} from "@/lib/server/whop-payment";

export async function POST(request: NextRequest) {
  try {
    const { receiptId } = await request.json();

    if (!receiptId || typeof receiptId !== "string") {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    if (isFounderReceipt(receiptId, process.env.FOUNDER_ACCESS_TOKEN)) {
      return NextResponse.json({ valid: true });
    }

    if (
      process.env.NODE_ENV === "development" &&
      (receiptId === "dev_unlock" || receiptId === "dev_test")
    ) {
      return NextResponse.json({ valid: true });
    }

    if (process.env.NEXT_PUBLIC_DEV_UNLOCK === "true" && receiptId === "dev_unlock") {
      return NextResponse.json({ valid: true });
    }

    // Real Whop receipts always start with pay_
    if (!receiptId.startsWith("pay_")) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const apiKey = process.env.WHOP_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { valid: false, error: "WHOP_API_KEY not configured" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `${WHOP_PAYMENTS_API}/${encodeURIComponent(receiptId)}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );

    if (res.status === 404) {
      // Payment not readable yet right after checkout
      return NextResponse.json({ valid: false, pending: true }, { status: 202 });
    }

    if (!res.ok) {
      return NextResponse.json({ valid: false });
    }

    const payment = await res.json();

    if (isWhopPaymentSuccessful(payment)) {
      return NextResponse.json({ valid: true });
    }

    if (isWhopPaymentPending(payment)) {
      return NextResponse.json({ valid: false, pending: true }, { status: 202 });
    }

    return NextResponse.json({ valid: false });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
