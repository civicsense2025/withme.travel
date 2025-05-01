#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { globby } from 'globby';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const logSuccess = (message) => console.log(`\x1b[32m✓\x1b[0m ${message}`);
const logError = (message) => console.log(`\x1b[31m✗\x1b[0m ${message}`);
const logInfo = (message) => console.log(`\x1b[34mi\x1b[0m ${message}`);

/**
 * Process each API route file to fix Next.js 15 route parameter types
 */
async function processFile(filePath) {
  try {
    // Read the file content
    let content = await fs.readFile(filePath, 'utf8');
    const originalContent = content;

    // Regular expression to match route handler functions
    // This pattern looks for export async function GET/POST/PUT/DELETE with a request param and
    // an object containing params as the second parameter
    const routeHandlerRegex =
      /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(\s*.*?:\s*.*?,\s*{\s*params\s*}:\s*{\s*params\s*:\s*{\s*([^}]+)\s*}\s*}\s*\)/g;

    // Replacement to update the function signature for Next.js 15
    content = content.replace(routeHandlerRegex, (match, method, paramsContent) => {
      // Create the updated function signature with await for params
      return `export async function ${method}(
  request: Request,
  { params }: { params: { ${paramsContent} } }
)`;
    });

    // Save the file if changes were made
    if (content !== originalContent) {
      await fs.writeFile(filePath, content, 'utf8');
      logSuccess(`Updated: ${path.relative(rootDir, filePath)}`);
      return true;
    } else {
      // Check for a specific pattern that may need manual fixing
      if (content.includes('{ params }: { params:')) {
        logInfo(`May need manual check: ${path.relative(rootDir, filePath)}`);
        return false;
      }
      logInfo(`No changes needed: ${path.relative(rootDir, filePath)}`);
      return false;
    }
  } catch (error) {
    logError(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Main function to find and process all API route files
 */
async function main() {
  try {
    console.log('\n🛠️  Fixing Next.js 15 route parameter types...\n');

    // Find all API route files
    const routeFiles = await globby([
      path.join(rootDir, 'app/api/**/*.ts'),
      path.join(rootDir, 'app/api/**/*.tsx'),
      // Exclude non-route files
      '!**/*.test.ts',
      '!**/*.spec.ts',
      '!**/*.d.ts',
      '!**/node_modules/**',
    ]);

    logInfo(`Found ${routeFiles.length} API route files to check`);

    // Process each file
    const results = await Promise.all(routeFiles.map(processFile));
    const updatedCount = results.filter(Boolean).length;

    console.log('\n🎉 Done!');
    console.log(`Updated ${updatedCount} of ${routeFiles.length} API route files`);
    console.log(
      `${routeFiles.length - updatedCount} files were already compatible or need manual review\n`
    );

    // Suggest next steps
    if (updatedCount > 0) {
      console.log('Next steps:');
      console.log('1. Review the changes made to ensure they are correct');
      console.log('2. Run your build again to check for any remaining type errors');
      console.log(
        '3. For any files marked "May need manual check", review the route handler function signature\n'
      );
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
