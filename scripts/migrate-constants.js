/**
 * Constants Migration Script
 *
 * This script helps migrate imports from the root constants.ts file
 * to the new modular constants in utils/constants/*.ts
 *
 * Usage:
 *   node scripts/migrate-constants.js         # Analyze only
 *   node scripts/migrate-constants.js --fix   # Analyze and fix
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Whether to fix files or just analyze
const shouldFix = process.argv.includes('--fix');

// Define the mapping of constants to their new location
const CONSTANT_MAPPING = {
  // Database constants
  TABLES: '@/utils/constants/database',
  DB_TABLES: '@/utils/constants/database',
  DB_FIELDS: '@/utils/constants/database',
  DB_ENUMS: '@/utils/constants/database',
  FIELDS: '@/utils/constants/database',
  ENUMS: '@/utils/constants/database',
  TripRole: '@/utils/constants/database',

  // Route constants
  API_ROUTES: '@/utils/constants/routes',
  PAGE_ROUTES: '@/utils/constants/routes',

  // Status constants
  TRIP_ROLES: '@/utils/constants/status',
  PERMISSION_STATUSES: '@/utils/constants/status',
  ITINERARY_CATEGORIES: '@/utils/constants/status',
  ITEM_STATUSES: '@/utils/constants/status',
  TRIP_STATUSES: '@/utils/constants/status',
  SPLIT_TYPES: '@/utils/constants/status',
  TRIP_TYPES: '@/utils/constants/status',
  BUDGET_CATEGORIES: '@/utils/constants/status',
  TEMPLATE_CATEGORIES: '@/utils/constants/status',
  TEMPLATE_TYPES: '@/utils/constants/status',

  // UI constants
  THEME: '@/utils/constants/ui',
  LIMITS: '@/utils/constants/ui',
  TIME_FORMATS: '@/utils/constants/ui',

  // Types from status
  ItineraryCategory: '@/utils/constants/status',
  ItemStatus: '@/utils/constants/status',
  TripStatus: '@/utils/constants/status',
  TripType: '@/utils/constants/status',
  BudgetCategory: '@/utils/constants/status',
  PermissionStatus: '@/utils/constants/status',
  SplitType: '@/utils/constants/status',
  TemplateCategory: '@/utils/constants/status',
  TemplateType: '@/utils/constants/status',
};

// Directory to exclude from scanning
const EXCLUDE_DIRS = ['node_modules', '.next', '.git', 'coverage'];

// Find all TS/TSX files in the project
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    if (EXCLUDE_DIRS.includes(file)) {
      return;
    }

    if (fs.statSync(filePath).isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Check if a file imports from constants.ts
function checksForConstantsImport(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return (
    content.includes("from '@/utils/constants'") || content.includes('from "@/utils/constants"')
  );
}

// Analyze imports and suggest changes
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const importMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]@\/utils\/constants['"]/g);

  if (!importMatch) return;

  console.log(`\nAnalyzing ${filePath}`);

  // Will hold all grouped constants
  const grouped = {};

  // Extract the imported constants
  importMatch.forEach((match) => {
    const constants = match
      .match(/import\s+{([^}]+)}\s+from/)[1]
      .split(',')
      .map((c) => c.trim());

    // Group constants by their new location
    constants.forEach((constant) => {
      const module = CONSTANT_MAPPING[constant];
      if (module) {
        if (!grouped[module]) {
          grouped[module] = [];
        }
        grouped[module].push(constant);
      } else {
        console.log(`- Unknown constant: ${constant}`);
      }
    });
  });

  // Output suggested changes
  console.log('Suggested import changes:');
  Object.entries(grouped).forEach(([module, consts]) => {
    console.log(`import { ${consts.join(', ')} } from '${module}';`);
  });

  // Fix the file if requested
  if (shouldFix && Object.keys(grouped).length > 0) {
    fixFile(filePath, content, importMatch, grouped);
  }

  return grouped;
}

// Fix imports in a file
function fixFile(filePath, content, importMatches, grouped) {
  let newContent = content;

  // Remove old imports
  importMatches.forEach((match) => {
    newContent = newContent.replace(match, '');
  });

  // Add new imports at the top of the file after any initial comments
  const imports = Object.entries(grouped)
    .map(([module, consts]) => {
      return `import { ${consts.join(', ')} } from '${module}';`;
    })
    .join('\n');

  // Find a good insertion point after comments and existing imports
  const lines = newContent.split('\n');
  let insertIndex = 0;

  // Skip initial comments and empty lines
  while (
    insertIndex < lines.length &&
    (lines[insertIndex].trim().startsWith('//') ||
      lines[insertIndex].trim().startsWith('/*') ||
      lines[insertIndex].trim() === '')
  ) {
    insertIndex++;
  }

  // Skip existing imports
  while (insertIndex < lines.length && lines[insertIndex].trim().startsWith('import ')) {
    insertIndex++;
  }

  // Insert the new imports
  lines.splice(insertIndex, 0, imports);

  // Clean up empty lines
  newContent = lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
    .replace(/^[\n\s]+/, ''); // Remove leading newlines

  // Write the file
  console.log(`✅ Fixing ${filePath}`);
  fs.writeFileSync(filePath, newContent, 'utf8');
}

// Main execution
function main() {
  console.log('Constants Migration Analysis');
  console.log('===========================');
  if (shouldFix) {
    console.log('Running in FIX mode - files will be updated');
  } else {
    console.log('Running in ANALYZE mode - no changes will be made');
    console.log('Use --fix option to apply changes');
  }
  console.log('===========================');

  const rootDir = path.resolve(__dirname, '..');
  const tsFiles = findTsFiles(rootDir);

  console.log(`Found ${tsFiles.length} TypeScript files`);

  const filesWithConstantsImport = tsFiles.filter(checksForConstantsImport);
  console.log(`Found ${filesWithConstantsImport.length} files importing from '@/utils/constants'`);

  let fixedFiles = 0;
  filesWithConstantsImport.forEach((file) => {
    const result = analyzeFile(file);
    if (shouldFix && result && Object.keys(result).length > 0) {
      fixedFiles++;
    }
  });

  if (shouldFix) {
    console.log(`\nMigration complete. Fixed ${fixedFiles} files.`);
  } else {
    console.log('\nAnalysis complete. Use --fix option to apply changes.');
  }
}

main();
