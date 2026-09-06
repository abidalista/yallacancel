/**
 * SDK-free Amplitude Agent Analytics for Cloudflare Pages Functions.
 * Do not import AmplitudeAI / @amplitude/ai here — those pull node:async_hooks.
 */

const AGENT_ID = "statement-auditor";
const HTTP_API = "https://api2.amplitude.com/2/httpapi";

type AgentEvent = {
  event_type: string;
  user_id: string;
  time: number;
  insert_id: string;
  event_properties: Record<string, unknown>;
};

class FetchAmplitudeClient {
  private buffer: AgentEvent[] = [];

  constructor(private apiKey: string) {}

  track(event: AgentEvent): void {
    this.buffer.push(event);
  }

  async flush(): Promise<void> {
    if (!this.buffer.length) return;
    const events = this.buffer.splice(0);
    try {
      const resp = await fetch(HTTP_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: this.apiKey, events }),
      });
      if (!resp.ok) console.error(`[Amplitude] Flush failed: ${resp.status}`);
    } catch (err) {
      console.error(`[Amplitude] Flush error: ${(err as Error).message}`);
    }
  }
}

type AnthropicUsage = {
  input_tokens?: number;
  output_tokens?: number;
  cache_read_input_tokens?: number;
  cache_creation_input_tokens?: number;
};

function parseAnthropicUsage(usage: unknown) {
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

function estimateClaudeCostUsd(tokens: ReturnType<typeof parseAnthropicUsage>): number {
  const uncached = Math.max(
    0,
    tokens.inputTokens - tokens.cacheReadTokens - tokens.cacheCreationTokens
  );
  return (
    (uncached / 1e6) * 3 +
    (tokens.cacheCreationTokens / 1e6) * 3.75 +
    (tokens.cacheReadTokens / 1e6) * 0.3 +
    (tokens.outputTokens / 1e6) * 15
  );
}

function baseProps(sessionId: string): Record<string, unknown> {
  return {
    "[Agent] Session ID": sessionId,
    "[Agent] Trace ID": sessionId,
    "[Agent] Agent ID": AGENT_ID,
    "[Agent] Agent Description":
      "Audits bank statements with Claude to find recurring subscriptions",
    "[Agent] SDK Version": "http-api/1.0",
    "[Agent] Runtime": "cloudflare-workers",
  };
}

export async function trackClaudeAudit<T>(
  env: Record<string, string>,
  waitUntil: ((promise: Promise<unknown>) => void) | undefined,
  context: { textLength: number },
  run: () => Promise<T>
): Promise<T> {
  const apiKey = env.AMPLITUDE_AI_API_KEY;
  if (!apiKey || env.AMPLITUDE_TRACKING_DISABLED) {
    return run();
  }

  const transport = new FetchAmplitudeClient(apiKey);
  const sessionId = crypto.randomUUID();
  const userId = `scan-${sessionId}`;
  const start = Date.now();

  transport.track({
    event_type: "[Agent] User Message",
    user_id: userId,
    time: start,
    insert_id: crypto.randomUUID(),
    event_properties: {
      ...baseProps(sessionId),
      "[Agent] Turn ID": 1,
      $llm_message: { text: "Audit bank statement subscriptions" },
      "[Agent] Context": { textLength: context.textLength },
    },
  });

  try {
    const result = await run();
    const latencyMs = Date.now() - start;
    const meta = (result as { _meta?: { model?: string; cache?: unknown } })?._meta;
    const tokens = parseAnthropicUsage(meta?.cache);
    transport.track({
      event_type: "[Agent] AI Response",
      user_id: userId,
      time: Date.now(),
      insert_id: crypto.randomUUID(),
      event_properties: {
        ...baseProps(sessionId),
        "[Agent] Turn ID": 1,
        "[Agent] Model Name": meta?.model || "claude-sonnet-4-6",
        "[Agent] Provider": "anthropic",
        "[Agent] Latency Ms": latencyMs,
        "[Agent] Input Tokens": tokens.inputTokens,
        "[Agent] Output Tokens": tokens.outputTokens,
        "[Agent] Cache Read Tokens": tokens.cacheReadTokens,
        "[Agent] Cache Creation Tokens": tokens.cacheCreationTokens,
        "[Agent] Total Tokens": tokens.totalTokens,
        "[Agent] Cost USD": estimateClaudeCostUsd(tokens),
        $llm_message: { text: "Statement audit completed" },
      },
    });
    return result;
  } catch (err) {
    transport.track({
      event_type: "[Agent] AI Response",
      user_id: userId,
      time: Date.now(),
      insert_id: crypto.randomUUID(),
      event_properties: {
        ...baseProps(sessionId),
        "[Agent] Turn ID": 1,
        "[Agent] Model Name": "claude-sonnet-4-6",
        "[Agent] Provider": "anthropic",
        "[Agent] Latency Ms": Date.now() - start,
        "[Agent] Is Error": true,
        "[Agent] Error Message": err instanceof Error ? err.message : String(err),
        $llm_message: { text: "" },
      },
    });
    throw err;
  } finally {
    transport.track({
      event_type: "[Agent] Session End",
      user_id: userId,
      time: Date.now(),
      insert_id: crypto.randomUUID(),
      event_properties: baseProps(sessionId),
    });
    const flushed = transport.flush();
    if (waitUntil) waitUntil(flushed);
    else await flushed;
  }
}
