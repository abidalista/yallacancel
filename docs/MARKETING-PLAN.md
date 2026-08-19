# YallaCancel: 30-day sales mission

**Goal:** 10 paying users at 49 SAR. Not followers. Not uploads. Payments.

**Window:** 19 Aug to 18 Sep 2026  
**Channel (locked):** Arabic short-form on TikTok + Snapchat Spotlight  
**Not this month:** Meta ads, Instagram-as-primary, more product features, Pass the Product outreach mixed into this mission

Linear: [YallaCancel sales](https://linear.app/abidal/project/yallacancel-sales-d0bb0a9d3397)

**Stop. Product first.** Do not send WhatsApps or post videos until [ABI-147](https://linear.app/abidal/issue/ABI-147/blocker-prove-scan-and-pay-work-before-any-marketing) is Done.

- [ABI-137](https://linear.app/abidal/issue/ABI-137/30-day-yallacancel-sales-mission-10-payments) parent
- [ABI-147](https://linear.app/abidal/issue/ABI-147/blocker-prove-scan-and-pay-work-before-any-marketing) **gate: prove scan + pay work**
- [ABI-148](https://linear.app/abidal/issue/ABI-148/production-anthropic-key-is-invalid-401) production Claude key 401
- [ABI-149](https://linear.app/abidal/issue/ABI-149/phone-test-real-bank-files-end-to-end) phone test real bank files
- [ABI-138](https://linear.app/abidal/issue/ABI-138/week-0-conversion-patches-so-the-site-can-sell) conversion copy
- [ABI-140](https://linear.app/abidal/issue/ABI-140/week-0-30-asks-first-5-payments-by-hand) first 5 sales (blocked by 147)
- [ABI-142](https://linear.app/abidal/issue/ABI-142/days-8-to-30-23-arabic-short-form-videos) short-form (blocked by 147)
- [ABI-144](https://linear.app/abidal/issue/ABI-144/background-gsc-canonicals-10-guide-ctas) SEO background

There is a duplicate Linear project [YallaCancel GTM](https://linear.app/abidal/project/yallacancel-gtm-ef311ecc67ab) (ABI-139, 141, 143, 145, 146). Same mission. Use **YallaCancel sales** as source of truth.

---

## Gate (do this before any marketing)

Checked 19 Aug 2026 against live `yallacancel.com`:

- Paid AI scan is **dead**: `POST /api/analyze-statements` → Claude `401 API key is invalid`
- Local parser works on the synthetic `public/test-statement.csv` (9 subs). That is not a real bank export.
- CSV-only happy path skips the server. PDF path needs Claude + LlamaParse. That is the path that used to fail for you.
- After payment, 401 falls back to unblurring the local teaser. You would be selling an AI report people do not get.

Fix [ABI-148](https://linear.app/abidal/issue/ABI-148/production-anthropic-key-is-invalid-401) (you paste the key into GitHub/Cloudflare). Then [ABI-149](https://linear.app/abidal/issue/ABI-149/phone-test-real-bank-files-end-to-end) on a phone with real Al Rajhi / SNB files. Then marketing.

---

## Why you have 0 sales

Ship or Die’s diagnosis fits: the app is shipped, AI helped you build it, and almost nobody knows it exists.

That is half the story. The other half is conversion. Even if 12 people land on [yallacancel.com](https://yallacancel.com) today they see:

- Zero testimonials (`TESTIMONIALS` is an empty array)
- Three names for one product: Yalla Cancel, أبدالستا, Abidalista
- A pricing button that can open checkout before they have scanned anything
- Privacy copy that contradicts itself (on-device vs Claude + LlamaParse on the server)

Traffic without a reason to trust a bank-statement upload will not buy. So week 0 is **manual sales + trust**, then the 30-day channel is **short-form**.

---

## Channel pick (Ship or Die step 1)

Ship or Die gives three bets: SEO, short-form, Meta ads. Pick one.

| Channel | Fit for YallaCancel | Verdict |
|---|---|---|
| **Short-form** | Product is a 15-second screen recording. Saudi under-35s discover on TikTok. Snapchat is daily life in KSA. Feedback in days. | **The mission** |
| SEO | You already have 200+ `كيف ألغي X` pages. arabtoolbox.com is competing on the same queries. 30 days of SEO will not produce sale #1. | Background only: Search Console + 1 internal link pass. No new blog factory. |
| Meta ads | 49 SAR AOV. No pixel history. No social proof. Learning spend eats the margin. | After 10 sales and a winning organic video. Not before. |

Founder constraint from the Aug life review: Instagram is not the focus, X is. So Instagram is a **repost of the TikTok file**, not a third strategy. X is for the manual first-5, not daily volume.

Saudi platform facts used here (Creative Era 2026): TikTok is the discovery engine under 35. Snapchat has the deepest daily engagement. Arabic-first wins. Peak watch window is 9PM to 1AM KSA. Cross-post one video, do not invent unique content per app.

---

## North star and kill rules

**Pass the mission if any of these is true by 18 Sep:**

1. 10 Whop payments (490 SAR)
2. Or 5 payments **and** a short-form winner (one video 10x the median views of the others)

**Fail / change channel if:**

- 30 videos posted, median under 200 views, **and** still 0 payments from strangers
- Then switch the next 30 days to SEO (Ilias playbook: GSC, 10 SERP-matched pages, not 200 more stubs)

**Do not:** start ads to “fix” a dead organic account. Ads amplify a winner. They do not create one.

---

## Week 0 (days 1 to 3): make the site able to sell

Do this before posting. None of it is a rebuild.

1. **One name everywhere:** Yalla Cancel / يلا كانسل. Kill أبدالستا and Abidalista on the public site.
2. **Pricing CTA goes to upload**, not straight to Whop. People must see a teaser number before they pay.
3. **Honest privacy one-liner:** files are analyzed then discarded. Paid path uses AI. Nothing stored after the report.
4. **Price display:** `49 SAR` with Western digits (already the rule in `src/lib/format.ts`). Stop mixing `49 ريال` in Arabic UI.
5. **UTM + PostHog:** every bio link is `https://yallacancel.com/?utm_source=tiktok&utm_campaign=mission30`. Confirm `paywall_viewed` and `payment_completed` still fire.
6. **Scan your own 2 to 3 months** of SNB / Al Rajhi. Screenshot the yearly total with amounts visible, names blurred. This is your first 10 videos.
7. **Canonical domain:** pick `yallacancel.com` or `yallacancel.sa` and make every cancel-guide canonical match. Split domains waste the SEO you already built.

Linear: week-0 conversion issue in the project.

---

## Week 0 continued (days 1 to 7): first 5 payments, by hand

Every first-customer playbook agrees: sale 1 to 10 come from conversations, not channels. Ship or Die testimonials are the same story (Discord, a friend, day-1 DMs).

**Quota:** 30 personal asks in 7 days. Target 5 paid.

Who to ask (in order):

1. People you can WhatsApp who bank in KSA
2. X replies under KSA money / راتب / اشتراكات / نتفليكس threads (you already chose X over Instagram)
3. Ship or Die Discord if you are in it: “Arabic Rocket Money for Saudi banks, 49 SAR, I will sit on the scan with you”
4. One Saudi finance / personal-budget Telegram or WhatsApp group where you already have history. Help first. Pitch once.

**WhatsApp script (send as-is, swap the name):**

> يا [اسم]، بنيت yallacancel.com  
> ترفع كشف الراجحي أو الأهلي (آخر 2 إلى 3 أشهر) ويطلع كل الاشتراكات المتكررة + رابط إلغاء.  
> 49 SAR مرة واحدة. مو اشتراك.  
> أوقف معك على الواتس لو الملف تعبّر. تجرّبها اليوم؟

After they pay: ask for one sentence + permission to use a blurred screenshot. That fills the empty testimonials block. Without this, short-form sends people to a site that looks unlaunched.

Do **not** comp the 49 SAR away. A free user is not a customer. If they hesitate, sit on the scan with them. Do not discount.

---

## Days 8 to 30: the actual marketing mission

Jack Friks playbook (Ship or Die short-form course), applied:

| Step | What you do |
|---|---|
| Fresh accounts | New TikTok + Snapchat. Do not post from a dead personal brand. |
| Profile | Photo: product mark. Bio: “ارفع كشفك · شوف اشتراكاتك الناسية · yallacancel.com” |
| Warmup | 2 to 3 days as a real user in the niche (personal finance, Saudi apps, كشف حساب) before post 1. Avoid 0-view jail. |
| Cadence | **1 video per day** for 23 days. Same format until a winner. Then clone the winner. |
| CTA | Soft. Never “buy now” in the video. Last 2 seconds: “الرابط في البايو”. |
| Time | Publish 9PM to 1AM KSA. |
| Language | Spoken Najdi / Gulf + burned-in Arabic captions. English-only dies in this market. |

### The one format to beat to death

Screen recording, 12 to 20 seconds:

1. Hook (0 to 2s): a money number
2. Proof (2 to 12s): upload → list of Shahid / Hungerstation / iCloud / ChatGPT
3. Soft CTA (last 2s): bio link

Record in the TikTok app or CapCut. No logo sting. No music that fights the voiceover.

### 12 hooks (rotate, do not invent new formats)

1. “فتحت كشف الراجحي لشهرين. هذا الرقم ما كنت أتابعه.”
2. “3 اشتراكات سعودية الناس تنساها: هنقرستيشن برو، شاهد، iCloud.”
3. “راتبك ينزل الأحد. الاشتراكات تأكله الأثنين.”
4. “Apple.COM/BILL في الكشف؟ هذا مو عملية واحدة.”
5. “شاهد + نتفليكس + يوتيوب بريميوم في نفس الكشف. ليش الثلاثة؟”
6. “كيف تنزّل كشف CSV من تطبيق الراجحي في 30 ثانية.” (utility, then scan)
7. “49 SAR مرة واحدة مقابل كم تدفع بالسنة على ناسٍ.”
8. “ستجد اشتراك ملغي وما زال ينخصم. هذا الشكل في الكشف.”
9. “ChatGPT و Claude و Cursor في نفس البطاقة. هذا مو 'تجربة'.”
10. “ستيب: ارفع الملف. 90 ثانية. قائمة.cancel.”
11. “ليش مدى يشتغل وهنا ما فيه حساب.”
12. Clone whatever got 10x views. Change only the first line.

Hashtags: 3 to 5 max. `#السعودية #اشتراكات #كشف_حساب` plus one product tag. Not 20.

### Snapchat

Same file into Spotlight. Stories: 3 slides of the screenshot + “الرابط في البايو”. No extra editing.

### X (support, not the mission)

When a video works, post the same hook as a 3-line post with the link. Reply to راتب / غلاء / نتفليكس conversations with the utility (how to export a statement), not a dump of the product.

---

## What not to build during the 30 days

From `docs/BACKLOG.md`: HITL confirm step, spending report, FX polish, speed-to-90s. All real. All later.

Exception: if 5 people try to pay and **checkout or scan is broken**, fix that the same day. That is not a feature. That is the register being jammed.

---

## SEO (background, 60 min total)

You already did the Ilias “ship pages” step. The gap is measurement and cannibalization.

1. Verify Google Search Console on `yallacancel.com`.
2. Fix `.sa` vs `.com` canonicals on the cancel HTML pages.
3. On the 10 highest-intent guides (Netflix, Shahid, Hungerstation Pro, stc, YouTube Premium, iCloud, ChatGPT, Jahez Plus, Careem Plus, Noon VIP) add one line above the fold: “أو ارفع كشفك وكل الاشتراكات تطلع مرة واحدة” → homepage with UTM `seo_guide`.

Do not write 50 new posts this month. arabtoolbox already owns the long “كيف تلغي أي اشتراك” article. You win by **scan the statement**, not by out-writing a blog.

---

## Ads (explicitly later)

When you have:

- 10 payments
- A video that already gets views organically
- A landing page with at least 3 real quotes

Then run Snapchat ads first (lowest CPM in KSA for 18 to 30). Budget cap: 1,000 SAR. Kill if CAC > 49 SAR after 50 clicks. Meta is Nico’s course; use it only after Snapchat creative is proven.

---

## Daily 25-minute loop (after day 7)

1. 5 min: check yesterday’s views, profile visits, PostHog `file_uploaded` / `payment_completed`
2. 15 min: record today’s video (same format, new hook)
3. 5 min: post TikTok + Snap + (optional) X. Reply to every comment.

If you skip a day, post two the next day. Missing 4 days in a row = mission failed by process, not by market.

---

## Scoreboard (update in Linear twice a week)

| Metric | Day 7 | Day 21 | Day 30 |
|---|---|---|---|
| WhatsApp / X asks sent | 30 | — | — |
| Payments | 5 | 8 | 10 |
| Videos posted | 0 | 14 | 23 |
| Best video views | — | | |
| Uploads (PostHog `file_uploaded`) | | | |
| Paywall views | | | |
| Payments from bio link vs WhatsApp | | | |

Tag every sale: `whatsapp` / `tiktok` / `snap` / `x` / `seo`. If you cannot say where sale #6 came from, you will pick the wrong channel next month.

---

## Sources this plan stole from

- [Ship or Die marketing](https://www.ship-or-die.com/marketing#pricing): one channel, 30-day mission, 80/20 courses, proof in the real world, no “just post more”
- Jack Friks short-form curriculum: warmup, 0-view jail, find a winner, soft CTA, bio conversion
- Ilias Ism SEO curriculum: GSC first, match the SERP, do not spam AI posts (used only as background)
- Nico Jeannen Meta ads: economics before spend (used as a reason **not** to advertise at 49 SAR with 0 data)
- [Creative Era, KSA social 2026](https://creative-era.co/social-media-marketing-saudi-arabia-2026/): TikTok discovery, Snapchat daily use, Arabic-first, 9PM to 1AM
- First-customer playbooks (manual outreach before ads/SEO): conversations for 1 to 10, channels after
- Just Fucking Cancel positioning: sell the **list + cancel links**,  one-time low price, 2 to 3 months of statements, under 90 seconds
- Your own constraints: too many products, Instagram off, X on, Yalla Cancel still an active product (Aug life review)

---

## Start tomorrow morning

1. Send the WhatsApp script to 10 people before noon.
2. Record the Al Rajhi screen recording (hook #1) even if accounts are still warming up.
3. Check Linear [YallaCancel sales](https://linear.app/abidal/project/yallacancel-sales-d0bb0a9d3397) and move the week-0 issue to In Progress.
