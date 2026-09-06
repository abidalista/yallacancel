import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AIConfig,
  PROP_SESSION_ID,
  PROP_MODEL_NAME,
  PROP_PROVIDER,
  PROP_LATENCY_MS,
  PROP_INPUT_TOKENS,
  PROP_OUTPUT_TOKENS,
  PROP_COST_USD,
} from "@amplitude/ai";
import { MockAmplitudeAI } from "@amplitude/ai/testing";

test("statement-auditor emits a closed session with AI response quality fields", async () => {
  const mock = new MockAmplitudeAI(new AIConfig({ contentMode: "metadata_only" }));
  const agent = mock.agent("statement-auditor", { userId: "scan-verify-session-1" });

  await agent.session({ sessionId: "scan-verify-session-1" }).run(async (s) => {
    s.trackUserMessage("Audit bank statement subscriptions", {
      context: { textLength: 1200 },
    });
    s.trackAiMessage("Statement audit completed", "claude-sonnet-4-6", "anthropic", 150, {
      inputTokens: 800,
      outputTokens: 200,
      cacheReadTokens: 0,
      cacheCreationTokens: 0,
      totalTokens: 1000,
    });
  });

  mock.assertEventTracked("[Agent] User Message", { userId: "scan-verify-session-1" });
  mock.assertSessionClosed("scan-verify-session-1");

  const aiEvents = mock.getEvents("[Agent] AI Response");
  assert.equal(aiEvents.length, 1);
  for (const e of aiEvents) {
    const p = e.event_properties ?? {};
    assert.ok(e.user_id || e.device_id);
    assert.ok(p[PROP_SESSION_ID]);
    assert.ok(p[PROP_MODEL_NAME]);
    assert.ok(p[PROP_PROVIDER]);
    assert.ok(Number(p[PROP_LATENCY_MS]) > 0);
    assert.ok(Number(p[PROP_INPUT_TOKENS]) > 0);
    assert.ok(Number(p[PROP_OUTPUT_TOKENS]) > 0);
    assert.ok(p[PROP_COST_USD] !== undefined);
  }
});
