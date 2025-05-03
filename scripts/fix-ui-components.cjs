#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

/**
 * Script to fix common UI component prop issues across the codebase
 * 
 * This script fixes:
 * 1. SelectValue placeholder props
 * 2. DialogTrigger asChild props
 * 3. Other common UI prop issues
 */

const ROOT_DIR = path.resolve(__dirname, '..');

async function fixSelectValuePlaceholder(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    
    // Match <SelectValue placeholder="..."> pattern
    const placeholderRegex = /<SelectValue\s+placeholder="([^"]+)"\s*\/>/g;
    if (placeholderRegex.test(content)) {
      console.log(`Fixing SelectValue placeholder in ${filePath}`);
      
      // Replace with <SelectValue>Text</SelectValue>
      content = content.replace(placeholderRegex, '<SelectValue>$1</SelectValue>');
      
      await fs.writeFile(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing SelectValue in ${filePath}:`, error);
    return false;
  }
}

async function fixDialogTriggerAsChild(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    
    // Match <DialogTrigger asChild> pattern
    const asChildRegex = /<DialogTrigger\s+asChild>/g;
    if (asChildRegex.test(content)) {
      console.log(`Fixing DialogTrigger asChild in ${filePath}`);
      
      // Replace with <DialogTrigger>
      content = content.replace(asChildRegex, '<DialogTrigger>');
      
      await fs.writeFile(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing DialogTrigger in ${filePath}:`, error);
    return false;
  }
}

async function findAndFixFiles() {
  // Get all TypeScript/TSX files in the project
  const tsxFiles = glob.sync('**/*.{ts,tsx}', {
    cwd: ROOT_DIR,
    ignore: ['**/node_modules/**', '**/build/**', '**/dist/**', '**/.next/**'],
  });
  
  let fixedSelectValue = 0;
  let fixedDialogTrigger = 0;
  
  for (const file of tsxFiles) {
    const filePath = path.join(ROOT_DIR, file);
    
    // Fix SelectValue placeholder
    const fixedSelect = await fixSelectValuePlaceholder(filePath);
    if (fixedSelect) fixedSelectValue++;
    
    // Fix DialogTrigger asChild
    const fixedDialog = await fixDialogTriggerAsChild(filePath);
    if (fixedDialog) fixedDialogTrigger++;
  }
  
  console.log(`\nFixed ${fixedSelectValue} files with SelectValue placeholder issues`);
  console.log(`Fixed ${fixedDialogTrigger} files with DialogTrigger asChild issues`);
}

// Run the script
findAndFixFiles().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
}); 