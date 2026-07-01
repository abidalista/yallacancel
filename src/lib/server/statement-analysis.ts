/**
 * Server-side statement analysis (LlamaParse + Claude).
 * Used by /api/parse-pdf.
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const LLAMA_API_KEY = process.env.LLAMA_CLOUD_API_KEY;
const LLAMA_BASE = "https://api.cloud.llamaindex.ai";

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

  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 3000));

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

  const prompt = `You are a bank statement analyzer. Given the raw text of a bank statement, extract ALL recurring subscriptions and charges.

For each subscription found, return:
- name: the service name (clean, recognizable name like "Netflix", "Spotify", "Apple", not the raw bank descriptor)
- amount: the charge amount as a number in SAR
- currency: "SAR"
- frequency: "weekly", "monthly", "quarterly", or "yearly"
- occurrences: how many times this charge appears in the statement
- first_date: first charge date (YYYY-MM-DD format)
- last_date: last charge date (YYYY-MM-DD format)
- raw_description: the original bank statement description
- category: one of "streaming", "music", "software", "gaming", "fitness", "food_delivery", "shopping", "cloud_storage", "vpn", "education", "finance", "telecom", "insurance", "other"

Rules:
- Only include RECURRING charges (subscriptions, memberships, recurring payments)
- Do NOT include one-time purchases, ATM withdrawals, transfers between accounts, salary deposits, employer allowance, cashback, or regular spending at stores/restaurants/gas
- Group charges from the same service together even if the bank description varies slightly
- Handle SNB, Revolut, Crypto.com, and international card descriptors
- If a charge appears only once but is clearly a known subscription service (Netflix, Spotify, Shahid, etc.), still include it
- Convert all amounts to SAR using approximate current exchange rates
- Return valid JSON only, no markdown, no explanation

Return format:
{
  "subscriptions": [...],
  "total_monthly": number,
  "total_yearly": number,
  "currency": "SAR",
  "statement_period": { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" },
  "total_transactions_analyzed": number
}

Here is the bank statement:

${rawText}`;

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
      messages: [{ role: "user", content: prompt }],
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
    return JSON.parse(cleaned);
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
