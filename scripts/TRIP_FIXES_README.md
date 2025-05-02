# Trip Fixes for withme.travel

This directory contains SQL scripts to fix two issues with the current trip:

1. Multiple relationships between `trip_members` and `profiles` tables causing the error:

   ```
   Could not embed because more than one relationship was found for 'trip_members' and 'profiles'
   ```

2. Missing itinerary sections for imported template items.

## Fix 1: Trip Members Relationship Issue

### Problem

The system can't load trip members because there are duplicate/ambiguous foreign key relationships between the `trip_members` and `profiles` tables.

### Solution

Run the `fix-trip-members-relationship.sql` script to:

1. Identify all foreign key constraints between these tables
2. Keep only one valid relationship and remove duplicates

### How to Run

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `fix-trip-members-relationship.sql`
4. Paste the SQL into the editor and click "Run"

## Fix 2: Create Missing Itinerary Sections

### Problem

When applying a template, the items were created but corresponding itinerary sections (days) were not.

### Solution

Run the `create-missing-sections.sql` script to:

1. Find all day numbers in the itinerary items that don't have sections
2. Create sections for those days
3. Update the trip's `duration_days` if needed

### How to Run

1. The script already contains your trip ID (`41d4e9e6-f0f9-49d4-bbbc-bdf5757bae85`)
2. Log in to your Supabase dashboard
3. Navigate to the SQL Editor
4. Copy the contents of `create-missing-sections.sql`
5. Paste the SQL into the editor and click "Run"

## Order of Execution

Run the scripts in this order:

1. First, run `fix-trip-members-relationship.sql` to fix the relationship issues
2. Then, run `create-missing-sections.sql` to create the missing sections

Once both scripts are run, you should be able to:

1. View the trip details page properly
2. See the imported template items organized by day

## Troubleshooting

If you encounter any issues:

1. Check the output messages from the SQL scripts for errors
2. Make sure you run the scripts as a user with enough database privileges
3. Be careful with other trip IDs - the sections script is targeted to your specific trip
