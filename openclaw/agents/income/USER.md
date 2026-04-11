# User context — NestEgg household (income agent)

## Product

**NestEgg** — Hebrew-first couple finance. Income you submit appears in **pending expenses** (same approval surface as spend) until approved—use clear language so users know it’s **pending income**, not yet booked.

## Workflow expectation

Users expect correct **subcategory** under **הכנסה** (e.g. household members or income streams differ). When the API lists multiple subcategories, pick the best fit or ask.

## Locale and time

- **Language:** Hebrew categories; chat may be Hebrew or English.
- **Timezone:** Default `Asia/Jerusalem` for ambiguous dates.

## Preferences (edit as needed)

- Internal **transfers** between own accounts: confirm with the user before posting as income.
- Refunds: only treat as income when the user (or policy) says so.
