#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_ROUTES_DIR = './app/api';
const BACKUP_DIR = './api-routes-backup';

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Function to make a backup of a file
function backupFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);

  // Create directory structure in backup
  const backupDir = path.dirname(backupPath);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  fs.copyFileSync(filePath, backupPath);
  console.log(`Backed up ${filePath} to ${backupPath}`);
}

// Function to update authentication patterns in a file
function updateAuthPattern(content) {
  // Match authentication patterns that need to be updated
  const authPattern =
    /const\s+{\s*data\s*(?::\s*{\s*(?:user|session)\s*})?\s*}\s*=\s*await\s+supabase\.auth\.get(?:User|Session)\(\)/g;

  // Update to include better error handling
  return content.replace(authPattern, (match) => {
    if (match.includes('getUser')) {
      return `const { data, error } = await supabase.auth.getUser()
    if (error) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
    const { user } = data`;
    } else {
      return `const { data, error } = await supabase.auth.getSession()
    if (error) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
    const { session } = data`;
    }
  });
}

// Function to update headers and cookies calls
function updateHeadersAndCookies(content) {
  // Update headers() to await headers()
  content = content.replace(/headers\(\)/g, 'await headers()');

  // Update cookies() to await cookies()
  content = content.replace(/cookies\(\)/g, 'await cookies()');

  return content;
}

// Function to update route params pattern
function updateRouteParams(content) {
  // Find route handler parameters that should be awaited
  const paramsPattern = /{\s*params\s*}:\s*{\s*params:\s*{\s*[a-zA-Z]+:\s*string\s*}\s*}/g;

  return content.replace(paramsPattern, (match) => {
    return match.replace('{', 'await {');
  });
}

// Function to ensure NextResponse is imported
function ensureNextResponseImport(content) {
  if (!content.includes('NextResponse')) {
    // Add NextResponse import if it doesn't exist
    if (content.includes('import { ')) {
      // Add to existing import from next/server if it exists
      content = content.replace(
        /import\s+{\s*([^}]+)\s*}\s+from\s+['"]next\/server['"]/,
        'import { $1, NextResponse } from "next/server"'
      );
    } else if (content.includes('import')) {
      // Add new import after the last import statement
      const lastImportIndex = content.lastIndexOf('import');
      const lastImportEndIndex = content.indexOf('\n', lastImportIndex);
      content =
        content.slice(0, lastImportEndIndex + 1) +
        'import { NextResponse } from "next/server";\n' +
        content.slice(lastImportEndIndex + 1);
    } else {
      // Add as the first line if no imports exist
      content = 'import { NextResponse } from "next/server";\n' + content;
    }
  }
  return content;
}

// Function to find all route.ts files in the API directory
function findRouteFiles(directory) {
  const routeFiles = [];

  function traverseDirectory(currentPath) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        traverseDirectory(filePath);
      } else if (file === 'route.ts' || file === 'route.js' || file === 'route.tsx') {
        routeFiles.push(filePath);
      }
    }
  }

  traverseDirectory(directory);
  return routeFiles;
}

// Main function to process files
async function processFiles() {
  console.log('Starting to update API routes for Next.js 15+ compatibility...');

  // Find all route files in the API directory
  const routeFiles = findRouteFiles(API_ROUTES_DIR);

  console.log(`Found ${routeFiles.length} API route files to update.`);

  // Process each file
  for (const filePath of routeFiles) {
    try {
      console.log(`Processing: ${filePath}`);

      // Backup the file
      backupFile(filePath);

      // Read file content
      let content = fs.readFileSync(filePath, 'utf8');

      // Apply updates
      content = updateAuthPattern(content);
      content = updateHeadersAndCookies(content);
      content = updateRouteParams(content);
      content = ensureNextResponseImport(content);

      // Write updated content back to file
      fs.writeFileSync(filePath, content);

      console.log(`Updated: ${filePath}`);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }

  console.log(
    '\nAPI route updates completed. Please review the changes and test your application.'
  );
  console.log(`Original files were backed up to ${BACKUP_DIR}`);
}

// Execute the script
processFiles().catch((error) => {
  console.error('Error updating API routes:', error);
  process.exit(1);
});
