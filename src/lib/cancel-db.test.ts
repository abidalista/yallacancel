import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getCancelInfo, getCancelUrl } from "./cancel-db";

describe("getCancelInfo", () => {
  it("resolves Claude Pro and Apple Music to a real cancel URL", () => {
    assert.ok(getCancelUrl("Claude Pro")?.startsWith("http"));
    assert.ok(getCancelUrl("claude.ai")?.startsWith("http"));
    assert.ok(getCancelUrl("Apple Music")?.startsWith("http"));
    assert.equal(getCancelInfo("Netflix")?.cancelUrl, "https://www.netflix.com/cancelplan");
  });

  it("returns info without inventing a URL when none exists", () => {
    const gym = getCancelInfo("نادي رياضي");
    assert.ok(gym);
    assert.equal(gym?.cancelUrl, "");
    assert.equal(getCancelUrl("Unknown Merchant XYZ"), null);
  });
});
