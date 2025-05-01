-- Script to safely drop the public.users table
-- Run this in the Supabase SQL Editor

-- Start a transaction so we can rollback if something goes wrong
BEGIN;

-- First, let's identify all foreign key constraints that reference public.users
-- (for informational purposes)
SELECT 
    tc.constraint_name,
    tc.table_schema, 
    tc.table_name
FROM 
    information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu 
      ON tc.constraint_name = ccu.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' AND
    ccu.table_schema = 'public' AND
    ccu.table_name = 'users';

-- Specifically update itinerary_items to set created_by to NULL
-- This addresses the foreign key constraint in the item creation process
UPDATE public.itinerary_items 
SET created_by = NULL 
WHERE created_by IS NOT NULL;

-- Manually drop the itinerary_items_created_by_fkey constraint if it exists
ALTER TABLE IF EXISTS public.itinerary_items
DROP CONSTRAINT IF EXISTS itinerary_items_created_by_fkey;

-- Now drop the public.users table if it exists
DROP TABLE IF EXISTS public.users;

-- Commit the changes
COMMIT;
