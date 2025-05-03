#!/usr/bin/env node

/**
 * This script fixes common syntax errors in component files (mostly .tsx files)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory of the project
const ROOT_DIR = path.join(__dirname, '..');

console.log('🔧 Fixing component syntax errors...');

/**
 * Fix common syntax issues in component files
 */
function fixComponentSyntax(content, filePath) {
  let updated = content;
  let hasChanges = false;

  // Fix 1: Fix 'use client' directive placement
  if (updated.includes("'use client'") && !updated.startsWith("'use client'")) {
    // Extract the use client directive and any imports
    const useClientMatch = updated.match(/(.*?)('use client';)(.*)/s);
    if (useClientMatch) {
      const [_, beforeUseClient, useClientDirective, afterUseClient] = useClientMatch;

      // Move the 'use client' directive to the top
      updated = `${useClientDirective}\n${beforeUseClient}${afterUseClient}`;
      hasChanges = true;
    }
  }

  // Fix 2: Remove standalone semicolons
  const standalonePattern = /^\s*;\s*$/gm;
  if (standalonePattern.test(updated)) {
    updated = updated.replace(standalonePattern, '');
    hasChanges = true;
  }

  // Fix 3: Fix unclosed interfaces
  const interfaces = [];
  const interfaceStart = /interface\s+([A-Za-z0-9_]+)\s*{/g;
  let interfaceMatch;

  while ((interfaceMatch = interfaceStart.exec(updated)) !== null) {
    const interfaceName = interfaceMatch[1];
    const startIndex = interfaceMatch.index;
    const openBracePos = updated.indexOf('{', startIndex);

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

  // Fix 4: Fix unclosed components/functions
  const componentPattern =
    /(export\s+(?:default\s+)?(?:function|const)\s+[A-Za-z0-9_]+\s*(?:=\s*(?:\([^)]*\)|)\s*=>|)?\s*\{)/g;
  let componentMatch;
  let components = [];

  while ((componentMatch = componentPattern.exec(updated)) !== null) {
    const startIndex = componentMatch.index;
    const openBracePos = updated.indexOf('{', startIndex);

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
        components.push({
          position: updated.length,
          missingBraces: openBraces,
        });
      }
    }
  }

  // Add missing closing braces to components
  for (const component of components) {
    updated =
      updated.substring(0, component.position) +
      '\n}'.repeat(component.missingBraces) +
      updated.substring(component.position);
    hasChanges = true;
  }

  // Fix 5: Fix incomplete conditional rendering
  // Pattern: condition ? <Component /> | <Component />
  const brokenTernaryPattern = /(\?\s*<[^>]*>(?:<\/[^>]*>)?)\s*\|\s*(<[^>]*>(?:<\/[^>]*>)?)/g;
  if (brokenTernaryPattern.test(updated)) {
    updated = updated.replace(brokenTernaryPattern, '$1 : $2');
    hasChanges = true;
  }

  // Fix 6: Fix incomplete import statements
  const incompleteImportPattern = /import\s+{[^}]*}\s+from\s+['"][^'"]*['"](?!;)/g;
  if (incompleteImportPattern.test(updated)) {
    updated = updated.replace(incompleteImportPattern, (match) => match + ';');
    hasChanges = true;
  }

  // Fix 7: Fix missing JSX fragment closing tags
  const openFragmentPattern = /<>([^<]*?)</g;
  if (openFragmentPattern.test(updated)) {
    updated = updated.replace(openFragmentPattern, (match, content, offset) => {
      // Check if there's a closing fragment later
      const restOfText = updated.substring(offset + match.length);
      if (!restOfText.includes('</>')) {
        return '<>' + content + '</>' + '<';
      }
      return match;
    });
    hasChanges = true;
  }

  return { updated, hasChanges };
}

/**
 * Process component files
 */
async function processComponentFiles() {
  try {
    // Find all component files
    const files = await glob('{app,components}/**/*.{ts,tsx}', {
      cwd: ROOT_DIR,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**', '**/api/**'],
      absolute: true,
    });

    console.log(`Found ${files.length} component files to check...`);

    let totalFiles = 0;
    let fixedFiles = 0;

    for (const file of files) {
      totalFiles++;
      try {
        const content = fs.readFileSync(file, 'utf8');
        const { updated, hasChanges } = fixComponentSyntax(content, file);

        if (hasChanges) {
          fs.writeFileSync(file, updated, 'utf8');
          console.log(`✅ Fixed component file: ${path.relative(ROOT_DIR, file)}`);
          fixedFiles++;
        }
      } catch (err) {
        console.error(`❌ Error processing file ${file}:`, err);
      }
    }

    console.log(`\n🎉 Done! Fixed ${fixedFiles} of ${totalFiles} component files.`);
  } catch (err) {
    console.error('❌ Error finding files:', err);
    process.exit(1);
  }
}

// Run the script
processComponentFiles().catch((err) => {
  console.error('❌ Script execution failed:', err);
  process.exit(1);
});
