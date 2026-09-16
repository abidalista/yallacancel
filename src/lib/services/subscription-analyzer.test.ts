import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeTransactions } from "./subscription-analyzer.service";
import { transformClaudeResponse } from "./ai-analyzer.service";
import type { Transaction } from "../types";

function tx(
  description: string,
  amount: number,
  date: string,
  currency = "USD"
): Transaction {
  return { date, description, amount, currency };
}

describe("analyzeTransactions Apple", () => {
  it("does not auto-confirm a one-off App Store charge", () => {
    const report = analyzeTransactions([
      tx("APPLE.COM/BILL", 4.99, "2026-08-02"),
      tx("NETFLIX.COM", 15.49, "2026-08-01"),
    ]);
    const names = report.subscriptions.map((s) => s.name);
    assert.ok(names.includes("Netflix"));
    assert.equal(
      names.some((n) => /apple|app store|itunes/i.test(n)),
      false
    );
  });

  it("confirms repeating Apple charges at the same amount", () => {
    const report = analyzeTransactions([
      tx("APPLE.COM/BILL", 14.99, "2026-06-02"),
      tx("APPLE.COM/BILL", 14.99, "2026-07-02"),
      tx("APPLE.COM/BILL", 14.99, "2026-08-02"),
    ]);
    assert.equal(report.subscriptions.length, 1);
    assert.equal(report.subscriptions[0].confidence, "confirmed");
    assert.match(report.subscriptions[0].name, /Apple/i);
  });
});

describe("transformClaudeResponse amounts", () => {
  it("drops a one-off Apple App Store charge from Claude JSON", () => {
    const report = transformClaudeResponse({
      subscriptions: [
        {
          name: "Apple",
          original_amount: 9.99,
          original_currency: "USD",
          amount: 37.5,
          frequency: "monthly",
          occurrences: 1,
          raw_description: "APPLE.COM/BILL",
          confidence: "confirmed",
        },
      ],
    });
    assert.equal(report.subscriptions.length, 0);
  });

  it("does not annualize Claude Pro into ~5000 SAR", () => {
    const report = transformClaudeResponse({
      subscriptions: [
        {
          name: "Claude Pro",
          original_amount: 416,
          original_currency: "SAR",
          amount: 416,
          frequency: "monthly",
          occurrences: 2,
          raw_description: "ANTHROPIC CLAUDE.AI",
          confidence: "confirmed",
        },
      ],
    });
    assert.equal(report.subscriptions.length, 1);
    const sub = report.subscriptions[0];
    assert.ok(sub.monthlySar * 12 < 1200);
    assert.equal(sub.yearlyEquivalent, 240);
  });
});
