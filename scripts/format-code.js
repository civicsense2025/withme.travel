#!/usr/bin/env node

/**
 * Script to format code with Prettier
 *
 * Usage:
 *   node scripts/format-code.js [directories]
 *
 * Examples:
 *   node scripts/format-code.js                  # Format all code
 *   node scripts/format-code.js components app   # Format only components and app directories
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Determine if the script is run from the project root or the scripts directory
const isRunFromRoot = fs.existsSync('package.json');
const rootDir = isRunFromRoot ? '.' : '..';

// Get directories to format from command line arguments
const args = process.argv.slice(2);
const directories =
  args.length > 0
    ? args
    : ['app', 'components', 'contexts', 'hooks', 'lib', 'pages', 'types', 'utils'];

// Extensions to format
const extensions = 'js,jsx,ts,tsx,json,md';

console.log('Formatting the following directories:');
directories.forEach((dir) => console.log(` - ${dir}`));

try {
  // Format each directory
  directories.forEach((dir) => {
    const dirPath = path.join(rootDir, dir);
    if (!fs.existsSync(dirPath)) {
      console.warn(`Warning: Directory ${dirPath} doesn't exist. Skipping.`);
      return;
    }

    console.log(`\nFormatting ${dir}/**/*.{${extensions}}...`);

    try {
      execSync(`npx prettier --write "${dirPath}/**/*.{${extensions}}"`, {
        stdio: 'inherit',
      });
    } catch (err) {
      console.error(`Error formatting ${dir}: ${err.message}`);
    }
  });

  console.log('\nFormatting completed successfully!');
} catch (error) {
  console.error('Error during formatting:', error);
  process.exit(1);
}
