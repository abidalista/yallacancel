import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AuditReport, Subscription } from "./types";
import type { AIAnalysisResult } from "./services/ai-analyzer.service";
import {
  classifyAiError,
  decidePayAiResult,
  decidePayUnlock,
  decideTeaserScan,
  isEmptyAiReport,
  isUsableReceiptId,
  scanErrorFromAi,
} from "./scan-flow";

function sub(name: string): Subscription {
  return {
    id: `sub_${name}`,
    name,
    normalizedName: name.toLowerCase(),
    amount: 20,
    currency: "SAR",
    frequency: "monthly",
    monthlyEquivalent: 20,
    yearlyEquivalent: 240,
    monthlySar: 20,
    occurrences: 2,
    lastCharge: "2026-08-01",
    firstCharge: "2026-07-01",
    status: "investigate",
    confidence: "confirmed",
    transactions: [],
  };
}

function report(names: string[], analyzed = names.length ? 10 : 0): AuditReport {
  const subscriptions = names.map(sub);
  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.monthlySar, 0);
  return {
    subscriptions,
    totalMonthly,
    totalYearly: totalMonthly * 12,
    potentialMonthlySavings: 0,
    potentialYearlySavings: 0,
    analyzedTransactions: analyzed,
    dateRange: { from: "2026-07-01", to: "2026-08-01" },
  };
}

function aiOk(names: string[], analyzed?: number, fileErrors?: string[]): AIAnalysisResult {
  return {
    success: true,
    report: report(names, analyzed ?? (names.length ? 12 : 0)),
    parseMethod: "claude_ai",
    fileErrors,
  };
}

function aiFail(error: string): AIAnalysisResult {
  return { success: false, error };
}

describe("isUsableReceiptId", () => {
  it("rejects missing and placeholder Whop ids", () => {
    assert.equal(isUsableReceiptId(""), false);
    assert.equal(isUsableReceiptId("   "), false);
    assert.equal(isUsableReceiptId("whop_paid"), false);
    assert.equal(isUsableReceiptId(undefined), false);
  });

  it("accepts real receipt ids", () => {
    assert.equal(isUsableReceiptId("pay_abc123"), true);
    assert.equal(isUsableReceiptId("founder_ycabi"), true);
  });
});

describe("classifyAiError", () => {
  it("maps Anthropic 401 to auth", () => {
    assert.equal(
      classifyAiError("API error 500: Claude API failed: 401 authentication_error — API key is invalid."),
      "auth"
    );
    assert.equal(classifyAiError("ANTHROPIC_API_KEY not configured"), "auth");
  });

  it("maps LlamaParse and empty PDF extract", () => {
    assert.equal(classifyAiError("LlamaParse timeout"), "timeout");
    assert.equal(classifyAiError("LlamaParse upload failed: 401"), "llamaparse");
    assert.equal(classifyAiError("Could not read any files. statement.pdf: empty extract"), "empty_extract");
  });
});

describe("decideTeaserScan", () => {
  it("skips server for CSV local hits when AI was not called", () => {
    const decision = decideTeaserScan({
      hasPdf: false,
      localReport: report(["Netflix"]),
      localCount: 1,
      aiResult: null,
    });
    assert.equal(decision.action, "use");
    if (decision.action === "use") {
      assert.equal(decision.engine, "local");
      assert.equal(decision.report.subscriptions[0].name, "Netflix");
    }
  });

  it("does not treat an empty PDF AI success as no subscriptions", () => {
    const decision = decideTeaserScan({
      hasPdf: true,
      localReport: null,
      localCount: 0,
      aiResult: aiOk([], 0),
    });
    assert.equal(decision.action, "error");
    if (decision.action === "error") {
      assert.equal(decision.kind, "empty_extract");
    }
  });

  it("surfaces Claude 401 on PDF-only with no local fallback", () => {
    const decision = decideTeaserScan({
      hasPdf: true,
      localReport: null,
      localCount: 0,
      aiResult: aiFail("Claude API failed: 401 authentication_error"),
    });
    assert.equal(decision.action, "error");
    if (decision.action === "error") {
      assert.equal(decision.kind, "auth");
    }
  });

  it("keeps a local PDF teaser when AI fails but local found subscriptions", () => {
    const decision = decideTeaserScan({
      hasPdf: true,
      localReport: report(["Netflix"]),
      localCount: 1,
      aiResult: aiFail("LlamaParse timeout"),
    });
    assert.equal(decision.action, "use");
    if (decision.action === "use") {
      assert.equal(decision.engine, "local");
    }
  });

  it("keeps local CSV teaser when AI fails so pay can retry Claude", () => {
    const decision = decideTeaserScan({
      hasPdf: false,
      localReport: report(["Spotify"]),
      localCount: 1,
      aiResult: aiFail("Claude API failed: 401"),
    });
    assert.equal(decision.action, "use");
    if (decision.action === "use") {
      assert.equal(decision.engine, "local");
    }
  });

  it("uses Claude when it finds subscriptions", () => {
    const decision = decideTeaserScan({
      hasPdf: true,
      localReport: null,
      localCount: 0,
      aiResult: aiOk(["Shahid"], 80),
    });
    assert.equal(decision.action, "use");
    if (decision.action === "use") {
      assert.equal(decision.engine, "claude");
      assert.equal(decision.report.subscriptions[0].name, "Shahid");
    }
  });

  it("allows honest empty Claude when transactions were analyzed", () => {
    const decision = decideTeaserScan({
      hasPdf: true,
      localReport: null,
      localCount: 0,
      aiResult: aiOk([], 42),
    });
    assert.equal(decision.action, "use");
    if (decision.action === "use") {
      assert.equal(decision.engine, "claude");
      assert.equal(decision.report.subscriptions.length, 0);
      assert.equal(decision.report.analyzedTransactions, 42);
    }
  });
});

describe("decidePayUnlock", () => {
  it("unblurs when the teaser already came from Claude", () => {
    assert.deepEqual(decidePayUnlock({ engine: "claude", hasPendingFiles: true }), {
      action: "unblur_existing",
    });
  });

  it("requires AI when the teaser was local", () => {
    assert.deepEqual(decidePayUnlock({ engine: "local", hasPendingFiles: true }), {
      action: "need_ai",
    });
  });

  it("errors when files are gone after pay", () => {
    assert.deepEqual(decidePayUnlock({ engine: "local", hasPendingFiles: false }), {
      action: "missing_files",
    });
  });
});

describe("decidePayAiResult", () => {
  it("does not unblur a local teaser when Claude fails after pay", () => {
    const decision = decidePayAiResult(aiFail("API error 500: Claude API failed: 401"), report(["Netflix"]));
    assert.equal(decision.action, "error");
    if (decision.action === "error") {
      assert.equal(decision.kind, "auth");
    }
  });

  it("does not unblur a local teaser when AI returns empty after pay", () => {
    const decision = decidePayAiResult(aiOk([], 0), report(["Netflix"]));
    assert.equal(decision.action, "error");
    if (decision.action === "error") {
      assert.equal(decision.kind, "empty_extract");
    }
  });

  it("does not pad an honest empty Claude report with the local teaser", () => {
    const decision = decidePayAiResult(aiOk([], 40), report(["Netflix"]));
    assert.equal(decision.action, "use_ai");
    if (decision.action === "use_ai") {
      assert.equal(decision.report.subscriptions.length, 0);
    }
  });

  it("uses the Claude report when the paid scan actually ran", () => {
    const decision = decidePayAiResult(aiOk(["ChatGPT"], 40), report(["Netflix"]));
    assert.equal(decision.action, "use_ai");
    if (decision.action === "use_ai") {
      const names = decision.report.subscriptions.map((s) => s.name);
      assert.ok(names.includes("ChatGPT"));
      assert.ok(names.includes("Netflix"));
    }
  });
});

describe("scanErrorFromAi", () => {
  it("returns EN and AR copy without selling local as AI", () => {
    const err = scanErrorFromAi("auth", { warning: "ai_unlock_failed" });
    assert.match(err.message, /AI scan/i);
    assert.match(err.messageAr, /الذكاء الاصطناعي/);
    assert.match(err.details, /did not treat the free preview as a full report/);
    assert.ok(err.warnings.includes("ai_unlock_failed"));
  });
});

describe("isEmptyAiReport", () => {
  it("is true only when both subs and analyzed txs are zero", () => {
    assert.equal(isEmptyAiReport(report([], 0)), true);
    assert.equal(isEmptyAiReport(report([], 5)), false);
    assert.equal(isEmptyAiReport(report(["Netflix"], 0)), false);
  });
});
