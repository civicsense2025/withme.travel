#!/usr/bin/env node

/**
 * This script fixes various remaining syntax issues in the codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory of the project
const ROOT_DIR = path.join(__dirname, '..');

console.log('🔧 Final comprehensive fix for all TypeScript files...');

/**
 * Fix remaining syntax issues in all files
 */
function fixSyntaxIssues(content, filePath) {
  let updated = content;
  let hasChanges = false;

  // Fix 1: Remove redundant imports
  const redundantImportPattern = /(import\s+{[^}]*}\s+from\s+['"][^'"]+['"];?\s*)\1/g;
  if (redundantImportPattern.test(updated)) {
    updated = updated.replace(redundantImportPattern, '$1');
    hasChanges = true;
  }

  // Fix 2: Handle semi-parse errors
  // These can often be caused by leftover trailing commas in enums, objects, etc.
  const objectLiteralPattern = /(\{\s*(?:[a-zA-Z0-9_'"]+\s*:\s*[^{},]+,\s*)*[a-zA-Z0-9_'"]+\s*:\s*[^{},]+),(\s*\})/g;
  updated = updated.replace(objectLiteralPattern, '$1$2');
  
  // Fix 3: Missing imports for TripRole
  if (updated.includes('TripRole') && !updated.includes("import") && !updated.includes("type TripRole")) {
    updated = `import { type TripRole } from '@/utils/constants/status';\n${updated}`;
    hasChanges = true;
  }

  // Fix 4: Fix missing brackets in object destructuring
  const brokenDestructuringPattern = /const\s+{([^}]*)}(?!\s*=)/g;
  if (brokenDestructuringPattern.test(updated)) {
    updated = updated.replace(brokenDestructuringPattern, 'const {$1} =');
    hasChanges = true;
  }

  // Fix 5: Unclosed JSX tags
  const jsxTags = [];
  const jsxTagPattern = /<([A-Z][A-Za-z0-9]*|[a-z][A-Za-z0-9]*)[^>]*>/g;
  let match;
  let content_copy = updated;
  
  while ((match = jsxTagPattern.exec(content_copy)) !== null) {
    const tagName = match[1];
    const fullTag = match[0];
    const startPos = match.index;
    
    // Check if it's a self-closing tag
    if (fullTag.endsWith('/>')) continue;
    
    // Check if there's a closing tag
    const closingTagPattern = new RegExp(`<\\/${tagName}\\s*>`, 'g');
    closingTagPattern.lastIndex = startPos + fullTag.length;
    const closingMatch = closingTagPattern.exec(content_copy);
    
    if (!closingMatch) {
      // Mark positions where we need to add closing tags
      jsxTags.push({
        name: tagName,
        position: content_copy.length
      });
    }
  }
  
  // Add missing closing tags
  for (const tag of jsxTags) {
    updated = updated.substring(0, tag.position) + `</${tag.name}>` + updated.substring(tag.position);
    hasChanges = true;
  }

  // Fix 6: Double function declaration patterns
  const doubleFunctionPattern = /(export\s+(?:async\s+)?function\s+[A-Za-z0-9_]+\s*\([^)]*\))\s*\{([^{]*)\{/g;
  if (doubleFunctionPattern.test(updated)) {
    updated = updated.replace(doubleFunctionPattern, '$1 {');
    hasChanges = true;
  }

  // Fix 7: Remove standalone type imports that refer to non-existent exports
  const brokenTypeImportPattern = /import\s+{\s*type\s+[^}]+}\s+from\s+['"]@\/utils\/constants\/database['"];/g;
  if (brokenTypeImportPattern.test(updated) && !updated.includes("import { TABLES }")) {
    // Only remove if there's no valid TABLES import from database
    updated = updated.replace(brokenTypeImportPattern, '');
    hasChanges = true;
  }

  // Fix 8: Fix unescaped template literals
  const unescapedTemplatePattern = /(\${[^}]*(?:=>|=>)[^}]*})/g;
  if (unescapedTemplatePattern.test(updated)) {
    updated = updated.replace(unescapedTemplatePattern, match => match.replace(/=>/g, '=>'));
    hasChanges = true;
  }

  // Fix 9: Fix invalid JSX props
  const invalidJsxPropPattern = /(\w+)=\{([^{}]*)\}/g;
  updated = updated.replace(invalidJsxPropPattern, (match, propName, propValue) => {
    // Check if propValue contains invalid JS
    if (propValue.includes('=>') && !propValue.includes('(')) {
      return `${propName}={${propValue.replace(/=>/g, '() =>')}}`;
    }
    return match;
  });

  // Fix 10: Fix missing return statements in arrow functions
  const arrowFunctionPattern = /\([^)]*\)\s*=>\s*\{([^{}]*)\}/g;
  updated = updated.replace(arrowFunctionPattern, (match, body) => {
    if (!body.trim().startsWith('return ') && body.trim() !== '') {
      return match.replace(body, ` return ${body.trim()} `);
    }
    return match;
  });

  return { updated, hasChanges };
}

/**
 * Process all TypeScript files in the project
 */
async function processAllFiles() {
  try {
    const files = await glob('**/*.{ts,tsx}', {
      cwd: ROOT_DIR,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**', '**/scripts/**'],
      absolute: true,
    });

    console.log(`Found ${files.length} TypeScript files to process...`);

    let totalFiles = 0;
    let fixedFiles = 0;

    for (const file of files) {
      totalFiles++;
      try {
        const content = fs.readFileSync(file, 'utf8');
        const { updated, hasChanges } = fixSyntaxIssues(content, file);

        if (hasChanges) {
          fs.writeFileSync(file, updated, 'utf8');
          console.log(`✅ Fixed file: ${path.relative(ROOT_DIR, file)}`);
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
processAllFiles().catch(err => {
  console.error('❌ Script execution failed:', err);
  process.exit(1);
}); 