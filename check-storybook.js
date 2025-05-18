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

// Find all Storybook files
function findStoryFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(findStoryFiles(filePath));
    } else if (file.endsWith('.stories.tsx') || file.endsWith('.stories.ts')) {
      results.push(filePath);
    }
  }

  return results;
}

// Extract story title from a file
function extractStoryTitle(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
  return titleMatch ? titleMatch[1] : null;
}

// Find duplicate story titles
function findDuplicateStoryTitles() {
  const storyFiles = findStoryFiles(componentsDir);
  const titleMap = new Map();
  const duplicates = [];

  storyFiles.forEach((file) => {
    const title = extractStoryTitle(file);
    if (!title) return;

    if (titleMap.has(title)) {
      titleMap.get(title).push(file);
    } else {
      titleMap.set(title, [file]);
    }
  });

  for (const [title, files] of titleMap.entries()) {
    if (files.length > 1) {
      duplicates.push({ title, files });
    }
  }

  return duplicates;
}

// Print duplicate story titles
const duplicates = findDuplicateStoryTitles();
if (duplicates.length > 0) {
  console.log('Duplicate story titles found:');
  duplicates.forEach(({ title, files }) => {
    console.log(`\nTitle: "${title}"`);
    files.forEach((file) => {
      console.log(` - ${path.relative(process.cwd(), file)}`);
    });
  });

  console.log('\nTo fix, either:');
  console.log('1. Rename one of the story titles');
  console.log('2. Remove one of the duplicate stories');
  console.log('3. Merge the stories into a single file');
} else {
  console.log('No duplicate story titles found.');
}

// Print story title format pattern for reference
console.log('\nStory title pattern:');

try {
  const storyTitles = findStoryFiles(componentsDir).map(extractStoryTitle).filter(Boolean);

  if (storyTitles.length > 0) {
    const examples = storyTitles.slice(0, 5);
    console.log(`Found ${storyTitles.length} stories with titles like:`);
    examples.forEach((title) => console.log(` - ${title}`));

    // Try to infer pattern
    const parts = storyTitles.filter((t) => t.includes('/')).map((t) => t.split('/').length);

    if (parts.length > 0) {
      const avgParts = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
      console.log(`\nMost titles have ${avgParts} parts (separated by '/').`);
      console.log('Recommended format: "Category/Subcategory/ComponentName"');
    }
  } else {
    console.log('No story titles found.');
  }
} catch (error) {
  console.error('Error analyzing story titles:', error);
}

// Check for common Storybook configuration issues
console.log('\nChecking for common Storybook configuration issues:');

// Missing component in meta
try {
  const missingComponent = execSync(
    `grep -r "title:" --include="*.stories.tsx" ${componentsDir} | grep -v "component:"`
  )
    .toString()
    .trim()
    .split('\n');

  if (missingComponent.length > 0) {
    console.log('\nPossible missing component in meta:');
    missingComponent.slice(0, 5).forEach((line) => console.log(` - ${line}`));
    if (missingComponent.length > 5) {
      console.log(`... and ${missingComponent.length - 5} more`);
    }
  }
} catch (error) {
  // No matches found
}

// Missing default export
try {
  const storyFiles = findStoryFiles(componentsDir);
  const missingDefaultExport = [];

  storyFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('export default')) {
      missingDefaultExport.push(path.relative(process.cwd(), file));
    }
  });

  if (missingDefaultExport.length > 0) {
    console.log('\nMissing default export:');
    missingDefaultExport.forEach((file) => console.log(` - ${file}`));
  }
} catch (error) {
  console.error('Error checking for missing default exports:', error);
}

console.log('\nDone checking Storybook configuration.');
