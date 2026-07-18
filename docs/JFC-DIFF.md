# JFC vs YallaCancel — Feature / UX Diff Log

Source: Just Fucking Cancel (justfuckingcancel.com) screenshots vs current YallaCancel production.
Purpose: decide later what to keep vs adopt. Arabic = our only intended language difference for shared patterns.

Status key:
- **THEIR** = JFC has it, we don't (or we do it differently)
- **OURS** = we have it, they don't
- **BOTH** = similar idea, different execution
- **DECIDE** = open choice for you

---

## 1. Upload

| # | Diff | JFC | YallaCancel | Status |
|---|------|-----|-------------|--------|
| 1.1 | Brand voice | “just fucking cancel” · blunt English | Mint green · Arabic-first product | KEEP brand (ours) |
| 1.2 | Drop zone copy | “Drop your last **2-3 months** of statements” | “ارفع كشوفاتك البنكية” + PDF/CSV/25 MB | **DECIDE** — adopt “2–3 months” guidance in Arabic |
| 1.3 | Time expectation | “Takes under 90 seconds” on upload | No time promise on upload | **THEIR** |
| 1.4 | Ideal-range warning | Orange: “2-3 months is ideal. More data won't improve results and may show cancelled subscriptions.” | None | **THEIR** — high value |
| 1.5 | File list | “5 file(s) selected” + full name + size + X | Count + total size + truncated names | **BOTH** |
| 1.6 | Primary CTA | “Scan for subscriptions” | “حلل N ملفات” | **DECIDE** copy |
| 1.7 | Privacy line | “Your files are analyzed and immediately discarded. Nothing is stored.” | Free = browser · paid = AI upload after pay | **DIFF** — theirs is simpler; ours is more honest about paid AI |
| 1.8 | Sample / demo | Not shown in screenshots | “جرب بمثال جاهز” | **OURS** |

**Arabic if we copy 1.2–1.4:**
- ارفع كشوفات آخر 2 إلى 3 أشهر
- يأخذ أقل من 90 ثانية
- مثالي: 2 إلى 3 أشهر. زيادة الشهور ما تحسّن النتيجة وقد تطلع اشتراكات ملغاة

---

## 2. Uploading / analyzing screen

| # | Diff | JFC | YallaCancel | Status |
|---|------|-----|-------------|--------|
| 2.1 | First phase | “Uploading files…” + privacy pill “Your files are never stored.” | Jump straight into analyze | **THEIR** — dedicated upload phase |
| 2.2 | Big number | **Transaction count** (e.g. 1,282) while scanning | Free: tx count · Paid AI: file `3/6` | **THEIR** — always show txs when known |
| 2.3 | Status copy | “Deep scan starting… (this takes 30-90 seconds)” | “تحليل AI · ملف X من Y” / reading files | **THEIR** — clearer expectation |
| 2.4 | Elapsed timer | Live **4s** counter | No timer | **THEIR** |
| 2.5 | Stay-on-page | “Almost there - stay on this page” | Similar clock badge | **BOTH** |
| 2.6 | Layout | Dashed border work box · minimal · white | Mint page + skeleton cards | **DECIDE** visual |
| 2.7 | Privacy on analyze | Padlock badge during upload | None on analyze | **THEIR** |

**Arabic if we copy:**
- جاري رفع الملفات…
- ملفاتك ما تنحفظ
- فحص عميق يبدأ الآن (30 إلى 90 ثانية)
- تقريباً خلصنا · ابقَ في الصفحة

---

## 3. Human-in-the-loop (uncertain charges)

| # | Diff | JFC | YallaCancel | Status |
|---|------|-----|-------------|--------|
| 3.1 | Confirm step | **Yes** — “Found 6 clear… Help identify 5 more” | **No** — auto report only | **THEIR** — biggest product gap |
| 3.2 | Per item | Raw bank text + AI blurb + count (x2) | Not shown in teaser | **THEIR** |
| 3.3 | Actions | Subscription / Not a subscription / Don't know | None | **THEIR** |
| 3.4 | Proceed options | “See your total” or “Skip, use 6 found” | N/A | **THEIR** |
| 3.5 | Edit warning | “Take your time — you can't edit these later.” | N/A | **THEIR** |

**Arabic if we copy:**
- لقينا 6 اشتراكات واضحة
- ساعدنا نحدد 5 إضافية
- اشتراك / مو اشتراك / ما أدري
- شوف المجموع ← · تخطّى واستخدم الـ 6

---

## 4. Results / teaser + paywall

| # | Diff | JFC | YallaCancel | Status |
|---|------|-----|-------------|--------|
| 4.1 | Headline | “You're spending **$1,240/year**” | “تصرف **X ريال/شهر**” | **DECIDE** — year vs month |
| 4.2 | Subline | “across 7 subscriptions” | معاينة سريعة · count · txs · files | **BOTH** (ours denser) |
| 4.3 | Currency in list | **Mixed native** (€210/yr, $316/yr) | All converted to **ريال/شهر** | **DECIDE** — show native vs SAR |
| 4.4 | Free unlock depth | Top expensive visible + Cancel links; rest blurred + padlock | Top **3** visible; rest blur; amounts visible | **BOTH** freemium |
| 4.5 | Free Cancel links | Yes on unlocked rows | Cancel only after full unlock | **THEIR** stronger teaser |
| 4.6 | “+ N more” | Logos strip (Spotify/Netflix) + yearly | Text + monthly SAR | **THEIR** polish |
| 4.7 | Paywall pitch | “Direct cancel links for all 7…” | تقرير AI كامل / يحلل كل الملفات | **DIFF** — they sell **cancel links**; we sell **AI full report** |
| 4.8 | Price | **$5** one-time | **49 ريال** one-time | **OURS** (market) |
| 4.9 | Checkout | **Stripe** + Google Pay + **currency picker** (USD / PLN etc.) | **Whop** · SAR · mada/Visa/Apple Pay | **DECIDE** infra |
| 4.10 | Account | “One-time. No account needed.” | Same idea | **BOTH** |
| 4.11 | Start over | Yes | نعم · ابدأ من جديد | **BOTH** |

---

## 5. Analysis engine / product logic (from behavior, not code)

| # | Diff | JFC | YallaCancel | Status |
|---|------|-----|-------------|--------|
| 5.1 | Confidence tiers | Clear vs unsure → user confirms | Local heuristic + paid Claude; no confirm UI | **THEIR** |
| 5.2 | Multi-currency | Keeps €/$ in UI; converts for totals carefully | Force SAR (FX bug fixed recently) | **DECIDE** display |
| 5.3 | Variable amounts | Notes “amounts vary (€14, €45…)” | Single average amount | **THEIR** |
| 5.4 | Raw descriptors | Shown on unsure cards | Hidden in teaser | **THEIR** |
| 5.5 | Speed promise | 30–90s deep scan | Often longer (per-file Claude + LlamaParse PDFs) | **GAP** — need to match speed or change promise |
| 5.6 | Ideal data volume | Warns against too many months | Accepts large mixes without guidance | **THEIR** |

---

## 6. What we have that they don’t (keep unless you say cut)

| Ours | Note |
|------|------|
| Arabic RTL product | Core ICP |
| Free **local** preview (no API cost until pay) | Protects Anthropic spend |
| Founder access code | Phone testing |
| Saudi bank parsers (SNB, etc.) + Revolut/Crypto.com CSV | Local teaser |
| Cancel guides / blog / SEO pages | Distribution |
| Spending breakdown (paid) | Extra |
| 49 SAR Whop + mada | Local payments |

---

## Suggested decision batches (for later)

### Batch A — Low effort, high clarity (copy/UX only)
- [ ] 1.2 + 1.4 Ideal 2–3 months warning (Arabic)
- [ ] 1.3 / 2.3 Time expectation on upload + analyze
- [ ] 2.1 Upload phase + privacy pill
- [ ] 2.4 Elapsed timer
- [ ] 2.2 Prefer transaction count when available (even during AI)

### Batch B — Product shape (bigger)
- [ ] 3.x Uncertain-charges confirmation step (HITL)
- [ ] 4.3 Show original €/$ **and** ريال
- [ ] 4.5 Free Cancel links on top visible rows
- [ ] 4.7 Reframe paid CTA around cancel links (not only “AI report”)

### Batch C — Infra (only if you want parity)
- [ ] 4.9 Stripe + currency picker vs keep Whop
- [ ] Speed path so “30–90s” is true (batch Claude / less LlamaParse)

---

## Screenshot inventory (this session)

1. JFC upload + 5 files selected + orange ideal-months warning  
2. JFC “Uploading files…” + never stored  
3. JFC deep scan · 1,282 transactions · timer 4s  
4–5. JFC “Help identify N more” confirm cards (€)  
6. JFC results · mixed $ / € · blur · Unlock $5 / G Pay  
7. ClassPass login (reference only — not JFC product)  
8. Stripe checkout · JustCancel · currency USD vs PLN  

---

*Last updated: 2026-07-18 · Decision: **COPY JFC EXPERIENCE** (Whop kept, mint/Arabic design kept)*

## Decision log
- 2026-07-18: Boss chose full JFC flow copy. Keep Whop. Keep our colors/Arabic.
- Shipped: upload copy + ideal months warning, uploading screen, deep-scan timer + tx count, HITL confirm-unsure, free Cancel links, paywall reframed around cancel links.
