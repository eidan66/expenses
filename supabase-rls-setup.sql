-- =============================================
-- Supabase Row Level Security (RLS) Setup
-- =============================================
-- Execute these commands in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- =============================================

-- Phase 2.1: Enable Row Level Security on all tables
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Phase 2.2: Create Security Policies for Transactions
-- =============================================

-- Users can only view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can only insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can only update their own transactions
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Users can only delete their own transactions
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid()::text = user_id);

-- Phase 2.3: Create Security Policies for Goals
-- =============================================

-- Users can only view their own goals
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can only insert their own goals
CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can only update their own goals
CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Users can only delete their own goals
CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  USING (auth.uid()::text = user_id);

-- =============================================
-- Verification Queries
-- =============================================
-- Run these to verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- 
-- Run this to see all policies:
-- SELECT * FROM pg_policies WHERE schemaname = 'public';

