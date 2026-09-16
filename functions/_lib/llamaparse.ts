/**
 * LlamaParse PDF extraction with fast failure for Cloudflare wall clocks.
 * Kept next to Pages Functions so the deploy bundle does not depend on src/.
 */

export const LLAMA_BASE = "https://api.cloud.llamaindex.ai";

const DEFAULT_MAX_ATTEMPTS = 12;
const DEFAULT_DELAY_MS = 1500;

export async function extractPdfWithLlamaParse(
  file: File,
  llamaKey: string,
  opts?: { maxAttempts?: number; delayMs?: number }
): Promise<string> {
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
    const err = await uploadRes.text();
    throw new Error(
      `LlamaParse upload failed: ${uploadRes.status} ${err.slice(0, 120)}`
    );
  }

  const uploaded = (await uploadRes.json()) as { id?: string };
  const jobId = uploaded.id;
  if (!jobId) throw new Error("LlamaParse upload returned no job id");

  const maxAttempts = opts?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const delayMs = opts?.delayMs ?? DEFAULT_DELAY_MS;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, delayMs));

    const statusRes = await fetch(`${LLAMA_BASE}/api/v1/parsing/job/${jobId}`, {
      headers: {
        Authorization: `Bearer ${llamaKey}`,
        Accept: "application/json",
      },
    });

    if (statusRes.ok) {
      const job = (await statusRes.json()) as {
        status?: string;
        error_message?: string;
        error?: string;
      };
      const status = String(job.status || "").toUpperCase();
      if (status === "ERROR" || status === "FAILED") {
        throw new Error(
          `LlamaParse error: ${job.error_message || job.error || "job failed"}`
        );
      }
      if (status === "SUCCESS" || status === "PARTIAL_SUCCESS") {
        return readLlamaMarkdown(jobId, llamaKey);
      }
      continue;
    }

    if (statusRes.status === 404) {
      const markdown = await tryLlamaMarkdown(jobId, llamaKey);
      if (markdown) return markdown;
      continue;
    }
  }

  throw new Error("LlamaParse timeout");
}

async function readLlamaMarkdown(jobId: string, llamaKey: string): Promise<string> {
  const markdown = await tryLlamaMarkdown(jobId, llamaKey);
  if (markdown) return markdown;
  throw new Error("LlamaParse empty extract");
}

async function tryLlamaMarkdown(
  jobId: string,
  llamaKey: string
): Promise<string | null> {
  const res = await fetch(`${LLAMA_BASE}/api/v1/parsing/job/${jobId}/result/markdown`, {
    headers: {
      Authorization: `Bearer ${llamaKey}`,
      Accept: "application/json",
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const data = (await res.json()) as { markdown?: string; text?: string };
  const text = String(data.markdown || data.text || "").trim();
  if (text.length >= 30) return text;
  if (text.length > 0) throw new Error("LlamaParse empty extract");
  return null;
}
