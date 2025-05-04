-- Add unique constraint on form_id and user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'form_collaborators_form_user_unique'
    ) THEN
        ALTER TABLE public.form_collaborators
            ADD CONSTRAINT form_collaborators_form_user_unique UNIQUE (form_id, user_id);
    END IF;
END $$; 