-- Add viator_link_clicks table for tracking Viator affiliate link clicks
CREATE TABLE IF NOT EXISTS viator_link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NULL, -- Can be null for anonymous users
  affiliate_url TEXT NOT NULL,
  product_code TEXT,
  trip_id UUID REFERENCES trips(id),
  page_context TEXT NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for user_id to make lookups faster
CREATE INDEX IF NOT EXISTS idx_viator_link_clicks_user_id ON viator_link_clicks(user_id);

-- Add index for trip_id
CREATE INDEX IF NOT EXISTS idx_viator_link_clicks_trip_id ON viator_link_clicks(trip_id);

-- Add index for product_code 
CREATE INDEX IF NOT EXISTS idx_viator_link_clicks_product_code ON viator_link_clicks(product_code);

-- Add index for clicked_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_viator_link_clicks_clicked_at ON viator_link_clicks(clicked_at);

-- Add RLS policy to allow inserts from authenticated users
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users"
  ON viator_link_clicks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add RLS policy to allow inserts from anonymous users (track non-logged-in clicks)
CREATE POLICY IF NOT EXISTS "Enable insert for anonymous users"
  ON viator_link_clicks
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add RLS policy to allow users to read their own click data
CREATE POLICY IF NOT EXISTS "Users can read their own click data"
  ON viator_link_clicks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Add RLS policy to allow service role to read all data
CREATE POLICY IF NOT EXISTS "Service role can read all click data"
  ON viator_link_clicks
  FOR SELECT
  TO service_role
  USING (true);

-- Enable RLS on the table
ALTER TABLE viator_link_clicks ENABLE ROW LEVEL SECURITY; 