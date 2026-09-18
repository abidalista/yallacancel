import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { getCancelUrl } from "./cancel-db";
import {
  DEMO_STATEMENT_FILENAME,
  DEMO_STATEMENT_URL,
  demoStatementFile,
} from "./demo-statement";
import { detectBank, parseCSVRobust } from "./services/csv-parser.service";
import { analyzeTransactions } from "./services/subscription-analyzer.service";

const csv = readFileSync(resolve("public/test-statement.csv"), "utf8");

describe("demo statement file", () => {
  it("is served at the public URL the UploadZone button fetches", () => {
    assert.equal(DEMO_STATEMENT_URL, "/test-statement.csv");
    assert.match(csv, /SPOTIFY PREMIUM/);
    assert.match(csv, /Netflix\.com/);
    const file = demoStatementFile(csv);
    assert.equal(file.name, DEMO_STATEMENT_FILENAME);
    assert.equal(file.type, "text/csv");
    assert.ok(file.size > 0);
  });

  it("local scan finds the 9 recurring demo subs with honest yearly math", () => {
    const parsed = parseCSVRobust(csv, detectBank(csv));
    assert.equal(parsed.transactions.length, 72);
    assert.equal(parsed.bankId, "alrajhi");

    const report = analyzeTransactions(parsed.transactions);
    const confirmed = report.subscriptions.filter((s) => s.confidence === "confirmed");
    const names = confirmed.map((s) => s.name);

    assert.equal(confirmed.length, 9);
    for (const expected of [
      "Netflix",
      "Spotify",
      "ChatGPT Plus",
      "iCloud+",
      "Adobe Creative Cloud",
      "Calm",
      "شاهد VIP",
      "هنقرستيشن",
    ]) {
      assert.ok(names.includes(expected), `missing ${expected}: ${names.join(", ")}`);
    }

    const apple = confirmed.find((s) => /apple/i.test(s.name));
    assert.ok(apple, "repeating APPLE.COM/BILL should stay as a recurring Apple sub");
    assert.ok((apple?.occurrences || 0) >= 2);
    assert.ok(!names.includes("APPLE.COM/BILL"));

    const chatgpt = confirmed.find((s) => s.name === "ChatGPT Plus");
    assert.ok(chatgpt);
    assert.equal(chatgpt?.currency, "USD");
    assert.ok((chatgpt?.monthlySar || 0) * 12 < 1200);
    assert.ok((chatgpt?.monthlySar || 0) * 12 > 700);

    for (const sub of confirmed) {
      const url = getCancelUrl(sub.name);
      assert.ok(url?.startsWith("http"), `${sub.name} needs a cancel URL`);
    }
  });
});
