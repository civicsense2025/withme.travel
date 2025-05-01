-- Migration to add the execute_sql function for schema checks

CREATE OR REPLACE FUNCTION public.execute_sql(query TEXT)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE query;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$; 