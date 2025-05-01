// scripts/update-constants-imports.ts

import * as fs from 'fs';
import * as path from 'path';

const EXCLUDED_DIRS = ['node_modules', '.next', 'dist', '.git'];
const SOURCE_DIR = path.join(process.cwd());

interface ImportMapping {
  oldImport: string;
  newImport: string;
  constantName: string;
}

const IMPORT_MAPPINGS: ImportMapping[] = [
  // Database constants
  {
    oldImport: '@/utils/constants',
    newImport: '@/utils/constants/database',
    constantName: 'DB_TABLES',
  },
  {
    oldImport: '@/utils/constants',
    newImport: '@/utils/constants/database',
    constantName: 'DB_FIELDS',
  },
  {
    oldImport: '@/utils/constants',
    newImport: '@/utils/constants/database',
    constantName: 'DB_ENUMS',
  },

  // API constants
  {
    oldImport: '@/utils/constants',
    newImport: '@/utils/constants/api',
    constantName: 'API_ROUTES',
  },
  {
    oldImport: '@/utils/constants',
    newImport: '@/utils/constants/api',
    constantName: 'UNSPLASH_CONFIG',
  },

  // Route constants
  {
    oldImport: '@/utils/constants',
    newImport: '@/utils/constants/routes',
    constantName: 'PAGE_ROUTES',
  },

  // UI constants
  { oldImport: '@/utils/constants', newImport: '@/utils/constants/ui', constantName: 'THEME' },
  {
    oldImport: '@/utils/constants',
    newImport: '@/utils/constants/ui',
    constantName: 'IMAGE_TYPES',
  },
  {
    oldImport: '@/utils/constants',
    newImport: '@/utils/constants/ui',
    constantName: 'ITINERARY_CATEGORIES',
  },

  // Validation constants
  {
    oldImport: '@/utils/constants',
    newImport: '@/utils/constants/validation',
    constantName: 'LIMITS',
  },
  {
    oldImport: '@/utils/constants',
    newImport: '@/utils/constants/validation',
    constantName: 'ITEM_STATUSES',
  },
  {
    oldImport: '@/utils/constants',
    newImport: '@/utils/constants/validation',
    constantName: 'TRIP_STATUSES',
  },
];

function scanDirectory(dir: string): string[] {
  const files: string[] = [];

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

function analyzeFile(filePath: string): {
  filePath: string;
  imports: string[];
  constants: string[];
} {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports: string[] = [];
  const constants: string[] = [];

  // Find imports from constants
  const importMatches =
    content.match(/import\s+{[^}]+}\s+from\s+['"]@\/utils\/constants['"]/g) || [];
  imports.push(...importMatches);

  // Find used constants
  IMPORT_MAPPINGS.forEach((mapping) => {
    if (content.includes(mapping.constantName)) {
      constants.push(mapping.constantName);
    }
  });

  return { filePath, imports, constants };
}

function generateMigrationPlan(): void {
  const files = scanDirectory(SOURCE_DIR);
  const affectedFiles: Array<{ filePath: string; imports: string[]; constants: string[] }> = [];

  files.forEach((file) => {
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
      imports.forEach((imp) => console.log(`  ${imp}`));
    }

    if (constants.length > 0) {
      console.log('Used constants:');
      constants.forEach((constant) => {
        const mapping = IMPORT_MAPPINGS.find((m) => m.constantName === constant);
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
