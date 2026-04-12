# OpenClaw API Credentials

Use these values when configuring OpenClaw to call the NestEgg expense API.

## Credentials

| Variable   | Value                                                |
| ---------- | ---------------------------------------------------- |
| Base URL   | `https://expenses-virid-two.vercel.app/api`          |
| Dev URL    | `http://localhost:3000/api`                          |
| API Token  | Set `OPENCLAW_API_TOKEN` in Vercel env (see below)   |
| Header     | `Authorization: Bearer <token>`                      |
| User scope | **`OPENCLAW_USER_ID`** — must match NestEgg login (see below) |

## Setup

1. **Generate a token** (if not already set):

   ```bash
   openssl rand -hex 32
   ```

   Or with Node:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Add to Vercel:** Project Settings → Environment Variables → add `OPENCLAW_API_TOKEN` with the generated value. Redeploy.

3. **Add to local .env** (for `yarn dev:api`):

   ```
   OPENCLAW_API_TOKEN=<your-token>
   ```

4. **Configure OpenClaw** to send this header on every request:

   ```
   Authorization: Bearer <your-token>
   ```

## `OPENCLAW_USER_ID` (required for correct totals)

All OpenClaw routes (`/api/openclaw/status`, `/month-summary`, `/payloads`, …) filter data with **one** Supabase `user_id`. The NestEgg **web app** shows whatever the **signed-in** Supabase user owns (see [DATA_AND_QUICK_AUTH.md](DATA_AND_QUICK_AUTH.md)).

- **If `OPENCLAW_USER_ID` is missing** on Vercel, handlers fall back to a **code default UUID** — which is usually **not** the same account as your browser. You will see **different** transactions, years, and totals than the dashboard (e.g. a handful of old rows vs full April 2026).
- **Fix:** Set **`OPENCLAW_USER_ID`** in **Vercel → Project → Environment Variables** to the **exact** `user_id` (UUID string) of the Supabase Auth user you use in NestEgg.

**How to get the UUID**

1. Supabase Dashboard → **Authentication** → **Users** → open the user you log in with → copy **User UID**.
2. Or run in **SQL Editor** (replace email if needed):

   ```sql
   select id, email from auth.users order by created_at desc;
   ```

   Use `id::text` as `OPENCLAW_USER_ID`.

3. Redeploy the Vercel project after changing env vars.

**Verify:** `GET /api/openclaw/month-summary?...` returns `scope.user_id` in JSON — it must match the dashboard owner’s UUID.

## Endpoints

- `GET /api/openclaw/ping` — health check (no auth, no Supabase). Use to verify the API is reachable.
- `GET /api/categories` — fetch categories and subcategories
- `GET /api/openclaw/status` — read-only snapshot (pending counts, recent pendings, recent transactions, goals) for the OpenClaw user
- `POST /api/openclaw/payloads` — submit expense payload

Categories, status, and payloads require the `Authorization: Bearer <token>` header when `OPENCLAW_API_TOKEN` is set.
