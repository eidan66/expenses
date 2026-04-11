# Memory — durable facts (Zeni / expenses agent)

## API base

- Production API base (from project docs): `https://expenses-virid-two.vercel.app/api`

## Read-only “ping”

- **`GET /api/openclaw/status`** — Current counts and recent rows for pendings, transactions, and goals (scoped user). Use before/after work; sub-agents should rely on this instead of imagining state.

## Category rules

- **Source of truth:** `GET /api/categories` — use exact `name` and subcategory strings from the response.
- **Fallback when unsure:** category **שונות**, subcategory **אחר**.
- **Common mappings** (hints only; API still wins): supermarket → **קניות** (סופר / שוק); fuel → **תחבורה (רכב)**; Netflix-style → **חשבונות קבועים**.

## Payload rules

- Required: `title`, `amount`, `category`, `date`.
- `amount` is a **string** in the JSON body (e.g. `"342.50"`).
- `month` / `year` may be omitted; API derives Hebrew month and year from `date` when missing.
- Include **`raw_payload`** when the OCR agent (or another step) provided extraction details for audit.

## Income

- Category **הכנסה** exists in the system for income-like rows. A dedicated **income agent** may own that flow later; this agent still uses the same payload endpoint and category list.

## User scoping

- Pending rows are associated with the user id configured server-side (`OPENCLAW_USER_ID` or default in handler). You do not set `user_id` in the POST body.

## Hebrew month names (if you ever set month manually)

ינואר, פברואר, מרץ, אפריל, מאי, יוני, יולי, אוגוסט, ספטמבר, אוקטובר, נובמבר, דצמבר
