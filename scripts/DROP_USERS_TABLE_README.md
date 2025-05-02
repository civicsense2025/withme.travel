# Dropping the `public.users` Table

This directory contains an SQL script to drop the unused `public.users` table that's causing foreign key constraint errors when applying templates to trips.

## Problem

The error message we're seeing is:

```
insert or update on table "itinerary_items" violates foreign key constraint "itinerary_items_created_by_fkey"
```

This happens because:

1. The `created_by` column in `itinerary_items` references the `public.users` table
2. This table is empty and unused, as the application is using `auth.users` and `public.profiles` instead
3. When attempting to insert items with a user ID, the foreign key constraint fails

## Solution

The included SQL script `drop-users-table.sql` will:

1. Null out any existing `created_by` values in `itinerary_items`
2. Drop the foreign key constraint between `itinerary_items` and `public.users`
3. Drop the `public.users` table itself

## How to Run

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `drop-users-table.sql`
4. Paste the SQL into the editor
5. Click "Run" to execute the script

## After Running

Once the script has been executed successfully:

1. Try applying a template to a trip again
2. The foreign key constraint error should be resolved
3. New itinerary items will have a `NULL` value for `created_by`

## Future Improvements

In the future, you may want to:

1. Update the `itinerary_items` schema to reference the correct user table
2. Consider adding a trigger to automatically populate the `created_by` field
3. Review other foreign key constraints for similar issues
