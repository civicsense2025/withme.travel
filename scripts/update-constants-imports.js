// scripts/update-constants-imports.js

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCLUDED_DIRS = ['node_modules', '.next', 'dist', '.git'];
const SOURCE_DIR = path.resolve(__dirname, '..');

const IMPORT_MAPPINGS = [
  // Database constants
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/database", constantName: "DB_TABLES" },
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/database", constantName: "DB_FIELDS" },
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/database", constantName: "DB_ENUMS" },
  
  // API constants
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/api", constantName: "API_ROUTES" },
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/api", constantName: "UNSPLASH_CONFIG" },
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/api", constantName: "DB_QUERIES" },
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/api", constantName: "QUERY_SNIPPETS" },
  
  // Route constants
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/routes", constantName: "PAGE_ROUTES" },
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/routes", constantName: "ROUTE_HELPERS" },
  
  // UI constants
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/ui", constantName: "THEME" },
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/ui", constantName: "IMAGE_TYPES" },
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/ui", constantName: "ITINERARY_CATEGORIES" },
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/ui", constantName: "TIME_FORMATS" },
  
  // Validation constants
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/validation", constantName: "LIMITS" },
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/validation", constantName: "ITEM_STATUSES" },
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/validation", constantName: "TRIP_STATUSES" },
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/validation", constantName: "SPLIT_TYPES" },
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/validation", constantName: "TRIP_TYPES" },
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/validation", constantName: "TEMPLATE_CATEGORIES" },
  { oldImport: "@/utils/constants", newImport: "@/utils/constants/validation", constantName: "BUDGET_CATEGORIES" },
];

function scanDirectory(dir) {
  const files = [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(entry.name)) {
        files.push(...scanDirectory(fullPath));
      }
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  const constants = [];
  
  // Find imports from constants
  const importMatches = content.match(/import\s+{[^}]+}\s+from\s+['"]@\/utils\/constants['"]/g) || [];
  imports.push(...importMatches);
  
  // Check each individual constant in imports
  const constantMatches = content.match(/import\s+{([^}]+)}\s+from\s+['"]@\/utils\/constants['"]/g) || [];
  constantMatches.forEach(match => {
    try {
      const constantsList = match.match(/{([^}]+)}/);
      if (constantsList && constantsList[1]) {
        const constantNames = constantsList[1].split(',').map(c => c.trim());
        constantNames.forEach(constant => {
          const mapping = IMPORT_MAPPINGS.find(m => m.constantName === constant);
          if (mapping) {
            constants.push(constant);
          }
        });
      }
    } catch (e) {
      console.error('Error parsing import:', match, e);
    }
  });
  
  // Find used constants
  IMPORT_MAPPINGS.forEach(mapping => {
    if (content.includes(mapping.constantName)) {
      constants.push(mapping.constantName);
    }
  });
  
  return { filePath, imports, constants };
}

function generateMigrationPlan() {
  console.log('Scanning directory:', SOURCE_DIR);
  const files = scanDirectory(SOURCE_DIR);
  console.log(`Found ${files.length} TypeScript files`);
  
  const affectedFiles = [];
  
  files.forEach(file => {
    const analysis = analyzeFile(file);
    if (analysis.imports.length > 0 || analysis.constants.length > 0) {
      affectedFiles.push(analysis);
    }
  });
  
  // Generate report
  console.log('\nConstants Migration Plan');
  console.log('=======================\n');
  
  affectedFiles.forEach(({ filePath, imports, constants }) => {
    const relativePath = path.relative(SOURCE_DIR, filePath);
    console.log(`File: ${relativePath}`);
    
    if (imports.length > 0) {
      console.log('Current imports:');
      imports.forEach(imp => console.log(`  ${imp}`));
    }
    
    if (constants.length > 0) {
      console.log('Used constants:');
      constants.forEach(constant => {
        const mapping = IMPORT_MAPPINGS.find(m => m.constantName === constant);
        if (mapping) {
          console.log(`  ${constant} -> import from ${mapping.newImport}`);
        }
      });
    }
    console.log('---\n');
  });
  
  console.log(`Total files to update: ${affectedFiles.length}`);
}

// Run the analysis
generateMigrationPlan();

