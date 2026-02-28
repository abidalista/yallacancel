# Project Structure

```
yallacancel/
├── .cursorrules              # Claude behavior rules
├── next.config.js            # output: "export", images unoptimized
├── postcss.config.mjs
├── tsconfig.json
├── package.json
│
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout — fonts, metadata, RTL html tag
│   │   ├── page.tsx          # Main app page (upload → analyze → results flow)
│   │   ├── globals.css       # Tailwind v4 @theme variables + global styles
│   │   └── guides/
│   │       └── page.tsx      # Guides index page
│   │
│   ├── components/
│   │   ├── Header.tsx        # Sticky nav — logo + language toggle
│   │   ├── UploadZone.tsx    # Bank statement upload (CSV/PDF drag-drop)
│   │   ├── AuditReport.tsx   # Subscription list after analysis
│   │   ├── SubscriptionCard.tsx  # Individual subscription row/card
│   │   ├── SpendingBreakdown.tsx # Category spend chart
│   │   ├── BankSelector.tsx  # Bank picker UI
│   │   └── PaywallModal.tsx  # Paywall / upgrade modal
│   │
│   └── lib/
│       ├── types.ts          # TypeScript types (AuditReport, Subscription, etc.)
│       ├── cancel-db.ts      # Cancellation guide data per service
│       ├── i18n.ts           # Arabic/English translations
│       └── services/         # Core logic
│           ├── parseCSV      # CSV bank statement parser
│           ├── parsePDF      # PDF bank statement parser
│           ├── detectBank    # Bank detection from statement
│           └── analyzeTransactions  # Subscription detection engine
│
├── public/                   # Static assets (served at root URL)
│   ├── cancel-*.html         # ~150 standalone cancel guides (Arabic)
│   ├── blog/                 # Blog posts (HTML)
│   ├── preview-a.html
│   ├── sitemap.xml
│   ├── robots.txt
│   ├── og-image.png
│   ├── logo-yallacancel*.{png,svg}
│   ├── favicon*.png
│   └── pdf.worker.min.mjs    # PDF.js worker (must stay in public/)
│
└── docs/
    ├── STACK.md
    ├── STRUCTURE.md          # This file
    ├── DESIGN.md
    └── reference/
        └── surfe/            # Surfe.com design screenshots (9 images)
```

## URL structure
| URL | Source |
|---|---|
| `/` | `src/app/page.tsx` |
| `/guides` | `src/app/guides/page.tsx` |
| `/cancel-netflix.html` | `public/cancel-netflix.html` |
| `/blog/...` | `public/blog/` |
