# Yalla Cancel verification map

This directory is the maintained source for verifying the user-facing behavior of Yalla Cancel. Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch with `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs launch` so Next listens on `http://127.0.0.1:4173` (or `$YALLACANCEL_VERIFY_PORT`) and Chrome uses `$YALLACANCEL_VERIFY_DIR/chrome-profile`.
- Seed file `public/test-statement.csv` is served at `/test-statement.csv` and contains `SPOTIFY PREMIUM`.
- `verify-yallacancel doctor` reports the expected URL, live `nextPid` / `chromePid`, and a 200 demo CSV.
- `NEXT_PUBLIC_DEV_UNLOCK` is unset. `yc_receipt` and `yc_unlocked` are empty in the Chrome profile.
- Never drive an instance that was not started by this verification run.

## Driving conventions

- Start every recipe from the baseline (Arabic landing at `/`) unless its preconditions say otherwise.
- Prefer visible names (`ما عندك كشف؟ جرّب مثال جاهز`, `افتح · 49 SAR`) and `aria-label` over CSS classes or coordinates.
- Treat every command as literal. Keep quoted Arabic copy unchanged.
- Run browser actions through `verify-yallacancel.mjs browser`.
- CSV demo is the safe local path. Do not complete Whop checkout. Do not add API keys to the verify environment.
- Cleanup removes the verify dir and processes from `state.json`. Do not remove proof artifacts.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes an ARIA snapshot and a screenshot with `yallacancel` visible in the header.
- Mutation proof (scan, locale, search) includes a second read of the rendered text after the action.
- Record the feature ID and entry point used with every artifact under `.cursor/skills/verify-yallacancel/artifacts/<feature-id>/`.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with verify-yallacancel` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Demo statement scan](./demo-scan.md) covers the bundled sample CSV from landing through confirm (if shown) to the locked teaser.
- [Statement upload](./statement-upload.md) covers picking a CSV, listing selected files, scanning, and rejecting a non CSV/PDF file.
- [Teaser results and paywall](./teaser-results.md) covers the 3-visible teaser, unlock CTA, paywall open/close, and start over.
- [Cancel guides](./cancel-guides.md) covers `/guides` search, category pills, and opening a static how-to page.
- [Locale toggle](./locale-toggle.md) covers switching the landing UI between Arabic and English.
