# Statement upload

Statement upload lets a user pick CSV or PDF bank files on the landing dropzone, see the selected list, start a scan, or get a visible error for a rejected file.

## Sub-features

- `upload-open` opens the hidden file picker from the dashed dropzone.
- `upload-list` shows each accepted file name, size in `KB`/`MB`, and a scan button.
- `upload-scan` starts analysis from `افحص الاشتراكات`.
- `upload-reject` rejects a non CSV/PDF file with an on-page error.
- `upload-clear` removes the selection with `مسح الكل`.

## How to get to it (user POV)

- On `/`, click the dashed dropzone `ارفع كشوفات آخر شهرين أو 3 شهور` (or press Enter/Space while it is focused) and choose a `.csv` or `.pdf`.
- Drop files onto that same dropzone.
- After files are listed, choose `افحص الاشتراكات`.
- Choose `مسح الكل` to empty the list, or the per-file remove control.

## Driving it with verify-yallacancel

Preconditions:

- Yalla Cancel is healthy at `http://127.0.0.1:4173`.
- `verify-yallacancel doctor` reports the expected URL.
- Chrome profile is on the Arabic landing with no files selected.

- **Open landing.** Load `/`. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser goto /`. Dropzone text `ارفع كشوفات آخر شهرين أو 3 شهور` is visible. The file input exists but is not shown.
- **Attach CSV.** Feed the bundled statement. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser upload --file public/test-statement.csv`. The list shows `demo-statement.csv` (the upload helper names the File from that public CSV via the demo helper only on the sample button; a raw upload of `public/test-statement.csv` shows `test-statement.csv`) and `افحص الاشتراكات`.
- **Scan.** Choose scan. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser click --text "افحص الاشتراكات"`. The uploading then analyzing screens appear, then confirm and/or the teaser as in [demo-scan](./demo-scan.md).
- **Reject type.** From a fresh landing, upload a `.txt` through the same `input[type=file]` (the UI filters `accept=".csv,.pdf"`; if the browser still delivers the file, the page shows `لازم CSV او PDF`). A blocked OS picker with no error is not a pass for `upload-reject`; report the unmet precondition.
- **Clear.** With a CSV listed, choose `مسح الكل`. Run `node .cursor/skills/verify-yallacancel/scripts/verify-yallacancel.mjs browser click --text "مسح الكل"`. The file list and `افحص الاشتراكات` are gone.
- **Proof.** Capture the populated file list before scan. Run `browser screenshot --path .cursor/skills/verify-yallacancel/artifacts/statement-upload/list.png` and `browser snapshot --aria --path .cursor/skills/verify-yallacancel/artifacts/statement-upload/list.aria.txt`. The artifacts show the filename and `افحص الاشتراكات`.

## Gotchas

- The dashed box is `role="button"` and opens the picker on click. Attach files through `input[type=file]`; do not click the box first in CDP or a native file dialog may steal the session.
- Max 5 files and 25 MB total, 10 MB per file. Limits display as `5` and `25 MB` / `10 MB`, never Arabic-Indic digits.
- One file shows `أضف شهر إضافي عشان نأكد الاشتراكات المتكررة`. That tip is not a failure.
- PDF upload is a production-boundary path (LlamaParse + Claude). Without those secrets the scan should error honestly, not show an empty success. Do not weaken `upload-scan` to CSV-only and then claim PDF is proven.
- Filename on the demo button path is `demo-statement.csv`. Filename on a direct upload of `public/test-statement.csv` is `test-statement.csv`. Assert the name you actually attached.
