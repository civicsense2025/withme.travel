-- Add guest_token column to group_plans table if it doesn't exist already
ALTER TABLE "public"."group_plans" 
  ADD COLUMN IF NOT EXISTS "guest_token" uuid REFERENCES "public"."guest_tokens"("id");

-- Add created_by_guest_token column to group_plans table if it doesn't exist already  
ALTER TABLE "public"."group_plans" 
  ADD COLUMN IF NOT EXISTS "created_by_guest_token" uuid REFERENCES "public"."guest_tokens"("id");
  
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_group_plans_guest_token" 
  ON "public"."group_plans" ("guest_token");
  
CREATE INDEX IF NOT EXISTS "idx_group_plans_created_by_guest_token" 
  ON "public"."group_plans" ("created_by_guest_token");
  
-- Copy data between columns if needed
UPDATE "public"."group_plans"
SET "created_by_guest_token" = "guest_token"
WHERE "guest_token" IS NOT NULL 
  AND "created_by_guest_token" IS NULL;

UPDATE "public"."group_plans"
SET "guest_token" = "created_by_guest_token"
WHERE "created_by_guest_token" IS NOT NULL 
  AND "guest_token" IS NULL; 