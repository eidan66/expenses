# OpenClaw Expense Extraction Skill

This skill documents how to extract expense details from invoices and receipts (OCR) and how to map them to NestEgg categories for the expense automation flow.

## 1. Extraction Details (What to Look For in OCR)

When scanning an invoice or receipt, extract the following fields:

| Field | Description | Example | Maps To |
|-------|-------------|---------|--------|
| **Vendor / Merchant** | Store name, business name, or payee | "סופרמרקט שופרסל", "Amazon" | `title` |
| **Total amount** | Final total paid (after tax, discounts) | 125.50 | `amount` |
| **Date** | Purchase or invoice date | 2025-03-07, 07/03/2025 | `date` |
| **Line items / Description** | Brief description of what was bought | "מצרכים שבועיים" | `notes` |
| **Tax** | VAT or sales tax (optional, for reference) | 17.5 | — |
| **Currency** | If not ILS, note for conversion | ILS, USD | — |

### Extraction Rules

- **title**: Use the vendor/merchant name. If multiple vendors on one receipt, use the primary or first one.
- **amount**: Use the total paid. For expenses, use a positive number (the API expects the amount as stored).
- **date**: Prefer ISO format `YYYY-MM-DD` or a parseable date string. The API derives Hebrew month/year if needed.
- **notes**: Optional. Include line-item summary, receipt number, or any context that helps verify the expense later.

## 2. Categories and Subcategories

Use **GET /api/categories** to fetch the current list. Below is the reference for matching.

### Expense Categories (Hebrew)

| Category (Hebrew) | English Hint | Subcategories |
|-------------------|--------------|---------------|
| דיור | Housing, rent, mortgage, utilities | שכירות/משכנתא, ביטוח מבנה, ועד בית, ארנונה, חשמל, מים, גז, אינטרנט, תמי 4, אחר |
| בריאות | Health, medical, dentist | רפואה כללית, שיניים, אחר |
| ביטוחים | Insurance | ביטוח בריאות, ביטוח חיים, אחר |
| צריכה | Consumption, food, toiletries | אוכל, טואלטיקה/היגיינה |
| ביגוד והנעלה | Clothing, shoes | ביגוד והנעלה |
| חשבונות קבועים | Fixed bills, subscriptions | טלוויזיה, נטפליקס, דיסני+, מצלמות אבטחה, אחר |
| תקשורת | Communication, phone | טלפון נייד |
| תחבורה (רכב) | Car, vehicle | ביטוח, טסט, דלק, תחזוקה, חניה, אחר |
| תחבורה (אופנוע) | Motorcycle, scooter | ביטוח, טסט, דלק, תחזוקה, חניה, אחר |
| תחבורה ציבורית | Public transport | אוטובוס/רכבת, מונית, אחר |
| חיות | Pets | הוצאות דייזי, הוצאות דגים |
| קניות אונליין | Online shopping | Temu, Shein, AliExpress, אחר |
| שירותים דיגיטליים | Digital services | ChatGPT/GPT, Cursor, אפליקציות, Google Drive, אחר |
| בילויים ופנאי | Entertainment, leisure | — |
| שונות | Miscellaneous | מזומן, אחר |
| חיסכון | Savings | יעד ארוך טווח, קרן חירום |
| גמל להשקעה | Investment provident fund | — |
| קניות | Shopping, supermarket | סופר, שוק, אחר |

### Income Category

| Category (Hebrew) | English Hint | Subcategories |
|-------------------|--------------|---------------|
| הכנסה | Income, salary | הכנסות עידן, הכנסות ספיר, הכנסות אחר |

### Matching Tips

- Match vendor keywords to category hints (e.g. "סופר" → קניות, "דלק" → תחבורה (רכב)).
- When unsure, prefer **שונות** with subcategory **אחר**.
- For grocery/supermarket: **קניות** → סופר or שוק.
- For subscriptions (Netflix, etc.): **חשבונות קבועים**.

## 3. Payload Contract

### POST /api/openclaw/payloads

**Required fields:**

```json
{
  "title": "string (vendor/merchant name)",
  "amount": "string (e.g. \"125.50\")",
  "category": "string (exact category name in Hebrew)",
  "subcategory": "string | null (exact subcategory name, or null)",
  "date": "string (YYYY-MM-DD or parseable)",
  "month": "string (optional - Hebrew month name, derived from date if missing)",
  "year": "string (optional - e.g. \"2025\", derived from date if missing)"
}
```

**Optional fields:**

```json
{
  "notes": "string | null",
  "raw_payload": "object | null (full OCR result for audit)"
}
```

### Date and Month/Year

- **date**: Use `YYYY-MM-DD` when possible. The API accepts other parseable formats.
- **month**: Hebrew month names: ינואר, פברואר, מרץ, אפריל, מאי, יוני, יולי, אוגוסט, ספטמבר, אוקטובר, נובמבר, דצמבר
- **year**: Four-digit string, e.g. `"2025"`
- If `month` or `year` is omitted, the API derives them from `date`.

### Example Payload

```json
{
  "title": "סופרמרקט שופרסל",
  "amount": "342.50",
  "category": "קניות",
  "subcategory": "סופר",
  "date": "2025-03-07",
  "notes": "מצרכים שבועיים",
  "raw_payload": {
    "vendor": "Shufersal",
    "total": 342.5,
    "items": ["milk", "bread", "..."],
    "receipt_id": "12345"
  }
}
```

## 4. Flow Summary

1. **Scan** invoice/receipt with OpenClaw OCR.
2. **Extract** title, amount, date, notes from OCR result.
3. **Fetch** categories via `GET /api/categories`.
4. **Match** the best category and subcategory using hints and keywords.
5. **Submit** payload via `POST /api/openclaw/payloads`.
6. **Verify** in NestEgg pending-expenses screen; approve or decline.
