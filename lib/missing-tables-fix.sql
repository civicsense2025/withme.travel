-- Fix for missing database tables
-- This will add tables that are being queried but don't exist in the database

-- Create feedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    email TEXT,
    message TEXT NOT NULL,
    category TEXT,
    page TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create appropriate policies for feedback table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND schemaname = 'public' AND policyname = 'users_can_read_own_feedback'
    ) THEN
        CREATE POLICY users_can_read_own_feedback ON feedback FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND schemaname = 'public' AND policyname = 'users_can_create_feedback'
    ) THEN  
        CREATE POLICY users_can_create_feedback ON feedback FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND schemaname = 'public' AND policyname = 'admins_can_update_feedback'
    ) THEN
        CREATE POLICY admins_can_update_feedback ON feedback FOR UPDATE USING (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END
$$;

-- Enable RLS on feedback
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create surveys table if it doesn't exist (compatible with existing code)
-- This should align with the research schema but be accessible through the name 'surveys'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'surveys' AND table_schema = 'public'
    ) THEN
        CREATE VIEW surveys AS
        SELECT * FROM survey_definitions;
    END IF;
END
$$; 