# Heartbeat — Shikamaru (bank agent)

## Default

**No automatic scheduled work** unless you configure OpenClaw heartbeat/cron. This agent is usually **on-demand** when the user drops a file or export.

## Optional periodic tasks (if enabled)

Reasonable read-only checks (same token as other NestEgg agents):

1. **GET /api/openclaw/ping** — API reachability.
2. **GET /api/openclaw/status** — light queue awareness before batch routing.

Do **not** push handoffs or POST payloads on a schedule without explicit user rules.

## Idle behavior

When nothing is scheduled, wait for new bank-side input.
