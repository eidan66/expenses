-- =============================================
-- Categories and Subcategories Migration
-- =============================================
-- Execute these commands in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- =============================================

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('Expense', 'Income')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, name)
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (all authenticated users can read, but only system can write)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view subcategories"
  ON subcategories FOR SELECT
  TO authenticated
  USING (true);

-- Insert all existing categories
INSERT INTO categories (name, type) VALUES
  ('דיור', 'Expense'),
  ('בריאות', 'Expense'),
  ('ביטוחים', 'Expense'),
  ('צריכה', 'Expense'),
  ('ביגוד והנעלה', 'Expense'),
  ('חשבונות קבועים', 'Expense'),
  ('תקשורת', 'Expense'),
  ('תחבורה (רכב)', 'Expense'),
  ('תחבורה (אופנוע)', 'Expense'),
  ('תחבורה ציבורית', 'Expense'),
  ('חיות', 'Expense'),
  ('קניות אונליין', 'Expense'),
  ('שירותים דיגיטליים', 'Expense'),
  ('בילויים ופנאי', 'Expense'),
  ('שונות', 'Expense'),
  ('חיסכון', 'Expense'),
  ('הכנסה', 'Income'),
  ('קניות', 'Expense')
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for each category
-- Note: We'll use a CTE to get category IDs dynamically
WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'דיור'),
  unnest(ARRAY['שכירות/משכנתא', 'ביטוח מבנה', 'ועד בית', 'ארנונה', 'חשמל', 'מים', 'גז', 'אינטרנט', 'תמי 4', 'אחר'])
ON CONFLICT (category_id, name) DO NOTHING;

WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'בריאות'),
  unnest(ARRAY['רפואה כללית', 'שיניים', 'אחר'])
ON CONFLICT (category_id, name) DO NOTHING;

WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'ביטוחים'),
  unnest(ARRAY['ביטוח בריאות', 'ביטוח חיים', 'אחר'])
ON CONFLICT (category_id, name) DO NOTHING;

WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'צריכה'),
  unnest(ARRAY['אוכל', 'טואלטיקה/היגיינה'])
ON CONFLICT (category_id, name) DO NOTHING;

WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'ביגוד והנעלה'),
  unnest(ARRAY['ביגוד והנעלה'])
ON CONFLICT (category_id, name) DO NOTHING;

WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'חשבונות קבועים'),
  unnest(ARRAY['טלוויזיה', 'נטפליקס', 'דיסני+', 'מצלמות אבטחה', 'אחר'])
ON CONFLICT (category_id, name) DO NOTHING;

WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'תקשורת'),
  unnest(ARRAY['טלפון נייד'])
ON CONFLICT (category_id, name) DO NOTHING;

WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'תחבורה (רכב)'),
  unnest(ARRAY['ביטוח', 'טסט', 'דלק', 'תחזוקה', 'חניה', 'אחר'])
ON CONFLICT (category_id, name) DO NOTHING;

WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'תחבורה (אופנוע)'),
  unnest(ARRAY['ביטוח', 'טסט', 'דלק', 'תחזוקה', 'חניה', 'אחר'])
ON CONFLICT (category_id, name) DO NOTHING;

WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'תחבורה ציבורית'),
  unnest(ARRAY['אוטובוס/רכבת', 'מונית', 'אחר'])
ON CONFLICT (category_id, name) DO NOTHING;

WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'חיות'),
  unnest(ARRAY['הוצאות דייזי', 'הוצאות דגים'])
ON CONFLICT (category_id, name) DO NOTHING;

WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'קניות אונליין'),
  unnest(ARRAY['Temu', 'Shein', 'AliExpress', 'אחר'])
ON CONFLICT (category_id, name) DO NOTHING;

WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'שירותים דיגיטליים'),
  unnest(ARRAY['ChatGPT/GPT', 'Cursor', 'אפליקציות', 'Google Drive', 'אחר'])
ON CONFLICT (category_id, name) DO NOTHING;

WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'שונות'),
  unnest(ARRAY['מזומן', 'אחר'])
ON CONFLICT (category_id, name) DO NOTHING;

WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'חיסכון'),
  unnest(ARRAY['יעד ארוך טווח', 'קרן חירום'])
ON CONFLICT (category_id, name) DO NOTHING;

WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'הכנסה'),
  unnest(ARRAY['הכנסות עידן', 'הכנסות ספיר', 'הכנסות אחר'])
ON CONFLICT (category_id, name) DO NOTHING;

-- Insert the new category "קניות" with its subcategories
WITH cat_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
  (SELECT id FROM cat_ids WHERE name = 'קניות'),
  unnest(ARRAY['סופר', 'שוק', 'אחר'])
ON CONFLICT (category_id, name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);

-- =============================================
-- Verification Queries
-- =============================================
-- Run these to verify:
-- SELECT c.name, COUNT(s.id) as subcategory_count 
-- FROM categories c 
-- LEFT JOIN subcategories s ON c.id = s.category_id 
-- GROUP BY c.name 
-- ORDER BY c.name;
--
-- SELECT c.name as category, s.name as subcategory
-- FROM categories c
-- LEFT JOIN subcategories s ON c.id = s.category_id
-- WHERE c.name = 'קניות'
-- ORDER BY s.name;
