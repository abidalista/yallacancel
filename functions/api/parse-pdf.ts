/**
 * Cloudflare Pages Function — full AI analysis (production).
 * Local dev uses src/app/api/parse-pdf/route.ts instead.
 */

const LLAMA_BASE = "https://api.cloud.llamaindex.ai";

async function extractPDFText(file: File, llamaKey: string): Promise<string> {
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

  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 3000));
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
  const prompt = `You are a bank statement analyzer. Extract ALL recurring subscriptions. Return JSON only with subscriptions array, total_monthly, total_yearly, statement_period, total_transactions_analyzed. Convert amounts to SAR. Exclude transfers, salary, cashback, one-time retail. Statement:\n\n${rawText}`;

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
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Claude API failed: ${res.status}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text || "";
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
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
