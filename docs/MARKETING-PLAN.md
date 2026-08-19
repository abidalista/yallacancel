# YallaCancel: first 10 sales in 30 days

**North star:** 10 people pay 49 SAR. Proof, not scale.
**Channel bet:** founder-led sales this week, then Arabic short-form (Snapchat + TikTok + Reels).
**Not this month:** ads, new SEO pages, WhatsApp Maps outreach (that is Pass the Product).

Linear: [YallaCancel GTM](https://linear.app/abidal/project/yallacancel-gtm-ef311ecc67ab) · [plan doc](https://linear.app/abidal/document/first-10-sales-plan-8628c1b7dfc0)

| When | Issue |
|---|---|
| Now | [ABI-139](https://linear.app/abidal/issue/ABI-139) Week 0 conversion |
| Days 1 to 7 | [ABI-141](https://linear.app/abidal/issue/ABI-141) 10 conversations/day |
| Days 8 to 30 | [ABI-143](https://linear.app/abidal/issue/ABI-143) 1 video/day |
| 2 hrs/week | [ABI-145](https://linear.app/abidal/issue/ABI-145) SEO hygiene |
| Later | [ABI-146](https://linear.app/abidal/issue/ABI-146) Ads freeze |

---

## Why 0 sales

Ship or Die is right: the product shipped, almost nobody knows it exists.

Evidence from this repo + inbox (not vibes):

| Fact | What it means |
|---|---|
| ~150 cancel guides + blog exist | Distribution was attempted via SEO |
| Canonicals on those pages point to `yallacancel.sa` | `.sa` registration was never finished (Bluvalt, Feb 2026). Google is told the real URL is a dead domain |
| Sitemap and homepage use `yallacancel.com` | Split brain. Rankings cannot compound |
| No Google Search Console emails for this domain | You are flying blind. buildsaudi.co has GSC. this site does not |
| Testimonials array is empty | Strangers have no reason to upload a bank statement |
| Privacy copy fights itself | Hero: files deleted. Comparison table: "on your device". FAQ: Claude + LlamaParse on the server |
| Whop "first payment" email 6 Aug | Same day the unlock 404 was fixed. Treat as a founder test unless a stranger paid |
| Product work (JFC flow, parsers, Whop) was the focus | Marketing was never a 30-day mission |

0 sales is a distribution problem first. Conversion is the second leak. Fix both. Do not add more pages until people actually arrive.

---

## What we steal

### Ship or Die ([marketing#pricing](https://www.ship-or-die.com/marketing#pricing))

Their whole pitch is your situation: AI helped you ship, 12 visitors, 0 customers.

80/20:

1. Pick **one** channel
2. Learn from someone who already got customers with it
3. Run a 30-day mission with proof in the real world

Their three channels: SEO (Ilias Ism), short-form (Jack Friks), Meta ads (Nico Jeannen). Price is 399 to 449 USD. You do not need the course to use the shape. You do need the discipline: one channel, daily work, proof.

**Pick for YallaCancel:** Jack Friks short-form, localized to KSA (Snapchat is not optional here). SEO is a 2 hour/week repair job on assets you already built. Ads wait until strangers convert.

### Rocket Money / Truebill

They sold the same job: "you are paying for things you forgot."

Steal:

- UGC that looks like a normal TikTok, not an ad
- Hook = shock number ("I found 1,200 SAR/year I forgot")
- Demo the product on screen
- How-to-cancel articles for search (you already have these; they are currently broken)
- Snapchat + TikTok, not LinkedIn
- Do **not** copy their free-then-premium app. Your offer is 49 SAR once. Keep it. The teaser already is the free trial.

### Just Fucking Cancel

You already copied the product. Their GTM is English indie Twitter. That is not your market. Keep their offer shape: sell **cancel links + the list**, not "AI report". Price stays 49 SAR (Saudi, mada, one time).

### First 10 playbooks (indie)

First customers come from conversations, not launches. 10 WhatsApp messages beat a Product Hunt post. Charge. Free testers lie.

---

## The bet

YallaCancel is a B2C impulse tool. Pain is visual. KSA lives on Snapchat (about 89% of adults) and TikTok. Arabic dialect video is the native format.

```
Week 0   Fix conversion so a stranger can pay
Days 1-7 Unscalable: WhatsApp, X, friends. Get sales 1 to 3 + quotes
Days 8-30 Same 15-second videos, 1/day, on Snap + TikTok + Reels
Evenings 2 hrs/week: GSC + canonical fix so old SEO can start working
Never    Ads until 3 stranger payments and paywall click-to-pay is not zero
```

If day 14 has 0 stranger payments, do not "post more." Diagnose: no views vs views and no clicks vs clicks and no pay.

---

## Offer (do not change price)

**One time 49 SAR.** Unlock the full list + direct cancel links. Money back already on the page.

Do not discount. Do not add a subscription. Do not sell "AI".

Founder close for the first 10:

> ارفع كشف الراجحي حق آخر 3 شهور. في 90 ثانية أوريك كم يروح على اشتراكات ناسيها. التقرير كامل 49 SAR مرة واحدة. إذا ما لقيت شي يستاهل، أرجع لك الفلوس.

That is the whole pitch.

---

## Week 0: conversion (2 days, before traffic)

A visitor who does not trust a bank upload will never pay.

1. **One privacy sentence, everywhere.** Paid path uses the server. Say that. Drop "on your device" from the comparison table. Hero line can stay "files deleted after analysis" if that is true.
2. **3 quotes on the landing page.** Get them from the first WhatsApp scans. Name + city + "لقيت X SAR/year". Empty testimonials = dead page.
3. **Verify checkout.** Pay 49 SAR yourself on a clean phone. Confirm mada + Apple Pay. Whop emailed twice (Mar 8 and Mar 16) to turn Apple Pay on.
4. **Google Search Console** on `yallacancel.com`. Submit sitemap. This is the Ilias Ism lesson 2. You never did it.
5. **Canonicals.** Every `public/cancel-*.html` and `public/blog/*.html` currently canonicals to `https://yallacancel.sa/...`. Point them to `https://yallacancel.com/...`. Until this is done, the 150 guides cannot rank.

Copy rule for any new UI: Western digits + English units (`49 SAR`, `1,200 SAR/year`). Not `49 ريال`.

---

## Days 1 to 7: unscalable sales

Goal: **3 paying humans** who are not you.

Daily quota: **10 conversations**. Not posts. Conversations.

Where they are:

- WhatsApp: 30 people in KSA who have Netflix / Shahid / Apple / ChatGPT
- X: search `اشتراك`, `نتفليكس`, `شاهد`, `خصم`, `اشتراكات`. Reply with help, then the tool
- Family group chats: one message, then DM the people who react
- Sit next to someone, scan their statement together, take the 49 SAR

Script (send as-is):

```
عندك دقيقة؟

بنيت أداة تقرأ كشف البنك وتطلع كل الاشتراكات الشهرية مع رابط إلغاء.

49 SAR مرة واحدة. مو اشتراك.

إذا ترفع كشف آخر 3 شهور (CSV أو PDF من تطبيق الراجحي أو الأهلي) أوريك النتيجة. إذا ما عجبتك أرجع الفلوس.
```

After they scan: ask for a 1-line quote + permission to use it. That fills the empty testimonials.

Do not wait for a "launch". The first sale is a WhatsApp receipt.

---

## Days 8 to 30: short-form mission

This is the Ship or Die channel.

**Platforms (same video, 3 posts):** Snapchat Spotlight, TikTok, Instagram Reels. Snapchat first in KSA. Skip YouTube Shorts until one format wins.

**Account setup (Jack Friks, day 8):**

- Fresh accounts named for the job, not your face brand: `يلا كانسل` / `yallacancel`
- Bio: `ارفع كشفك · شوف اشتراكاتك الناسية · 49 SAR` + link
- Warmup 48 hours: watch, like, comment in the niche (فواتير، توفير، نتفليكس، شاهد) before posting sales videos
- Film vertical 9:16. Saudi dialect voice or big Arabic captions. No English-first ads

**Cadence:** 1 video/day for 22 days. Reuse the winner. Kill the rest.

**Soft CTA:** last 2 seconds: `الرابط في البايو` or `yallacancel.com`. No "buy now smash subscribe".

### 12 hooks to film (pick 10, shoot this weekend)

Each video: 0 to 2s hook, 8 to 12s proof, 2s CTA. Screen-record the real product when you can. Blur the statement.

1. **Shock number.** "لقيت 1,847 SAR/year تطلع من حسابي وما أدري." Show the teaser total.
2. **Apple.** "ليش أبل تخصم علي وأنا ما عندي إلا آيفون." Show Apple + iCloud + Apple TV rows.
3. **Trial trap.** "التجربة المجانية صارت اشتراك. هذا شكلها في الكشف."
4. **Shahid vs Netflix.** "تشوف شاهد ونتفليكس مع بعض؟ هذا كم يكلفك بالسنة."
5. **Hungerstation / Jahez / Careem.** "تطبيقات التوصيل فيها اشتراك وأنت ناسي."
6. **How to download Al Rajhi statement.** Teach first. Tool last. High save rate.
7. **How to download SNB / Alinma.** Same format, different bank. Saves become traffic.
8. **49 SAR vs 1,200 SAR/year.** Whiteboard math. Price objection, killed.
9. **Cancel in 30 seconds.** Click a real cancel link from the report.
10. **Before / after.** Screenshot of monthly total, then after 3 cancels.
11. **STC / Jawwy / extra packs.** Local, not US SaaS.
12. **Duets / stitches.** Reply to anyone complaining about a mystery card charge.

Winning format: double down for a week. Do not invent a 13th idea while a winner is still climbing.

---

## SEO: 2 hours a week, not a new content factory

Ilias Ism 80/20, applied to what you already have:

Mon: open GSC. Note indexed vs not. Request index on `/`, `/guides/`, top 20 Saudi cancel pages (Netflix, Shahid, Spotify, Apple, STC, ChatGPT, Hungerstation, Careem, Anghami, Jawwy).
Wed: one internal-link pass. Every guide CTA goes to `/` with "ارفع كشفك".
Fri: one keyword check. Search `الغاء نتفليكس`, `الغاء شاهد`, `اشتراكات مخفية`. If a competitor page is a listicle, match that shape. Do not write 50 more thin AI guides.

After canonicals are `.com`, these pages can actually rank. Until then, more content is waste.

---

## Ads: freeze

Nico's first Meta lessons are strategy, pixel, economics. Your unit economics:

- Price: 49 SAR
- Max CPA to stay sane: ~20 SAR
- You have 0 stranger conversions, so the pixel has nothing to learn

Turn ads on only after:

1. 3 payments from people who found you (not WhatsApp friends you sat with)
2. Paywall viewed → checkout started is not ~0 in PostHog
3. One organic video with comments asking "الرابط"

Then start with **Snapchat ads**, 20 SAR/day, using the winning organic video as the creative. Not a polished brand film.

---

## Scoreboard (check every Sunday)

| Week | Must be true | If not |
|---|---|---|
| 0 | Checkout works. GSC verified. Canonicals `.com`. Privacy copy honest | Do not drive traffic |
| 1 | 3 conversations/day. At least 1 paid or a written "no" with a reason | You are posting, not selling. Go back to WhatsApp |
| 2 | 1 video/day live on 3 apps. First quote on the site | If 0 views: warmup/accounts. If views and 0 site visits: bio/link |
| 3 | 1 winning format identified. 5+ site visits from social | Kill 11 hooks, clone the 1 |
| 4 | 10 payments **or** a clear diagnosis (trust / parse fail / paywall / no traffic) | Read PostHog funnel before changing the product |

PostHog already tracks `file_uploaded` → `analysis_completed` → `paywall_viewed` → `checkout_started` → `payment_completed`. Use that. Do not guess.

---

## Do not do

- New features instead of 10 conversations
- A second landing page before 3 sales
- English-only content
- Discount codes
- Whop marketplace as the growth plan (US audience, wrong job)
- Google Maps / salon WhatsApp (wrong product)
- 30 new blog posts
- "I will post when I have time"

---

## If you only do 3 things this week

1. Message 10 people on WhatsApp with the script above. Sit with 2 of them and scan.
2. Point every canonical from `yallacancel.sa` to `yallacancel.com`. Verify GSC.
3. Film hooks 1, 6, and 8. Post tomorrow on Snapchat Spotlight.

That is the whole plan. Everything else is optional until sale #1 exists.
