-- supabase/tests/database/00_sanity_check.test.sql
-- Basic test to ensure pgTAP is running

-- Start a transaction
BEGIN;

-- Plan to run 1 test
SELECT plan(1);

-- The actual test: Check if true is true
SELECT ok(true, 'pgTAP extension seems to be working correctly');

-- Finish the tests
SELECT * FROM finish();

-- Roll back the transaction (important!) 
ROLLBACK; 