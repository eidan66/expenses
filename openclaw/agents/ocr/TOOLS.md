# Tools — Neji / OCR agent

## Your tools (OpenClaw)

Use whatever **vision / OCR / file reading** capabilities your OpenClaw deployment provides for images and PDFs. This file does not name a specific vendor tool; refer to your workspace’s configured tools for scanning documents.

## Read-only NestEgg APIs (any agent)

### GET /api/openclaw/status

**Read-only** snapshot: pending expense counts, recent pendings, recent transactions, goals — scoped to the OpenClaw user on the server.

**Headers:** `Authorization: Bearer <OPENCLAW_API_TOKEN>` when configured.

**Query:** optional `pending_limit` (max 50), `transaction_limit` (max 50).

### GET /api/categories

Live Hebrew categories and subcategories (same auth header).

### GET /api/openclaw/payloads

Lists pending rows for the scoped user (read-only listing).

## What you do **not** own by default

- **Category matching + submit** — usually the **expenses** agent unless you run the full pipeline yourself.

## Handoff JSON (for Zeni / expenses specialist)

After reading a document, produce a single structured object the expenses workflow can consume:

```json
{
  "vendor": "string — merchant / store name (Hebrew or as printed)",
  "amount": "string — final total as string e.g. \"342.50\"",
  "date": "string — prefer YYYY-MM-DD",
  "notes": "string | null — line summary, receipt #, etc.",
  "currency": "string | null — e.g. ILS",
  "confidence": "high | medium | low",
  "confidence_notes": "string | null — why not high, if applicable",
  "raw_payload": {
    "source": "ocr",
    "lines": [],
    "subtotal": null,
    "vat": null,
    "total": null,
    "alternatives": [],
    "extra_text": "optional snippets from receipt"
  }
}
```

**Rules:**

- `amount` must match the **final payable total** when one is clearly labeled; if only subtotal is clear, set `confidence` to `medium` or `low` and explain in `confidence_notes` and `raw_payload`.
- `raw_payload` should be JSON-serializable (no circular structures). NestEgg stores it on pending rows for audit.

## POST /api/openclaw/payloads (when you submit)

Use only when you have **`title`, `amount`, `category`, `date`** (exact Hebrew `category` / `subcategory` from **GET /api/categories**). Same body rules as the expenses specialist (e.g. Zeni). This is the **only** write endpoint you should use — it inserts a **pending** row.

---

## Mapping reminder (for the expenses specialist, not your job to guess categories)

| Extraction   | NestEgg payload field |
|-------------|------------------------|
| `vendor`    | `title`                |
| `amount`    | `amount`               |
| `date`      | `date`                 |
| `notes`     | `notes`                |
| full object | `raw_payload`          |

## In-repo docs

- `docs/skills/openclaw-expense-extraction.md`
- `openclaw/agents/expenses/TOOLS.md` — API details when you need to align output shape
