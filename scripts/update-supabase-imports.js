#!/usr/bin/env node

/**
 * Script to migrate all API routes from the old Supabase client
 * to the new singleton implementation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to search
const API_DIRS = [
  './app/api',
  './app/auth'
];

// File extensions to include
const EXTENSIONS = ['.ts', '.tsx'];

// Old import pattern to replace
const OLD_IMPORT = `import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"`;
const OLD_CLIENT = `const supabase = createRouteHandlerClient({ cookies })`;

// New replacements
const NEW_IMPORT = `import { createClient } from "@/utils/supabase/server"`;
const NEW_CLIENT = `const supabase = createClient()`;

let updatedFiles = 0;
let skippedFiles = 0;
let errorFiles = 0;

/**
 * Check if the file needs to be updated
 */
function needsUpdate(content) {
  return content.includes(OLD_IMPORT) || content.includes(OLD_CLIENT);
}

/**
 * Update the file content
 */
function updateContent(content) {
  let updated = content;
  
  // Replace imports
  updated = updated.replace(OLD_IMPORT, NEW_IMPORT);
  
  // Replace client initialization, handling different formats
  updated = updated.replace(/const supabase = createRouteHandlerClient\(\{ cookies(:? [a-zA-Z]+)? \}\)/g, NEW_CLIENT);
  
  return updated;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (needsUpdate(content)) {
      const updated = updateContent(content);
      fs.writeFileSync(filePath, updated, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      updatedFiles++;
      return true;
    } else {
      skippedFiles++;
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    errorFiles++;
    return false;
  }
}

/**
 * Recursively process files in a directory
 */
function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      processFile(fullPath);
    }
  }
}

// Main execution
console.log('🔄 Starting Supabase client migration...');

for (const dir of API_DIRS) {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  } else {
    console.warn(`⚠️ Directory not found: ${dir}`);
  }
}

console.log('\n📊 Migration Summary:');
console.log(`✅ Updated files: ${updatedFiles}`);
console.log(`⏭️ Skipped files: ${skippedFiles}`);
console.log(`❌ Errors: ${errorFiles}`);

if (updatedFiles > 0) {
  console.log('\n🔍 Running type-check to verify changes...');
  try {
    execSync('npm run typecheck', { stdio: 'inherit' });
    console.log('✅ Type-check passed!');
  } catch (error) {
    console.error('❌ Type-check failed. You may need to manually fix some files.');
  }
}

console.log('\n✨ Migration complete!'); 