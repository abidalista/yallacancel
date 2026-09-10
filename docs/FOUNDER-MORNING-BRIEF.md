# Founder morning brief · first sales unblock

**Site:** https://yallacancel.com  
**Do not use:** yallacancel.sa (registration never finished)

This PR is product + SEO + trust. It is not another marketing essay. The 30 day GTM plan lives on PR #7.

---

## What changed in this PR

1. **Canonicals and absolute URLs** on ~150 cancel guides + blog now point to `https://yallacancel.com`. Footer/contact domains too.
2. **Guide CTAs** no longer send people to the design mock `preview-a.html`. Logo, back, footer Home, and “جرّب Yalla Cancel” go to `/`.
3. **Honest privacy copy** on landing, upload, comparison table, FAQ, JSON-LD, and a real `/privacy.html` (guides already linked here; the file was missing).
4. **No fake testimonials.** Empty array stays hidden until you have a real quote from a WhatsApp scan.
5. **PostHog** wired in the Next app (env vars, no token in git). Funnel events: `landing_view`, `upload_start`, `preview_shown`, `paywall_view`, `checkout_start`, `purchase_success`, `purchase_fail`.
6. **Price display** on landing uses `49 SAR` (Western digits + English unit), not `49 ريال`.

`preview-a.html` is a design mock. It is noindexed so it does not compete with `/`.

---

## Verify Google Search Console on `.com` (do this morning)

1. Open [Google Search Console](https://search.google.com/search-console).
2. Add property **URL prefix:** `https://yallacancel.com`.
3. Verify with DNS TXT or the HTML tag. Use the same Google account that owns the domain DNS.
4. After verify: **Sitemaps →** submit `https://yallacancel.com/sitemap.xml`.
5. URL Inspection → request index for `/`, `/guides`, `/privacy.html`, then the top KSA pages: Netflix, Shahid, Spotify, Apple, STC, ChatGPT, Hungerstation, Careem, Anghami, Jawwy.
6. Confirm Inspection shows canonical `https://yallacancel.com/...` not `.sa`.
7. Do **not** add `yallacancel.sa` as a property.

If GSC already exists for buildsaudi.co, that does not cover this domain. This site needs its own property.

---

## Deploy secrets (paid scan is dead without these)

Production `POST /api/analyze-statements` returns **500** if `ANTHROPIC_API_KEY` is missing. The UI then falls back to the weaker on-device parser. Do not drive WhatsApp traffic until this is green.

### GitHub Actions (this repo builds here, then deploys `out/` to Cloudflare Pages)

Repo → **Settings → Secrets and variables → Actions**. Required names:

| Secret | Used for |
|---|---|
| `ANTHROPIC_API_KEY` | Claude scan (`functions/api/analyze-statements.ts`) |
| `LLAMA_CLOUD_API_KEY` | PDF text when in-browser extract is too thin |
| `WHOP_API_KEY` | Payment verify |
| `CLOUDFLARE_API_TOKEN` | Pages deploy |
| `CLOUDFLARE_ACCOUNT_ID` | Pages deploy |
| `NEXT_PUBLIC_POSTHOG_KEY` | Client analytics (build-time; must be `phc_...`) |
| `NEXT_PUBLIC_POSTHOG_HOST` | Optional. Default `https://eu.i.posthog.com` |

Optional: `FOUNDER_ACCESS_TOKEN`, `WHOP_WEBHOOK_SECRET`.

The deploy workflow copies Anthropic / Llama / Whop into **Cloudflare Pages secrets** for the Functions. The PostHog key must be present **during `npm run build`** (GitHub secret), not only in Cloudflare, because `NEXT_PUBLIC_*` is baked into the static JS.

### Cloudflare Pages (Functions runtime)

Pages project `yallacancel` → Settings → Environment variables / secrets:

- `ANTHROPIC_API_KEY`
- `LLAMA_CLOUD_API_KEY`
- `WHOP_API_KEY`

Never commit keys. Never paste them into issues or this file.

### Smoke test after merge

1. Open https://yallacancel.com → upload a 2 to 3 month Al Rajhi CSV or PDF.
2. If the report is empty or clearly weaker than a known Claude scan, open DevTools → Network → `/api/analyze-statements`. `500` + `ANTHROPIC_API_KEY not configured` means the Pages secret is missing.
3. Pay 49 SAR on a clean phone (mada + Apple Pay). Confirm unlock.
4. PostHog EU project → Live events. You should see `landing_view` with host `yallacancel.com`. If you only still see buildsaudi.co, the `NEXT_PUBLIC_POSTHOG_KEY` was missing at build time. Re-run the deploy workflow after adding the secret.

---

## WhatsApp: send to 10 people today (copy as-is)

```
عندك دقيقة؟

بنيت أداة تقرأ كشف البنك وتطلع كل الاشتراكات الشهرية مع رابط إلغاء.

49 SAR مرة واحدة. مو اشتراك.

إذا ترفع كشف آخر 3 شهور (CSV أو PDF من تطبيق الراجحي أو الأهلي) أوريك النتيجة. إذا ما عجبتك أرجع الفلوس.

الرابط: https://yallacancel.com
```

Sit with 2 of them and scan. After they see the teaser, ask for one line you can put on the site (name + city + “لقيت X SAR/year”). Empty testimonials stay empty until that exists. Do not invent quotes.

---

## 3 videos to film today (Snapchat Spotlight first, then TikTok + Reels)

Vertical 9:16. Arabic captions. Blur the statement. Last 2 seconds: `yallacancel.com` or الرابط في البايو. Price stays 49 SAR.

### 1. Shock number (~15 sec)

**Hook (0 to 2s):** لقيت 1,200 SAR/year تطلع من حسابي وما أدري.  
**Proof:** Screen record the teaser total + 2 or 3 rows (Shahid / Netflix / Apple). Finger points at yearly.  
**CTA:** ارفع كشف الراجحي. 90 ثانية. الرابط في البايو.

### 2. How to download Al Rajhi statement (~20 sec)

**Hook:** تبي تعرف وش يخصم عليك كل شهر؟ كذا تنزّل الكشف من الراجحي.  
**Proof:** Open Al Rajhi app → الحسابات → كشف الحساب → آخر 3 شهور → PDF أو CSV. Then drop the file on yallacancel.com (blur amounts).  
**CTA:** الأداة تقرأ الملف وتطلّع الاشتراكات. 49 SAR مرة واحدة.

### 3. 49 SAR vs 1,200 SAR/year (~12 sec)

**Hook:** ليش أدفع 49 وأنا ممكن ألغي لحالي؟  
**Proof:** Whiteboard or notes: اشتراك ناسيه 100 SAR/mo = 1,200 SAR/year. الفحص 49 SAR مرة.  
**CTA:** إذا ما لقيت شي يستاهل، نرجع الفلوس. yallacancel.com

---

## After merge: 5 minute checklist

- [ ] GitHub secrets above are set (especially Anthropic + PostHog)
- [ ] Re-run **Deploy to Cloudflare Pages** if you added secrets after the last build
- [ ] GSC property + sitemap submitted
- [ ] Live scan works (Network 200 on `/api/analyze-statements`)
- [ ] PostHog live: host `yallacancel.com`
- [ ] 10 WhatsApp messages sent
- [ ] Three clips posted on Snapchat Spotlight
