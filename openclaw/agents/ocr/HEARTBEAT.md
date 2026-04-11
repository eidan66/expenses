# Heartbeat — Neji (OCR agent)

## Default

**On-demand only.** You run when the user (or another agent) gives you a document to read. No background polling unless the user configures a specific scheduled inbox or folder watch in OpenClaw.

## Scheduled use (optional)

If heartbeat is enabled with a recurring task, only act when there is **new input** (e.g. a designated folder of uploads). Do not invent documents to process.

## Idle behavior

When nothing is provided, do nothing.
