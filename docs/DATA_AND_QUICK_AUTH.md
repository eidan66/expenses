# How data is stored and how QuickAuth loads it

## Where data is saved

- **Tables:** `public.transactions`, `public.goals` (and `categories` / `subcategories`, which are shared).
- **Ownership:** Each row in `transactions` and `goals` has a `user_id` (text) that must equal the signed-in Supabase user’s UUID (as text).
- **RLS:** Row Level Security enforces `auth.uid()::text = user_id` for SELECT/INSERT/UPDATE/DELETE. So you only see and write rows whose `user_id` is the current Supabase Auth user.

## How it’s saved when you’re logged in

- **Create:** `createTransaction` and `createGoal` in `client/src/lib/supabaseQueries.ts` get the current user with `supabase.auth.getUser()` and set `user_id` to that UUID. So “the data” is whatever is stored under that Supabase user’s id.
- **Read:** `getTransactions()` and `getGoals()` run with the same Supabase session; RLS automatically filters to rows where `user_id = auth.uid()::text`.

## QuickAuth (idansapir9394 / 20102025) and pulling existing data

- QuickAuth only controls **app access** (Dashboard vs QuickLogin). It does **not** by itself create a Supabase session.
- To **pull the data that already exists**, the app must be signed in to Supabase as the **same user** whose `user_id` is on those rows.
- So: the “current data” was saved under one Supabase Auth user. You need to sign in as that user so RLS returns those rows.

## What we did in code

- After a successful **QuickAuth** login (correct username + password), the app calls **Supabase** `signInWithPassword` with:
  - **Email:** `VITE_SUPABASE_QUICK_AUTH_EMAIL` from `.env`, or `{username}@gmail.com` (e.g. `idansapir9394@gmail.com`).
  - **Password:** the same QuickAuth password (`20102025`).
- If that Supabase account exists and matches the one that owns the data, you get one login (QuickAuth) and all existing data loads by default.

## What you need to do

1. **Find the data owner (Supabase user)**  
   Run the script **`supabase-find-data-owner.sql`** in **Supabase Dashboard → SQL Editor**. The last query shows the auth user(s) that have transactions/goals and their **email**.
2. **Set that email in `.env`**  
   Set `VITE_SUPABASE_QUICK_AUTH_EMAIL` to that email (e.g. `your@email.com`). Ensure that Supabase Auth user’s password is `20102025` (or change the QuickAuth password in code to match).
3. **Use one login**  
   Log in with QuickAuth (idansapir9394 / 20102025). The app will sign you into Supabase with that email/password and load all data tied to that user.

## Auto-login (skip login UI)

To sign in as a specific user by default and skip the QuickLogin screen:

1. **Get the user's email** — Run the query in `supabase-find-data-owner.sql` (section 2b) for your `user_id`, or use section 3 for data owners.
2. **Get or set the password** — Passwords cannot be retrieved (they're hashed). Use the known password or reset it in **Supabase Dashboard → Authentication → Users**.
3. **Set env vars in `client/.env.local`**:
   ```
   VITE_SUPABASE_QUICK_AUTH_EMAIL=user@example.com
   VITE_SUPABASE_QUICK_AUTH_PASSWORD=your-password
   ```
4. **Restart the dev server** — The app will auto sign-in and show the Dashboard without showing the login UI.

## Summary

| What                | Where / How |
|---------------------|-------------|
| Transactions stored | `public.transactions`, column `user_id` = Supabase user UUID (text) |
| Goals stored        | `public.goals`, column `user_id` = Supabase user UUID (text) |
| Who can see them    | Only the Supabase user with that `user_id` (RLS) |
| How QuickAuth helps | After QuickAuth, we sign in to Supabase with `VITE_SUPABASE_QUICK_AUTH_EMAIL` + QuickAuth password so that user’s data loads by default |
