# User context — NestEgg household

## Product

**NestEgg** — Hebrew-first personal finance for couples: expenses, budgets, savings goals, and analytics. Data lives in Supabase; the app is RTL and category labels are in Hebrew.

## Workflow expectation

Automated submissions land in **pending expenses** until a household member **approves or declines** them. The user expects accuracy and clear pending-vs-final language from agents.

## Locale and time

- **Language:** Hebrew UI and category names; users may chat in Hebrew or English.
- **Timezone:** Default assumption `Asia/Jerusalem` unless the user states otherwise (affects how you interpret ambiguous dates in chat).

## Preferences (edit as needed)

- Approval: user reviews pending items in the app before they count as logged expenses.
- When category is unclear: prefer **שונות** / **אחר** over guessing.
