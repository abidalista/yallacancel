/**
 * Server-side statement analysis — JFC skill-grade Claude + prompt caching.
 * Used by Next.js /api/* routes (local / Node).
 */

import {
  CLAUDE_MODEL,
  JFC_SKILL_SYSTEM,
  buildStatementUserMessage,
} from "./jfc-skill";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const LLAMA_API_KEY = process.env.LLAMA_CLOUD_API_KEY;

/**
 * LlamaCloud is region-partitioned (a US key is rejected by the EU host and
 * vice-versa). Try an explicit override first, then US, then EU, so the key
 * works regardless of which region it was issued in.
 */
const LLAMA_BASES = Array.from(
  new Set(
    [
      process.env.LLAMA_CLOUD_BASE_URL,
      "https://api.cloud.llamaindex.ai",
      "https://api.cloud.eu.llamaindex.ai",
    ].filter((b): b is string => Boolean(b))
  )
);

/** Upload to the first region that accepts the key; return that region + job id. */
async function llamaUpload(file: File): Promise<{ base: string; jobId: string }> {
  let lastErr = "no region attempted";
  for (const base of LLAMA_BASES) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${base}/api/v1/parsing/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LLAMA_API_KEY}`,
        Accept: "application/json",
      },
      body: formData,
    });

    if (res.status === 401 || res.status === 403) {
      // Wrong region for this key — try the next host.
      lastErr = `${res.status} ${await res.text()}`;
      continue;
    }
    if (!res.ok) {
      throw new Error(`LlamaParse upload failed: ${res.status} ${await res.text()}`);
    }

    const { id } = await res.json();
    return { base, jobId: id };
  }
  throw new Error(`LlamaParse upload failed (all regions): ${lastErr}`);
}

export async function extractPDFText(file: File): Promise<string> {
  if (!LLAMA_API_KEY) throw new Error("LLAMA_CLOUD_API_KEY not set");

  const { base, jobId } = await llamaUpload(file);

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const res = await fetch(
      `${base}/api/v1/parsing/job/${jobId}/result/markdown`,
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

export async function extractFileText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return extractPDFText(file);
  return file.text();
}

/** Skill-grade Claude call with cached system prompt */
export async function analyzeStatementText(
  rawText: string,
  model: string = CLAUDE_MODEL
): Promise<unknown> {
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");

  let text = rawText;
  if (text.length > 180000) {
    text = text.slice(0, 180000);
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 16384,
      system: [
        {
          type: "text",
          text: JFC_SKILL_SYSTEM,
          cache_control: { type: "ephemeral", ttl: "1h" },
        },
      ],
      messages: [
        {
          role: "user",
          content: buildStatementUserMessage(text),
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API failed: ${res.status} ${err.slice(0, 240)}`);
  }

  const data = await res.json();
  const out = data.content?.[0]?.text || "";
  let cleaned = out.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  // Some models (esp. Haiku) prepend/append prose around the JSON. Extract the
  // outermost {...} object so a stray sentence doesn't break the whole scan.
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    parsed._meta = {
      model,
      provider: "anthropic",
      cache: data.usage || null,
    };
    return parsed;
  } catch {
    throw new Error("Claude returned invalid JSON");
  }
}

export async function analyzeStatementFile(
  file: File,
  model: string = CLAUDE_MODEL
): Promise<unknown> {
  const rawText = await extractFileText(file);
  if (!rawText || rawText.length < 50) {
    throw new Error("Could not extract text from file");
  }
  return analyzeStatementText(rawText, model);
}

/** Combine multiple statement files → one skill-grade Claude audit */
export async function analyzeStatementFiles(
  files: File[],
  model: string = CLAUDE_MODEL
): Promise<unknown> {
  if (files.length === 0) throw new Error("No files provided");

  const chunks: string[] = [];
  const errors: string[] = [];

  // PDFs are slow (LlamaParse) — run extractions with limited concurrency
  const concurrency = 2;
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (file) => {
        try {
          const text = await extractFileText(file);
          if (!text || text.length < 30) {
            return { file: file.name, ok: false as const, error: "empty extract" };
          }
          return { file: file.name, ok: true as const, text };
        } catch (err) {
          return {
            file: file.name,
            ok: false as const,
            error: err instanceof Error ? err.message : "extract failed",
          };
        }
      })
    );

    for (const r of results) {
      if (r.ok) {
        chunks.push(`\n\n===== FILE: ${r.file} =====\n${r.text}`);
      } else {
        errors.push(`${r.file}: ${r.error}`);
      }
    }
  }

  if (chunks.length === 0) {
    throw new Error(
      errors.length
        ? `Could not read any files. ${errors.join("; ")}`
        : "Could not read any files"
    );
  }

  const combined = chunks.join("\n");
  const result = (await analyzeStatementText(combined, model)) as Record<string, unknown>;
  if (errors.length) {
    result._file_errors = errors;
  }
  return result;
}
