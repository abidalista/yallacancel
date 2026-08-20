# AGENTS.md

## Cursor Cloud specific instructions

Product: **yallacancel** (aka "عبدالله ليستا") — an Arabic/Saudi subscription-audit landing app. A
user uploads bank-statement files (CSV/PDF), the app detects recurring subscriptions, and shows an
audit report with direct cancel links behind a one-time paywall. Stack details live in
`docs/STACK.md` and `docs/STRUCTURE.md`.

Single service: a Next.js 16 (App Router, Turbopack, React 19, Tailwind v4) app configured for
**static export** (`output: "export"` → `out/`) and deployed to Cloudflare Pages. Production API
lives in Cloudflare Pages Functions under `functions/api/*`; the mirrored dev-only route handlers are
under `src/app/api/*`.

Standard commands (defined in `package.json`):
- Dev server: `npm run dev` → http://localhost:3000
- Build (static export): `npm run build` → outputs `out/`
- Type-check: `npx tsc --noEmit` (clean; this is the de-facto static check here)

Non-obvious gotchas:
- `npm run lint` is BROKEN. Next.js 16 removed the `next lint` subcommand, and there is no ESLint
  config in the repo, so `next lint` just errors with "Invalid project directory ... /workspace/lint".
  Use `npx tsc --noEmit` for static verification instead.
- The build reports the `src/app/api/*` routes as `ƒ (Dynamic)` but the static export still succeeds;
  those routes are not part of the exported site (prod uses `functions/`).
- **No API keys are needed to exercise the core flow locally.** For CSV uploads the app parses and
  detects subscriptions fully client-side (`src/lib/services/*`, `analyzeTransactions`) and lands
  directly on the results page — no server call. The "AI deep scan" and PDF paths call the API routes
  which require `ANTHROPIC_API_KEY` / `LLAMA_CLOUD_API_KEY`; payments require Whop keys
  (`WHOP_API_KEY`, `WHOP_WEBHOOK_SECRET`). All are optional for local dev. See `.env.example`; set
  `NEXT_PUBLIC_DEV_UNLOCK=true` to unlock the full report without Whop.
- Testing tip: a CSV with recurring known merchants (e.g. Netflix, Spotify) that appear 2+ times with
  consistent **negative** amounts (single "Amount" column: negative = spend, positive = income and is
  skipped) produces "confirmed" subscriptions and skips the confirm step, going straight to results.
