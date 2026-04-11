# OpenClaw API Credentials

Use these values when configuring OpenClaw to call the NestEgg expense API.

## Credentials

| Variable   | Value                                                |
| ---------- | ---------------------------------------------------- |
| Base URL   | `https://expenses-virid-two.vercel.app/api`          |
| Dev URL    | `http://localhost:3000/api`                          |
| API Token  | Set `OPENCLAW_API_TOKEN` in Vercel env (see below)   |
| Header     | `Authorization: Bearer <token>`                      |

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

## Endpoints

- `GET /api/openclaw/ping` — health check (no auth, no Supabase). Use to verify the API is reachable.
- `GET /api/categories` — fetch categories and subcategories
- `GET /api/openclaw/status` — read-only snapshot (pending counts, recent pendings, recent transactions, goals) for the OpenClaw user
- `POST /api/openclaw/payloads` — submit expense payload

Categories, status, and payloads require the `Authorization: Bearer <token>` header when `OPENCLAW_API_TOKEN` is set.
