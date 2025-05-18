#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const componentsDir = path.join(process.cwd(), 'components');
const uiComponentsDir = path.join(componentsDir, 'ui');

// Map of old imports to new imports
const componentMappings = {
  // Add mappings as you discover them
  './DestinationCard': '@/components/ui/features/destinations/molecules/DestinationCard',
};

// Find all .tsx files in the components directory
function findTsxFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(findTsxFiles(filePath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(filePath);
    }
  }

  return results;
}

// Check if a file contains relative imports
function hasRelativeImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return /from\s+['"]\./.test(content);
}

// Find files with relative imports
function findFilesWithRelativeImports() {
  const allFiles = findTsxFiles(componentsDir);
  return allFiles.filter(hasRelativeImports);
}

// List all files with relative imports
console.log('Files with relative imports:');
const filesWithRelativeImports = findFilesWithRelativeImports();
filesWithRelativeImports.forEach((file) => {
  console.log(` - ${path.relative(process.cwd(), file)}`);
});

// List all component files in the ui/features directory for reference
console.log('\nAvailable UI components:');
exec(
  `find ${uiComponentsDir}/features -name "*.tsx" | grep -v ".stories.tsx" | sort`,
  (error, stdout) => {
    console.log(stdout);
  }
);

console.log(
  '\nTo fix imports, look at the relative paths in each file and update the componentMappings object in this script.'
);
console.log('Then run this script with the --fix flag to automatically update the imports.');

// If --fix flag is provided, fix the imports
if (process.argv.includes('--fix')) {
  console.log('\nFixing imports...');

  filesWithRelativeImports.forEach((file) => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    for (const [oldImport, newImport] of Object.entries(componentMappings)) {
      const regex = new RegExp(`from\\s+['"](${oldImport.replace('.', '\\.')})['"](;?)`, 'g');
      const newContent = content.replace(regex, `from '${newImport}'$2`);

      if (newContent !== content) {
        content = newContent;
        modified = true;
        console.log(`Updated imports in ${path.relative(process.cwd(), file)}`);
      }
    }

    if (modified) {
      fs.writeFileSync(file, content);
    }
  });
}
