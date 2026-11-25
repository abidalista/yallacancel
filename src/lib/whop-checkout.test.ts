import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";
import {
  FALLBACK_WHOP_PLAN_ID,
  getWhopCheckoutEnvironment,
  getWhopPlanId,
} from "./whop-checkout";

const originalNodeEnv = process.env.NODE_ENV;
const originalWhopEnv = process.env.NEXT_PUBLIC_WHOP_ENVIRONMENT;
const originalPlanId = process.env.NEXT_PUBLIC_WHOP_PLAN_ID;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  if (originalWhopEnv === undefined) delete process.env.NEXT_PUBLIC_WHOP_ENVIRONMENT;
  else process.env.NEXT_PUBLIC_WHOP_ENVIRONMENT = originalWhopEnv;
  if (originalPlanId === undefined) delete process.env.NEXT_PUBLIC_WHOP_PLAN_ID;
  else process.env.NEXT_PUBLIC_WHOP_PLAN_ID = originalPlanId;
});

describe("getWhopCheckoutEnvironment", () => {
  it("production NODE_ENV always uses live Whop", () => {
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_WHOP_ENVIRONMENT = "sandbox";
    assert.equal(getWhopCheckoutEnvironment(), "production");
  });

  it("sandbox is opt-in for non-production only", () => {
    process.env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_WHOP_ENVIRONMENT = "sandbox";
    assert.equal(getWhopCheckoutEnvironment(), "sandbox");
  });

  it("defaults to live Whop in development", () => {
    process.env.NODE_ENV = "development";
    delete process.env.NEXT_PUBLIC_WHOP_ENVIRONMENT;
    assert.equal(getWhopCheckoutEnvironment(), "production");
  });
});

describe("getWhopPlanId", () => {
  it("uses the existing fallback when env is empty", () => {
    delete process.env.NEXT_PUBLIC_WHOP_PLAN_ID;
    assert.equal(getWhopPlanId(), FALLBACK_WHOP_PLAN_ID);
    assert.match(FALLBACK_WHOP_PLAN_ID, /^plan_/);
  });
});

describe("PaywallModal checkout wiring", () => {
  it("passes helper environment (not hardcoded sandbox) and fires checkout_clicked", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/PaywallModal.tsx"),
      "utf8",
    );
    assert.match(source, /environment=\{checkoutEnvironment\}/);
    assert.doesNotMatch(source, /environment=["']sandbox["']/);
    assert.match(source, /track\("checkout_clicked"/);
    assert.match(source, /price:\s*PRICE_SAR/);
    assert.match(source, /currency:\s*PRICE_CURRENCY/);
    assert.match(source, /path:/);
  });
});
