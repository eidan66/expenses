# OpenClaw Quick Start

One-time setup, then one command to run everything.

## 1. One-time setup

Add `SUPABASE_SERVICE_ROLE_KEY` and optionally `OPENCLAW_API_TOKEN` to your project:

**Option A – Supabase Dashboard**
1. Open [Supabase API Settings](https://supabase.com/dashboard/project/yaofpgeatsbrswjkwgwm/settings/api)
2. Copy the **service_role** key (secret)
3. Add to `.env`: `SUPABASE_SERVICE_ROLE_KEY=eyJ...`

**Option B – Vercel**
1. `vercel env add SUPABASE_SERVICE_ROLE_KEY` (paste the key when prompted)
2. `vercel env pull .env.vercel`

**Run migration** (one-time): Supabase Dashboard → SQL Editor → run `supabase-openclaw-pending-migration.sql`

**OpenClaw token** (optional): To require Bearer auth for OpenClaw, add `OPENCLAW_API_TOKEN` to `.env` and Vercel. See [OPENCLAW_CREDENTIALS.md](OPENCLAW_CREDENTIALS.md).

## 2. Run everything

```bash
yarn dev:all
```

Starts both the API (port 3000) and the client (port 4321).

## 3. Test in browser

1. Open http://localhost:4321/pending-expenses
2. Use OpenClaw to send a payload, or POST to `/api/openclaw/payloads` with a test payload
3. Approve or decline in the UI

## Commands

| Command | Description |
|--------|-------------|
| `yarn dev:all` | Start API + client |
| `yarn dev:api` | Start API only |
| `yarn dev` | Start client only |
