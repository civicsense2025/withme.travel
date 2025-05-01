#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_ROUTES_DIR = './app/api';

// Patterns to look for in files that indicate they need updating
const patterns = [
  // Authentication patterns that need updating
  /const\s+{\s*data\s*(?::\s*{\s*(?:user|session)\s*})?\s*}\s*=\s*await\s+supabase\.auth\.get(?:User|Session)\(\)/,

  // Headers and cookies calls that need to be awaited
  /(?<![await\s])(headers|cookies)\(\)/,

  // Route params that need to be awaited
  /{\s*params\s*}:\s*{\s*params:\s*{\s*[a-zA-Z]+:\s*string\s*}\s*}/,

  // Missing NextResponse imports where Response is used
  /new\s+Response\(/,
];

// Function to check if a file needs updating
function fileNeedsUpdating(content) {
  for (const pattern of patterns) {
    if (pattern.test(content)) {
      return true;
    }
  }
  return false;
}

// Function to find all route files in the API directory
function findRoutesNeedingUpdates(directory) {
  const routeFiles = [];

  function traverseDirectory(currentPath) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        traverseDirectory(filePath);
      } else if (file === 'route.ts' || file === 'route.js' || file === 'route.tsx') {
        // Read file content
        const content = fs.readFileSync(filePath, 'utf8');

        // Check if file needs updating
        if (fileNeedsUpdating(content)) {
          routeFiles.push({
            path: filePath,
            patterns: patterns.filter((pattern) => pattern.test(content)).map((p) => p.toString()),
          });
        }
      }
    }
  }

  traverseDirectory(directory);
  return routeFiles;
}

// Main function
function main() {
  console.log('Scanning for API routes that need updating for Next.js 15+ compatibility...\n');

  const routesNeedingUpdates = findRoutesNeedingUpdates(API_ROUTES_DIR);

  console.log(`Found ${routesNeedingUpdates.length} routes that need updating:\n`);

  // Print results
  routesNeedingUpdates.forEach((file) => {
    console.log(`File: ${file.path}`);
    console.log('Issues found:');
    file.patterns.forEach((pattern) => {
      console.log(`- ${getIssueDescription(pattern)}`);
    });
    console.log(''); // Empty line for spacing
  });

  // Return a simple list of file paths for scripting
  console.log('\nList of files for processing:');
  routesNeedingUpdates.forEach((file) => {
    console.log(file.path);
  });
}

// Helper function to get human-readable description of the issue
function getIssueDescription(patternString) {
  if (patternString.includes('supabase.auth.get')) {
    return 'Authentication pattern needs updating for better error handling';
  } else if (patternString.includes('(headers|cookies)')) {
    return 'Headers or cookies function needs to be awaited';
  } else if (patternString.includes('params')) {
    return 'Route parameters need to be awaited';
  } else if (patternString.includes('Response')) {
    return 'Should use NextResponse instead of Response';
  }
  return 'Unknown issue';
}

// Run the script
main();
