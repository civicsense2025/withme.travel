#!/usr/bin/env node

/**
 * Script to fix Form component issues across the codebase
 * 
 * This script identifies and fixes Form components that are missing the form prop:
 * <Form {...form}> where form is destructured but not passed to Form component
 */

const fs = require('fs').promises;
const fsSync = require('fs'); // Add standard fs for existsSync
const path = require('path');
const glob = require('glob');

const ROOT_DIR = path.resolve(__dirname, '..');

// Regular expression to match Form component usage
const formUsageRegex = /<Form\s+\{\.\.\.(form|methods)\}\s*>/g;

// Regular expression to match form destructuring (from react-hook-form)
const formDestructureRegex = /const\s+\{([^}]+)\}\s*=\s*(?:useForm|form)\(/;

// Regular expression to match the entire component code
const componentRegex = /export\s+(?:default\s+)?(?:function|const)\s+(\w+)(?:\s*=\s*(?:\([^)]*\)|function\s*\([^)]*\)))?/;

async function fixFormInFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;
    let componentName = '';

    // Extract component name
    const componentMatch = content.match(componentRegex);
    if (componentMatch) {
      componentName = componentMatch[1];
    }

    // Try to find use of Form component without proper form prop
    if (formUsageRegex.test(content)) {
      console.log(`Found Form component usage in ${filePath}`);
      
      // Check for form destructuring
      const formDestructureMatch = content.match(formDestructureRegex);
      
      if (formDestructureMatch) {
        // Form is being destructured but not passed correctly
        console.log(`Form is destructured in ${filePath}`);
        
        // Replace <Form {...form}> with <Form form={form} {...form}>
        content = content.replace(formUsageRegex, (match) => {
          if (match.includes('{...form}')) {
            return '<Form form={form} {...form}>';
          } else if (match.includes('{...methods}')) {
            return '<Form form={methods} {...methods}>';
          }
          return match;
        });
        
        modified = true;
      } else {
        // If no form destructuring found, try to find the form in component props
        console.log(`No form destructuring found in ${filePath}, might be passed as prop`);
      }
    }

    if (modified) {
      // Write back the modified content
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ Fixed Form component in ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

async function findAndFixFormComponents() {
  // Find all TSX files in the project
  const tsxFiles = glob.sync('**/*.tsx', {
    cwd: ROOT_DIR,
    ignore: ['**/node_modules/**', '**/build/**', '**/dist/**', '**/.next/**'],
  });

  let fixedFiles = 0;
  const knownIssueFiles = [
    'components/itinerary/itinerary-item-form.tsx',
    'components/trip-overview-tab.tsx',
    'components/trips/CreatePollForm.tsx',
  ];

  // Process known issue files first
  for (const file of knownIssueFiles) {
    const filePath = path.join(ROOT_DIR, file);
    if (fsSync.existsSync(filePath)) {
      const fixed = await fixFormInFile(filePath);
      if (fixed) fixedFiles++;
    }
  }

  // Then process all other files
  for (const file of tsxFiles) {
    if (!knownIssueFiles.includes(file)) {
      const filePath = path.join(ROOT_DIR, file);
      const fixed = await fixFormInFile(filePath);
      if (fixed) fixedFiles++;
    }
  }

  console.log(`\nFixed Form component issues in ${fixedFiles} files`);
}

// Run the script
findAndFixFormComponents().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
}); 