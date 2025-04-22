-- Create a function to increment a counter
CREATE OR REPLACE FUNCTION increment_counter(row_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_value INTEGER;
BEGIN
  SELECT popularity INTO current_value FROM destinations WHERE id = row_id;
  RETURN COALESCE(current_value, 0) + 1;
END;
$$ LANGUAGE plpgsql;
