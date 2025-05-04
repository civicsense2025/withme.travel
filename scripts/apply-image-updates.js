// This is a JavaScript version of the script to apply SQL updates using ES modules
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local first, then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: false });

// Get SQL script content
const sqlFilePath = path.resolve(process.cwd(), 'scripts/update_destination_images.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Split the SQL file into individual statements
// This simple approach assumes semicolons at the end of each statement
const sqlStatements = sqlContent
  .split(';')
  .map(statement => statement.trim())
  .filter(statement => statement && !statement.startsWith('--'));

// Initialize Supabase clients
async function initClients() {
  // Local database
  const localUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Try to use service role key first, then fall back to anon key if needed
  let localKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let usingServiceRole = true;
  
  if (!localKey) {
    localKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    usingServiceRole = false;
    console.log('ℹ️ SUPABASE_SERVICE_ROLE_KEY not found, using NEXT_PUBLIC_SUPABASE_ANON_KEY instead');
  }
  
  if (!localUrl || !localKey) {
    throw new Error('Local database credentials not found. Required: NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  console.log(`🔑 Using URL from NEXT_PUBLIC_SUPABASE_URL and key from ${usingServiceRole ? 'SUPABASE_SERVICE_ROLE_KEY' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY'}`);
  const localClient = createClient(localUrl, localKey);

  // Remote database (if configured)
  let remoteClient = null;
  const remoteUrl = process.env.REMOTE_SUPABASE_URL;
  let remoteKey = process.env.REMOTE_SUPABASE_SERVICE_ROLE_KEY;
  let remoteUsingServiceRole = true;
  
  if (remoteUrl) {
    if (!remoteKey) {
      remoteKey = process.env.REMOTE_SUPABASE_ANON_KEY;
      remoteUsingServiceRole = false;
      console.log('ℹ️ REMOTE_SUPABASE_SERVICE_ROLE_KEY not found, using REMOTE_SUPABASE_ANON_KEY instead');
    }
    
    if (remoteKey) {
      console.log(`🔑 Using remote URL from REMOTE_SUPABASE_URL and key from ${remoteUsingServiceRole ? 'REMOTE_SUPABASE_SERVICE_ROLE_KEY' : 'REMOTE_SUPABASE_ANON_KEY'}`);
      remoteClient = createClient(remoteUrl, remoteKey);
    } else {
      console.log('⚠️ Remote database URL found but no key provided. Set REMOTE_SUPABASE_SERVICE_ROLE_KEY or REMOTE_SUPABASE_ANON_KEY');
    }
  }

  return { localClient, remoteClient };
}

// Execute SQL statements against a client
async function executeSQL(client, name) {
  console.log(`\n🔄 Applying updates to ${name} database...`);
  
  try {
    // Test connection by getting a single record
    const { error: testError } = await client.from('destinations').select('id').limit(1);
    if (testError) {
      console.error(`❌ Connection test failed: ${testError.message}`);
      return;
    }
    console.log('✅ Connection test successful');
  } catch (err) {
    console.error(`❌ Connection test failed: ${err.message}`);
    return;
  }
  
  for (const statement of sqlStatements) {
    if (!statement) continue;
    
    try {
      // Remove any comments before executing
      const cleanStatement = statement.replace(/--.*$/gm, '').trim();
      if (!cleanStatement) continue;
      
      // Skip the final SELECT statement (count)
      if (cleanStatement.toUpperCase().startsWith('SELECT COUNT')) {
        console.log('Skipping count query...');
        continue;
      }
      
      console.log(`Executing: ${cleanStatement.substring(0, 60)}...`);
      
      // Parse the UPDATE statement
      if (cleanStatement.toUpperCase().startsWith('UPDATE')) {
        try {
          // Extract table name and WHERE conditions from UPDATE statement
          // Example: UPDATE destinations SET image_url = '/destinations/rome.jpg' WHERE city = 'Rome' AND country = 'Italy';
          const tableName = cleanStatement.split(' ')[1]; // 'destinations'
          
          // Extract the SET part
          const setStart = cleanStatement.toUpperCase().indexOf('SET ') + 4;
          const whereStart = cleanStatement.toUpperCase().indexOf(' WHERE ');
          const setPart = cleanStatement.substring(setStart, whereStart).trim();
          
          // Extract column and value
          const [column, value] = setPart.split('=').map(part => part.trim());
          const valueWithoutQuotes = value.replace(/^'|'$/g, ''); // Remove single quotes
          
          // Extract WHERE conditions
          const wherePart = cleanStatement.substring(whereStart + 7).trim();
          const conditions = wherePart.split(' AND ').map(condition => {
            const [field, value] = condition.split('=').map(part => part.trim());
            return { field, value: value.replace(/^'|'$/g, '').replace(';', '') };
          });
          
          console.log(`Parsed: Set ${column} to ${valueWithoutQuotes} where ${JSON.stringify(conditions)}`);
          
          // Build the update using Supabase API
          let query = client.from(tableName).update({ [column]: valueWithoutQuotes });
          
          // Add all conditions
          conditions.forEach(({ field, value }) => {
            query = query.eq(field, value);
          });
          
          // Execute the update
          const { error, count } = await query;
          
          if (error) {
            console.error(`❌ Error updating ${tableName}: ${error.message}`);
          } else {
            console.log(`✅ Updated ${count || 'unknown number of'} row(s) in ${tableName}`);
          }
        } catch (parseErr) {
          console.error(`❌ Error parsing UPDATE statement: ${parseErr.message}`);
        }
      } else {
        // For other SQL statements - try RPC if available
        try {
          const { error: rpcError } = await client.rpc('exec_sql', { sql: cleanStatement });
          
          if (rpcError) {
            console.error(`❌ Error executing via RPC: ${rpcError.message}`);
          } else {
            console.log(`✅ Statement executed successfully via RPC`);
          }
        } catch (rpcErr) {
          console.error(`❌ Error with RPC call: ${rpcErr.message}`);
        }
      }
    } catch (err) {
      console.error(`❌ Error processing statement: ${err.message}`);
    }
  }
}

// Main function
async function main() {
  console.log('🚀 Starting SQL script execution...');
  console.log(`📄 SQL file: ${sqlFilePath}`);
  
  try {
    const { localClient, remoteClient } = await initClients();
    
    // Update local database
    await executeSQL(localClient, 'LOCAL');
    
    // Update remote database if available
    if (remoteClient) {
      await executeSQL(remoteClient, 'REMOTE');
    } else {
      console.log('\n⚠️ No remote database configured. Only local database was updated.');
      console.log('To update remote database, set REMOTE_SUPABASE_URL and REMOTE_SUPABASE_SERVICE_ROLE_KEY in .env.local');
    }
    
    console.log('\n🎉 SQL script execution completed!');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main(); 