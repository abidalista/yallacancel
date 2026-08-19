# Feature Backlog — YallaCancel

Single source of truth for planned product work.  
**Now:** ship + harden the JFC-style web scan flow.  
**Later:** skill-quality audit report and extras below.

---

## Now (main track)

- [ ] **BLOCKER** Production Claude key is invalid (401). [ABI-148](https://linear.app/abidal/issue/ABI-148/production-anthropic-key-is-invalid-401). Confirmed 19 Aug 2026.
- [ ] Phone test with real 5–6 file mix (SNB + Revolut + Crypto.com). [ABI-149](https://linear.app/abidal/issue/ABI-149/phone-test-real-bank-files-end-to-end)
- [ ] Harden new scan UX on production (upload → timer → HITL → results → Whop)
- [ ] Fix FX / multi-currency accuracy on free + paid AI path
- [ ] Make paid AI path reliable and closer to 30–90s where possible
- [ ] Do **not** start the sales mission until [ABI-147](https://linear.app/abidal/issue/ABI-147/blocker-prove-scan-and-pay-work-before-any-marketing) is Done

---

## Later — Just Cancel Claude Code skill (what it does better)

Capabilities to eventually beat or match. Source: skill report screenshots, Jul 2026.

1. **Keep / Decide / Already stopped** buckets — not one flat list  
2. **Why / reason copy** per item (cashback, Polish SIM, seller remnant, etc.)  
3. **Native currency + bank FX truth** (e.g. Claude $115 ↔ SNB SAR 441.60)  
4. **Cashback / rebate awareness** (Netflix/Spotify “effectively free” via CRO)  
5. **Already stopped detection** (no charge since month X)  
6. **Price variance notes** (Apple €17.99 Jan vs €16.99 May)  
7. **Savings headline** (“up to €780/yr on the table”)  
8. **Deep spending report** (categories + “two things worth acting on”) — **CUT from web for now** (removed from paid results 2026-07-18)  
9. **Multi-account caveat** (this card vs salary account vs rewards card)  
10. **Kill checklist → Copy** action UX  

**Product cut when we build this:** paid unlock = this audit report style, not only unblur + AI parse.

---

## Later — Web / UX (from JFC site)

- [ ] Show original €/$ **and** ريال in results  
- [ ] Stronger free teaser (logos on “+ N more”)  
- [ ] Elapsed-timer polish + upload privacy parity (done-ish; iterate from feedback)  
- [ ] Ideal 2–3 months warning (shipped; iterate copy if needed)

---

## Later — Growth / ops

- [ ] **Now:** 30-day sales mission. Plan: `docs/MARKETING-PLAN.md`. Linear: [YallaCancel sales](https://linear.app/abidal/project/yallacancel-sales-d0bb0a9d3397)
- [ ] WhatsApp Google Maps outreach is **Pass the Product**, not YallaCancel. Do not mix into this mission.
- [ ] Founder access code rotation / revoke when done testing
- [ ] After 10 sales: Snapchat ads cap 1,000 SAR (see plan). Not before.  

---

## Icebox

- [ ] Stripe + currency picker (rejected for now — **Whop stays**)  
- [ ] Dark terminal-style report UI (skill aesthetic only; keep mint for web)  

---

## How to use this file

1. Add new ideas under **Later** or **Icebox**  
2. Move to **Now** only when it’s the active focus  
3. Check boxes when shipped; add date in a one-line note under the item  

Related: `docs/JFC-DIFF.md` (detailed site vs us diffs).
