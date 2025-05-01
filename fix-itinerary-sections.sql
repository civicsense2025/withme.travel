-- First, let's check if sections exist for this template
SELECT count(*) AS section_count
FROM itinerary_template_sections
WHERE template_id = (
  SELECT id FROM itinerary_templates
  WHERE slug = 'traditional-kyoto-4-day-cultural-immersion'
);

-- Verify the template ID
SELECT id, title FROM itinerary_templates
WHERE slug = 'traditional-kyoto-4-day-cultural-immersion';

-- Verify the relationship keys that exist
SELECT 
  c.conname AS constraint_name,
  c.contype AS constraint_type,
  tbl.relname AS table_name,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class tbl ON tbl.oid = c.conrelid
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE tbl.relname = 'itinerary_template_sections'
AND n.nspname = 'public';

-- Check if we have multiple relationships between these tables
SELECT 
  c.conname AS constraint_name,
  tbl.relname AS table_name,
  reftbl.relname AS referenced_table_name,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class tbl ON tbl.oid = c.conrelid
JOIN pg_class reftbl ON reftbl.oid = c.confrelid
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE tbl.relname = 'itinerary_template_sections'
AND reftbl.relname = 'itinerary_templates'
AND n.nspname = 'public';

-- Create sections if none exist
INSERT INTO itinerary_template_sections (
  template_id, day_number, title, position, created_at, updated_at
)
SELECT 
  id AS template_id, 
  1 AS day_number, 
  'Day 1' AS title, 
  1 AS position, 
  NOW() AS created_at, 
  NOW() AS updated_at
FROM itinerary_templates
WHERE slug = 'traditional-kyoto-4-day-cultural-immersion'
AND NOT EXISTS (
  SELECT 1 FROM itinerary_template_sections 
  WHERE template_id = itinerary_templates.id 
  AND day_number = 1
)
RETURNING id;

-- Add sections for days 2-4 if needed
INSERT INTO itinerary_template_sections (
  template_id, day_number, title, position, created_at, updated_at
)
SELECT 
  id AS template_id, 
  2 AS day_number, 
  'Day 2' AS title, 
  2 AS position, 
  NOW() AS created_at, 
  NOW() AS updated_at
FROM itinerary_templates
WHERE slug = 'traditional-kyoto-4-day-cultural-immersion'
AND NOT EXISTS (
  SELECT 1 FROM itinerary_template_sections 
  WHERE template_id = itinerary_templates.id 
  AND day_number = 2
)
RETURNING id;

INSERT INTO itinerary_template_sections (
  template_id, day_number, title, position, created_at, updated_at
)
SELECT 
  id AS template_id, 
  3 AS day_number, 
  'Day 3' AS title, 
  3 AS position, 
  NOW() AS created_at, 
  NOW() AS updated_at
FROM itinerary_templates
WHERE slug = 'traditional-kyoto-4-day-cultural-immersion'
AND NOT EXISTS (
  SELECT 1 FROM itinerary_template_sections 
  WHERE template_id = itinerary_templates.id 
  AND day_number = 3
)
RETURNING id;

INSERT INTO itinerary_template_sections (
  template_id, day_number, title, position, created_at, updated_at
)
SELECT 
  id AS template_id, 
  4 AS day_number, 
  'Day 4' AS title, 
  4 AS position, 
  NOW() AS created_at, 
  NOW() AS updated_at
FROM itinerary_templates
WHERE slug = 'traditional-kyoto-4-day-cultural-immersion'
AND NOT EXISTS (
  SELECT 1 FROM itinerary_template_sections 
  WHERE template_id = itinerary_templates.id 
  AND day_number = 4
)
RETURNING id;

-- Check if sections were created
SELECT * FROM itinerary_template_sections
WHERE template_id = (
  SELECT id FROM itinerary_templates
  WHERE slug = 'traditional-kyoto-4-day-cultural-immersion'
)
ORDER BY day_number;

-- Check if RLS policies might be preventing access
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'itinerary_template_sections'; 