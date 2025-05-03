// build-debug.js - Run this before or during build to debug issues
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Log environment info
console.log('====== BUILD DEBUG INFO ======');
console.log(`Node version: ${process.version}`);
console.log(`Working directory: ${process.cwd()}`);
console.log(`Environment: ${process.env.NODE_ENV || 'not set'}`);

// Check for critical files
const criticalFiles = [
  'package.json',
  'pnpm-lock.yaml',
  '.npmrc',
  'vercel.json',
  'next.config.mjs',
  'tsconfig.json'
];

console.log('\n====== CRITICAL FILES ======');
criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
});

// Log dependency resolution info
console.log('\n====== DEPENDENCY INFO ======');
try {
  const pnpmOutput = execSync('pnpm list --depth=0').toString();
  console.log('PNPM Dependencies:');
  console.log(pnpmOutput);
} catch (error) {
  console.error('Error checking dependencies:', error.message);
}

// Check for common build issues
console.log('\n====== CHECKING FOR COMMON ISSUES ======');

// Check for Node.js compatibility
console.log('Checking Node.js version compatibility...');
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
if (packageJson.engines && packageJson.engines.node) {
  console.log(`Required Node.js version: ${packageJson.engines.node}`);
} else {
  console.log('No Node.js version requirement specified in package.json');
}

// Exit with success
console.log('\n====== BUILD DEBUG COMPLETE ======');
console.log('If you see this message, the debug script ran successfully.'); 