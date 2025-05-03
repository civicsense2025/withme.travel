-- Create trip_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.trip_history (
    id BIGSERIAL PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User performing action, null if system
    action public.trip_action_type NOT NULL, -- Use the ENUM type
    details JSONB, -- Store details about the action
    item_id UUID, -- Optional reference to itinerary item, member, comment etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.trip_history ENABLE ROW LEVEL SECURITY;

-- Add appropriate RLS policies here if known
CREATE POLICY "Allow members to view trip history" 
ON public.trip_history FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.trip_members tm 
        WHERE tm.trip_id = trip_history.trip_id AND tm.user_id = auth.uid()
    )
); 