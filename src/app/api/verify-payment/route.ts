import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { receiptId } = await request.json();

    if (!receiptId || typeof receiptId !== "string") {
      return NextResponse.json({ valid: false });
    }

    const apiKey = process.env.WHOP_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ valid: false }, { status: 503 });
    }

    const res = await fetch(
      `https://api.whop.com/api/v5/payments/${receiptId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
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
    return NextResponse.json({ valid: false });
  }
}
