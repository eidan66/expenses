# Tools — NestEgg API (Zeni / expenses agent)

Base URL (production, from project docs): `https://expenses-virid-two.vercel.app/api`  
Local dev: `http://localhost:3000/api` (when the stack is running)

## Authentication

When the server has `OPENCLAW_API_TOKEN` set, every request below must include:

```http
Authorization: Bearer <OPENCLAW_API_TOKEN>
```

Set the token in OpenClaw’s environment; never paste the token into agent markdown or chat.

Related env vars (server-side, not for client apps):

- `OPENCLAW_API_TOKEN` — Bearer secret
- `OPENCLAW_USER_ID` — optional; scopes pending rows to a user (see `api/openclaw/payloads.ts`)

## Endpoints

### GET /api/openclaw/ping

Health check. No auth required on some deployments; use to verify reachability.

### GET /api/openclaw/status

**Read-only** snapshot for the OpenClaw-scoped user (`OPENCLAW_USER_ID` on the server). No SQL — one JSON document.

**Headers:** `Authorization: Bearer …` when token is configured.

**Query (optional):** `pending_limit` (default 20, max 50), `transaction_limit` (default 15, max 50).

**Returns:** `pending_expenses.counts` (pending / approved / declined), `pending_expenses.recent`, `transactions.recent`, `goals.items`, plus `hints` for categories and submit path.

Use at conversation start, after submissions, or on heartbeat to stay aligned with the household’s real data.

### GET /api/openclaw/month-summary

**Read-only** booked ledger for one Hebrew calendar month, bucketed by the **assigned** `date` on each transaction (same rule as the NestEgg app UI — not `created_at`, not the stored `month`/`year` columns alone).

**Query (required):** `month` — Hebrew month name (e.g. `אפריל`), `year` — e.g. `2026`  
**Query (optional):** `include_transactions=true` — include full row list (can be large; default is totals only).

**Example:**  
`GET /api/openclaw/month-summary?month=אפריל&year=2026`

**Returns:** `totals` (income, expenses, savings_transfers, net_after_expenses_and_savings), `expenses_by_category`, `counts`, `basis: "assigned_date_field"`, and `query.date_gte` / `query.date_lt` (half-open ISO month range, e.g. `2026-04-01` .. `< 2026-05-01`).

**Storage note:** The server scopes rows with `date` in that ISO range (works for `date`, `timestamp`, and ISO-prefixed text). Legacy rows whose `date` is only `D.M.YYYY` text may be omitted until the row’s `date` is normalized (e.g. after an edit/save in NestEgg).

For **monthly spend / category reports in chat**, prefer this endpoint over inferring totals from `GET /api/openclaw/status` (which only returns a short `transactions.recent` slice).

### GET /api/categories

Returns categories with subcategories and hints for matching.

**Headers:** `Authorization: Bearer …` when token is configured.

Use the response as the **only** authoritative list of `category` / `subcategory` strings.

### POST /api/openclaw/payloads

Creates a **pending** expense.

**Headers:** `Content-Type: application/json`, `Authorization: Bearer …` when configured.

**Body:** either a **flat** JSON object or `{ "payload": { ... } }` (both supported).

**Required fields:**

| Field        | Type   | Notes |
|-------------|--------|--------|
| `title`     | string | Vendor / merchant name |
| `amount`    | string | e.g. `"125.50"` |
| `category`  | string | Exact Hebrew name from GET /api/categories |
| `date`      | string | `YYYY-MM-DD` or parseable date |

**Optional fields:**

| Field          | Type        | Notes |
|----------------|------------|--------|
| `subcategory`  | string \| null | Exact Hebrew subcategory or `null` |
| `month`        | string     | Hebrew month name; derived from `date` if omitted |
| `year`         | string     | e.g. `"2026"`; derived from `date` if omitted |
| `notes`        | string \| null | Line items, receipt #, context |
| `raw_payload`  | object \| null | Full extraction / OCR blob for audit |

**Success:** `201` + created row (includes `id`, `status: "pending"`).

**Errors:** `400` (validation), `401` (auth), `500` (server).

### GET /api/openclaw/payloads

Lists pending payloads for the configured user (requires auth when token is set). Useful for debugging or confirming submissions.

## Language

User-facing text (status summaries, reminders after `POST`, questions to the household) should be **in Hebrew** unless the user is clearly messaging in English. API/JSON field names stay as documented.

## User-facing reminder

After a successful `POST /api/openclaw/payloads`, remind the user **in Hebrew** that the row is pending, e.g.:  
«ההוצאה נשלחה כ**ממתינה לאישור** — צריך לאשר ב־NestEgg לפני שהיא נספרת בספרים.»

## In-repo documentation

- `docs/OPENCLAW_INTEGRATION.md`
- `docs/OPENCLAW_CREDENTIALS.md`
- `docs/skills/openclaw-expense-extraction.md`
