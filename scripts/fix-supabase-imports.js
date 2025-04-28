// Fix Supabase import statements across the codebase
// This script replaces incorrect imports of 'createClient' from utils/supabase/server
// with either 'createApiClient' for API routes or 'createServerClient' for other server components

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Function to execute shell commands
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: projectRoot, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return reject(error);
      }
      resolve(stdout.trim());
    });
  });
}

// Find all files that import createClient from utils/supabase/server
async function findFilesToFix() {
  const grepCommand = "grep -r --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' \"createClient.*from.*@/utils/supabase/server\" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist";
  
  try {
    const output = await execCommand(grepCommand);
    const filePaths = output
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const match = line.match(/^\.\/([^:]+):/);
        return match ? match[1] : null;
      })
      .filter(Boolean);
    
    return [...new Set(filePaths)]; // Remove duplicates
  } catch (error) {
    console.error('Error finding files:', error);
    return [];
  }
}

// Check if a file is in an API route
function isApiRoute(filePath) {
  return filePath.includes('/api/') && (filePath.includes('/route.') || filePath.includes('/index.'));
}

// Fix imports in a file
async function fixImports(filePath) {
  try {
    const content = fs.readFileSync(path.join(projectRoot, filePath), 'utf8');
    
    // Determine which client to use based on the file path
    const replacement = isApiRoute(filePath) ? 'createApiClient' : 'createServerClient';
    
    // Replace different import patterns
    let newContent = content;
    
    // Pattern 1: import { createServerClient } from "@/utils/supabase/server";
    newContent = newContent.replace(
      /import\s*{\s*createClient\s*}\s*from\s*["']@\/utils\/supabase\/server["'];?/g,
      `import { ${replacement} } from "@/utils/supabase/server";`
    );
    
    // Pattern 2: import { createServerClient, otherStuff  } from "@/utils/supabase/server";
    newContent = newContent.replace(
      /import\s*{\s*createClient\s*,\s*([^}]+)\s*}\s*from\s*["']@\/utils\/supabase\/server["'];?/g,
      `import { ${replacement}, $1 } from "@/utils/supabase/server";`
    );
    
    // Pattern 3: Aliased imports - import { createServerClient as someAlias } from "@/utils/supabase/server";
    const aliasPattern = /import\s*{\s*createClient\s+as\s+([a-zA-Z0-9_]+)\s*}\s*from\s*["']@\/utils\/supabase\/server["'];?/g;
    const aliasMatches = [...newContent.matchAll(aliasPattern)];
    
    for (const match of aliasMatches) {
      const alias = match[1];
      newContent = newContent.replace(
        match[0],
        `import { ${replacement} as ${alias} } from "@/utils/supabase/server";`
      );
    }
    
    // Replace usages of createClient with the appropriate function
    if (content !== newContent) {
      fs.writeFileSync(path.join(projectRoot, filePath), newContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing imports in ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Finding files with incorrect Supabase imports...');
  const filesToFix = await findFilesToFix();
  
  console.log(`Found ${filesToFix.length} files to fix.`);
  let fixedCount = 0;
  
  for (const filePath of filesToFix) {
    const fixed = await fixImports(filePath);
    if (fixed) {
      console.log(`Fixed imports in ${filePath}`);
      fixedCount++;
    }
  }
  
  console.log(`\nFixed imports in ${fixedCount} out of ${filesToFix.length} files.`);
}

main().catch(error => {
  console.error('Error running the script:', error);
  process.exit(1);
}); 