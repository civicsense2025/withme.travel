#!/usr/bin/env node

/**
 * Development Configuration Restore Script
 *
 * This script restores the original configuration files after using optimize-dev.js.
 * It will restore:
 * 1. tsconfig.json
 * 2. next.config.mjs
 * 3. .env.development.local
 * 4. package.json
 *
 * Usage:
 *   node scripts/restore-dev.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function warning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

function heading(message) {
  log(`\n${colors.cyan}${message}${colors.reset}`);
  log(`${colors.cyan}${'='.repeat(message.length)}${colors.reset}\n`);
}

// Helper to restore a file from its backup
function restoreFromBackup(filePath, backupPath) {
  if (fs.existsSync(backupPath)) {
    try {
      fs.copyFileSync(backupPath, filePath);
      fs.unlinkSync(backupPath);
      success(`Restored ${path.basename(filePath)} from backup`);
      return true;
    } catch (err) {
      warning(`Error restoring ${path.basename(filePath)}: ${err.message}`);
      return false;
    }
  } else {
    warning(`No backup found for ${path.basename(filePath)}`);
    return false;
  }
}

// Restore TypeScript configuration
function restoreTsConfig() {
  heading('Restoring TypeScript Configuration');

  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  const backupPath = path.join(process.cwd(), 'tsconfig.json.bak');

  restoreFromBackup(tsconfigPath, backupPath);
}

// Restore Next.js configuration
function restoreNextConfig() {
  heading('Restoring Next.js Configuration');

  const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
  const backupPath = path.join(process.cwd(), 'next.config.mjs.bak');

  restoreFromBackup(nextConfigPath, backupPath);
}

// Restore environment variables
function restoreEnvFile() {
  heading('Restoring Environment Variables');

  const envPath = path.join(process.cwd(), '.env.development.local');
  const backupPath = path.join(process.cwd(), '.env.development.local.bak');

  if (fs.existsSync(backupPath)) {
    restoreFromBackup(envPath, backupPath);
  } else if (fs.existsSync(envPath)) {
    // If there's no backup, but the optimized file exists, just remove it
    try {
      fs.unlinkSync(envPath);
      success('Removed optimized .env.development.local');
    } catch (err) {
      warning(`Error removing .env.development.local: ${err.message}`);
    }
  } else {
    warning('No environment file to restore');
  }
}

// Restore package.json
function restorePackageJson() {
  heading('Restoring Package.json');

  const packagePath = path.join(process.cwd(), 'package.json');
  const backupPath = path.join(process.cwd(), 'package.json.bak');

  if (fs.existsSync(backupPath)) {
    if (restoreFromBackup(packagePath, backupPath)) {
      success('Removed fast-dev script from package.json');
    }
  } else {
    // If no backup exists, try to remove just the fast-dev script
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      if (packageJson.scripts && packageJson.scripts['fast-dev']) {
        delete packageJson.scripts['fast-dev'];
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
        success('Removed fast-dev script from package.json');
      } else {
        warning('No fast-dev script found in package.json');
      }
    } catch (err) {
      warning(`Error updating package.json: ${err.message}`);
    }
  }
}

// Main function
function main() {
  heading('Restoring Original Development Configuration');
  log('This script will restore your original configuration files from backups.\n');

  // Run restoration functions
  restoreTsConfig();
  restoreNextConfig();
  restoreEnvFile();
  restorePackageJson();

  heading('Restoration Complete');
  log('Your development environment has been restored to its original state.');
  log('To run the standard development server:');
  log('   pnpm run dev', colors.cyan);
}

// Run the main function
main();
