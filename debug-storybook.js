#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check all necessary dependencies
const requiredDeps = ['file-loader', 'url-loader', '@storybook/nextjs'];
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

console.log('===== Storybook Troubleshooting =====');
console.log('\nChecking dependencies:');

const missing = [];
for (const dep of requiredDeps) {
  const isDev = packageJson.devDependencies?.[dep];
  const isProd = packageJson.dependencies?.[dep];

  if (!isDev && !isProd) {
    missing.push(dep);
    console.log(`❌ Missing: ${dep}`);
  } else {
    console.log(`✅ Found: ${dep} (${isDev ? 'devDependencies' : 'dependencies'})`);
  }
}

// Check .storybook directory structure
console.log('\nChecking .storybook directory:');
const storybookDir = path.join(__dirname, '.storybook');

if (fs.existsSync(storybookDir)) {
  console.log(`✅ .storybook directory exists`);

  // List key files
  const mainFile = path.join(storybookDir, 'main.ts');
  const previewFile = path.join(storybookDir, 'preview.tsx');

  console.log(`${fs.existsSync(mainFile) ? '✅' : '❌'} main.ts`);
  console.log(`${fs.existsSync(previewFile) ? '✅' : '❌'} preview.tsx`);

  // Check pages directory
  const pagesDir = path.join(storybookDir, 'pages');
  if (fs.existsSync(pagesDir)) {
    console.log(`✅ pages directory exists with ${fs.readdirSync(pagesDir).length} files`);
  } else {
    console.log(`❌ pages directory is missing`);
  }
} else {
  console.log(`❌ .storybook directory is missing!`);
}

// Check node version and ESM compatibility
console.log('\nChecking Node.js environment:');
console.log(`Node version: ${process.version}`);
console.log(`ES Modules: ${packageJson.type === 'module' ? 'Enabled (type: module)' : 'Disabled'}`);

// Verify webpack configuration if available
const webpackConfig = path.join(storybookDir, 'main.ts');
if (fs.existsSync(webpackConfig)) {
  const content = fs.readFileSync(webpackConfig, 'utf8');

  console.log('\nChecking webpack configuration:');
  console.log(`file-loader mentioned: ${content.includes('file-loader') ? 'Yes' : 'No'}`);
  console.log(`url-loader mentioned: ${content.includes('url-loader') ? 'Yes' : 'No'}`);
  console.log(`__dirname handling: ${content.includes('__dirname') ? 'Found' : 'Not found'}`);
}

// Provide recommendations
console.log('\n===== Recommendations =====');

if (missing.length > 0) {
  console.log(`- Install missing dependencies: pnpm add -D ${missing.join(' ')}`);
}

console.log(
  `- Try running with explicit Node options: NODE_OPTIONS=--experimental-vm-modules pnpm storybook`
);
console.log(`- Check if your MDX files are using correct import syntax for ESM`);
console.log(
  `- Ensure webpack configuration in .storybook/main.ts has correct loaders for images and assets`
);

// Check if there are stale caches
console.log('\nTry clearing storybook cache:');
console.log('pnpm storybook:clean');

console.log('\n===== End of Troubleshooting =====');
