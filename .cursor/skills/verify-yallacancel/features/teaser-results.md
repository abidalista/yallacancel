# Teaser results and paywall

Teaser results show the first three named subscriptions from a scan, hide the rest, and open a one-time `49 SAR` paywall. The user can dismiss the paywall or start over without paying.

## Sub-features

- `teaser-visible` names three subscriptions and a `SAR/year` total.
- `teaser-locked` marks remaining rows `مخفي` and shows a `+ N إضافية` line.
- `teaser-unlock` opens the paywall from `افتح · 49 SAR`.
- `teaser-dismiss` closes the paywall without unlocking.
- `teaser-startover` returns to the Arabic landing.

## How to get to it (user POV)

- Finish a demo scan or a CSV upload scan until the results list is on screen.
- On that list, choose `افتح · 49 SAR`.
- In the paywall, choose the close control, or click the dimmed backdrop.
- Choose `ابدأ من جديد`.

## Driving it with verify-yallacancel

Preconditions:

- Yalla Cancel is healthy at `http://127.0.0.1:4173`.
- A teaser is on screen (run [demo-scan](./demo-scan.md) first). `yc_unlocked` is not set.
- `NEXT_PUBLIC_DEV_UNLOCK` is unset, so `Dev unlock (no payment)` must **not** appear.

- **Read teaser.** On results, three merchant names are visible and further rows have `aria-label="مخفي"`. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser wait --text "افتح · 49 SAR"`. The page also contains `SAR/year` and `ابدأ من جديد`.
- **Open paywall.** Choose unlock. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser click --text "افتح · 49 SAR"`. A dialog heading `افتح باقي الاشتراكات` appears with price `49 SAR` and a pay button `ادفع · 49 SAR`.
- **Dismiss paywall.** Choose close. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser click --text "إغلاق"` (the control is `aria-label="إغلاق"`). The heading `افتح باقي الاشتراكات` is gone. Locked rows are still locked. `yc_unlocked` is still empty.
- **Start over.** Choose reset. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser click --text "ابدأ من جديد"`. The heading `اعرف وين تروح فلوسك كل شهر` returns.
- **Proof.** Capture paywall open, then dismissed teaser. Run `browser screenshot --path .cursor/skills/verify-yallacancel/artifacts/teaser-results/paywall.png` while the dialog is open, then after close `browser snapshot --aria --path .cursor/skills/verify-yallacancel/artifacts/teaser-results/still-locked.aria.txt`. The snapshot still has `مخفي` and `افتح · 49 SAR`.

## Gotchas

- Paywall is only opened from this teaser (`setShowPaywall(true)` once in `src/app/page.tsx`). The landing pricing block scrolls to `#upload` and must not open the modal. Do not report teaser-unlock proven from the pricing card.
- `49 SAR` uses Western digits and the English unit in Arabic UI. `49 ريال` is a product bug, not a locale feature.
- Do not click `ادفع · 49 SAR` in a proof run. That embeds Whop checkout (live payment). Opening the embed is not required to prove the modal.
- If `Dev unlock (no payment)` is visible, the instance was started with `NEXT_PUBLIC_DEV_UNLOCK=true`. That is not baseline. Relanch without the flag. Using the bypass requires a separate, labeled run that then checks `localStorage yc_unlocked`.
- Pasting a `pay_` receipt or founder code talks to `/api/verify-payment`. Without `WHOP_API_KEY` / `FOUNDER_ACCESS_TOKEN` that path must fail closed. Do not seed those secrets to make it pass.
- `src/components/AuditReport.tsx` filter chips (`الكل` / `يُلغى`) are not on the live results path. Do not drive them as this feature.
