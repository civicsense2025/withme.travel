-- Table to store Splitwise connections for users
CREATE TABLE IF NOT EXISTS splitwise_connections (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  splitwise_user_id BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_user_connection UNIQUE (user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_splitwise_connections_user_id ON splitwise_connections(user_id);

-- Add column to trips table for linking to Splitwise groups
ALTER TABLE trips ADD COLUMN IF NOT EXISTS splitwise_group_id BIGINT;

-- Create index for trips with Splitwise integration
CREATE INDEX IF NOT EXISTS idx_trips_splitwise_group_id ON trips(splitwise_group_id);

-- RLS policies
ALTER TABLE splitwise_connections ENABLE ROW LEVEL SECURITY;

-- Only allow users to see and manage their own Splitwise connections
CREATE POLICY select_own_splitwise_connections ON splitwise_connections 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_own_splitwise_connections ON splitwise_connections 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_own_splitwise_connections ON splitwise_connections 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY delete_own_splitwise_connections ON splitwise_connections 
  FOR DELETE USING (auth.uid() = user_id); 