/**
 * Server-side statement analysis (LlamaParse + Claude).
 * Used by /api/parse-pdf (local Next.js).
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const LLAMA_API_KEY = process.env.LLAMA_CLOUD_API_KEY;
const LLAMA_BASE = "https://api.cloud.llamaindex.ai";

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

export function buildAnalysisPrompt(rawText: string): string {
  return `You are a bank statement analyzer for Saudi users. Extract ALL recurring subscriptions.

CRITICAL CURRENCY RULES (do not break these):
- Detect the statement currency from headers, symbols (£ $ €), column labels, and bank name (Revolut/Crypto.com are often USD/EUR/GBP; SNB/Saudi banks are usually SAR).
- NEVER treat a foreign amount as SAR. Example: Claude Pro $20 must become about ${20 * FX.USD} SAR, NOT 20 SAR.
- Convert using these rates: 1 USD = ${FX.USD} SAR, 1 EUR = ${FX.EUR} SAR, 1 GBP = ${FX.GBP} SAR, 1 AED = ${FX.AED} SAR, 1 KWD = ${FX.KWD} SAR, 1 BHD = ${FX.BHD} SAR, 1 QAR = ${FX.QAR} SAR, 1 CHF = ${FX.CHF} SAR. If already SAR, leave as-is.
- For each subscription return BOTH original_amount + original_currency AND amount in SAR after conversion.

For each subscription:
- name: clean service name (Netflix, Spotify, Claude Pro, Apple, etc.)
- original_amount: number as printed on the statement
- original_currency: ISO code (SAR, USD, EUR, GBP, ...)
- amount: number in SAR after conversion
- currency: "SAR"
- frequency: weekly | monthly | quarterly | yearly
- occurrences: how many times it appears
- first_date / last_date: YYYY-MM-DD
- raw_description: bank descriptor
- category: streaming | music | software | gaming | fitness | food_delivery | shopping | cloud_storage | vpn | education | finance | telecom | insurance | other

Include: recurring subscriptions/memberships. Known services even if they appear once.
Exclude: transfers, salary, allowance, cashback, ATM, one-time retail/grocery/gas.

Handle SNB, Al Rajhi, Revolut, Crypto.com, and mixed multi-currency statements.

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

export async function extractPDFText(file: File): Promise<string> {
  if (!LLAMA_API_KEY) throw new Error("LLAMA_CLOUD_API_KEY not set");

  const formData = new FormData();
  formData.append("file", file);

  const uploadRes = await fetch(`${LLAMA_BASE}/api/v1/parsing/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LLAMA_API_KEY}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`LlamaParse upload failed: ${uploadRes.status} ${err}`);
  }

  const { id: jobId } = await uploadRes.json();

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const res = await fetch(
      `${LLAMA_BASE}/api/v1/parsing/job/${jobId}/result/markdown`,
      {
        headers: {
          Authorization: `Bearer ${LLAMA_API_KEY}`,
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

export async function analyzeStatementText(rawText: string): Promise<unknown> {
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [{ role: "user", content: buildAnalysisPrompt(rawText) }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API failed: ${res.status} ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text || "";
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    parsed._meta = {
      model: "claude-sonnet-4-20250514",
      provider: "anthropic",
    };
    return parsed;
  } catch {
    throw new Error("Claude returned invalid JSON");
  }
}

export async function analyzeStatementFile(file: File): Promise<unknown> {
  let rawText: string;
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    rawText = await extractPDFText(file);
  } else {
    rawText = await file.text();
  }

  if (!rawText || rawText.length < 50) {
    throw new Error("Could not extract text from file");
  }

  if (rawText.length > 100000) {
    rawText = rawText.slice(0, 100000);
  }

  return analyzeStatementText(rawText);
}
