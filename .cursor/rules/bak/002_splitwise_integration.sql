-- supabase/migrations/001_splitwise_integration.sql

-- 1. Enable pgsodium extension if not already enabled (required for encryption)
-- You might need to run this separately in the Supabase SQL editor if it fails here.
create extension if not exists pgsodium with schema pgsodium;

-- 2. Create the splitwise_connections table if it doesn't exist
create table if not exists public.splitwise_connections (
    user_id uuid not null primary key references auth.users(id) on delete cascade,
    splitwise_user_id bigint null unique, -- Allow null initially, but should be unique once set
    access_token text null, -- Store encrypted token
    refresh_token text null, -- Store encrypted token
    expires_at timestamptz null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Apply encryption using pgsodium (if extension is enabled)
-- This encrypts the tokens at rest. Adjust key_id if necessary.
-- security label for pgsodium on column public.splitwise_connections.access_token is 'ENCRYPT WITH KEY COLUMN user_id';
-- security label for pgsodium on column public.splitwise_connections.refresh_token is 'ENCRYPT WITH KEY COLUMN user_id';
-- Note: Applying security labels might require running separately or specific privileges.
-- If the above labels fail, you might need to apply them manually via Supabase UI or psql.
-- Consider if encryption is strictly needed based on your security requirements.

-- Optional: Add comment for clarity
comment on table public.splitwise_connections is 'Stores user connections and credentials for Splitwise OAuth integration.';

-- 3. Add splitwise_group_id column to the trips table if it doesn't exist
alter table public.trips
add column if not exists splitwise_group_id bigint null;

-- Optional: Add comment for clarity
comment on column public.trips.splitwise_group_id is 'Stores the linked Splitwise group ID for the trip.';

-- 4. Enable Row Level Security (RLS) for splitwise_connections
alter table public.splitwise_connections enable row level security;

-- 5. Create RLS policies for splitwise_connections

-- Policy: Allow users to select their own connection details
drop policy if exists "Allow authenticated user select access" on public.splitwise_connections;
create policy "Allow authenticated user select access"
on public.splitwise_connections
for select
to authenticated
using (auth.uid() = user_id);

-- Policy: Allow users to insert their own connection details
drop policy if exists "Allow authenticated user insert access" on public.splitwise_connections;
create policy "Allow authenticated user insert access"
on public.splitwise_connections
for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy: Allow users to update their own connection details
drop policy if exists "Allow authenticated user update access" on public.splitwise_connections;
create policy "Allow authenticated user update access"
on public.splitwise_connections
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy: Allow users to delete their own connection details
drop policy if exists "Allow authenticated user delete access" on public.splitwise_connections;
create policy "Allow authenticated user delete access"
on public.splitwise_connections
for delete
to authenticated
using (auth.uid() = user_id);

-- Function to update 'updated_at' timestamp automatically
create or replace function public.handle_splitwise_connections_update()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to update 'updated_at' before any update operation
drop trigger if exists on_splitwise_connections_update on public.splitwise_connections;
create trigger on_splitwise_connections_update
before update on public.splitwise_connections
for each row
execute procedure public.handle_splitwise_connections_update(); 