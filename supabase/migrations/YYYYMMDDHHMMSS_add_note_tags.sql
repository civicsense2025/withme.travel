-- Migration to add tagging functionality to trip notes

BEGIN;

-- 1. Create the note_tags table
CREATE TABLE public.note_tags (
    note_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    assigned_at timestamptz DEFAULT now() NOT NULL,
    -- Constraints
    CONSTRAINT note_tags_pkey PRIMARY KEY (note_id, tag_id),
    CONSTRAINT note_tags_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.trip_notes(id) ON DELETE CASCADE,
    CONSTRAINT note_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE
);

-- Add indexes for faster lookups
CREATE INDEX idx_note_tags_note_id ON public.note_tags(note_id);
CREATE INDEX idx_note_tags_tag_id ON public.note_tags(tag_id);

-- 2. RLS Policies for note_tags

-- Enable RLS
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;

-- Allow members to view tags for notes on trips they are members of
CREATE POLICY "Allow members to view note tags" ON public.note_tags
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.trip_notes tn
            JOIN public.trip_members tm ON tn.trip_id = tm.trip_id
            WHERE tn.id = note_tags.note_id AND tm.user_id = auth.uid()
        )
    );

-- Allow editors/admins to assign/remove tags on notes for trips they are editors/admins of
-- Assuming the is_trip_member_with_role helper function exists from previous migration
CREATE POLICY "Allow editors/admins to manage note tags" ON public.note_tags
    FOR ALL -- Covers INSERT, UPDATE, DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.trip_notes tn
            WHERE tn.id = note_tags.note_id AND is_trip_member_with_role(tn.trip_id, auth.uid(), ARRAY['admin', 'editor'])
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.trip_notes tn
            WHERE tn.id = note_tags.note_id AND is_trip_member_with_role(tn.trip_id, auth.uid(), ARRAY['admin', 'editor'])
        )
    );


-- 3. Grant usage permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON TABLE public.note_tags TO service_role;

-- Grant permissions for authenticated users (adjust based on RLS needs)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.note_tags TO authenticated;


COMMIT; 