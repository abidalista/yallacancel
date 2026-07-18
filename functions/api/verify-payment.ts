function normalizeAccessCode(code: string): string {
  return code.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function isFounderReceipt(receiptId: string, token?: string): boolean {
  if (!token || !receiptId.startsWith("founder_")) return false;
  const entered = normalizeAccessCode(receiptId.slice("founder_".length));
  const expected = normalizeAccessCode(token);
  return !!expected && entered === expected;
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

    const apiKey = context.env.WHOP_API_KEY;
    if (!apiKey) {
      return Response.json({ valid: false, error: "WHOP_API_KEY not configured" }, { status: 500 });
    }

    const res = await fetch(`https://api.whop.com/api/v5/payments/${receiptId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return Response.json({ valid: false });
    }

    const payment = await res.json();
    return Response.json({
      valid: payment.status === "paid" || payment.status === "succeeded",
    });
  } catch {
    return Response.json({ valid: false }, { status: 500 });
  }
}
