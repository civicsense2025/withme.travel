#!/usr/bin/env node

/**
 * This script fixes:
 * 1. Cookie handlers in API routes to properly use async/await
 * 2. Supabase imports to use the correct package
 * 3. Duplicate async modifier
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory of the project
const ROOT_DIR = path.join(__dirname, '..');

console.log('🔧 Fixing cookie handlers and Supabase imports...');

// Function to fix a file
function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updated = content;
    let hasChanges = false;

    // Fix 1: Fix double async declaration
    if (updated.includes('async async')) {
      updated = updated.replace(/async\s+async/g, 'async');
      hasChanges = true;
    }

    // Fix 2: Fix async cookie handlers
    if (updated.includes('cookieStore')) {
      // Add async to set() method if it uses await
      const setCookieRegex = /(set\(name: string, value: string, options: CookieOptions\)\s*\{[\s\n]*try\s*\{[\s\n]*await)/g;
      if (setCookieRegex.test(updated)) {
        updated = updated.replace(
          setCookieRegex,
          'async set(name: string, value: string, options: CookieOptions) {\n            try {\n              await'
        );
        hasChanges = true;
      }

      // Add async to remove() method if it uses await
      const removeCookieRegex = /(remove\(name: string, options: CookieOptions\)\s*\{[\s\n]*try\s*\{[\s\n]*await)/g;
      if (removeCookieRegex.test(updated)) {
        updated = updated.replace(
          removeCookieRegex,
          'async remove(name: string, options: CookieOptions) {\n            try {\n              await'
        );
        hasChanges = true;
      }
    }

    // Fix 3: Fix Supabase imports
    if (updated.includes('@supabase/auth-helpers-nextjs')) {
      updated = updated.replace(
        /import\s+{([^}]*?)}\s+from\s+['"]@\/supabase\/auth-helpers-nextjs['"]/g,
        'import {$1} from \'@supabase/ssr\''
      );
      hasChanges = true;
    }

    // Fix 4: Fix Supabase client creation in unified.ts
    if (filePath.includes('supabase/unified.ts') && updated.includes('createServerClient')) {
      updated = updated.replace(
        /createServerClient<Database>/g,
        'createServerComponentClient<Database>'
      );
      hasChanges = true;
    }

    // Fix 5: Fix createServerComponentClient imports in app pages
    if (updated.includes('createServerComponentClient') && 
        updated.includes('@/utils/supabase/unified')) {
      updated = updated.replace(
        /import\s+{\s*createServerComponentClient\s*}\s+from\s+['"]@\/utils\/supabase\/unified['"]/g,
        'import { createServerComponentClient } from \'@supabase/ssr\''
      );
      hasChanges = true;
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, updated);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  // Find all API route files and key Supabase files
  const apiRoutes = await glob('app/api/**/*.ts', { cwd: ROOT_DIR });
  const supabaseFiles = await glob('utils/supabase/**/*.ts', { cwd: ROOT_DIR });
  const appPages = await glob('app/**/*.{ts,tsx}', { 
    cwd: ROOT_DIR,
    ignore: ['app/api/**/*']
  });
  
  let fixedCount = 0;
  
  // Fix API routes first (most likely to have cookie issues)
  for (const file of apiRoutes) {
    const fixed = fixFile(path.join(ROOT_DIR, file));
    if (fixed) fixedCount++;
  }
  
  // Fix Supabase utility files
  for (const file of supabaseFiles) {
    const fixed = fixFile(path.join(ROOT_DIR, file));
    if (fixed) fixedCount++;
  }
  
  // Fix app pages with Supabase imports
  for (const file of appPages) {
    const fixed = fixFile(path.join(ROOT_DIR, file));
    if (fixed) fixedCount++;
  }
  
  console.log(`\n🎉 Done! Fixed ${fixedCount} files.`);
}

main().catch(console.error); 