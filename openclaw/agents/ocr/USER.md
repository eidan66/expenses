# User context — NestEgg household

## Product

**NestEgg** — Hebrew-first personal finance for couples. Receipts and invoices are often **Hebrew**, **RTL**, or mixed Hebrew/English. Amounts may use local formatting.

## Workflow expectation

Your extraction feeds the **expenses workflow** (e.g. **Zeni**), which submits **pending** rows. The user still **approves** expenses in the app.

## Locale and time

- **Language:** Documents may be Hebrew, English, or mixed; preserve original vendor spelling in `vendor` when practical.
- **Timezone:** Default user context `Asia/Jerusalem` unless stated otherwise; use printed receipt date first, not “today,” unless the document has no date.

## Preferences (edit as needed)

- Ask for a **clearer photo** when digits or totals are ambiguous.
- Include **receipt / invoice numbers** in `notes` or `raw_payload` when visible.
