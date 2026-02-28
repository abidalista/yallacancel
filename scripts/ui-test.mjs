/**
 * Puppeteer UI test for Yalla Cancel
 * Run: node scripts/ui-test.mjs
 * Requires dev server running on localhost:3000
 */

import puppeteer from "puppeteer";
import { mkdirSync } from "fs";
import { join } from "path";

const BASE_URL = "http://localhost:3000";
const SS_DIR = "scripts/screenshots";

mkdirSync(SS_DIR, { recursive: true });

const delay = (ms) => new Promise(r => setTimeout(r, ms));

let passed = 0;
let failed = 0;

function log(label, ok, detail = "") {
  const icon = ok ? "✅" : "❌";
  console.log(`${icon} ${label}${detail ? "  →  " + detail : ""}`);
  if (ok) passed++; else failed++;
}

async function screenshot(page, name) {
  const file = join(SS_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`   📸 ${file}`);
}

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 }); // iPhone 14 Pro

    // ── 1. Landing page loads ──────────────────────────────────────
    console.log("\n━━━ 1. Landing Page ━━━");
    const res = await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 15000 });
    log("Page loads (200)", res.status() === 200, `HTTP ${res.status()}`);

    const headline = await page.$eval("h1", el => el.textContent.trim()).catch(() => "");
    log("Hero h1 present", headline.length > 0, headline.slice(0, 50));

    const hasOldColors = await page.evaluate(() => {
      for (const el of document.querySelectorAll("*")) {
        const s = el.getAttribute("style") || "";
        if (s.includes("indigo") || s.includes("violet") || s.includes("purple")) return true;
      }
      return false;
    });
    log("No indigo/violet inline styles", !hasOldColors);

    const headerBg = await page.$eval("header", el => window.getComputedStyle(el).backgroundColor).catch(() => "");
    log("Header has light background", !headerBg.includes("(26,"), headerBg);

    await screenshot(page, "01-landing");

    // ── 2. Bank logos visible ──────────────────────────────────────
    console.log("\n━━━ 2. Bank / Brand Logos ━━━");
    await delay(2000);

    const imgStats = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return {
        total: imgs.length,
        loaded: imgs.filter(i => i.naturalWidth > 0).length,
        broken: imgs.filter(i => i.complete && i.naturalWidth === 0).length,
        sources: imgs.slice(0, 6).map(i => i.src.replace(/^https?:\/\//, "").slice(0, 60)),
      };
    });

    log(`Images loaded (${imgStats.loaded}/${imgStats.total})`, imgStats.loaded > 0, `${imgStats.broken} broken`);
    log("No Clearbit sources", !imgStats.sources.some(s => s.includes("clearbit")), imgStats.sources[0] || "none");
    log("Using Google Favicons", imgStats.sources.some(s => s.includes("google.com/s2/favicons")),
      imgStats.sources.find(s => s.includes("google")) || "not found");

    await screenshot(page, "02-logos");

    // ── 3. Upload zone ─────────────────────────────────────────────
    console.log("\n━━━ 3. Upload Zone ━━━");
    const fileInput = await page.$("input[type='file']");
    log("File input present", !!fileInput);

    // ── 4. Sample data flow ────────────────────────────────────────
    console.log("\n━━━ 4. Sample Data Flow ━━━");

    const sampleBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      return btns.find(b => b.textContent.includes("جرّب") || b.textContent.includes("جرب") || b.textContent.toLowerCase().includes("sample"));
    });

    const sampleBtnEl = sampleBtn.asElement();
    log("Sample data button found", !!sampleBtnEl);

    if (sampleBtnEl) {
      await sampleBtnEl.click();
      console.log("   ⏳ Waiting for analysis...");

      // Wait for the identify state (ambiguous transactions review)
      try {
        await page.waitForFunction(
          () => document.body.innerText.includes("شوف تقريري") || document.body.innerText.includes("View my report"),
          { timeout: 20000 }
        );
        log("Identify step reached", true);
      } catch {
        log("Identify step reached", false, "Timed out");
      }

      await screenshot(page, "03-identify");

      // Click "View my report" / "شوف تقريري" to proceed to results
      const viewReportBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        return btns.find(b => b.textContent.includes("شوف تقريري") || b.textContent.toLowerCase().includes("view my report"));
      });
      const viewReportEl = viewReportBtn.asElement();
      log("View report button found", !!viewReportEl);
      if (viewReportEl) await viewReportEl.click();

      // Now wait for actual AuditReport
      try {
        await page.waitForFunction(
          () =>
            document.body.innerText.includes("subscriptions found") ||
            document.body.innerText.includes("اشتراك مكتشف") ||
            document.body.innerText.includes("transactions analyzed"),
          { timeout: 15000 }
        );
        log("Audit report loaded", true);
      } catch {
        log("Audit report loaded", false, "Timed out");
      }

      await delay(2000);
      await screenshot(page, "04-results");

      // ── 5. Audit results ──────────────────────────────────────────
      console.log("\n━━━ 5. Audit Results ━━━");

      const subCount = await page.evaluate(() => {
        const el = document.querySelector("[class*='space-y-4']");
        return el ? el.children.length : 0;
      });
      log("Subscription cards rendered", subCount > 0, `${subCount} cards`);

      const hasSpending = await page.evaluate(() =>
        document.body.innerText.includes("Spending Breakdown") ||
        document.body.innerText.includes("تحليل الإنفاق") ||
        document.body.innerText.includes("Where it goes") ||
        document.body.innerText.includes("وين تروح فلوسك")
      );
      log("Spending breakdown visible", hasSpending);

      const hasTotals = await page.evaluate(() =>
        (document.body.innerText.includes("SAR") && document.body.innerText.includes("month")) ||
        (document.body.innerText.includes("ريال") && document.body.innerText.includes("شهر"))
      );
      log("Monthly totals visible", hasTotals);

      await delay(1500);
      const resultImgStats = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll("img"));
        return {
          total: imgs.length,
          loaded: imgs.filter(i => i.naturalWidth > 0).length,
          broken: imgs.filter(i => i.complete && i.naturalWidth === 0).length,
        };
      });
      log(`Result logos loaded (${resultImgStats.loaded}/${resultImgStats.total})`,
        resultImgStats.loaded > 0, `${resultImgStats.broken} broken`);

      await screenshot(page, "05-results-full");

      // ── 6. Filter buttons ─────────────────────────────────────────
      console.log("\n━━━ 6. Filter Controls ━━━");
      const filterBtns = await page.$$eval("button", btns =>
        btns
          .filter(b => ["All", "Cancel", "Keep", "Review", "الكل", "يُلغى", "يُبقى", "مراجعة"].some(t => b.textContent.includes(t)))
          .map(b => b.textContent.trim())
      );
      log("Filter buttons present", filterBtns.length >= 3, filterBtns.join(" | "));

      // ── 7. Privacy mode toggle ────────────────────────────────────
      console.log("\n━━━ 7. Privacy Mode ━━━");
      const privacyBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        return btns.find(b => b.textContent.includes("Hide") || b.textContent.includes("اخفِ"));
      });
      log("Privacy toggle found", !!privacyBtn.asElement());
    }

    // ── 8. Color system sanity check ──────────────────────────────
    console.log("\n━━━ 8. Color System ━━━");
    const colorCheck = await page.evaluate(() => {
      // React serializes hex colors as rgb() in inline styles
      // #1A3A35 = rgb(26, 58, 53)  |  #00A651 = rgb(0, 166, 81)
      const allStyles = Array.from(document.querySelectorAll("[style]")).map(el => el.getAttribute("style") || "").join(" ");
      const allClasses = Array.from(document.querySelectorAll("[class]")).map(el => el.getAttribute("class") || "").join(" ");
      const combined = (allStyles + " " + allClasses).toLowerCase();
      return {
        hasIndigo: combined.includes("indigo"),
        hasTeal: combined.includes("26, 58, 53") || combined.includes("1a3a35"),
        hasGreen: combined.includes("0, 166, 81") || combined.includes("00a651"),
      };
    });
    log("Dark teal #1A3A35 in use", colorCheck.hasTeal);
    log("Green #00A651 in use", colorCheck.hasGreen);
    log("No indigo class names", !colorCheck.hasIndigo);

  } finally {
    await browser.close();
  }

  console.log(`\n${"━".repeat(40)}`);
  console.log(`✅ Passed: ${passed}   ❌ Failed: ${failed}   Total: ${passed + failed}`);
  console.log(`📁 Screenshots saved to: ${SS_DIR}/`);
  console.log("━".repeat(40));

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
