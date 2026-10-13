# Cancel guides

Cancel guides let a user browse Arabic how-to pages for known services, filter by category, search by name, and open a static guide with a CTA back to the scanner.

## Sub-features

- `guides-index` loads `/guides` with heading `أدلة إلغاء الاشتراكات`.
- `guides-search` filters cards from the search field.
- `guides-empty` shows `ما لقينا الخدمة` for a query with no matches.
- `guides-category` narrows the list with a category pill such as `بث فيديو`.
- `guides-open` opens `/cancel-netflix.html` and shows the Netflix how-to plus `ارفع كشفك`.

## How to get to it (user POV)

- Choose `أدلة الإلغاء` in the site header on `/`.
- Open `/guides` directly.
- From `/guides`, type in `ابحث... Netflix, شاهد, Adobe...`.
- Choose a category pill (`الكل`, `سعودية`, `بث فيديو`, …).
- Choose a result card such as `Netflix` (`href="/cancel-netflix.html"`).
- From a guide, choose `ارفع كشفك` (or the header `حلل كشفك مجاناً` on `/guides`).

## Driving it with verify-yallacancel

Preconditions:

- Yalla Cancel is healthy at `http://127.0.0.1:4173`.
- `verify-yallacancel doctor` reports the expected URL.
- `public/cancel-netflix.html` is present in the working tree.

- **Header entry.** From `/`, choose Cancel Guides. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser goto /` then `browser click --text "أدلة الإلغاء"`. The heading is `أدلة إلغاء الاشتراكات` and a Netflix card is visible.
- **Direct route.** Open the index. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser goto /guides`. Same heading. Count text matches `دليل إلغاء`.
- **Search match.** Type Netflix. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser fill --placeholder "ابحث" --value "Netflix"`. A card whose accessible name includes `Netflix` remains. Unrelated cards (for example a unique name you just saw, such as `Mobily`) are gone.
- **Search miss.** Replace the query with `volcano`. Run `browser fill --placeholder "ابحث" --value "volcano"`. Status `ما لقينا نتائج · جرب كلمة ثانية` and empty state `ما لقينا الخدمة` appear, plus CTA `ارفع كشفك مجاناً`.
- **Category.** Clear search (fill `""`) and choose `بث فيديو`. Run `browser click --text "بث فيديو"`. Netflix remains; a Saudi-only card such as `موبايلي` does not.
- **Open guide.** Choose Netflix. Run `browser click --text "Netflix"` or `browser goto /cancel-netflix.html`. The heading contains `كيف ألغي Netflix` and a button/link `ارفع كشفك` points at `/?utm_source=seo_guide`.
- **Proof.** Capture the filtered index and the Netflix guide. Run `browser screenshot --path .cursor/skills/verify-yallacancel/artifacts/cancel-guides/netflix.png` on the guide. The screenshot shows Yalla Cancel chrome and `كيف ألغي Netflix`.

## Gotchas

- `/guides` is a Next app route. `/cancel-netflix.html` is a static file under `public/`. A 404 on the `.html` path means the export/public file is missing, not that search failed.
- Search matches English `name` or Arabic `nameAr`. `شاهد` hits Shahid; `netflix` is case-insensitive.
- Category pills toggle off when clicked again. Re-check the `الكل` pill if the list looks empty.
- Guide CTAs send the user to `/?utm_source=seo_guide`. That is still the landing scanner, not an auto-scan.
- Do not treat `/blog` as this feature. Blog is a separate static tree.
