#!/usr/bin/env node

/**
 * This script fixes syntax errors in import statements
 * caused by our previous fix-duplicate-types.js script
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory of the project
const ROOT_DIR = path.join(__dirname, '..');

console.log('🔧 Fixing syntax errors in import statements...');

// Files with known import issues based on the TypeScript output
const FILES_WITH_ISSUES = [
  'app/design-sandbox/design-sandbox-client.tsx',
  'components/itinerary/itinerary-display.tsx',
  'components/itinerary/itinerary-tab.tsx',
  'components/members-tab.tsx',
  'components/Todo.tsx',
  'components/trip-overview-tab.tsx',
  'types/itinerary.ts',
  'types/trip.ts'
];

// Fix import statement in a file
function fixImportSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updated = content;
    let hasChanges = false;

    // Fix 1: Empty named imports like "import { , } from"
    if (updated.includes('import { , }')) {
      updated = updated.replace(/import\s+{\s*,\s*}\s+from\s+['"][^'"]*['"]/g, '');
      hasChanges = true;
    }

    // Fix 2: Malformed imports with type keywords
    const typeImportRegex = /import\s+{\s*type\s+(\w+)(?:\s*,\s*type\s+(\w+))*\s*}\s+from\s+['"][^'"]*['"]/g;
    let match;
    while ((match = typeImportRegex.exec(content)) !== null) {
      // This could be a valid import, no need to fix
    }

    // Fix 3: Fix broken imports with multiple statements
    if (updated.match(/import\s+{\s*[^}]*\s*}\s*\n\s*}\s+from/)) {
      updated = updated.replace(/import\s+{\s*([^}]*)\s*}\s*\n\s*}\s+from\s+['"]([^'"]*)['"]/g, (match, importList, source) => {
        // Find the matching opening bracket
        const openingBracketIndex = match.lastIndexOf('{', match.indexOf('}'));
        if (openingBracketIndex !== -1) {
          // Reconstruct the import statement
          return `import { ${importList} } from "${source}"`;
        }
        return match; // If we can't find it, leave as is
      });
      hasChanges = true;
    }

    // Fix 4: Fix doubled import statements
    const importRegex = /import\s+{([^}]*)}\s+from\s+['"]([^'"]*)['"]/g;
    const imports = {};
    
    let importMatch;
    while ((importMatch = importRegex.exec(updated)) !== null) {
      const importList = importMatch[1].trim();
      const source = importMatch[2];
      
      if (!imports[source]) {
        imports[source] = [];
      }
      
      // Split and clean the import list
      const items = importList.split(',')
        .map(i => i.trim())
        .filter(i => i && i !== ',');
      
      imports[source].push(...items);
    }
    
    // If we have multiple imports from the same source, combine them
    let combinedImports = '';
    for (const source in imports) {
      // Remove duplicates
      const uniqueImports = [...new Set(imports[source])];
      combinedImports += `import { ${uniqueImports.join(', ')} } from '${source}';\n`;
    }
    
    // Replace all imports with our combined version
    if (Object.keys(imports).length > 0) {
      // Remove all existing imports
      updated = updated.replace(/import\s+{([^}]*)}\s+from\s+['"]([^'"]*)['"]/g, '');
      
      // Add our cleaned combined imports at the top
      updated = combinedImports + updated;
      hasChanges = true;
    }
    
    // Remove duplicate lines
    const lines = updated.split('\n');
    const uniqueLines = [];
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !uniqueLines.includes(trimmedLine)) {
        uniqueLines.push(line);
      } else if (!trimmedLine) {
        uniqueLines.push(line); // Keep empty lines
      }
    }
    updated = uniqueLines.join('\n');

    if (hasChanges) {
      fs.writeFileSync(filePath, updated);
      console.log(`✅ Fixed import syntax in: ${filePath}`);
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
  let fixedCount = 0;
  
  // Fix known files with issues first
  for (const filePath of FILES_WITH_ISSUES) {
    const fullPath = path.join(ROOT_DIR, filePath);
    if (fs.existsSync(fullPath)) {
      const fixed = fixImportSyntax(fullPath);
      if (fixed) fixedCount++;
    } else {
      console.warn(`⚠️ File not found: ${filePath}`);
    }
  }
  
  // Also scan all TypeScript/TSX files for similar issues
  const tsFiles = await glob('**/*.{ts,tsx}', {
    cwd: ROOT_DIR,
    ignore: [
      'node_modules/**',
      'coverage/**',
      'build/**',
      '.next/**',
      'scripts/**',
      ...FILES_WITH_ISSUES // Skip already fixed files
    ]
  });
  
  for (const file of tsFiles) {
    const fullPath = path.join(ROOT_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Only process files that might have import issues
    if (content.includes('import { , }') || 
        content.match(/import\s+{\s*[^}]*\s*}\s*\n\s*}\s+from/) ||
        content.includes('type TripRole') ||
        content.includes('type ItemStatus')) {
      const fixed = fixImportSyntax(fullPath);
      if (fixed) fixedCount++;
    }
  }
  
  console.log(`\n🎉 Done! Fixed import syntax in ${fixedCount} files.`);
}

main().catch(console.error); 