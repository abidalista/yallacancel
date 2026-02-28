# Tech Stack

## Core
| Package | Version |
|---|---|
| Next.js | ^16.1.6 |
| React | ^19.2.4 |
| TypeScript | ^5.9.3 |

## Styling
| Package | Version | Notes |
|---|---|---|
| Tailwind CSS | ^4.1.18 | v4 — uses `@theme` in CSS, no config file |
| PostCSS | ^8.5.6 | via `@tailwindcss/postcss` |

## UI & Animation
| Package | Version |
|---|---|
| Framer Motion | ^12.34.3 |
| Lucide React | ^0.575.0 |

## Utilities
| Package | Version |
|---|---|
| pdfjs-dist | ^5.4.624 |

## Build
- `next dev` — local dev
- `next build` — static export (outputs to `out/`)
- `output: "export"` + `images: { unoptimized: true }` in next.config.js

## Fonts (loaded via Google Fonts in layout.tsx)
- **Plus Jakarta Sans** — English UI (weights 400–800)
- **Inter** — English UI fallback
- **Noto Sans Arabic** — Arabic text (weights 300–900)

## No backend
No database, no API routes, no server-side rendering. Fully static.
