-- Enable row-level security for form_templates table
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;

-- View policies
DROP POLICY IF EXISTS "Everyone can view published templates" ON public.form_templates;
CREATE POLICY "Everyone can view published templates" ON public.form_templates
    FOR SELECT
    USING (is_published = true);
    
DROP POLICY IF EXISTS "Creators can view their own templates" ON public.form_templates;
CREATE POLICY "Creators can view their own templates" ON public.form_templates
    FOR SELECT
    USING (auth.uid() = created_by);

-- Insert policies
DROP POLICY IF EXISTS "Authenticated users can create templates" ON public.form_templates;
CREATE POLICY "Authenticated users can create templates" ON public.form_templates
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Update policies
DROP POLICY IF EXISTS "Creators can update their own templates" ON public.form_templates;
CREATE POLICY "Creators can update their own templates" ON public.form_templates
    FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Delete policies
DROP POLICY IF EXISTS "Creators can delete their own templates" ON public.form_templates;
CREATE POLICY "Creators can delete their own templates" ON public.form_templates
    FOR DELETE
    USING (auth.uid() = created_by); 