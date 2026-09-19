import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  amountsFromCharge,
  classifyAppleCharge,
  isAppleBillingAggregator,
  isKnownAppleSubscriptionProduct,
  yearlyFromCharge,
} from "./subscription-rules";

describe("Apple classification", () => {
  it("does not treat a single App Store / apple.com/bill charge as a confirmed sub", () => {
    const oneOff = classifyAppleCharge({
      name: "Apple",
      description: "APPLE.COM/BILL",
      occurrences: 1,
      consistentAmount: true,
      frequency: "monthly",
    });
    assert.equal(oneOff.kind, "one_off");
    assert.equal(oneOff.include, false);

    const store = classifyAppleCharge({
      name: "App Store",
      description: "APP STORE PURCHASE",
      occurrences: 1,
    });
    assert.equal(store.include, false);
    assert.equal(isAppleBillingAggregator("Apple iTunes", "ITUNES.COM"), true);
    assert.equal(isKnownAppleSubscriptionProduct("Apple", "APPLE.COM/BILL"), false);
  });

  it("confirms named Apple products even with one charge", () => {
    const icloud = classifyAppleCharge({
      name: "iCloud+",
      description: "APPLE.COM/BILL ICLOUD",
      occurrences: 1,
    });
    assert.equal(icloud.kind, "named_product");
    assert.equal(icloud.include, true);
    assert.equal(icloud.confidence, "confirmed");
    assert.equal(isKnownAppleSubscriptionProduct("Apple Music", ""), true);
  });

  it("confirms Apple aggregator only with a recurring same-amount pattern", () => {
    const recurring = classifyAppleCharge({
      name: "Apple",
      description: "APPLE.COM/BILL",
      occurrences: 3,
      consistentAmount: true,
      frequency: "monthly",
    });
    assert.equal(recurring.include, true);
    assert.equal(recurring.confidence, "confirmed");

    const variable = classifyAppleCharge({
      name: "Apple",
      description: "APPLE.COM/BILL",
      occurrences: 3,
      consistentAmount: false,
      frequency: "monthly",
    });
    assert.equal(variable.include, true);
    assert.equal(variable.confidence, "suspicious");
  });
});

describe("Yearly annualization", () => {
  it("annualizes monthly × 12 only", () => {
    assert.equal(yearlyFromCharge(20, "monthly"), 240);
    assert.equal(yearlyFromCharge(200, "yearly"), 200);
    assert.equal(yearlyFromCharge(60, "quarterly"), 240);
  });

  it("keeps Claude Pro $20/mo as ~900 SAR/yr, not ~5000", () => {
    const usd = amountsFromCharge({
      name: "Claude Pro",
      chargeAmount: 20,
      currency: "USD",
      frequency: "monthly",
    });
    assert.equal(usd.currency, "USD");
    assert.equal(usd.yearlyEquivalent, 240);
    assert.equal(usd.yearlySar, 900);

    const mistagged = amountsFromCharge({
      name: "Claude Pro",
      chargeAmount: 20,
      currency: "SAR",
      frequency: "monthly",
    });
    assert.equal(mistagged.currency, "USD");
    assert.equal(mistagged.yearlySar, 900);

    const wildSar = amountsFromCharge({
      name: "Claude Pro",
      chargeAmount: 416,
      currency: "SAR",
      frequency: "monthly",
    });
    assert.equal(wildSar.currency, "USD");
    assert.equal(wildSar.amount, 20);
    assert.ok(wildSar.yearlySar < 1200);
    assert.ok(wildSar.yearlySar > 700);

    const weeklyCoerce = amountsFromCharge({
      name: "Claude Pro",
      chargeAmount: 20,
      currency: "USD",
      frequency: "weekly",
      occurrences: 1,
    });
    assert.equal(weeklyCoerce.frequency, "monthly");
    assert.equal(weeklyCoerce.yearlySar, 900);
  });
});
