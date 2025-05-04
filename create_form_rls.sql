-- Enable row-level security for forms table
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

-- View policies
DROP POLICY IF EXISTS "Users can view forms they have access to" ON public.forms;
CREATE POLICY "Users can view forms they have access to" ON public.forms
    FOR SELECT
    USING (
        auth.uid() = created_by
        OR visibility = 'public'
        OR (
            visibility = 'members' 
            AND trip_id IS NOT NULL 
            AND EXISTS (
                SELECT 1 FROM public.trip_members 
                WHERE trip_id = forms.trip_id 
                AND user_id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM public.form_collaborators
            WHERE form_id = id
            AND user_id = auth.uid()
        )
    );

-- Insert policies
DROP POLICY IF EXISTS "Users can insert forms they create" ON public.forms;
CREATE POLICY "Users can insert forms they create" ON public.forms
    FOR INSERT
    WITH CHECK (
        auth.uid() = created_by
        AND (
            trip_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.trip_members 
                WHERE trip_id = forms.trip_id 
                AND user_id = auth.uid()
                AND role IN ('admin', 'editor')
            )
        )
    );

-- Update policies
DROP POLICY IF EXISTS "Form creators can update their forms" ON public.forms;
CREATE POLICY "Form creators can update their forms" ON public.forms
    FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Trip admins and editors can update trip forms" ON public.forms;
CREATE POLICY "Trip admins and editors can update trip forms" ON public.forms
    FOR UPDATE
    USING (
        trip_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.trip_members 
            WHERE trip_id = forms.trip_id 
            AND user_id = auth.uid()
            AND role IN ('admin', 'editor')
        )
    )
    WITH CHECK (
        trip_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.trip_members 
            WHERE trip_id = forms.trip_id 
            AND user_id = auth.uid()
            AND role IN ('admin', 'editor')
        )
    );

-- Delete policies
DROP POLICY IF EXISTS "Form creators can delete their forms" ON public.forms;
CREATE POLICY "Form creators can delete their forms" ON public.forms
    FOR DELETE
    USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Trip admins can delete trip forms" ON public.forms;
CREATE POLICY "Trip admins can delete trip forms" ON public.forms
    FOR DELETE
    USING (
        trip_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.trip_members 
            WHERE trip_id = forms.trip_id 
            AND user_id = auth.uid()
            AND role = 'admin'
        )
    ); 