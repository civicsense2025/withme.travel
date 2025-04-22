-- Create trip_notes table
CREATE TABLE IF NOT EXISTS trip_notes (
  trip_id UUID PRIMARY KEY REFERENCES trips(id) ON DELETE CASCADE,
  content TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE trip_notes ENABLE ROW LEVEL SECURITY;

-- Allow read access to trip members
CREATE POLICY trip_notes_select_policy ON trip_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = trip_notes.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

-- Allow write access to trip members with edit permissions
CREATE POLICY trip_notes_insert_policy ON trip_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = trip_notes.trip_id
      AND trip_members.user_id = auth.uid()
      AND trip_members.role IN ('admin', 'editor')
    )
  );

CREATE POLICY trip_notes_update_policy ON trip_notes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = trip_notes.trip_id
      AND trip_members.user_id = auth.uid()
      AND trip_members.role IN ('admin', 'editor')
    )
  );
