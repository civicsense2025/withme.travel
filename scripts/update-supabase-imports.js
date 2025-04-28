#!/usr/bin/env node

/**
 * Script to migrate all API routes from the old Supabase client
 * to the new singleton implementation
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Get all TypeScript files that import from the old library
const findCommand = `grep -r -l --include="*.ts" --include="*.tsx" "@supabase/auth-helpers-nextjs" ${ROOT_DIR}`;
let files;

try {
  files = execSync(findCommand).toString().trim().split('\n');
} catch (error) {
  console.error('Error finding files:', error.message);
  process.exit(1);
}

console.log(`Found ${files.length} files to update.`);

// Process each file
let successCount = 0;
let errorCount = 0;

files.forEach(filePath => {
  try {
    console.log(`Processing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the import from auth-helpers-nextjs
    content = content.replace(
      /import\s+\{\s*createRouteHandlerClient\s*\}\s+from\s+['"]@supabase\/auth-helpers-nextjs['"]/g,
      `import { createApiClient } from "@/utils/supabase/server"`
    );
    
    content = content.replace(
      /import\s+\{\s*createServerComponentClient\s*\}\s+from\s+['"]@supabase\/auth-helpers-nextjs['"]/g,
      `import { createServerClientComponent } from "@/utils/supabase/server"`
    );
    
    // Replace client creation patterns
    content = content.replace(
      /const\s+supabase\s*=\s*createRouteHandlerClient(?:.*?)?\(\s*\{\s*cookies(?:.*?)?\s*\}\s*\)/gs,
      `const supabase = await createApiClient()`
    );
    
    content = content.replace(
      /const\s+supabase\s*=\s*createServerComponentClient(?:.*?)?\(\s*\{\s*cookies(?:.*?)?\s*\}\s*\)/gs,
      `const supabase = await createServerClientComponent()`
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content);
    successCount++;
    console.log(`Updated: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    errorCount++;
  }
});

console.log('\nSummary:');
console.log(`Total files processed: ${files.length}`);
console.log(`Successfully updated: ${successCount}`);
console.log(`Errors: ${errorCount}`);

if (errorCount > 0) {
  console.log('\nWarning: Some files could not be updated automatically. Manual review is needed.');
} 