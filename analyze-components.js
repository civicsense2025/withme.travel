#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const componentsDir = path.join(process.cwd(), 'components');
const uiComponentsDir = path.join(componentsDir, 'ui');

// Find all component files
function findComponentFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(findComponentFiles(filePath));
    } else if (file.endsWith('.tsx') && !file.endsWith('.stories.tsx')) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Extract component name from file
function extractComponentName(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Try to find export function ComponentName or export const ComponentName =
  const functionMatch = content.match(/export\s+function\s+([A-Z][A-Za-z0-9_]*)/);
  if (functionMatch) return functionMatch[1];
  
  const constMatch = content.match(/export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*(?:function)?/);
  if (constMatch) return constMatch[1];
  
  // Get the filename without extension as fallback
  return path.basename(filePath, path.extname(filePath));
}

// Check export pattern
function getExportPattern(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('export default')) {
    return 'default';
  } else if (content.match(/export\s+function/)) {
    return 'named_function';
  } else if (content.match(/export\s+const/)) {
    return 'named_const';
  } else if (content.match(/export\s+\{/)) {
    return 'export_object';
  } else {
    return 'unknown';
  }
}

// Find all component files
const componentFiles = findComponentFiles(componentsDir);

// Group by directories
const directoryCounts = {};
componentFiles.forEach(file => {
  const relPath = path.relative(componentsDir, file);
  const dir = path.dirname(relPath);
  
  if (!directoryCounts[dir]) {
    directoryCounts[dir] = 0;
  }
  directoryCounts[dir]++;
});

// Sort directories by count
const sortedDirs = Object.entries(directoryCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([dir, count]) => `${dir} (${count} components)`);

// Extract component names and export patterns
const components = componentFiles.map(file => {
  const relPath = path.relative(componentsDir, file);
  return {
    path: relPath,
    name: extractComponentName(file),
    exportPattern: getExportPattern(file)
  };
});

// Find naming inconsistencies
const kebabCaseFiles = components.filter(c => path.basename(c.path, '.tsx').includes('-'));
const pascalCaseFiles = components.filter(c => {
  const basename = path.basename(c.path, '.tsx');
  return /^[A-Z]/.test(basename) && !basename.includes('-');
});

// Find export inconsistencies
const exportPatterns = {};
components.forEach(c => {
  if (!exportPatterns[c.exportPattern]) {
    exportPatterns[c.exportPattern] = 0;
  }
  exportPatterns[c.exportPattern]++;
});

// Find duplicate component names
const nameCount = {};
components.forEach(c => {
  if (!nameCount[c.name]) {
    nameCount[c.name] = [];
  }
  nameCount[c.name].push(c.path);
});

const duplicateNames = Object.entries(nameCount)
  .filter(([_, paths]) => paths.length > 1)
  .map(([name, paths]) => ({ name, paths }));

// Print results
console.log('Component Analysis:');
console.log('==================\n');

console.log(`Total components: ${componentFiles.length}`);
console.log(`Components in UI directory: ${componentFiles.filter(f => f.includes('/ui/')).length}`);
console.log(`Components in features: ${componentFiles.filter(f => f.includes('/features/')).length}\n`);

console.log('Directory structure:');
sortedDirs.slice(0, 10).forEach(dir => console.log(` - ${dir}`));
if (sortedDirs.length > 10) {
  console.log(`... and ${sortedDirs.length - 10} more directories`);
}

console.log('\nNaming conventions:');
console.log(` - Kebab case filenames (like 'button-group.tsx'): ${kebabCaseFiles.length}`);
console.log(` - PascalCase filenames (like 'Button.tsx'): ${pascalCaseFiles.length}`);

console.log('\nExport patterns:');
Object.entries(exportPatterns).forEach(([pattern, count]) => {
  console.log(` - ${pattern}: ${count} components`);
});

if (duplicateNames.length > 0) {
  console.log('\nDuplicate component names:');
  duplicateNames.forEach(({ name, paths }) => {
    console.log(`\n${name} appears in ${paths.length} files:`);
    paths.forEach(p => console.log(` - ${p}`));
  });
  
  console.log('\nThis may cause import confusion. Consider:');
  console.log('1. Renaming components to be unique');
  console.log('2. Moving components to a more appropriate location');
  console.log('3. Consolidating duplicate components');
}

console.log('\nRecommendations:');
console.log('1. Use consistent naming: Either kebab-case.tsx or PascalCase.tsx for all files');
console.log('2. Use consistent exports: Prefer named exports like "export function ComponentName"');
console.log('3. Organize components by feature or atomic design (atoms, molecules, organisms)');
console.log('4. Ensure components are imported from their canonical location');

console.log('\nDone analyzing components.'); 