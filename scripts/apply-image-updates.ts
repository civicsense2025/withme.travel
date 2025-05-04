import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

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
  const localUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const localKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const localClient = createClient(localUrl, localKey);

  // Remote database (if configured)
  let remoteClient = null as any;
  const remoteUrl = process.env.REMOTE_SUPABASE_URL;
  const remoteKey = process.env.REMOTE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (remoteUrl && remoteKey) {
    remoteClient = createClient(remoteUrl, remoteKey);
  }

  return { localClient, remoteClient };
}

// Execute SQL statements against a client
async function executeSQL(client: any, name: string) {
  console.log(`\n🔄 Applying updates to ${name} database...`);
  
  for (const statement of sqlStatements) {
    if (!statement) continue;
    
    try {
      // Remove any comments before executing
      const cleanStatement = statement.replace(/--.*$/gm, '').trim();
      if (!cleanStatement) continue;
      
      console.log(`Executing: ${cleanStatement.substring(0, 60)}...`);
      const { error } = await client.rpc('exec_sql', { sql: cleanStatement });
      
      if (error) {
        console.error(`❌ Error executing statement: ${error.message}`);
      } else {
        console.log(`✅ Statement executed successfully`);
      }
    } catch (err: any) {
      console.error(`❌ Error executing statement: ${err.message}`);
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
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main(); 