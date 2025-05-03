#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

/**
 * Script to fix constants import issues across the codebase
 * 
 * This script fixes:
 * 1. DB_ENUMS -> ENUMS
 * 2. DB_FIELDS -> FIELDS
 * 3. Missing imports from database.ts
 */

const ROOT_DIR = path.resolve(__dirname, '..');

async function fixDatabaseImports(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;
    
    // Fix DB_ENUMS -> ENUMS
    if (content.includes('DB_ENUMS')) {
      console.log(`Fixing DB_ENUMS in ${filePath}`);
      content = content.replace(/DB_ENUMS/g, 'ENUMS');
      modified = true;
    }
    
    // Fix DB_FIELDS -> FIELDS
    if (content.includes('DB_FIELDS')) {
      console.log(`Fixing DB_FIELDS in ${filePath}`);
      content = content.replace(/DB_FIELDS/g, 'FIELDS');
      modified = true;
    }
    
    // Fix DB_TABLES -> TABLES
    if (content.includes('DB_TABLES')) {
      console.log(`Fixing DB_TABLES in ${filePath}`);
      content = content.replace(/DB_TABLES/g, 'TABLES');
      modified = true;
    }
    
    // Fix import { TripRole } from '@/utils/constants/database' to import { type TripRole } from '@/utils/constants/database'
    const importRegex = /import\s+\{\s*([^}]*TripRole[^}]*)\s*\}\s*from\s+['"]@\/utils\/constants\/database['"]/g;
    const importMatch = importRegex.exec(content);
    
    if (importMatch) {
      const imports = importMatch[1];
      if (!imports.includes('type TripRole')) {
        console.log(`Fixing TripRole import in ${filePath}`);
        const fixedImports = imports.replace(/(\b)TripRole(\b)/g, '$1type TripRole$2');
        content = content.replace(importMatch[0], `import { ${fixedImports} } from '@/utils/constants/database'`);
        modified = true;
      }
    }
    
    // Fix missing imports
    if ((content.includes('ENUMS.') || content.includes('TABLES.') || content.includes('FIELDS.')) && 
        !content.includes("from '@/utils/constants/database'")) {
      console.log(`Adding missing database imports in ${filePath}`);
      
      // Determine what to import
      const needsENUMS = content.includes('ENUMS.');
      const needsTABLES = content.includes('TABLES.');
      const needsFIELDS = content.includes('FIELDS.');
      
      let importLine = 'import {';
      if (needsTABLES) importLine += ' TABLES,';
      if (needsFIELDS) importLine += ' FIELDS,';
      if (needsENUMS) importLine += ' ENUMS,';
      importLine = importLine.slice(0, -1); // Remove trailing comma
      importLine += " } from '@/utils/constants/database';";
      
      // Add import to the top of the file
      const lines = content.split('\n');
      const importIndex = lines.findIndex(line => line.startsWith('import'));
      
      if (importIndex !== -1) {
        lines.splice(importIndex, 0, importLine);
      } else {
        lines.unshift(importLine);
      }
      
      content = lines.join('\n');
      modified = true;
    }
    
    if (modified) {
      await fs.writeFile(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing imports in ${filePath}:`, error);
    return false;
  }
}

async function findAndFixFiles() {
  // Get all TypeScript/TSX files in the project
  const tsxFiles = glob.sync('**/*.{ts,tsx}', {
    cwd: ROOT_DIR,
    ignore: ['**/node_modules/**', '**/build/**', '**/dist/**', '**/.next/**'],
  });
  
  let fixedFiles = 0;
  
  for (const file of tsxFiles) {
    const filePath = path.join(ROOT_DIR, file);
    
    // Fix database constants imports
    const fixed = await fixDatabaseImports(filePath);
    if (fixed) fixedFiles++;
  }
  
  console.log(`\nFixed ${fixedFiles} files with constants import issues`);
}

// Run the script
findAndFixFiles().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
}); 