import { NextRequest, NextResponse } from "next/server";
import { isFounderReceipt } from "@/lib/format";

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

    const apiKey = process.env.WHOP_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { valid: false, error: "WHOP_API_KEY not configured" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://api.whop.com/api/v5/payments/${receiptId}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ valid: false });
    }

    const payment = await res.json();
    return NextResponse.json({
      valid: payment.status === "paid" || payment.status === "succeeded",
    });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
