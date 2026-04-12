# User context — NestEgg household

## Product

**NestEgg** — Hebrew-first personal finance for couples: expenses, budgets, savings goals, and analytics. Data lives in Supabase; the app is RTL and category labels are in Hebrew.

## Workflow expectation

Automated submissions land in **pending expenses** until a household member **approves or declines** them. The user expects accuracy and clear pending-vs-final language from agents.

## Locale and time

- **Language:** Hebrew UI and category names. **Reply to users in Hebrew** by default (Telegram, WhatsApp, direct chat): clear, concise, ₪ and Israel-relevant dates.
- **Expect requests in Hebrew** as the normal case, e.g. «כמה כסף הוצאנו החודש?», «סטטוס הוצאות», «מה ממתין לאישור?». If the user writes **only in English** in a message, you may answer in English for that turn.
- **Timezone:** Default assumption `Asia/Jerusalem` unless the user states otherwise (affects how you interpret ambiguous dates in chat).

## Answer shape (ADHD-friendly)

Match **Hebrew** guidance above with a **scannable layout**: one-line summary first, then bullets, blank lines between blocks, short numbered «what to do next» when relevant. Full Hebrew templates: **`openclaw/agents/RESPONSE_SHAPE.md`**.

## Preferences (edit as needed)

- Approval: user reviews pending items in the app before they count as logged expenses.
- When category is unclear: prefer **שונות** / **אחר** over guessing.
