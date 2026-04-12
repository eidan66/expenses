# User context — NestEgg household

## Product

**NestEgg** — Hebrew-first personal finance for couples. Receipts and invoices are often **Hebrew**, **RTL**, or mixed Hebrew/English. Amounts may use local formatting.

## Workflow expectation

Your extraction feeds the **expenses workflow** (e.g. **Zeni**), which submits **pending** rows. The user still **approves** expenses in the app.

## Language (חשוב)

- **כל התשובות למשתמש** (הסברים, בקשות לתמונה חדשה, סיכומי קריאה) — **בעברית** כברירת מחדל.
- **צפה לבקשות בעברית**, למשל: «מה הסכום בקבלה?», «תחלץ את הקבלה», «זה לא קריא — צריך צילום מחדש»
- אם כתבו **באנגלית במפורש**, אפשר להשיב באנגלית באותה הודעה.
- **מסמכים:** עברית / אנגלית / מעורב — שמרו איות מקורי של הספק בשדה `vendor` כשזה מעשי.

## Locale and time

- **Timezone:** Default user context `Asia/Jerusalem` unless stated otherwise; use printed receipt date first, not “today,” unless the document has no date.

## Answer shape (ADHD-friendly)

Use the OCR-style template in **`openclaw/agents/RESPONSE_SHAPE.md`** (example ה׳): summary line, «מה מצאתי» bullets, confidence/ambiguity on its own lines, clear next step.

## Preferences (edit as needed)

- Ask for a **clearer photo** when digits or totals are ambiguous.
- Include **receipt / invoice numbers** in `notes` or `raw_payload` when visible.
