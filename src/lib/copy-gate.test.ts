import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, it } from "node:test";
import { formatPriceOnce, PRICE_LABEL } from "./format";
import { PRIVACY_ONE_LINER, translations } from "./i18n";

const ROOT = process.cwd();

function walkFiles(dir: string, ext: Set<string>, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "out" || name === ".next") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkFiles(full, ext, out);
    else if (ext.has(name.slice(name.lastIndexOf(".")))) out.push(full);
  }
  return out;
}

describe("ABI-150 public name", () => {
  it("i18n appName is Yalla Cancel / يلا كانسل", () => {
    assert.equal(translations.ar.appName, "يلا كانسل");
    assert.equal(translations.en.appName, "Yalla Cancel");
  });

  it("customer-facing src has no أبدالستا / Abidalista / عبدالله ليستا", () => {
    const files = walkFiles(join(ROOT, "src"), new Set([".ts", ".tsx", ".js", ".jsx", ".html"]))
      .filter((f) => !f.endsWith(".test.ts"));
    const banned = /أبدالستا|Abidalista|عبدالله ليستا/;
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      assert.equal(banned.test(text), false, relative(ROOT, file));
    }
  });
});

describe("ABI-151 pricing CTA", () => {
  it("pricing card scrolls to upload and does not open the paywall", () => {
    const page = readFileSync(join(ROOT, "src/app/page.tsx"), "utf8");
    const pricingIdx = page.indexOf('id="pricing"');
    assert.ok(pricingIdx > 0);
    const pricingChunk = page.slice(pricingIdx, page.indexOf("{/* FAQ */}", pricingIdx));
    assert.match(pricingChunk, /getElementById\("upload"\)\?\.scrollIntoView/);
    assert.doesNotMatch(pricingChunk, /setShowPaywall\(true\)/);
    assert.match(pricingChunk, /حلل كشف حسابك/);
  });

  it("paywall open stays on the results teaser only", () => {
    const page = readFileSync(join(ROOT, "src/app/page.tsx"), "utf8");
    const opens = page.match(/setShowPaywall\(true\)/g) ?? [];
    assert.equal(opens.length, 1);
    assert.ok(page.indexOf("needsPaywall") < page.indexOf("setShowPaywall(true)"));
  });
});

describe("ABI-152 privacy one-liner", () => {
  it("exports the same AR+EN sentence", () => {
    assert.equal(
      PRIVACY_ONE_LINER.ar,
      "نحلل ملفاتك ثم نحذفها. المسار المدفوع يستخدم الذكاء الاصطناعي. ما نخزن شيء بعد التقرير."
    );
    assert.equal(
      PRIVACY_ONE_LINER.en,
      "Files are analyzed then discarded. The paid path uses AI. Nothing is stored after the report."
    );
    assert.equal(translations.ar.privacyDesc, PRIVACY_ONE_LINER.ar);
    assert.equal(translations.en.privacyDesc, PRIVACY_ONE_LINER.en);
    assert.doesNotMatch(PRIVACY_ONE_LINER.ar, /[—–]/);
    assert.doesNotMatch(PRIVACY_ONE_LINER.en, /[—–]/);
  });

  it("src UI does not claim on-device analysis", () => {
    const files = walkFiles(join(ROOT, "src"), new Set([".ts", ".tsx"]))
      .filter((f) => !f.endsWith(".test.ts"));
    const banned = /على جهازك|on your device|never leaves the device|on-device/i;
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      assert.equal(banned.test(text), false, relative(ROOT, file));
    }
  });
});

describe("ABI-153 product price", () => {
  it("formatPriceOnce is always 49 SAR", () => {
    assert.equal(PRICE_LABEL, "49 SAR");
    assert.equal(formatPriceOnce(), "49 SAR");
    assert.equal(formatPriceOnce(true), "49 SAR");
    assert.equal(formatPriceOnce(false), "49 SAR");
  });

  it("src product copy has no 49 ريال / 49 Riyal", () => {
    const files = walkFiles(join(ROOT, "src"), new Set([".ts", ".tsx"]))
      .filter((f) => !f.endsWith(".test.ts"));
    const banned = /49\s*ريال|٤٩\s*ريال|49\s*Riyal/i;
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      assert.equal(banned.test(text), false, relative(ROOT, file));
    }
  });
});

describe("ABI-156 canonical host", () => {
  it("public HTML and sitemap stay on yallacancel.com", () => {
    const files = [
      ...walkFiles(join(ROOT, "public"), new Set([".html", ".xml"])),
    ];
    assert.ok(files.length > 10);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      assert.doesNotMatch(text, /yallacancel\.sa/, relative(ROOT, file));
    }
    const sitemap = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");
    assert.match(sitemap, /https:\/\/yallacancel\.com\//);
  });
});
