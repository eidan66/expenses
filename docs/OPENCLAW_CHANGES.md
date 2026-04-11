# NestEgg API Changes — Notes for OpenClaw

This document summarizes recent changes to the NestEgg expense API. Use it when configuring or updating OpenClaw.

---

## Authentication

- When `OPENCLAW_API_TOKEN` is set, include `Authorization: Bearer <token>` on all requests to `GET /api/categories`, `GET /api/openclaw/status`, and `POST /api/openclaw/payloads`.

## Read-only status

- **`GET /api/openclaw/status`** — Scoped snapshot: pending expense counts and recent rows, recent transactions, goals. See [OPENCLAW_INTEGRATION.md](OPENCLAW_INTEGRATION.md) §2.2.
- See [OPENCLAW_CREDENTIALS.md](OPENCLAW_CREDENTIALS.md) for setup.

---

## Categories

### גמל להשקעה (Investment Provident Fund) is now a top-level category

- Use `category: "גמל להשקעה"` (not under חיסכון).
- Set `subcategory: null` when submitting.
- This is an **expense** — money going out to the provident fund. The API will store it as a negative amount.

### חיסכון (Savings) subcategories

- Only `יעד ארוך טווח` and `קרן חירום` remain under חיסכון.
- Do **not** use גמל להשקעה as a subcategory of חיסכון.

---

## Amount Format

- Use decimals when the receipt shows them: `"125.50"`, `"10.2"`, etc.
- The API accepts amounts as strings with decimal points.

---

## Sorting

- Transactions are fetched by last updated (most recent first). No change needed on your side.
