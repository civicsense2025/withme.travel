-- Migration to add the execute_sql function for schema checks

CREATE OR REPLACE FUNCTION public.execute_sql(query TEXT)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    row record;
BEGIN
  -- Loop through results and convert each row to json
  FOR row IN EXECUTE query LOOP
    RETURN NEXT to_json(row);
  END LOOP;
  RETURN;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$; 