-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('destination', 'itinerary', 'attraction')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (user_id, item_id, item_type)
);

-- Add RLS policies
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own likes
CREATE POLICY "Users can view their own likes"
    ON public.likes FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to create their own likes
CREATE POLICY "Users can create their own likes"
    ON public.likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own likes
CREATE POLICY "Users can delete their own likes"
    ON public.likes FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_likes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_likes_updated_at
    BEFORE UPDATE ON public.likes
    FOR EACH ROW
    EXECUTE FUNCTION update_likes_updated_at();

-- Add indexes for performance
CREATE INDEX likes_user_id_idx ON public.likes(user_id);
CREATE INDEX likes_item_id_idx ON public.likes(item_id);
CREATE INDEX likes_item_type_idx ON public.likes(item_type); 