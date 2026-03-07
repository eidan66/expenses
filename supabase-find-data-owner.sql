-- =============================================
-- Find which Supabase user owns your transactions & goals
-- Run in Supabase Dashboard → SQL Editor
-- =============================================
-- This helps you set VITE_SUPABASE_QUICK_AUTH_EMAIL so QuickAuth
-- (idansapir9394 / 20102025) signs in as the same user and loads data.

-- 1) user_id(s) that have data (RLS is off for this query in SQL Editor)
SELECT 'transactions' AS source, user_id, COUNT(*) AS row_count
FROM public.transactions
GROUP BY user_id
UNION ALL
SELECT 'goals', user_id, COUNT(*)
FROM public.goals
GROUP BY user_id
ORDER BY source, row_count DESC;

-- 2) Match that user_id to the auth user's email (so you can set it in .env)
-- Replace 'YOUR_USER_ID_HERE' with the user_id from the query above
/*
SELECT id, email, created_at
FROM auth.users
WHERE id::text = 'YOUR_USER_ID_HERE';
*/

-- 2b) Find email for specific user (c0d1a144-90cc-449f-a1ae-a1709cb534ca)
-- Run this to get the email, then set VITE_SUPABASE_QUICK_AUTH_EMAIL in .env.local
-- Note: Passwords cannot be retrieved (hashed). Reset in Supabase Dashboard if needed.
SELECT id, email, created_at
FROM auth.users
WHERE id::text = 'c0d1a144-90cc-449f-a1ae-a1709cb534ca';

-- 3) One-shot: show the email for the user who has the most transactions
SELECT u.id, u.email, u.created_at,
       (SELECT COUNT(*) FROM public.transactions t WHERE t.user_id = u.id::text) AS tx_count,
       (SELECT COUNT(*) FROM public.goals g WHERE g.user_id = u.id::text) AS goal_count
FROM auth.users u
WHERE EXISTS (SELECT 1 FROM public.transactions t WHERE t.user_id = u.id::text)
   OR EXISTS (SELECT 1 FROM public.goals g WHERE g.user_id = u.id::text)
ORDER BY tx_count DESC NULLS LAST
LIMIT 5;
