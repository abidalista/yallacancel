#!/usr/bin/env node
/**
 * Verification helper for Yalla Cancel.
 * Drive the real Next.js app over Chrome CDP. Never kill by process name.
 *
 *   node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs launch
 *   node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs doctor
 *   node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser goto /
 *   node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser click --text "ما عندك كشف؟ جرّب مثال جاهز"
 *   node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs drive demo-scan
 *   node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs cleanup
 */
import { spawn, execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  chmodSync,
  openSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..");
const repoRoot = resolve(skillRoot, "../../..");
const artifactsRoot = join(skillRoot, "artifacts");

const DEFAULT_PORT = 4173;
const DEFAULT_CDP = 4174;
const HERO_AR = "اعرف وين تروح فلوسك كل شهر";
const HERO_EN = "See exactly where your money goes each month";
const DEMO_BTN_AR = "ما عندك كشف؟ جرّب مثال جاهز";
const SKIP_AR = "تخطّى · روح للنتيجة";
const UNLOCK_AR = "افتح · 49 SAR";
const START_OVER_AR = "ابدأ من جديد";
const DEMO_CSV_MARKER = "SPOTIFY PREMIUM";

function envDir() {
  return process.env.YALLACANCEL_VERIFY_DIR || "/tmp/yallacancel-verify";
}
function statePath() {
  return join(envDir(), "state.json");
}
function readState() {
  const p = statePath();
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8"));
}
function writeState(state) {
  mkdirSync(envDir(), { recursive: true });
  writeFileSync(statePath(), JSON.stringify(state, null, 2));
}
function pidAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
function portPids(port) {
  try {
    const out = execFileSync("ss", ["-ltnp"], { encoding: "utf8" });
    const pids = new Set();
    for (const line of out.split("\n")) {
      if (!line.includes(`:${port} `) && !line.includes(`:${port}\n`)) {
        if (!new RegExp(`:${port}\\s`).test(line)) continue;
      }
      for (const m of line.matchAll(/pid=(\d+)/g)) pids.add(Number(m[1]));
    }
    return [...pids];
  } catch {
    return [];
  }
}
function chromePath() {
  for (const c of [
    process.env.CHROME_PATH,
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/local/bin/google-chrome",
    "/usr/local/bin/chrome",
  ]) {
    if (c && existsSync(c)) return c;
  }
  throw new Error("Chrome not found. Set CHROME_PATH.");
}
async function waitForHttp(url, { timeoutMs = 90_000, test } = {}) {
  const start = Date.now();
  let last = "";
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      const body = await res.text();
      last = `${res.status} ${body.slice(0, 120)}`;
      if (res.ok && (!test || test(res.status, body))) return { status: res.status, body };
    } catch (err) {
      last = String(err.message || err);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timeout waiting for ${url} (${last})`);
}
function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) out[key] = true;
      else {
        out[key] = next;
        i++;
      }
    } else out._.push(a);
  }
  return out;
}

async function launch(args) {
  const existing = readState();
  if (existing && pidAlive(existing.nextPid)) {
    throw new Error(
      `Already running pid=${existing.nextPid} url=${existing.url}. Run cleanup first or pick another YALLACANCEL_VERIFY_DIR.`
    );
  }
  const port = Number(args.port || process.env.YALLACANCEL_VERIFY_PORT || DEFAULT_PORT);
  const cdpPort = Number(args["cdp-port"] || process.env.YALLACANCEL_VERIFY_CDP_PORT || DEFAULT_CDP);
  const owners = portPids(port);
  if (owners.length) {
    throw new Error(`Port ${port} already owned by pid(s) ${owners.join(",")}. Refuse to share.`);
  }
  if (!existsSync(join(repoRoot, "node_modules", "next"))) {
    console.error("Installing npm dependencies (node_modules missing)...");
    execFileSync("npm", ["install"], { cwd: repoRoot, stdio: "inherit" });
  }

  mkdirSync(envDir(), { recursive: true });
  const nextLog = join(envDir(), "next.log");
  const chromeLog = join(envDir(), "chrome.log");
  const chromeProfile = join(envDir(), "chrome-profile");
  mkdirSync(chromeProfile, { recursive: true });
  const nextLogFd = openSync(nextLog, "w");
  const nextBin = join(repoRoot, "node_modules", ".bin", "next");
  const next = spawn(
    nextBin,
    ["dev", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        PORT: String(port),
        // Keep the real teaser lock. Do not invent payment.
        NEXT_PUBLIC_DEV_UNLOCK: "",
        BROWSER: "none",
      },
      detached: true,
      stdio: ["ignore", nextLogFd, nextLogFd],
    }
  );
  next.unref();

  const url = `http://127.0.0.1:${port}`;
  try {
    await waitForHttp(url, {
      timeoutMs: 120_000,
      test: (_s, body) =>
        body.toLowerCase().includes("yallacancel") &&
        (body.includes(HERO_AR) || body.includes("yallacancel")),
    });
  } catch (err) {
    try {
      process.kill(next.pid, "SIGTERM");
    } catch {
      /* ignore */
    }
    throw err;
  }

  const chromeLogFd = openSync(chromeLog, "w");
  const chrome = spawn(
    chromePath(),
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${chromeProfile}`,
      "--window-size=390,844",
      "--lang=ar",
      "about:blank",
    ],
    {
      detached: true,
      stdio: ["ignore", chromeLogFd, chromeLogFd],
    }
  );
  chrome.unref();

  await waitForHttp(`http://127.0.0.1:${cdpPort}/json/version`, { timeoutMs: 20_000 });

  const state = {
    url,
    port,
    cdpPort,
    nextPid: next.pid,
    chromePid: chrome.pid,
    chromeProfile,
    repoRoot,
    startedAt: new Date().toISOString(),
  };
  writeState(state);
  console.log(`ready url=${url} nextPid=${next.pid} chromePid=${chrome.pid} cdp=${cdpPort}`);
}

function requireState() {
  const state = readState();
  if (!state) throw new Error(`No state at ${statePath()}. Run launch first.`);
  return state;
}

async function doctor() {
  const state = requireState();
  const problems = [];
  if (!pidAlive(state.nextPid)) problems.push(`next pid ${state.nextPid} is dead`);
  const owners = portPids(state.port);
  if (!owners.length) problems.push(`port ${state.port} has no listener`);
  else if (!owners.includes(state.nextPid) && !owners.some((p) => pidAlive(p))) {
    problems.push(`port ${state.port} owned by dead pid(s) ${owners.join(",")}`);
  } else if (!owners.includes(state.nextPid)) {
    // next often listens via a child thread/process; require our pid still alive.
    if (!pidAlive(state.nextPid)) {
      problems.push(`port ${state.port} owned by ${owners.join(",")} and nextPid ${state.nextPid} is dead`);
    }
  }
  let landing = "";
  try {
    const res = await fetch(state.url);
    landing = await res.text();
    if (!res.ok) problems.push(`GET / HTTP ${res.status}`);
    if (!landing.toLowerCase().includes("yallacancel")) problems.push("GET / missing yallacancel");
    if (!landing.includes(HERO_AR) && !landing.includes("yallacancel")) {
      problems.push("GET / missing hero/app identity");
    }
  } catch (err) {
    problems.push(`GET / failed: ${err.message}`);
  }
  try {
    const csvRes = await fetch(`${state.url}/test-statement.csv`);
    const csv = await csvRes.text();
    if (!csvRes.ok) problems.push(`GET /test-statement.csv HTTP ${csvRes.status}`);
    if (!csv.includes(DEMO_CSV_MARKER)) problems.push("demo CSV missing SPOTIFY PREMIUM");
  } catch (err) {
    problems.push(`demo CSV failed: ${err.message}`);
  }
  try {
    const v = await fetch(`http://127.0.0.1:${state.cdpPort}/json/version`);
    if (!v.ok) problems.push(`CDP HTTP ${v.status}`);
  } catch (err) {
    problems.push(`CDP down: ${err.message}`);
  }
  if (!pidAlive(state.chromePid)) problems.push(`chrome pid ${state.chromePid} is dead`);

  const report = {
    ok: problems.length === 0,
    url: state.url,
    port: state.port,
    nextPid: state.nextPid,
    chromePid: state.chromePid,
    cdpPort: state.cdpPort,
    build: "next dev (repo working tree)",
    demoCsv: "/test-statement.csv",
    problems,
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exit(2);
  return report;
}

function ensurePuppeteer() {
  const libDir = join(envDir(), "node_lib");
  mkdirSync(libDir, { recursive: true });
  const pkg = join(libDir, "node_modules", "puppeteer-core", "package.json");
  if (!existsSync(pkg)) {
    if (!existsSync(join(libDir, "package.json"))) {
      writeFileSync(
        join(libDir, "package.json"),
        JSON.stringify({ name: "yallacancel-verify-lib", private: true }, null, 2)
      );
    }
    execFileSync("npm", ["install", "--no-fund", "--no-audit", "puppeteer-core@24.2.0"], {
      cwd: libDir,
      stdio: "inherit",
    });
  }
  const require = createRequire(join(libDir, "package.json"));
  return require("puppeteer-core");
}

async function withPage(fn) {
  const state = requireState();
  const puppeteer = ensurePuppeteer();
  const browser = await puppeteer.connect({
    browserURL: `http://127.0.0.1:${state.cdpPort}`,
    defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2 },
  });
  try {
    let page = (await browser.pages())[0];
    if (!page) page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    return await fn(page, state);
  } finally {
    browser.disconnect();
  }
}

function visibleText(page) {
  return page.evaluate(() => document.body?.innerText || "");
}

async function clickText(page, text) {
  const found = await page.evaluate((needle) => {
    const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
    const want = norm(needle);
    const els = Array.from(document.querySelectorAll("button, a, [role='button'], input[type='button']"));
    const el = els.find((e) => norm(e.textContent).includes(want) || norm(e.getAttribute("aria-label") || "").includes(want));
    if (!el) return false;
    el.click();
    return true;
  }, text);
  if (!found) throw new Error(`No clickable element containing ${JSON.stringify(text)}`);
}

async function waitText(page, text, timeout = 30_000) {
  await page.waitForFunction(
    (needle) => (document.body?.innerText || "").includes(needle),
    { timeout },
    text
  );
}

function flattenAria(node, lines = [], depth = 0) {
  if (!node) return lines;
  const name = node.name || "";
  const role = node.role || "";
  lines.push(`${"  ".repeat(depth)}${role}${name ? `: ${name}` : ""}`);
  for (const c of node.children || []) flattenAria(c, lines, depth + 1);
  return lines;
}

async function browserCmd(args) {
  const sub = args._[1];
  if (!sub) throw new Error("browser <goto|click|fill|wait|upload|screenshot|snapshot|eval|storage-clear>");
  return withPage(async (page, state) => {
    if (sub === "goto") {
      const path = args._[2] || "/";
      const url = path.startsWith("http") ? path : `${state.url}${path.startsWith("/") ? path : `/${path}`}`;
      await page.goto(url, { waitUntil: "networkidle0", timeout: 30_000 });
      console.log(`goto ${page.url()}`);
      return;
    }
    if (sub === "click") {
      if (!args.text) throw new Error('browser click --text "..."');
      await clickText(page, args.text);
      console.log(`clicked ${JSON.stringify(args.text)}`);
      return;
    }
    if (sub === "fill") {
      const value = args.value ?? "";
      if (args.placeholder) {
        const handle = await page.$(`input[placeholder*="${args.placeholder}"]`);
        if (!handle) throw new Error(`No input placeholder containing ${args.placeholder}`);
        await handle.click({ clickCount: 3 });
        await handle.type(value, { delay: 20 });
      } else if (args.selector) {
        await page.type(args.selector, value, { delay: 20 });
      } else {
        throw new Error("browser fill --placeholder ... --value ...");
      }
      console.log("filled");
      return;
    }
    if (sub === "wait") {
      if (!args.text) throw new Error("browser wait --text ...");
      await waitText(page, args.text, Number(args.timeout || 30_000));
      console.log(`saw ${JSON.stringify(args.text)}`);
      return;
    }
    if (sub === "upload") {
      const file = resolve(repoRoot, args.file || "public/test-statement.csv");
      const input = await page.$('input[type="file"]');
      if (!input) throw new Error("No input[type=file]");
      await input.uploadFile(file);
      console.log(`uploaded ${file}`);
      return;
    }
    if (sub === "screenshot") {
      const path = args.path;
      if (!path) throw new Error("browser screenshot --path ...");
      mkdirSync(dirname(resolve(path)), { recursive: true });
      await page.screenshot({ path: resolve(path), fullPage: false });
      console.log(`screenshot ${resolve(path)}`);
      return;
    }
    if (sub === "snapshot") {
      const path = args.path;
      if (!path) throw new Error("browser snapshot --aria --path ...");
      const snap = await page.accessibility.snapshot({ interestingOnly: false });
      mkdirSync(dirname(resolve(path)), { recursive: true });
      const text = flattenAria(snap).join("\n");
      writeFileSync(resolve(path), text);
      console.log(`snapshot ${resolve(path)}`);
      return;
    }
    if (sub === "eval") {
      const js = args.js;
      if (!js) throw new Error("browser eval --js ...");
      const result = await page.evaluate(js);
      console.log(typeof result === "string" ? result : JSON.stringify(result, null, 2));
      return;
    }
    if (sub === "storage-clear") {
      await page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {
          /* ignore */
        }
      });
      console.log("storage cleared");
      return;
    }
    if (sub === "text") {
      console.log(await visibleText(page));
      return;
    }
    throw new Error(`Unknown browser subcommand ${sub}`);
  });
}

async function driveDemoScan() {
  const doctorReport = await doctor();
  const outDir = join(artifactsRoot, "demo-scan");
  mkdirSync(outDir, { recursive: true });
  const result = await withPage(async (page, state) => {
    await page.goto(state.url + "/", { waitUntil: "networkidle0", timeout: 30_000 });
    await page.evaluate(() => {
      try {
        localStorage.removeItem("yc_receipt");
        localStorage.removeItem("yc_unlocked");
        sessionStorage.clear();
      } catch {
        /* ignore */
      }
    });
    await page.reload({ waitUntil: "networkidle0" });
    await waitText(page, HERO_AR, 20_000);
    await page.screenshot({ path: join(outDir, "01-landing.png") });
    await clickText(page, DEMO_BTN_AR);

    const outcome = await page.waitForFunction(
      () => {
        const t = document.body?.innerText || "";
        if (t.includes("تخطّى · روح للنتيجة") || t.includes("شوف المجموع")) return "confirm";
        if (t.includes("افتح · 49 SAR") || t.includes("ابدأ من جديد")) return "results";
        if (t.includes("جاري رفع الملفات") || t.includes("Deep scan") || t.includes("فحص عميق")) return "busy";
        return false;
      },
      { timeout: 40_000 }
    );
    let stage = await outcome.jsonValue();
    const busyUntil = Date.now() + 40_000;
    while (stage === "busy" && Date.now() < busyUntil) {
      await new Promise((r) => setTimeout(r, 500));
      stage = await page.evaluate(() => {
        const t = document.body?.innerText || "";
        if (t.includes("تخطّى · روح للنتيجة") || t.includes("شوف المجموع")) return "confirm";
        if (t.includes("افتح · 49 SAR") || t.includes("ابدأ من جديد")) return "results";
        if (t.includes("جاري رفع الملفات") || t.includes("Deep scan") || t.includes("فحص عميق") || /\d+s/.test(t))
          return "busy";
        return "unknown";
      });
    }
    if (stage === "confirm") {
      await page.screenshot({ path: join(outDir, "02-confirm.png") });
      await clickText(page, SKIP_AR);
      await waitText(page, UNLOCK_AR, 20_000);
    } else if (stage !== "results") {
      const t = await visibleText(page);
      throw new Error(`Did not reach confirm or results. Last stage=${stage}\n${t.slice(0, 800)}`);
    }

    await waitText(page, UNLOCK_AR, 15_000);
    await waitText(page, START_OVER_AR, 5_000);
    const text = await visibleText(page);
    const checks = {
      heroGone: !text.includes(HERO_AR),
      yearly: /SAR\/year/.test(text),
      unlock: text.includes(UNLOCK_AR),
      startOver: text.includes(START_OVER_AR),
      knownSub: /Adobe|ChatGPT|Netflix|Spotify|شاهد/.test(text),
      hiddenCount: await page.evaluate(
        () => document.querySelectorAll('[aria-label="مخفي"]').length
      ),
    };
    await page.screenshot({ path: join(outDir, "03-teaser-results.png") });
    const snap = await page.accessibility.snapshot({ interestingOnly: false });
    writeFileSync(join(outDir, "03-teaser-results.aria.txt"), flattenAria(snap).join("\n"));
    writeFileSync(join(outDir, "03-teaser-results.txt"), text);
    const failed = Object.entries(checks)
      .filter(([k, v]) => (k === "hiddenCount" ? !(v > 0) : !v))
      .map(([k]) => k);
    if (failed.length) {
      throw new Error(`demo-scan assertions failed: ${failed.join(", ")}\n${text.slice(0, 1200)}`);
    }
    return { stage, checks, url: page.url() };
  });

  const proof = {
    featureId: "demo-scan",
    entryPoint: "landing demo button",
    provenAt: new Date().toISOString(),
    doctor: { url: doctorReport.url, port: doctorReport.port, nextPid: doctorReport.nextPid },
    result,
    artifacts: [
      "01-landing.png",
      "03-teaser-results.png",
      "03-teaser-results.aria.txt",
      "03-teaser-results.txt",
    ],
  };
  writeFileSync(join(outDir, "proof.json"), JSON.stringify(proof, null, 2));
  console.log(JSON.stringify(proof, null, 2));
  console.log(`evidence ${outDir}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function cleanup() {
  const state = readState();
  if (!state) {
    console.log("nothing to clean (no state file)");
    return;
  }
  for (const pid of [state.chromePid, state.nextPid]) {
    if (pidAlive(pid)) {
      try {
        process.kill(pid, "SIGTERM");
      } catch {
        /* ignore */
      }
    }
  }
  for (let i = 0; i < 20; i++) {
    if (!pidAlive(state.nextPid) && !pidAlive(state.chromePid)) break;
    await sleep(100);
  }
  for (const pid of [state.chromePid, state.nextPid]) {
    if (pidAlive(pid)) {
      try {
        process.kill(pid, "SIGKILL");
      } catch {
        /* ignore */
      }
    }
  }
  // Scratch only. Evidence in artifacts/ survives.
  rmSync(envDir(), { recursive: true, force: true });
  console.log(`cleaned pids next=${state.nextPid} chrome=${state.chromePid}; artifacts kept at ${artifactsRoot}`);
}

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0];
try {
  chmodSync(fileURLToPath(import.meta.url), 0o755);
} catch {
  /* ignore */
}

const run = async () => {
  if (cmd === "launch") return launch(args);
  if (cmd === "doctor") return doctor();
  if (cmd === "browser") return browserCmd(args);
  if (cmd === "drive") {
    const feature = args._[1];
    if (feature === "demo-scan") return driveDemoScan();
    throw new Error(`No drive recipe for ${feature}. Use features/ and browser commands.`);
  }
  if (cmd === "cleanup") return cleanup();
  throw new Error(
    "Usage: launch | doctor | browser ... | drive demo-scan | cleanup"
  );
};

run().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
