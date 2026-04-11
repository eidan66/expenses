# Memory — durable facts (income agent)

## API base

- Production: `https://expenses-virid-two.vercel.app/api`

## Category rules

- **Income category name** is **`הכנסה`** in current NestEgg data; always confirm via **`GET /api/categories`** (names and subcategories can change).
- **Subcategories:** Use exact strings from the API response under that category. Reference skill hints only: salary, household members, “אחר” — see `docs/skills/openclaw-expense-extraction.md` §2 (table); **API overrides docs**.
- If truly unsure which subcategory fits, prefer the subcategory that matches **אחר** or the closest generic option **only if** it exists on the API; otherwise ask the user.

## Payload rules

- Same as expenses: required `title`, `amount`, `category`, `date`; `amount` as **string**; `date` preferably **`YYYY-MM-DD`**.
- Include **`raw_payload`** when OCR or bank export provided structured extras.

## Read-only status

- **`GET /api/openclaw/status`** — useful before/after submissions.

## User scoping

- `OPENCLAW_USER_ID` (server env) scopes rows; you do not send `user_id` in the POST body.

## Hebrew months (manual `month` only if ever needed)

ינואר, פברואר, מרץ, אפריל, מאי, יוני, יולי, אוגוסט, ספטמבר, אוקטובר, נובמבר, דצמבר
