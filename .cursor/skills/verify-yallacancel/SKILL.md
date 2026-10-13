---
name: verify-yallacancel
description: Drive the Yalla Cancel web app (Next.js, Arabic-first UI at /) the way a user does. Use to prove landing, demo scan, CSV upload, teaser results/paywall, cancel guides, or locale toggle. Do not use for production deploys or live Whop charges.
---

# Verify Yalla Cancel

Yalla Cancel is a Saudi subscription-audit site. The surface a user touches is the **web UI** (`src/app/page.tsx` at `/`, cancel-guide index at `/guides`, static `public/cancel-*.html` pages). There is no first-party CLI. Cloudflare Pages functions (`functions/api/*`) and `src/app/api/*` exist for PDF/AI/payment; a local CSV demo scan does **not** call them.

`scripts/ui-test.mjs` is a stale Puppeteer sketch (it waits for copy that is no longer on screen). Do not treat it as the harness.

## Launch

From the repo root, with a disposable verify dir so two runs do not share Chrome profiles or PIDs:

```bash
export YALLACANCEL_VERIFY_DIR=/tmp/yallacancel-verify-$RANDOM
export YALLACANCEL_VERIFY_PORT=4173
export YALLACANCEL_VERIFY_CDP_PORT=4174
# Leave NEXT_PUBLIC_DEV_UNLOCK unset. Do not load production secrets.
node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs launch
```

What launch does:

1. `npm install` only if `node_modules/next` is missing.
2. Starts `node_modules/.bin/next dev --hostname 127.0.0.1 --port $PORT` (empty data dir: there is no database; seed is `public/test-statement.csv`).
3. Waits until `GET http://127.0.0.1:$PORT/` is 200 and the body identifies Yalla Cancel (`yallacancel`, Arabic hero `اعرف وين تروح فلوسك كل شهر` in the RSC payload).
4. Starts a **separate** headless Chrome with `--user-data-dir=$YALLACANCEL_VERIFY_DIR/chrome-profile` and CDP on `$YALLACANCEL_VERIFY_CDP_PORT`.

Ready means the landing document is served **and** Chrome CDP `/json/version` answers. A process on the port without the app identity is not ready.

Default locale is Arabic (`<html lang="ar" dir="rtl">`). Client state lives in `localStorage` keys `yc_receipt` / `yc_unlocked` and `sessionStorage` `yc_report`. The isolated Chrome profile starts empty.

**Do not attach to an existing `:3000` (or any port you did not start).** Two instances: pick another `YALLACANCEL_VERIFY_PORT` + `YALLACANCEL_VERIFY_CDP_PORT` + `YALLACANCEL_VERIFY_DIR`. Sharing a Chrome profile or `localStorage` unlocks the teaser and invalidates proof.

Teardown: `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs cleanup` (see Cleanup).

## Doctor

Read-only. Run first whenever anything looks off:

```bash
node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs doctor
```

Pass requires all of:

- State file `$YALLACANCEL_VERIFY_DIR/state.json` present (this run started the instance).
- `nextPid` alive; `chromePid` alive.
- `GET $url/` HTTP 200 containing `yallacancel`.
- `GET $url/test-statement.csv` HTTP 200 containing `SPOTIFY PREMIUM`.
- CDP `http://127.0.0.1:$cdpPort/json/version` HTTP 200.

Prints JSON with `url`, `port`, `nextPid`, `chromePid`, `cdpPort`, `build`. Exit 2 on fail. Never drive a failing instance.

## Drive

Harness: Chrome CDP through `verify-yallacancel.mjs` (`browser` subcommands, or `drive demo-scan` for the mapped happy path). Prefer **visible button/link text**, `aria-label`, `input[type=file]`, and route paths. There are almost no `data-testid`s.

```bash
node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser goto /
node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser click --text "ما عندك كشف؟ جرّب مثال جاهز"
node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser wait --text "افتح · 49 SAR" --timeout 40000
node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser screenshot --path .cursor/skills/verify-yallacancel/artifacts/demo-scan/results.png
node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser snapshot --aria --path .cursor/skills/verify-yallacancel/artifacts/demo-scan/results.aria.txt
```

Stable handles from this repo:

| User control | Handle |
|---|---|
| Logo / home | button.nav-logo text `yallacancel`; guides header link `href="/"` |
| Cancel guides | header link text `أدلة الإلغاء` → `/guides` |
| Articles | header link text `المقالات` → `/blog` |
| Locale toggle | header button text `EN` (Arabic UI) or `ع` (English UI) |
| Demo scan | button `ما عندك كشف؟ جرّب مثال جاهز` (EN: `No statement handy? Try a sample`) |
| File picker | dropzone `role="button"`; real control `input[type=file][accept=".csv,.pdf"]` |
| Scan selected files | button `افحص الاشتراكات` |
| Confirm skip | button `تخطّى · روح للنتيجة` |
| Confirm continue | button `شوف المجموع ←` |
| Unlock teaser | button `افتح · 49 SAR` |
| Paywall close | button `aria-label="إغلاق"` |
| Start over | button `ابدأ من جديد` |
| Guides search | `input[placeholder*="ابحث"]` |
| Netflix guide | `/guides` card `href="/cancel-netflix.html"` |

CSV-only scans with local hits skip the server (`src/app/page.tsx`: no `analyzeStatementsWithAI` call). Expect ~3s upload pacing plus ~2.5s analyze pacing, then either the confirm step or teaser results.

Read `features/` before driving. A proof that only hits `/` is incomplete when the map lists `/guides`.

## Evidence

Store proof under `.cursor/skills/verify-yallacancel/artifacts/<feature-id>/`. Cleanup **must not** delete this directory.

Standards:

- Exercise the real user path (demo button, file input, header links). Do not set `yc_unlocked` / `yc_receipt` or call `/api/verify-payment` to fake a purchase.
- Capture the action and the resulting state (landing screenshot **and** results screenshot, plus an ARIA snapshot). Record `featureId` and the entry point in `proof.json`.
- Side effects: demo scan fetches `GET /test-statement.csv` (status 200). Teaser lock: 3 names visible, remaining rows `aria-label="مخفي"`. Confirm skip drops suspicious merchants; the 9 bundled confirmed subs still appear.
- Production boundaries: Whop checkout, Anthropic, and LlamaParse. Do not complete a live payment. Do not put API keys in the verify env. `NEXT_PUBLIC_DEV_UNLOCK=true` is a test-mode bypass; if you enable it, prove it by observing the `Dev unlock (no payment)` button **and** that `localStorage yc_unlocked` flips only after that click — never treat an unset flag as unlocked.
- `scripts/ui-test.mjs` is not evidence.

## Cleanup

```bash
node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs cleanup
```

Kills **only** `chromePid` and `nextPid` from `state.json`, then deletes `$YALLACANCEL_VERIFY_DIR` (Chrome profile, next.log, helper `node_lib`). It never `pkill next` / `pkill chrome`. Artifacts stay in `.cursor/skills/verify-yallacancel/artifacts/`. After cleanup, confirm those files still exist before calling the run a proof.

If launch/drive fails, run cleanup anyway so ports 4173/4174 are not stranded.

## Helpers

Script (executable): `.cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs`

| Command | Purpose |
|---|---|
| `launch` | Start isolated Next + Chrome CDP. Optional `--port` `--cdp-port`. |
| `doctor` | Read-only health JSON. Exit 2 if not worth driving. |
| `browser goto <path>` | Open a route on the launched origin. |
| `browser click --text "..."` | Click button/link by visible text or aria-label. |
| `browser fill --placeholder "ابحث" --value "Netflix"` | Type into an input. |
| `browser wait --text "..." [--timeout 40000]` | Wait until `document.body.innerText` contains the string. |
| `browser upload --file public/test-statement.csv` | Set `input[type=file]`. Then click `افحص الاشتراكات`. |
| `browser screenshot --path <file>` | Viewport PNG. |
| `browser snapshot --aria --path <file>` | Accessibility tree dump. |
| `browser storage-clear` | Clear yc_* storage on the current origin. |
| `drive demo-scan` | Full mapped demo-scan recipe + artifacts. |
| `cleanup` | Tear down PIDs from state.json only. |

Feature map: [features/README.md](features/README.md).

Keep the map honest as the app changes with `/maintain-verification-skill`.
