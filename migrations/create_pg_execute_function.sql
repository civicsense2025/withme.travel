-- Migration to create pg_execute function
-- This adds a function to execute arbitrary SQL through RPC
-- IMPORTANT: This should only be available to service role/admin users, not anon or regular users

-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.pg_execute;

-- Create the function with security definer
CREATE OR REPLACE FUNCTION public.pg_execute(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Revoke execute from public
REVOKE EXECUTE ON FUNCTION public.pg_execute(text) FROM public;

-- Grant execute only to authenticated users with service role
-- The security definer ensures it runs with the privileges of the user who created it
GRANT EXECUTE ON FUNCTION public.pg_execute(text) TO service_role;

-- Add a comment explaining the security implications
COMMENT ON FUNCTION public.pg_execute(text) IS 'Execute arbitrary SQL. WARNING: High security risk. Only use with service_role clients.'; 