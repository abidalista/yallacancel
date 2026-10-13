# Demo statement scan

Demo statement scan lets a user run the bundled Al Rajhi CSV from the landing page without uploading a file, then reach the locked teaser with the recurring subscriptions from that sample.

## Sub-features

- `demo-open` starts a scan from the landing sample button in Arabic.
- `demo-progress` shows the uploading then analyzing screens before any result.
- `demo-confirm` offers skip/continue when the analyzer marks extra charges as unsure.
- `demo-teaser` shows the yearly total, three named subscriptions, locked rows, and `افتح · 49 SAR`.
- `demo-en` starts the same scan after switching the landing to English.

## How to get to it (user POV)

- On `/`, choose `ما عندك كشف؟ جرّب مثال جاهز`.
- Switch the header to English, then choose `No statement handy? Try a sample`.

## Driving it with verify-yallacancel

Preconditions:

- Yalla Cancel is healthy at `http://127.0.0.1:4173`.
- `verify-yallacancel doctor` reports the expected URL and that `/test-statement.csv` contains `SPOTIFY PREMIUM`.
- Chrome profile has empty `yc_unlocked` / `yc_receipt`.
- `NEXT_PUBLIC_DEV_UNLOCK` is unset.

- **Open landing.** Load `/`. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser goto /`. The heading reads `اعرف وين تروح فلوسك كل شهر` and the header shows `yallacancel`.
- **Start demo.** Choose the sample. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser click --text "ما عندك كشف؟ جرّب مثال جاهز"`. The button may show `نحمل المثال...`, then the page shows `جاري رفع الملفات...` and then an elapsed-seconds analyzing screen.
- **Confirm or skip.** If `تخطّى · روح للنتيجة` appears, the user can skip unsure charges. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser click --text "تخطّى · روح للنتيجة"`. If that button never appears, do not invent a skip; wait for results instead.
- **Teaser results.** Wait for the unlock CTA. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser wait --text "افتح · 49 SAR" --timeout 40000`. The heading contains `SAR/year`, at least one of `Adobe`, `ChatGPT`, `Netflix`, `Spotify`, or `شاهد` is named, extra rows use `aria-label="مخفي"`, and `ابدأ من جديد` is present.
- **English entry.** From a fresh landing (`browser storage-clear`, then `goto /`), choose `EN`, then `No statement handy? Try a sample`. The same teaser appears with `Unlock · 49 SAR` and `Start Over`.
- **One-shot proof.** Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs drive demo-scan`.
- **Proof.** Capture landing and teaser. Run `browser screenshot --path .cursor/skills/verify-yallacancel/artifacts/demo-scan/03-teaser-results.png` and `browser snapshot --aria --path .cursor/skills/verify-yallacancel/artifacts/demo-scan/03-teaser-results.aria.txt`. Both identify Yalla Cancel, `49 SAR`, and a known demo merchant.

## Gotchas

- `scripts/ui-test.mjs` waits for `شوف تقريري` / `View my report`. That copy is gone; the confirm CTA is `شوف المجموع ←` and skip is `تخطّى · روح للنتيجة`.
- Upload and analyze screens are paced (~3s + ~2.5s) and Framer Motion can leave the analyzing overlay in the DOM while results are already underneath. Wait until `افتح · 49 SAR` is a visible button, not merely present in `innerText`.
- The sample path is CSV-only and stays local. A hang of 60s+ means the client fell through to the AI server; stop and check that the file fetched was `/test-statement.csv`.
- Confirm is optional. Amazon-style one-off merchants may appear as unsure. Skipping them is still the demo journey; do not mark demo-scan failed only because confirm appeared.
- Teaser shows the **top 3 by monthly SAR**. Adobe / ChatGPT may outrank Netflix. Assert a known name plus locked rows, not a fixed first row.
- On a 390x844 viewport the unlock CTA sits below the fold. Scroll `افتح · 49 SAR` into view before treating it as visible; capture a full-page screenshot for proof.
- `drive demo-scan` already writes artifacts. Re-running it overwrites `artifacts/demo-scan/`.
- English entry is a second path. Do not report it proven if you only clicked the Arabic sample button.
