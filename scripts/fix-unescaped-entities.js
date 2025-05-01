#!/usr/bin/env node

/**
 * Script to fix all unescaped entity errors in the codebase
 * This replaces ' with &apos; and " with &quot; in JSX content
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Find all files with unescaped entity errors
console.log('Finding files with unescaped entity errors...');
const grepCommand = `grep -r -l "Error: \\\`'\\\` can be escaped with" --include="*.log" ${ROOT_DIR}/.next/build-manifest*.log`;

let errorFiles = [];
try {
  // Use the Next.js build logs to find files with errors
  const result = execSync('pnpm run build --no-lint || true').toString();

  // Extract file paths from build error messages
  const pattern = /\.\/(.*?)\s+\d+:\d+\s+Error: [`'](["`])[`'] can be escaped with/g;
  let match;
  const seenFiles = new Set();

  while ((match = pattern.exec(result)) !== null) {
    const filePath = match[1];
    if (!seenFiles.has(filePath)) {
      seenFiles.add(filePath);
      errorFiles.push(filePath);
    }
  }
} catch (error) {
  console.error('Error finding files:', error.message);
  process.exit(1);
}

if (errorFiles.length === 0) {
  console.log('No files with unescaped entity errors found.');
  process.exit(0);
}

console.log(`Found ${errorFiles.length} files with unescaped entity errors.`);

// Process each file
let successCount = 0;
let errorCount = 0;

errorFiles.forEach((filePath) => {
  try {
    console.log(`Processing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace unescaped quotes within JSX but not in JS code
    // This is a simplified approach and might need refinement

    // Function to replace quotes in JSX attributes and content
    const processContent = (str) => {
      // Replace in JSX element content but not in attributes or JS expressions
      // This is a simplistic approach and may need refinement
      return str.replace(/(<[^>]*>)(.*?)(<\/[^>]*>)/gs, (match, openTag, content, closeTag) => {
        // Replace only in the content, not in the tags
        const fixedContent = content.replace(/(?<!\\)'/g, '&apos;').replace(/(?<!\\)"/g, '&quot;');
        return `${openTag}${fixedContent}${closeTag}`;
      });
    };

    content = processContent(content);

    // Write the updated content back to the file
    fs.writeFileSync(filePath, content);
    successCount++;
    console.log(`Updated: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    errorCount++;
  }
});

console.log('\nSummary:');
console.log(`Total files processed: ${errorFiles.length}`);
console.log(`Successfully updated: ${successCount}`);
console.log(`Errors: ${errorCount}`);

if (errorCount > 0) {
  console.log('\nWarning: Some files could not be updated automatically. Manual review is needed.');
} else {
  console.log(
    '\nAll files processed successfully. Run the build again to check if errors are fixed.'
  );
}
