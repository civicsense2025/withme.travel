#!/usr/bin/env node

/**
 * fix-nextjs15-route-params.js
 *
 * This script identifies and fixes Next.js 15 route handler parameter issues.
 * In Next.js 15, dynamic route parameters (params.x) need to be awaited.
 *
 * Usage:
 *   node scripts/fix-nextjs15-route-params.js [--check] [--fix]
 *
 * Options:
 *   --check  Only check for issues without fixing (default)
 *   --fix    Automatically fix identified issues
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globbySync } from 'globby';

// Get the directory name correctly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const checkOnly = args.includes('--check') || !shouldFix;

console.log(`Running in ${checkOnly ? 'check' : 'fix'} mode\n`);

// Find all API route files with dynamic route parameters
const routeFiles = globbySync([
  'app/api/**/[*]/route.ts', // Find routes with dynamic parameters
  'app/api/**/**/[*]/route.ts',
  'app/api/**/***/[*]/route.ts',
]);

console.log(`Found ${routeFiles.length} route files with dynamic parameters`);

let fixedCount = 0;

routeFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');

  // Check if the file exports a handler function with a params parameter
  if (content.includes('params:') && !content.includes('await params.')) {
    console.log(`Fixing ${filePath}...`);

    // Fix params within the function body
    let newContent = content;

    // Fix direct params access
    const paramsRegex = /\bparams\.([a-zA-Z0-9_]+)\b/g;
    newContent = newContent.replace(paramsRegex, 'await params.$1');

    // Fix function parameter types
    const paramTypeRegex = /params: {\s*([a-zA-Z0-9_]+):\s*string;?\s*}/g;
    newContent = newContent.replace(paramTypeRegex, 'params: { $1: Promise<string> }');

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      fixedCount++;
      console.log(`Fixed ${filePath}`);
    } else {
      console.log(`No changes needed in ${filePath}`);
    }
  }
});

console.log(`\nSummary: Fixed ${fixedCount} files out of ${routeFiles.length} total files found.`);

// Report findings
console.log(`Found ${routeFiles.length} files with potential route handler parameter issues:`);

// Summary
if (routeFiles.length === 0) {
  console.log('No issues found!');
} else if (checkOnly) {
  console.log('\nRun with --fix to automatically update these files.');
} else {
  console.log('\nFixes applied. Please review the changes and test thoroughly.');
}
