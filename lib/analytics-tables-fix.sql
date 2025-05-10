-- Fix for missing analytics tables
-- This will add the auth_modal_analytics table if it doesn't exist

-- Create auth_modal_analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth_modal_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES auth.users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    url TEXT,
    ab_test_variant TEXT DEFAULT 'control',
    context TEXT DEFAULT 'default'
);

-- Create appropriate policies for auth_modal_analytics table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'auth_modal_analytics' AND schemaname = 'public' AND policyname = 'anyone_can_insert_analytics'
    ) THEN
        CREATE POLICY anyone_can_insert_analytics ON auth_modal_analytics FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'auth_modal_analytics' AND schemaname = 'public' AND policyname = 'admins_can_read_analytics'
    ) THEN
        CREATE POLICY admins_can_read_analytics ON auth_modal_analytics FOR SELECT USING (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END
$$;

-- Enable RLS on auth_modal_analytics
ALTER TABLE auth_modal_analytics ENABLE ROW LEVEL SECURITY; 