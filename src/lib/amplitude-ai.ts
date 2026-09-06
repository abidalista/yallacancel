/**
 * Amplitude Agent Analytics bootstrap (Node / Next.js API routes).
 * Do not import this from Cloudflare Pages Functions — they cannot bundle
 * @amplitude/ai (node:async_hooks). Workers use functions/lib/amplitude-agent.ts.
 */

import { AmplitudeAI, AIConfig } from "@amplitude/ai";

const AMPLITUDE_AI_API_KEY = process.env.AMPLITUDE_AI_API_KEY;

export const ai = AMPLITUDE_AI_API_KEY
  ? new AmplitudeAI({
      apiKey: AMPLITUDE_AI_API_KEY,
      config: new AIConfig({
        contentMode: "metadata_only",
        redactPii: true,
      }),
    })
  : null;

export const statementAuditor = ai?.agent("statement-auditor", {
  description: "Audits bank statements with Claude to find recurring subscriptions",
});

export type AnthropicUsage = {
  input_tokens?: number;
  output_tokens?: number;
  cache_read_input_tokens?: number;
  cache_creation_input_tokens?: number;
};

export function parseAnthropicUsage(usage: unknown): {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  totalTokens: number;
} {
  const u = (usage ?? {}) as AnthropicUsage;
  const rawInput = u.input_tokens ?? 0;
  const cacheRead = u.cache_read_input_tokens ?? 0;
  const cacheCreation = u.cache_creation_input_tokens ?? 0;
  const output = u.output_tokens ?? 0;
  const inputTokens = rawInput + cacheRead + cacheCreation;
  return {
    inputTokens,
    outputTokens: output,
    cacheReadTokens: cacheRead,
    cacheCreationTokens: cacheCreation,
    totalTokens: inputTokens + output,
  };
}

export async function runStatementAuditSession<T>(
  context: { textLength: number },
  fn: () => Promise<T>
): Promise<T> {
  if (!ai || !statementAuditor) {
    return fn();
  }

  const sessionId = crypto.randomUUID();
  try {
    return await statementAuditor
      .session({
        userId: `scan-${sessionId}`,
        sessionId,
      })
      .run(async (s) => {
        s.trackUserMessage("Audit bank statement subscriptions", {
          context: { textLength: context.textLength },
        });
        const start = performance.now();
        try {
          const result = await fn();
          const latencyMs = performance.now() - start;
          const meta = (result as { _meta?: { model?: string; cache?: unknown } })?._meta;
          const tokens = parseAnthropicUsage(meta?.cache);
          s.trackAiMessage(
            "Statement audit completed",
            meta?.model || "claude-sonnet-4-6",
            "anthropic",
            latencyMs,
            tokens
          );
          return result;
        } catch (err) {
          s.trackAiMessage("", "claude-sonnet-4-6", "anthropic", performance.now() - start, {
            isError: true,
            errorMessage: err instanceof Error ? err.message : String(err),
          });
          throw err;
        }
      });
  } finally {
    await ai.flush();
  }
}
