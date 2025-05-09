-- Add guest_token column if it doesn't exist (some old code may still use this)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'group_plans' AND column_name = 'guest_token') THEN
        ALTER TABLE public.group_plans ADD COLUMN guest_token uuid REFERENCES public.guest_tokens(id);
        RAISE NOTICE 'Added guest_token column to group_plans';
    END IF;
END $$;

-- Add created_by_guest_token column if it doesn't exist (newer code uses this)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'group_plans' AND column_name = 'created_by_guest_token') THEN
        ALTER TABLE public.group_plans ADD COLUMN created_by_guest_token uuid REFERENCES public.guest_tokens(id);
        RAISE NOTICE 'Added created_by_guest_token column to group_plans';
    END IF;
END $$;

-- Create indexes for better performance if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'group_plans' AND indexname = 'idx_group_plans_guest_token') THEN
        CREATE INDEX idx_group_plans_guest_token ON public.group_plans (guest_token);
        RAISE NOTICE 'Created index on guest_token';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'group_plans' AND indexname = 'idx_group_plans_created_by_guest_token') THEN
        CREATE INDEX idx_group_plans_created_by_guest_token ON public.group_plans (created_by_guest_token);
        RAISE NOTICE 'Created index on created_by_guest_token';
    END IF;
END $$;

-- Copy data between columns if needed
DO $$ 
BEGIN
    -- First check if both columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'group_plans' AND column_name = 'guest_token') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'group_plans' AND column_name = 'created_by_guest_token') THEN
       
        -- Update created_by_guest_token from guest_token where applicable
        UPDATE public.group_plans
        SET created_by_guest_token = guest_token
        WHERE guest_token IS NOT NULL 
          AND created_by_guest_token IS NULL;
        
        -- Update guest_token from created_by_guest_token where applicable
        UPDATE public.group_plans
        SET guest_token = created_by_guest_token
        WHERE created_by_guest_token IS NOT NULL 
          AND guest_token IS NULL;
          
        RAISE NOTICE 'Synchronized data between guest_token and created_by_guest_token columns';
    END IF;
END $$; 