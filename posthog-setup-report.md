# PostHog Setup Report — YallaCancel

**Date:** 2026-03-29
**Project:** YallaCancel (Saudi subscription audit platform)
**PostHog Project ID:** 149503
**Host:** https://eu.i.posthog.com (EU region)

---

## Integration Summary

PostHog analytics is fully integrated across the client and server sides of this Next.js App Router application.

### Initialization

| Layer | File | Method |
|-------|------|--------|
| Client | `instrumentation-client.ts` | `posthog.init()` via Next.js 15.3+ pattern |
| Server | `src/lib/posthog-server.ts` | Singleton `PostHog` (posthog-node) |
| Proxy | `next.config.js` | `/ingest/*` → `eu.i.posthog.com` (avoids ad-blockers) |

---

## Events Tracked

### Client-side (posthog-js)

| Event | File | Properties | Trigger |
|-------|------|-----------|---------|
| `file_uploaded` | `UploadZone.tsx` | `file_count`, `locale` | User uploads bank statement file(s) |
| `sample_data_tried` | `UploadZone.tsx` | `locale` | User clicks "Try sample data" |
| `analysis_started` | `page.tsx` | `file_count`, `locale` | handleScan begins |
| `analysis_completed` | `page.tsx` | `locale`, `subscription_count`, `method` | AI or local parser succeeds |
| `analysis_failed` | `page.tsx` | `locale`, `reason` | Parsing fails (no_transactions / unexpected_error) |
| `paywall_viewed` | `PaywallModal.tsx` | `locale`, `plan_id` | Paywall modal mounts |
| `checkout_started` | `PaywallModal.tsx` | `locale`, `plan_id` | User clicks pay button |
| `payment_completed` | `PaywallModal.tsx` | `locale`, `plan_id`, `receipt_id` | Whop checkout completes |
| `pdf_downloaded` | `AuditReport.tsx` | `locale`, `subscription_count` | User downloads PDF report |
| `subscription_marked_cancel` | `SubscriptionCard.tsx` | `locale`, `subscription_name` | User marks sub for cancellation |
| `subscription_marked_keep` | `SubscriptionCard.tsx` | `locale`, `subscription_name` | User marks sub to keep |
| `cancel_link_clicked` | `SubscriptionCard.tsx` | `locale`, `subscription_name` | User clicks direct cancel link |
| `cancel_guide_opened` | `SubscriptionCard.tsx` | `locale`, `subscription_name` | User opens cancel guide |

### Server-side (posthog-node)

| Event | File | Properties | Trigger |
|-------|------|-----------|---------|
| `pdf_analysis_requested` | `api/parse-pdf/route.ts` | `file_type`, `file_size` | Claude successfully analyzes a PDF |
| `payment_webhook_received` | `api/whop-webhook/route.ts` | `plan_id`, `payment_id`, `status` | Whop payment.succeeded webhook fires |

---

## Dashboard

**Name:** Analytics basics
**URL:** https://eu.posthog.com/project/149503/dashboard/593238

### Insights

| # | Name | URL | Type |
|---|------|-----|------|
| 1 | Conversion Funnel: Upload → Payment | https://eu.posthog.com/project/149503/insights/F8dxG9Pt | Funnel |
| 2 | Analysis Success vs Failure Rate | https://eu.posthog.com/project/149503/insights/8Op3IhN0 | Trends |
| 3 | Paywall Views vs Payments | https://eu.posthog.com/project/149503/insights/32S3mw0l | Trends |
| 4 | Report Engagement Actions | https://eu.posthog.com/project/149503/insights/YwUQAhsI | Trends |
| 5 | Upload Entry Points: File vs Sample | https://eu.posthog.com/project/149503/insights/QdSZZDy2 | Trends |

---

## Environment Variables

Set in `.env.local` (not committed to git):

```
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

---

## Key Questions These Events Answer

1. **What's the conversion funnel?** → Insight 1 — upload → analysis → paywall → payment
2. **Is the AI parser working reliably?** → Insight 2 — success vs failure rate daily
3. **What's the paywall conversion rate?** → Insight 3 — paywall views vs payments
4. **What do paying users do with their report?** → Insight 4 — mark cancel/keep, click links, download PDFs
5. **How do users start — real file or demo?** → Insight 5 — file upload vs sample data
