#!/usr/bin/env node

/**
 * This script coordinates running all fixing scripts in the proper sequence
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory using ES module pattern
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Current directory
const ROOT_DIR = __dirname;

console.log('🚀 Starting comprehensive TypeScript error fix process...');

// Steps to run in sequence
const steps = [
  {
    name: 'Cleaning up XML-style closing tags',
    script: 'cleanup-xml-tags.js',
  },
  {
    name: 'Fixing template literals',
    script: 'fix-template-literals.js',
  },
  {
    name: 'Fixing destructuring issues',
    script: 'fix-destructuring.js',
  },
  {
    name: 'Fixing API route handler syntax',
    script: 'fix-api-routes.js',
  },
  {
    name: 'Fixing template and syntax issues',
    script: 'fix-template-and-syntax.js',
  },
  {
    name: 'Fixing critical files directly',
    script: 'fix-critical-files.js',
  },
  {
    name: 'Fixing email service template literals',
    script: 'fix-email-service.js',
  },
  {
    name: 'Fixing Unsplash service template literals',
    script: 'fix-unsplash-service.js',
  },
  {
    name: 'Fixing Pexels service template literals',
    script: 'fix-pexels-service.js',
  },
  {
    name: 'Fixing middleware.ts',
    script: 'fix-middleware.js',
  },
];

// Run each step
let success = true;
for (const step of steps) {
  try {
    console.log(`\n📌 ${step.name}...`);
    const scriptPath = path.join(ROOT_DIR, step.script);

    // Make sure the script is executable
    execSync(`chmod +x ${scriptPath}`, { stdio: 'inherit' });

    // Run the script
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n❌ Error during ${step.name}:`);
    console.error(error.message);
    success = false;
    // Continue with next steps even if this one failed
  }
}

if (success) {
  console.log('\n✅ All fix steps completed successfully!');
} else {
  console.log('\n⚠️ Some fix steps had errors. Check the output above for details.');
}

console.log('\nNext step: Run TypeScript compiler to check remaining errors:');
console.log('  npx tsc --noEmit');

console.log('\nYou may need to create additional fix scripts for remaining issues.');
console.log('Check the typescript-fixes-summary.md file for guidance on next steps.');
