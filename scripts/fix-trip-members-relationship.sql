-- Script to fix the multiple relationships between trip_members and profiles
-- Run this in the Supabase SQL Editor

-- Start a transaction so we can rollback if something goes wrong
BEGIN;

-- First, let's identify all foreign key constraints between trip_members and profiles
SELECT 
    tc.constraint_name,
    tc.table_schema as schema_name, 
    tc.table_name as table_with_fk,
    kcu.column_name as fk_column,
    ccu.table_schema as target_schema,
    ccu.table_name as target_table,
    ccu.column_name as target_column
FROM 
    information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu 
      ON tc.constraint_name = ccu.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' AND
    ((tc.table_name = 'trip_members' AND ccu.table_name = 'profiles') OR
     (tc.table_name = 'profiles' AND ccu.table_name = 'trip_members'));

-- Now drop all relationships except one (assuming we find multiple)
-- The DO block below will keep the first relationship and drop all others
DO $$
DECLARE
    first_constraint_name text := NULL;
    r RECORD;
BEGIN
    -- Loop through all relationships between trip_members and profiles
    FOR r IN 
        SELECT 
            tc.constraint_name,
            tc.table_schema as schema_name, 
            tc.table_name as table_with_fk
        FROM 
            information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu 
              ON tc.constraint_name = ccu.constraint_name
        WHERE 
            tc.constraint_type = 'FOREIGN KEY' AND
            ((tc.table_name = 'trip_members' AND ccu.table_name = 'profiles') OR
             (tc.table_name = 'profiles' AND ccu.table_name = 'trip_members'))
        ORDER BY tc.constraint_name
    LOOP
        -- If this is the first relationship, keep it
        IF first_constraint_name IS NULL THEN
            first_constraint_name := r.constraint_name;
            RAISE NOTICE 'Keeping constraint: %.%.%', 
                         r.schema_name, r.table_with_fk, r.constraint_name;
        -- Otherwise, drop all other relationships
        ELSE
            RAISE NOTICE 'Dropping constraint: %.%.%', 
                         r.schema_name, r.table_with_fk, r.constraint_name;
                         
            EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT %I', 
                          r.schema_name, r.table_with_fk, r.constraint_name);
        END IF;
    END LOOP;
    
    -- If no constraints were found
    IF first_constraint_name IS NULL THEN
        RAISE NOTICE 'No constraints found between trip_members and profiles';
    END IF;
END $$;

-- Commit the changes
COMMIT; 