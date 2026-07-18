/**
 * Cloudflare Pages Function — full AI analysis (production).
 * Local dev uses src/app/api/parse-pdf/route.ts instead.
 */

const LLAMA_BASE = "https://api.cloud.llamaindex.ai";

/** Approximate mid-market rates — keep Claude from treating USD/EUR as SAR */
const FX = {
  USD: 3.75,
  EUR: 4.1,
  GBP: 4.8,
  AED: 1.02,
  KWD: 12.2,
  BHD: 9.95,
  QAR: 1.03,
  CHF: 4.25,
};

function buildPrompt(rawText: string): string {
  return `You are the subscription detection engine for YallaCancel (same job as Just Fucking Cancel).
Analyze EVERY transaction in the statement. Count all rows you read.

CRITICAL CURRENCY RULES:
- Detect currency from headers, symbols (£ $ €), columns, bank (Revolut/Crypto.com often USD/EUR/GBP; SNB/Saudi usually SAR).
- NEVER treat a foreign amount as SAR. Example: Claude Pro $20 ≈ ${20 * FX.USD} SAR, NOT 20 SAR.
- Rates: 1 USD=${FX.USD} SAR, 1 EUR=${FX.EUR} SAR, 1 GBP=${FX.GBP} SAR, 1 AED=${FX.AED} SAR, 1 KWD=${FX.KWD} SAR, 1 BHD=${FX.BHD} SAR, 1 QAR=${FX.QAR} SAR, 1 CHF=${FX.CHF} SAR.
- Return BOTH original_amount + original_currency AND amount in SAR.

DETECTION RULES (follow Just Fucking Cancel skill logic):
- Find recurring charges: same merchant, similar amounts, weekly/monthly/quarterly/yearly.
- Flag subscription-like charges (streaming, SaaS, memberships, gyms, AI tools).
- Known services even if they appear ONCE (Netflix, Spotify, Claude, Apple, etc.).
- CARD REBATES / CASHBACK that name a service (e.g. "Card Rebate: Spotify", "Card Cashback Netflix") ARE subscription signals — include them with confidence "suspicious" and note that rebate suggests an active sub being reimbursed. Use the rebate amount as the subscription amount when the charge itself is missing.
- Exclude ONLY: salary/payroll, pure bank transfers (internal/incoming/outgoing with no merchant), ATM, one-time grocery/gas/restaurant with no membership signal.
- Do NOT blanket-exclude all cashback — only exclude reward lines with no identifiable service.

For each subscription return:
- name: clean service name
- original_amount, original_currency, amount (SAR), currency: "SAR"
- frequency: weekly | monthly | quarterly | yearly
- occurrences, first_date, last_date (YYYY-MM-DD)
- raw_description: bank descriptor
- confidence: "confirmed" | "suspicious" (use suspicious for rebates, fuzzy merchants, one-offs)
- reason: short why (e.g. "Card rebate suggests active Spotify")
- category: streaming | music | software | gaming | fitness | food_delivery | shopping | cloud_storage | vpn | education | finance | telecom | insurance | other

Handle SNB, Al Rajhi, Revolut, Crypto.com, mixed multi-currency.

Return JSON only (no markdown):
{
  "subscriptions": [...],
  "total_monthly": number (SAR),
  "total_yearly": number (SAR),
  "currency": "SAR",
  "statement_period": { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" },
  "total_transactions_analyzed": number,
  "statement_currency_detected": "SAR|USD|EUR|GBP|MIXED"
}

Statement:

${rawText}`;
}

async function extractPDFText(file: File, llamaKey: string): Promise<string> {
  if (!llamaKey) throw new Error("LLAMA_CLOUD_API_KEY not set");

  const formData = new FormData();
  formData.append("file", file);

  const uploadRes = await fetch(`${LLAMA_BASE}/api/v1/parsing/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${llamaKey}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!uploadRes.ok) {
    throw new Error(`LlamaParse upload failed: ${uploadRes.status}`);
  }

  const { id: jobId } = await uploadRes.json();

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(
      `${LLAMA_BASE}/api/v1/parsing/job/${jobId}/result/markdown`,
      {
        headers: {
          Authorization: `Bearer ${llamaKey}`,
          Accept: "application/json",
        },
      }
    );
    if (res.status === 404) continue;
    if (!res.ok) continue;
    const data = await res.json();
    if (data.markdown) return data.markdown;
  }

  throw new Error("LlamaParse timeout");
}

async function analyzeWithClaude(rawText: string, anthropicKey: string): Promise<unknown> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [{ role: "user", content: buildPrompt(rawText) }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API failed: ${res.status} ${err.slice(0, 180)}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text || "";
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;
  parsed._meta = {
    model: "claude-sonnet-4-20250514",
    provider: "anthropic",
  };
  return parsed;
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // free Claude path — 4–5 files per scan, don't kill retries
const RATE_WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function onRequestPost(context: {
  request: Request;
  env: Record<string, string>;
}): Promise<Response> {
  const anthropicKey = context.env.ANTHROPIC_API_KEY;
  const llamaKey = context.env.LLAMA_CLOUD_API_KEY;

  if (!anthropicKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const ip =
    context.request.headers.get("cf-connecting-ip") ||
    context.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  if (isRateLimited(ip)) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const formData = await context.request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    let rawText =
      ext === "pdf"
        ? await extractPDFText(file, llamaKey)
        : await file.text();

    if (!rawText || rawText.length < 50) {
      return Response.json({ error: "Could not extract text from file" }, { status: 400 });
    }

    if (rawText.length > 100000) {
      rawText = rawText.slice(0, 100000);
    }

    const result = await analyzeWithClaude(rawText, anthropicKey);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Parse failed" },
      { status: 500 }
    );
  }
}
