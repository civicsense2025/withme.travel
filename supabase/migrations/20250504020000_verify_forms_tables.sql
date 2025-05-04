-- This migration is for verification only
DO $$
DECLARE
    table_count INTEGER;
    template_count INTEGER;
BEGIN
    -- Count form-related tables
    SELECT COUNT(*) INTO table_count
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN ('form_templates', 'forms', 'questions', 'response_sessions', 'responses', 'form_collaborators', 'question_branching');
    
    -- Count form templates
    SELECT COUNT(*) INTO template_count
    FROM public.form_templates;
    
    -- Output results
    RAISE NOTICE 'Form-related tables found: %', table_count;
    RAISE NOTICE 'Form templates found: %', template_count;
END $$; 