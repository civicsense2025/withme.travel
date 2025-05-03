#!/bin/bash

echo "Reverting all migrations in the remote database..."

# Revert all migrations
pnpm supabase migration repair --status reverted 20250427001519
pnpm supabase migration repair --status reverted 20250427001520
pnpm supabase migration repair --status reverted 20250427001521
pnpm supabase migration repair --status reverted 20250427001522
pnpm supabase migration repair --status reverted 20250427001523
pnpm supabase migration repair --status reverted 20250427001524
pnpm supabase migration repair --status reverted 20250427001525
pnpm supabase migration repair --status reverted 20250428000001
pnpm supabase migration repair --status reverted 20250501000000
pnpm supabase migration repair --status reverted 20250501000001
pnpm supabase migration repair --status reverted 202505010000011
pnpm supabase migration repair --status reverted 202505010000012
pnpm supabase migration repair --status reverted 20250501000002
pnpm supabase migration repair --status reverted 20250530000001
pnpm supabase migration repair --status reverted 20250531000000
pnpm supabase migration repair --status reverted 20250601000000

echo "All migrations reverted. Now running db pull..."
pnpm supabase db pull 