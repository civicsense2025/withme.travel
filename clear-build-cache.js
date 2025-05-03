import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUILD_DIR = path.join(__dirname, 'build');
const NEXT_CACHE_DIR = path.join(__dirname, '.next');
const NODE_MODULES_DIR = path.join(__dirname, 'node_modules');
const NODE_MODULES_CACHE = path.join(NODE_MODULES_DIR, '.cache');

console.log('Clearing build caches...');

// Clear build directory
if (fs.existsSync(BUILD_DIR)) {
  console.log('Removing build/ directory...');
  try {
    fs.rmSync(BUILD_DIR, { recursive: true, force: true });
    console.log('✅ Successfully removed build/ directory');
  } catch (error) {
    console.error('❌ Failed to remove build/ directory:', error);
  }
}

// Clear Next.js cache
if (fs.existsSync(NEXT_CACHE_DIR)) {
  console.log('Removing .next/ directory...');
  try {
    fs.rmSync(NEXT_CACHE_DIR, { recursive: true, force: true });
    console.log('✅ Successfully removed .next/ directory');
  } catch (error) {
    console.error('❌ Failed to remove .next/ directory:', error);
  }
}

// Clear node_modules/.cache
if (fs.existsSync(NODE_MODULES_CACHE)) {
  console.log('Removing node_modules/.cache/ directory...');
  try {
    fs.rmSync(NODE_MODULES_CACHE, { recursive: true, force: true });
    console.log('✅ Successfully removed node_modules/.cache/ directory');
  } catch (error) {
    console.error('❌ Failed to remove node_modules/.cache/ directory:', error);
  }
}

// Run Next.js cache clean
console.log('Running next clean...');
try {
  execSync('npx next clean', { stdio: 'inherit' });
  console.log('✅ Successfully ran next clean');
} catch (error) {
  console.error('❌ Failed to run next clean:', error);
}

console.log('Build cache clearing completed.');
