-- =============================================
-- OpenClaw pending_expenses table
-- Run in Supabase Dashboard → SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS pending_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  amount text NOT NULL,
  category text NOT NULL,
  subcategory text,
  date text NOT NULL,
  month text NOT NULL,
  year text NOT NULL,
  notes text,
  raw_payload jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at timestamptz DEFAULT now()
);

-- Index for listing by user and status
CREATE INDEX IF NOT EXISTS idx_pending_expenses_user_created
  ON pending_expenses (user_id, created_at DESC);

-- RLS: service_role key bypasses RLS, so no policies needed for API access
ALTER TABLE pending_expenses ENABLE ROW LEVEL SECURITY;
