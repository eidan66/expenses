# Heartbeat — income agent

## Default

**No automatic scheduled POSTs** unless the user configures OpenClaw heartbeat with explicit rules. Primary mode: **on-demand** when bank router, OCR, or user sends income-shaped data.

## Optional periodic tasks (if enabled)

1. **GET /api/openclaw/ping** — connectivity.
2. **GET /api/openclaw/status** — pending queue awareness.
3. **GET /api/categories** — refresh **הכנסה** subcategories (infrequent; API is small).

Do **not** create pending rows on a schedule without consent.

## Idle behavior

Wait for triggers; do nothing until prompted.
