#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Load environment variables from .env file

// Create a Supabase client with the service role key for admin privileges
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
  }
);

async function main() {
  try {
    console.log('Running database cleanup for the public.users table...');
    
    // 1. First identify all foreign key constraints pointing to public.users
    const { data: fkConstraints, error: fkError } = await supabase
      .rpc('identify_users_fk_constraints');

    if (fkError) {
      console.error('Error identifying FK constraints:', fkError);
      console.log('\nAlternative approach: Use the Supabase SQL Editor to run the SQL script directly:');
      const sqlScript = fs.readFileSync(
        path.join(__dirname, 'drop-users-table.sql'),
        'utf8'
      );
      console.log(sqlScript);
      process.exit(1);
    }

    console.log(`Found ${fkConstraints?.length || 0} foreign key constraints to remove.`);

    // 2. Drop each constraint
    for (const constraint of (fkConstraints || [])) {
      const { table_schema, table_name, constraint_name } = constraint;
      console.log(`Dropping constraint ${constraint_name} from ${table_schema}.${table_name}...`);
      
      const { error: dropError } = await supabase
        .rpc('drop_constraint', {
          p_schema: table_schema,
          p_table: table_name, 
          p_constraint: constraint_name
        });
      
      if (dropError) {
        console.error(`Error dropping constraint ${constraint_name}:`, dropError);
        process.exit(1);
      }
    }

    // 3. Specifically update itinerary_items to set created_by to NULL
    const { error: updateError } = await supabase
      .from('itinerary_items')
      .update({ created_by: null })
      .not('created_by', 'is', null);

    if (updateError) {
      console.error('Error updating itinerary_items:', updateError);
      process.exit(1);
    }

    // 4. Drop the users table
    const { error: dropTableError } = await supabase
      .rpc('drop_users_table');

    if (dropTableError) {
      console.error('Error dropping users table:', dropTableError);
      console.log('\nAlternative approach: Use the Supabase SQL Editor to run:');
      console.log('DROP TABLE IF EXISTS public.users;');
      process.exit(1);
    }

    console.log('Successfully cleaned up the public.users table and its references!');
    console.log('\nNext steps:');
    console.log('1. Try your template application again');
    console.log('2. Update any code that might be referring to the removed table');

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

main(); 