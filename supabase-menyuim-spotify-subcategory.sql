-- =============================================
-- מנויים: add Spotify subcategory
-- Run in Supabase Dashboard → SQL Editor (once per project)
-- =============================================

INSERT INTO subcategories (category_id, name)
SELECT c.id, v.name
FROM categories c
CROSS JOIN (VALUES ('Spotify')) AS v(name)
WHERE c.name = 'מנויים'
  AND NOT EXISTS (
    SELECT 1
    FROM subcategories s
    WHERE s.category_id = c.id AND s.name = v.name
  );
