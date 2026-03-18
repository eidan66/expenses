# NestEgg API 500 Error Diagnostic

When OpenClaw (or any client) receives `500 FUNCTION_INVOCATION_FAILED` from the NestEgg API, follow this guide to diagnose and fix.

## Root Cause

`FUNCTION_INVOCATION_FAILED` occurs when a Vercel serverless function **crashes** (uncaught exception) before it can return a response. As of the latest changes, all API handlers now catch errors and return structured JSON, so you should see a more specific error message in the response body.

## Most Likely Causes

### 1. Missing Supabase env vars

**Symptom:** GET /api/categories and POST /api/openclaw/payloads both return 500.

**Cause:** The API needs these in Vercel Project Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Or `VITE_SUPABASE_URL` — e.g. `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | From Supabase Dashboard → Settings → API → service_role key |

**Fix:** Add both in Vercel → Project Settings → Environment Variables. Redeploy.

### 2. Bearer token mismatch

**Symptom:** 401 Unauthorized instead of 500.

**Cause:** `OPENCLAW_API_TOKEN` is set in Vercel, but the request header doesn’t match.

**Fix:** Set `Authorization: Bearer <exact-token>` where `exact-token` matches the value of `OPENCLAW_API_TOKEN` in Vercel.

### 3. Missing tables

**Symptom:** 500 with `relation "categories" does not exist` or similar.

**Cause:** Supabase migrations or tables not created.

**Fix:** Run migrations in Supabase Dashboard → SQL Editor:

- `categories` and `subcategories` tables
- `pending_expenses` table (see `supabase-openclaw-pending-migration.sql` if present)

## How to Inspect the Error

1. **Response body:** Check the JSON body for `error` or `message`. Example:
   ```json
   { "error": "Missing Supabase env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). Add them in Vercel Project Settings." }
   ```

2. **Vercel logs:** Vercel Dashboard → Project → Deployments → select deployment → Functions → Logs tab.

3. **Local test:** Run `yarn dev:api` and call the same endpoints locally. Ensure `.env` has `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and optionally `OPENCLAW_API_TOKEN`.

## POST /api/openclaw/payloads — Payload Requirements

| Field | Required | Type | Example |
|-------|----------|------|---------|
| `title` | Yes | string | `"אייץ' אנד אר פתרח אופנה 2003 בע\"מ"` |
| `amount` | Yes | string or number | `299.60` or `"299.60"` |
| `category` | Yes | string | `"קניות"` |
| `date` | Yes | string | `"2026-03-18"` (ISO) |
| `subcategory` | No | string | `"אחר"` |
| `notes` | No | string | |
| `raw_payload` | No | object | `{ items, total }` |
| `month` | No | string | `"מרץ"` (derived from date if omitted) |
| `year` | No | string | `"2026"` (derived from date if omitted) |

## Headers for OpenClaw

```
Authorization: Bearer <OPENCLAW_API_TOKEN>
Content-Type: application/json
```

## Quick Checklist

- [ ] `SUPABASE_URL` or `VITE_SUPABASE_URL` set in Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Vercel
- [ ] `OPENCLAW_API_TOKEN` set in Vercel (if using Bearer auth)
- [ ] Redeploy after changing env vars
- [ ] `Authorization: Bearer <token>` header when `OPENCLAW_API_TOKEN` is set.
