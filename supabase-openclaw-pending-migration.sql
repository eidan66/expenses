-- =============================================
-- Pending Expenses (OpenClaw) Migration
-- =============================================
-- Execute in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
--
-- Env: Set OPENCLAW_USER_ID in Vercel (or .env) for the user receiving OpenClaw payloads.
-- =============================================

CREATE TABLE IF NOT EXISTS pending_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  amount TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  date TEXT NOT NULL,
  month TEXT NOT NULL,
  year TEXT NOT NULL,
  notes TEXT,
  raw_payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for listing pending items by user and status
CREATE INDEX IF NOT EXISTS idx_pending_expenses_user_status ON pending_expenses(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pending_expenses_created_at ON pending_expenses(created_at DESC);

-- RLS: authenticated users can SELECT (for the pending-expenses screen)
ALTER TABLE pending_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pending_expenses"
  ON pending_expenses FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Service role bypasses RLS for INSERT/UPDATE (API uses service role)
-- No policy needed for service_role - it bypasses RLS by default
