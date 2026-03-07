/**
 * POST /api/parse-pdf
 * Reads PDF/CSV content and sends to Claude API for subscription analysis.
 * Returns structured subscription data directly.
 */

import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const LLAMA_API_KEY = process.env.LLAMA_CLOUD_API_KEY;
const LLAMA_BASE = "https://api.cloud.llamaindex.ai";

// Simple in-memory rate limiter (per IP, 5 requests per 10 minutes)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
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

// ── LlamaParse: extract text from PDF ──

async function extractPDFText(file: File): Promise<string> {
  if (!LLAMA_API_KEY) throw new Error("LLAMA_CLOUD_API_KEY not set");

  // Upload
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

  // Poll for result
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

// ── Claude API: analyze transactions ──

async function analyzeWithClaude(rawText: string): Promise<unknown> {
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");

  const prompt = `You are a bank statement analyzer. Given the raw text of a bank statement, extract ALL recurring subscriptions and charges.

For each subscription found, return:
- name: the service name (clean, recognizable name like "Netflix", "Spotify", "Apple", not the raw bank descriptor)
- amount: the charge amount as a number
- currency: the currency (SAR, EUR, USD, etc.)
- frequency: "weekly", "monthly", "quarterly", or "yearly"
- occurrences: how many times this charge appears in the statement
- first_date: first charge date (YYYY-MM-DD format)
- last_date: last charge date (YYYY-MM-DD format)
- raw_description: the original bank statement description
- cancel_url: if you know the cancellation URL for this service, include it. otherwise null.
- category: one of "streaming", "music", "software", "gaming", "fitness", "food_delivery", "shopping", "cloud_storage", "vpn", "education", "finance", "telecom", "insurance", "other"

Rules:
- Only include RECURRING charges (subscriptions, memberships, recurring payments)
- Do NOT include one-time purchases, ATM withdrawals, transfers between accounts, salary deposits, or regular spending at stores/restaurants
- Group charges from the same service together even if the bank description varies slightly
- If a charge appears only once but is clearly a known subscription service (Netflix, Spotify, etc.), still include it
- Be thorough: check every transaction for potential subscriptions
- Convert all amounts to SAR (Saudi Riyal) if the statement is in a different currency. Use approximate current exchange rates.
- Return valid JSON only, no markdown, no explanation

Return format:
{
  "subscriptions": [...],
  "total_monthly": number,
  "total_yearly": number,
  "currency": "SAR" or "EUR" etc,
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

  // Parse JSON from response (strip markdown fences if any)
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Claude returned invalid JSON");
  }
}

// ── API handler ──

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let rawText: string;
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "pdf") {
      rawText = await extractPDFText(file);
    } else {
      rawText = await file.text();
    }

    if (!rawText || rawText.length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from file" },
        { status: 400 }
      );
    }

    // Truncate if too long (~100k chars ≈ 25k tokens)
    if (rawText.length > 100000) {
      rawText = rawText.slice(0, 100000);
    }

    const result = await analyzeWithClaude(rawText);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Parse failed" },
      { status: 500 }
    );
  }
}
