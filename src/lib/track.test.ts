import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { track } from "./track";

const originalKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

afterEach(() => {
  if (originalKey === undefined) delete process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  else process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY = originalKey;
});

describe("track", () => {
  it("does not throw without a key or window", () => {
    delete process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    assert.doesNotThrow(() => {
      track("checkout_clicked", { price: 49, currency: "SAR", path: "/" });
    });
  });

  it("no-ops when Amplitude key is missing even if window.amplitude exists", () => {
    delete process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    const calls: unknown[] = [];
    const previous = (globalThis as { window?: unknown }).window;
    (globalThis as { window: { amplitude: { track: (...args: unknown[]) => void } } }).window = {
      amplitude: {
        track: (...args: unknown[]) => {
          calls.push(args);
        },
      },
    };
    try {
      track("checkout_clicked", { price: 49, currency: "SAR", path: "/" });
      assert.equal(calls.length, 0);
    } finally {
      if (previous === undefined) delete (globalThis as { window?: unknown }).window;
      else (globalThis as { window: unknown }).window = previous;
    }
  });
});
