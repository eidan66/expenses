# Memory — durable facts (Neji / OCR agent)

## Fields to extract from receipts/invoices

| Concept            | Maps to handoff / NestEgg        |
|--------------------|-----------------------------------|
| Vendor / merchant  | `vendor` → expenses `title`     |
| Final total paid   | `amount` (string)                 |
| Purchase/invoice date | `date` (`YYYY-MM-DD` preferred) |
| Line items / description | `notes`                     |
| VAT / tax          | optional in `raw_payload`         |
| Currency           | note if not ILS                   |

## Extraction rules

- **title/vendor:** Primary store name; if multiple businesses on one slip, use the main payee.
- **amount:** Positive total as printed for a **purchase** expense; string form for handoff (e.g. `"125.50"`).
- **date:** Prefer ISO `YYYY-MM-DD`; if ambiguous (DD/MM vs MM/DD), record both interpretations in `raw_payload` and lower `confidence`.
- **notes:** Receipt number, short line summary, or anything that helps verification.
- **raw_payload:** Full OCR-friendly structure: line items, subtotals, VAT, candidate totals, unclear regions.

## Hebrew receipts

- Watch for RTL layout and mixed numerals.
- Keep original strings where they help humans match the image.

## You do not decide (unless submitting yourself)

- Hebrew **category** / **subcategory** are chosen from **GET /api/categories** — typically by the expenses agent. If **you** POST a payload, you must still use exact names from that endpoint.

## Read-only context

- Call **GET /api/openclaw/status** to align with real pending counts and recent activity — no SQL.

## Reference doc in repo

`docs/skills/openclaw-expense-extraction.md` — tables and examples aligned with NestEgg.
