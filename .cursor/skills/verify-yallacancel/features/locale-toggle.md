# Locale toggle

Locale toggle switches the landing chrome and hero copy between Arabic (default) and English without changing the URL.

## Sub-features

- `locale-default` loads `/` in Arabic (`dir=rtl`, `lang=ar`).
- `locale-to-en` switches via the header `EN` control.
- `locale-to-ar` switches back via the header `ع` control.
- `locale-demo-copy` updates the sample button text with the locale.

## How to get to it (user POV)

- Open `/`. The UI is Arabic until the user toggles.
- Choose `EN` in the header (globe + `EN`).
- Choose `ع` in the header to return to Arabic.

## Driving it with verify-yallacancel

Preconditions:

- Yalla Cancel is healthy at `http://127.0.0.1:4173`.
- `verify-yallacancel doctor` reports the expected URL.
- Start on `/` with a fresh page load (locale state is React state, not a query param).

- **Default Arabic.** Load `/`. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser goto /`. `document.documentElement.lang` is `ar`, `dir` is `rtl`, heading is `اعرف وين تروح فلوسك كل شهر`, sample button is `ما عندك كشف؟ جرّب مثال جاهز`, guides link is `أدلة الإلغاء`.
- **Switch to English.** Choose `EN`. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser click --text "EN"`. `lang` is `en`, `dir` is `ltr`, heading is `See exactly where your money goes each month`, sample button is `No statement handy? Try a sample`, guides link is `Cancel Guides`, toggle label is `ع`.
- **Switch back.** Choose `ع`. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser click --text "ع"`. Arabic heading and `EN` toggle return.
- **Proof.** Capture both languages. Run `browser screenshot --path .cursor/skills/verify-yallacancel/artifacts/locale-toggle/en.png` while English is active, and `browser eval --js "({lang: document.documentElement.lang, dir: document.documentElement.dir, h1: document.querySelector('h1')?.innerText})"`. The JSON is `en` / `ltr` / the English heading.

## Gotchas

- Locale is in-memory. Reload resets to Arabic. Do not use the URL to assert language.
- The toggle label is the **target** script: `EN` means "switch to English" while the UI is Arabic. Clicking `EN` while already English is not a valid path (the label is `ع` then).
- `/guides` and `public/cancel-*.html` are Arabic-only pages. Proving locale toggle on those routes is a skip with reason, not a pass via the landing toggle.
- Amounts stay Western digits + English units in both languages (`49 SAR`, `90` seconds). A switch that produces `٤٩ ريال` is a product bug.
- Header `Contact` / `تواصل معنا` is a `mailto:` link. Do not follow it during a UI proof.
