/**
 * Script to fix all API routes using createRouteHandlerClient without awaiting it
 * 
 * Next.js 15 has changed cookies() and headers() to be async functions, which means
 * createRouteHandlerClient() and other supabase client creators now return Promises.
 * 
 * This script finds and fixes all occurrences of these functions being used without await.
 */

const fs = require('fs/promises');
const path = require('path');
const { execSync } = require('child_process');

// Define patterns to search for
const PATTERNS = [
  {
    search: /const\s+supabase\s*=\s*createRouteHandlerClient\(\)/g,
    replace: 'const supabase = await createRouteHandlerClient()'
  },
  {
    search: /const\s+supabase\s*=\s*createServerComponentClient\(\)/g,
    replace: 'const supabase = await createServerComponentClient()'
  }
];

/**
 * Recursively search for files matching the pattern
 */
async function findFiles(dir, pattern) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (['.git', 'node_modules', '.next', 'build'].includes(entry.name)) {
          return [];
        }
        return findFiles(fullPath, pattern);
      } else if (pattern.test(entry.name)) {
        return [fullPath];
      } else {
        return [];
      }
    })
  );
  
  return files.flat();
}

/**
 * Process a single file
 */
async function processFile(filePath) {
  try {
    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    
    let modified = false;
    let newContent = content;
    
    // Apply each replacement pattern
    for (const pattern of PATTERNS) {
      if (pattern.search.test(newContent)) {
        newContent = newContent.replace(pattern.search, pattern.replace);
        modified = true;
      }
    }
    
    // If the file was modified, write it back
    if (modified) {
      await fs.writeFile(filePath, newContent, 'utf8');
      console.log(`[FIXED] ${filePath}`);
      return 1;
    }
    
    return 0;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return 0;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Searching for API route files...');
  
  // Find API route files
  const apiRouteFiles = await findFiles(
    path.join(process.cwd(), 'app'), 
    /route\.(js|ts)$/
  );
  
  console.log(`Found ${apiRouteFiles.length} API route files to check.`);
  
  let fixedCount = 0;
  
  // Process each file
  for (const file of apiRouteFiles) {
    fixedCount += await processFile(file);
  }
  
  console.log(`\n✅ Updated ${fixedCount} files to await supabase client creation.`);
  
  if (fixedCount > 0) {
    console.log('\n⚠️ Remember that you will also need to update any code that consumes these clients');
    console.log('   to handle the fact that functions like .from(), .auth.getUser(), etc. now require');
    console.log('   the client to be awaited first.');
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 