/**
 * Server-side statement analysis — JFC skill-grade Claude + prompt caching.
 * Used by Next.js /api/* routes (local / Node).
 */

import {
  CLAUDE_MODEL,
  JFC_SKILL_SYSTEM,
  buildStatementUserMessage,
} from "./jfc-skill";
import { runStatementAuditSession } from "../amplitude-ai";

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

export async function extractFileText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return extractPDFText(file);
  return file.text();
}

/** Skill-grade Claude call with cached system prompt */
export async function analyzeStatementText(rawText: string): Promise<unknown> {
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");

  let text = rawText;
  if (text.length > 180000) {
    text = text.slice(0, 180000);
  }

  return runStatementAuditSession({ textLength: text.length }, () =>
    callClaude(text)
  );
}

async function callClaude(text: string): Promise<unknown> {
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
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
  const cleaned = out.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    parsed._meta = {
      model: CLAUDE_MODEL,
      provider: "anthropic",
      cache: data.usage || null,
    };
    return parsed;
  } catch {
    throw new Error("Claude returned invalid JSON");
  }
}

export async function analyzeStatementFile(file: File): Promise<unknown> {
  const rawText = await extractFileText(file);
  if (!rawText || rawText.length < 50) {
    throw new Error("Could not extract text from file");
  }
  return analyzeStatementText(rawText);
}

/** Combine multiple statement files → one skill-grade Claude audit */
export async function analyzeStatementFiles(files: File[]): Promise<unknown> {
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
  const result = (await analyzeStatementText(combined)) as Record<string, unknown>;
  if (errors.length) {
    result._file_errors = errors;
  }
  return result;
}
