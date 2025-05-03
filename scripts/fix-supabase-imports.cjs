#!/usr/bin/env node

/**
 * Fix Supabase Imports Script
 * 
 * This script fixes Supabase client imports in API routes, updating them to use the new
 * server.ts utilities instead of the deprecated unified.ts ones.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript files in the app/api directory
function getAllApiRoutes() {
  const apiDir = path.join(process.cwd(), 'app/api');
  const result = execSync(`find ${apiDir} -name "route.ts" -type f`);
  return result.toString().trim().split('\n');
}

// Process a single file
function processFile(filePath) {
  console.log(`Processing ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace unified imports
  if (content.includes("@/utils/supabase/unified")) {
    content = content.replace(
      /import\s+\{\s*([^}]*getRouteHandlerClient[^}]*)\s*\}\s*from\s+['"]@\/utils\/supabase\/unified['"]/g,
      "import { createRouteHandlerClient } from '@/utils/supabase/server'"
    );
    modified = true;
  }
  
  // Replace getRouteHandlerClient function calls
  if (content.includes("getRouteHandlerClient")) {
    content = content.replace(
      /(\s+)const\s+supabase\s+=\s+await\s+getRouteHandlerClient\(\s*(?:request)?\s*\)/g,
      "$1const supabase = await createRouteHandlerClient()"
    );
    modified = true;
  }
  
  // Replace getServerSession function calls
  if (content.includes("getServerSession")) {
    // Make sure we're using the correct import
    if (!content.includes("import { getServerSession } from '@/utils/supabase/server'")) {
      content = content.replace(
        /import\s+\{\s*([^}]*getServerSession[^}]*)\s*\}\s*from\s+['"]@\/utils\/supabase\/[^'"]+['"]/g,
        "import { $1 } from '@/utils/supabase/server'"
      );
      if (!content.includes("import { getServerSession }")) {
        // Add import if not present
        content = content.replace(
          /(import\s+[^;]+;)/,
          "$1\nimport { getServerSession } from '@/utils/supabase/server';"
        );
      }
      modified = true;
    }
    
    // Fix session destructuring if needed
    if (content.includes("const { session } = await getServerSession()")) {
      content = content.replace(
        /const\s+\{\s*session\s*\}\s*=\s*await\s+getServerSession\(\)/g,
        "const { data: { session } } = await getServerSession()"
      );
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath}`);
    return true;
  }
  
  return false;
}

// Main function
function main() {
  const apiRoutes = getAllApiRoutes();
  console.log(`Found ${apiRoutes.length} API routes to process`);
  
  let updated = 0;
  
  apiRoutes.forEach(filePath => {
    try {
      const wasUpdated = processFile(filePath);
      if (wasUpdated) updated++;
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  });
  
  console.log(`\nCompleted! Updated ${updated} of ${apiRoutes.length} files.`);
}

main();
