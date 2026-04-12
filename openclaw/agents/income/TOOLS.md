# Tools — NestEgg API (income agent)

Same HTTP contract as the expenses agent; you specialize in category **`הכנסה`** and its subcategories from the live API.

Base URL (production, from project docs): `https://expenses-virid-two.vercel.app/api`  
Local dev: `http://localhost:3000/api`

## Authentication

When the server has `OPENCLAW_API_TOKEN` set:

```http
Authorization: Bearer <OPENCLAW_API_TOKEN>
```

Env vars (names only): `OPENCLAW_API_TOKEN`, `OPENCLAW_USER_ID` (see `api/openclaw/payloads.ts`).

## Endpoints

### GET /api/openclaw/ping

Health check.

### GET /api/openclaw/status

Read-only snapshot for the scoped user: pending counts, recent rows, goals. Optional: `pending_limit`, `transaction_limit`.

### GET /api/categories

**Authoritative** list of categories (including `type`) and subcategories. Find **`הכנסה`** and use its `subcategories` strings **exactly** in POST bodies.

### POST /api/openclaw/payloads

Creates a **pending** row (same handler as expenses).

**Headers:** `Content-Type: application/json`, `Authorization: Bearer …` when configured.

**Body:** flat JSON or `{ "payload": { ... } }`.

**Required fields:**

| Field       | Type   | Notes |
|------------|--------|--------|
| `title`    | string | Employer, payer, or income source label |
| `amount`   | string | e.g. `"8500.00"` |
| `category` | string | Typically **`הכנסה`** — confirm on every run via GET |
| `date`     | string | `YYYY-MM-DD` or parseable |

**Optional:** `subcategory`, `month`, `year`, `notes`, `raw_payload` — same semantics as expenses agent (`openclaw/agents/expenses/TOOLS.md`).

**Success:** `201` + created row with `status: "pending"`.

### GET /api/openclaw/payloads

List pending payloads for debugging or confirmation.

## Language

User-facing status text and post-submit reminders — **Hebrew by default** (see `USER.md`). JSON/API field names unchanged.

## In-repo documentation

- `docs/OPENCLAW_INTEGRATION.md`
- `docs/skills/openclaw-expense-extraction.md`
- `openclaw/agents/expenses/TOOLS.md` — full field table
