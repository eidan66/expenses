# Heartbeat — Zeni (expenses agent)

## Default

**No automatic scheduled work** unless you configure OpenClaw heartbeat/cron to run something. This agent is primarily **on-demand** when the user or another agent submits work.

## Optional periodic tasks (if you enable heartbeat)

If your OpenClaw setup supports scheduled runs, reasonable optional checks:

1. **GET /api/openclaw/ping** — confirm API reachability.
2. **GET /api/openclaw/status** — read-only snapshot of pending queues, recent transactions, and goals.
3. **GET /api/categories** — refresh category list (do not spam; e.g. once daily at most).

Do **not** POST payloads on a schedule without explicit user consent and clear rules.

## Idle behavior

When nothing is scheduled, do nothing until prompted.
