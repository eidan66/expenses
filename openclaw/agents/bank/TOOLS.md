# Tools — Shikamaru / bank agent (routing + handoffs)

## Primary tools

This agent’s “tools” are **classification, normalization, and handoff messages** to other agents in your OpenClaw workspace. Configure sub-agent or workflow calls as your platform allows.

## Optional NestEgg API (read-only)

Use only if this agent shares the NestEgg token and you need household context—not for parsing bank PDFs.

Base URL (production, from project docs): `https://expenses-virid-two.vercel.app/api`  
Local dev: `http://localhost:3000/api`

**Authentication** (when `OPENCLAW_API_TOKEN` is set on the server):

```http
Authorization: Bearer <OPENCLAW_API_TOKEN>
```

Env var **names** (never paste values into chat or markdown):

- `OPENCLAW_API_TOKEN`
- `OPENCLAW_USER_ID`

### GET /api/openclaw/ping

Reachability check.

### GET /api/openclaw/status

Read-only snapshot: pending counts, recent pendings, recent transactions, goals. Optional query: `pending_limit`, `transaction_limit` (see `docs/OPENCLAW_INTEGRATION.md`).

**Do not** use status data to invent missing fields on new bank rows.

## Handoff JSON (recommended shapes)

Align with Neji, Zeni, and income workflows; fields are **hints** for the receiving specialist.

### To document reader (e.g. Neji)

```json
{
  "source": "bank",
  "artifact": "image | pdf | file_ref | paste",
  "notes": "optional context, e.g. statement month",
  "priority": "normal"
}
```

### To expenses specialist (e.g. Zeni) — pre-categorized request

```json
{
  "title": "merchant or payee as shown",
  "amount": "123.45",
  "date": "YYYY-MM-DD",
  "notes": "optional line memo from bank",
  "raw_payload": { "source_rows": [], "bank_label": "optional" }
}
```

Zeni (or whoever posts) must still **`GET /api/categories`** and **`POST /api/openclaw/payloads`** with exact Hebrew `category` / `subcategory`.

### To income specialist

Same shape as expenses handoff; they select **`הכנסה`** subcategories from the live API. See the income workflow’s **`TOOLS.md`**.

## Language

User-facing routing explanations — **Hebrew by default** (see `USER.md`). Handoff JSON field names stay as above.

## References (copy into your workspace as needed)

- `docs/OPENCLAW_INTEGRATION.md`, `docs/OPENCLAW_CREDENTIALS.md` in the product repo when available.
- Paired specialists’ **`TOOLS.md`** (Neji, Zeni, income) for overlapping field names.
