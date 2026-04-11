# OpenClaw Integration Guide — NestEgg Expense Automation

This document describes OpenClaw’s role in the NestEgg expense automation flow. Use it as the main reference for implementation.

**OpenClaw agent markdown packs** (AGENTS, SOUL, TOOLS, IDENTITY, USER, HEARTBEAT, MEMORY) for **expenses**, **OCR**, **bank** (router), and **income** live under [`openclaw/agents/`](../openclaw/agents/) (`expenses/`, `ocr/`, `bank/`, `income/`)—copy or sync into your OpenClaw workspace as needed.

---

## 1. Your Job

1. **Scan** invoices/receipts (OCR)
2. **Extract** vendor, amount, date, and other details
3. **Fetch** NestEgg categories from the API
4. **Match** each expense to the correct category and subcategory
5. **Submit** the payload to NestEgg
6. A human **approves or declines** in the NestEgg app; approved items become transactions

---

## 2. APIs

Base URL: `https://expenses-virid-two.vercel.app/api` (or `http://localhost:3000/api` in dev)

**Authentication:** When `OPENCLAW_API_TOKEN` is configured, include this header on all requests:

```
Authorization: Bearer <OPENCLAW_API_TOKEN>
```

See [OpenClaw Credentials](OPENCLAW_CREDENTIALS.md) for the token and setup.

### 2.1 GET /api/categories

**Purpose:** Fetch all categories and subcategories for matching.

**Request:**
```
GET /api/categories
Authorization: Bearer <token>
```

**Response:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "קניות",
      "type": "Expense",
      "subcategories": ["סופר", "שוק", "אחר"],
      "description": "shopping, supermarket, market"
    }
  ]
}
```

- `name`: Hebrew category name (use exactly when submitting)
- `subcategories`: Hebrew subcategory names (use exactly when submitting)
- `description`: English hints for matching (vendor keywords, etc.)

**When to call:** Before submitting each payload, or periodically to refresh the list.

---

### 2.2 GET /api/openclaw/status

**Purpose:** Read-only snapshot of NestEgg data for the OpenClaw user (`OPENCLAW_USER_ID` or server default). Use this to “ping” current state: pending expense counts, recent pending rows, recent ledger transactions, and savings goals. No direct SQL — only this curated JSON.

**Request:**
```
GET /api/openclaw/status
Authorization: Bearer <token>
```

**Optional query parameters:**

| Parameter | Default | Max | Description |
|-----------|---------|-----|-------------|
| `pending_limit` | 20 | 50 | Recent `pending_expenses` rows (all statuses), newest first |
| `transaction_limit` | 15 | 50 | Recent `transactions` rows by `date` |

**Response (shape):**

- `readonly: true`
- `scope.user_id` — which household user the data is scoped to
- `pending_expenses.counts` — `pending`, `approved`, `declined` counts
- `pending_expenses.recent` — slice of pending rows (`raw_payload` is omitted here to keep responses small; use the app or full row sources if needed)
- `transactions.recent` — recent booked transactions
- `goals.items` — goals for that user
- `hints` — pointers to `GET /api/categories` and `POST /api/openclaw/payloads`

**When to call:** At session start, before/after submitting payloads, or on a heartbeat to refresh context.

---

### 2.3 POST /api/openclaw/payloads

**Purpose:** Submit an expense for human approval.

**Request:**
```
POST /api/openclaw/payloads
Content-Type: application/json
Authorization: Bearer <token>
```

**Body (required fields):**
| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Vendor/merchant name |
| `amount` | string | Total amount (e.g. `"125.50"`) |
| `category` | string | Exact category name in Hebrew (from GET /api/categories) |
| `subcategory` | string \| null | Exact subcategory name, or `null` |
| `date` | string | Date in `YYYY-MM-DD` or parseable format |

**Body (optional):**
| Field | Type | Description |
|-------|------|-------------|
| `month` | string | Hebrew month name (derived from `date` if omitted) |
| `year` | string | Year, e.g. `"2025"` (derived from `date` if omitted) |
| `notes` | string \| null | Line items, receipt number, or other context |
| `raw_payload` | object \| null | Full OCR result for audit |

**Success (201):**
```json
{
  "id": "uuid",
  "user_id": "...",
  "title": "...",
  "amount": "...",
  "category": "...",
  "subcategory": "...",
  "date": "...",
  "month": "...",
  "year": "...",
  "notes": "...",
  "raw_payload": {...},
  "status": "pending",
  "created_at": "..."
}
```

**Error (400):**
```json
{
  "error": "Missing required fields: title, amount, category, date"
}
```

---

## 3. Flow (Step by Step)

```
┌─────────────────┐
│ 1. Scan receipt │  (OCR — image/PDF)
└────────┬────────┘
         ▼
┌─────────────────┐
│ 2. Extract      │  title, amount, date, notes
└────────┬────────┘
         ▼
┌─────────────────┐
│ 3. GET /api/    │  Fetch categories + subcategories
│    categories   │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 4. Match        │  Use vendor keywords + description hints
│    category     │  → pick best category + subcategory
└────────┬────────┘
         ▼
┌─────────────────┐
│ 5. POST /api/   │  Submit payload
│    openclaw/    │
│    payloads     │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 6. Human        │  Approve/decline in NestEgg UI
│    verifies     │  → approved items become transactions
└─────────────────┘
```

---

## 4. Skills to Use

Use the **OpenClaw Expense Extraction** skill (`docs/skills/openclaw-expense-extraction.md`) for:

- **Extraction:** What to read from OCR (vendor, amount, date, line items)
- **Categories:** Full list with Hebrew names and English hints
- **Matching:** How to map vendor/keywords to category and subcategory
- **Payload format:** Required and optional fields, examples

---

## 5. Rules to Follow

### 5.1 Extraction

- **title:** Vendor/merchant name. If multiple vendors, use the primary one.
- **amount:** Total paid (positive number). Use string, e.g. `"125.50"`.
- **date:** Prefer `YYYY-MM-DD`. API can derive Hebrew month/year from other formats.
- **notes:** Optional. Include line-item summary or receipt number when useful.

### 5.2 Category Matching

- Use **exact** Hebrew names from `GET /api/categories` for `category` and `subcategory`.
- Use `description` hints (e.g. "supermarket" → קניות, "fuel" → תחבורה (רכב)).
- If unsure: use **שונות** (Miscellaneous) with subcategory **אחר**.
- Grocery/supermarket → **קניות** → סופר or שוק.
- Subscriptions (Netflix, etc.) → **חשבונות קבועים**.

### 5.3 Payload

- All required fields must be present and non-empty.
- `category` and `subcategory` must match the API response exactly.
- Include `raw_payload` with the full OCR result when possible (for audit).

### 5.4 Hebrew Month Names (if you set month/year manually)

```
ינואר, פברואר, מרץ, אפריל, מאי, יוני, יולי, אוגוסט, ספטמבר, אוקטובר, נובמבר, דצמבר
```
(January through December)

---

## 6. Example

### 6.1 GET categories

```http
GET /api/categories
Authorization: Bearer <token>
```

### 6.2 Build and POST payload

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
    "items": ["חלב", "לחם", "..."],
    "receipt_id": "12345"
  }
}
```

---

## 7. Error Handling

| HTTP | Meaning | Action |
|------|---------|--------|
| 201 | Created | Payload stored; human will review |
| 400 | Bad request | Check required fields and format |
| 401 | Unauthorized | Provide `Authorization: Bearer <token>` (see OPENCLAW_CREDENTIALS.md) |
| 405 | Method not allowed | Use GET for categories and status, POST for payloads |
| 500 | Server error | Retry later or report |

On 400, inspect the `error` field for details (e.g. missing fields).

---

## 8. Summary

| Step | Action |
|------|--------|
| 0 (optional) | `GET /api/openclaw/status` for read-only context |
| 1 | Scan invoice/receipt (OCR) |
| 2 | Extract title, amount, date, notes |
| 3 | `GET /api/categories` |
| 4 | Match to category + subcategory using hints |
| 5 | `POST /api/openclaw/payloads` with the payload |
| 6 | Human approves/declines in NestEgg |

**Reference:** `docs/skills/openclaw-expense-extraction.md` for extraction rules and category list.
