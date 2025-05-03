#!/usr/bin/env node

/**
 * This script fixes common syntax errors introduced by the previous fix scripts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory of the project
const ROOT_DIR = path.join(__dirname, '..');

console.log('🔧 Fixing syntax errors across the codebase...');

/**
 * Fix common syntax issues in the provided file content
 */
function fixSyntaxIssues(content, filePath) {
  let updated = content;
  let hasChanges = false;

  // Fix 1: Remove standalone semicolons on empty lines
  const standalonePattern = /^\s*;\s*$/gm;
  if (standalonePattern.test(updated)) {
    updated = updated.replace(standalonePattern, '');
    hasChanges = true;
  }

  // Fix 2: Fix duplicate type imports by removing them
  const redundantTypeImportPattern =
    /(import\s+(?:type\s+)?\{\s*[A-Za-z0-9_]+(?:\s+as\s+[A-Za-z0-9_]+)?(?:\s*,\s*[A-Za-z0-9_]+(?:\s+as\s+[A-Za-z0-9_]+)?)* *\}\s+from\s+['"][^'"]+['"];?\s*)\1/g;
  if (redundantTypeImportPattern.test(updated)) {
    updated = updated.replace(redundantTypeImportPattern, '$1');
    hasChanges = true;
  }

  // Fix 3: Fix missing brackets in API route handler functions
  if (filePath.includes('api') && filePath.includes('route.ts')) {
    // First, look for route handler functions with missing closing brackets in parameter declarations
    const routeHandlerPattern =
      /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(\s*([^)]*)\s*\)/g;
    let match;

    while ((match = routeHandlerPattern.exec(updated)) !== null) {
      const [fullMatch, methodName, params] = match;

      // Check if params include { params: { without closing brace
      if (
        params.includes('{ params:') &&
        !params.includes('{ params: {') &&
        !params.includes('{ params }')
      ) {
        // Missing closing brace for destructured params
        const fixedParams = params.replace(/{ params:\s*(?!\{)/, '{ params: { ') + ' }';
        const newMatch = fullMatch.replace(params, fixedParams);
        updated = updated.replace(fullMatch, newMatch);
        hasChanges = true;
      }

      // Now check if the function is missing its opening brace
      const position = match.index + fullMatch.length;
      const nextChar = updated.substring(position, position + 1).trim();

      if (nextChar !== '{') {
        // Missing opening brace for function body
        updated = updated.substring(0, position) + ' {\n' + updated.substring(position);
        hasChanges = true;
      }
    }

    // Fix completely broken function declarations for route handlers
    const brokenRouteHandlerPattern =
      /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(\s*request:[^,]+,\s*\{\s*params\s*\}:[^)]+\s*(?!\))/g;
    while ((match = brokenRouteHandlerPattern.exec(updated)) !== null) {
      const fullMatch = match[0];
      const fixedDeclaration = fullMatch + ' )';
      updated = updated.replace(fullMatch, fixedDeclaration);
      hasChanges = true;
    }
  }

  // Fix 4: Fix missing closing braces in function bodies
  const functionBodyPattern = /export\s+(?:async\s+)?function\s+[A-Za-z0-9_]+\s*\([^{]*\)\s*{/g;
  let funcMatch;
  while ((funcMatch = functionBodyPattern.exec(updated)) !== null) {
    const startPos = funcMatch.index + funcMatch[0].length;
    let openBraces = 1;
    let closePos = startPos;

    // Scan forward to find matching closing brace
    while (openBraces > 0 && closePos < updated.length) {
      const char = updated[closePos];
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
      closePos++;
    }

    // If we reach the end without matching braces, add closing brace
    if (openBraces > 0) {
      updated = updated.substring(0, updated.length) + '\n}'.repeat(openBraces);
      hasChanges = true;
    }
  }

  // Fix 5: Fix unclosed interface definitions
  const interfaces = [];
  const interfaceStartPattern = /interface\s+([A-Za-z0-9_]+)\s*{/g;
  let interfaceMatch;

  while ((interfaceMatch = interfaceStartPattern.exec(updated)) !== null) {
    const interfaceName = interfaceMatch[1];
    const startPos = interfaceMatch.index;
    const openBracePos = updated.indexOf('{', startPos);

    if (openBracePos !== -1) {
      let openBraces = 1;
      let closePos = openBracePos + 1;

      // Scan forward to find matching closing brace
      while (openBraces > 0 && closePos < updated.length) {
        const char = updated[closePos];
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        closePos++;
      }

      // If we didn't find a matching closing brace
      if (openBraces > 0) {
        interfaces.push({
          name: interfaceName,
          position: updated.length,
          missingBraces: openBraces,
        });
      }
    }
  }

  // Add missing closing braces to interfaces
  for (const iface of interfaces) {
    updated =
      updated.substring(0, iface.position) +
      '\n}'.repeat(iface.missingBraces) +
      updated.substring(iface.position);
    hasChanges = true;
  }

  // Fix 6: Fix broken import statements with unnecessary semicolons
  const brokenImportPattern = /import\s*{[^}]*}\s*from\s*['"][^'"]+['"];\s*;/g;
  if (brokenImportPattern.test(updated)) {
    updated = updated.replace(brokenImportPattern, (match) => match.replace(';;', ';'));
    hasChanges = true;
  }

  // Fix 7: Fix 'use client' directive placement
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    const useClientWrongPlacePattern = /(import[^;]*;\s*)'use client';/;
    if (useClientWrongPlacePattern.test(updated)) {
      updated = updated.replace(useClientWrongPlacePattern, "'use client';\n$1");
      hasChanges = true;
    }
  }

  // Fix 8: Remove duplicate type imports from database.ts
  const duplicateDbImportsPattern =
    /(import\s*{\s*[^}]*,\s*type\s+(?:TripRole|ItemStatus|TripStatus|PermissionStatus)[^}]*}\s*from\s*['"]@\/utils\/constants\/database['"][^;]*;)/g;
  if (duplicateDbImportsPattern.test(updated)) {
    // Get all matches to find duplicates
    const matches = [...updated.matchAll(duplicateDbImportsPattern)];
    if (matches.length > 1) {
      // Keep only the first occurrence
      for (let i = 1; i < matches.length; i++) {
        updated = updated.replace(matches[i][0], '');
        hasChanges = true;
      }
    }
  }

  return { updated, hasChanges };
}

/**
 * Process all TypeScript files in the project
 */
async function processAllFiles() {
  try {
    // Process API route files first as they have the most critical issues
    const apiRouteFiles = await glob('app/api/**/*.ts', {
      cwd: ROOT_DIR,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**'],
      absolute: true,
    });

    console.log(`Found ${apiRouteFiles.length} API route files to process...`);

    // Then process all remaining TypeScript files
    const allTsFiles = await glob('**/*.{ts,tsx}', {
      cwd: ROOT_DIR,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**'],
      absolute: true,
    });

    // Combine the files, processing API routes first
    const files = [...apiRouteFiles, ...allTsFiles.filter((file) => !apiRouteFiles.includes(file))];

    console.log(`Total of ${files.length} TypeScript files to process...`);

    let totalFiles = 0;
    let fixedFiles = 0;

    for (const file of files) {
      totalFiles++;
      try {
        const content = fs.readFileSync(file, 'utf8');
        const { updated, hasChanges } = fixSyntaxIssues(content, file);

        if (hasChanges) {
          fs.writeFileSync(file, updated, 'utf8');
          console.log(`✅ Fixed syntax issues in: ${path.relative(ROOT_DIR, file)}`);
          fixedFiles++;
        }
      } catch (err) {
        console.error(`❌ Error processing file ${file}:`, err);
      }
    }

    console.log(`\n🎉 Done! Fixed ${fixedFiles} of ${totalFiles} files.`);
  } catch (err) {
    console.error('❌ Error finding files:', err);
    process.exit(1);
  }
}

// Run the script
processAllFiles().catch((err) => {
  console.error('❌ Script execution failed:', err);
  process.exit(1);
});
