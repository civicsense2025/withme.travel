#!/bin/bash
set -e

# Make sure we have a backup
echo "Creating backup of migrations..."
mkdir -p supabase/migrations.backup.$(date +%Y%m%d%H%M%S)
cp -r supabase/migrations/* supabase/migrations.backup.$(date +%Y%m%d%H%M%S)/

# Clean up migrations folder
echo "Cleaning up migrations folder..."
rm -rf supabase/migrations.old
mkdir -p supabase/migrations.old
mv supabase/migrations/*.sql supabase/migrations.old/

# Reset the migration history in remote Supabase
echo ""
echo "WARNING: The next step requires you to manually run this SQL query in the Supabase dashboard:"
echo "TRUNCATE supabase.schema_migrations;"
echo ""
echo "After running the SQL query, press Enter to continue..."
read -p "" DUMMY

# Pull the current schema as a fresh migration
echo "Pulling current schema as a fresh migration..."
pnpm supabase db pull

echo ""
echo "If successful, you should see a new migration file in supabase/migrations/"
echo "You can verify with: ls -la supabase/migrations/" 