#!/usr/bin/env node

/**
 * Script to fix shadcn/ui Dialog component usage
 * 
 * This script identifies and modifies DialogTrigger components with asChild prop,
 * replacing them with proper usage patterns in the codebase.
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT_DIR = path.resolve(__dirname, '..');

// Regular expression to match DialogTrigger with asChild
const dialogTriggerRegex = /<DialogTrigger\s+([\s\S]*?)asChild([\s\S]*?)>/g;
const dialogTriggerWithContentRegex = /<DialogTrigger\s+([\s\S]*?)asChild([\s\S]*?)>\s*([\s\S]*?)<\/DialogTrigger>/g;
const dialogImportRegex = /import\s+\{([^}]*DialogTrigger[^}]*)\}\s+from\s+['"]@\/components\/ui\/dialog['"]/;

async function fixDialogInFile(filePath) {
  try {
    console.log(`Checking file: ${filePath}`);
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;

    // Check if file has DialogTrigger with asChild
    const hasDialogTrigger = dialogTriggerRegex.test(content);
    console.log(`  Has DialogTrigger with asChild: ${hasDialogTrigger}`);
    
    if (hasDialogTrigger) {
      console.log(`Found DialogTrigger with asChild in ${filePath}`);
      
      // Reset regex state
      dialogTriggerRegex.lastIndex = 0;
      
      // Replace DialogTrigger with asChild
      content = content.replace(/<DialogTrigger\s+([\s\S]*?)asChild([\s\S]*?)>/g, '<div className="inline-block">');
      content = content.replace(/<\/DialogTrigger>/g, '</div>');
      
      modified = true;
    }

    // Update Dialog imports if needed
    if (modified && dialogImportRegex.test(content)) {
      // Ensure DialogTrigger is still imported even though we're changing its usage
      console.log(`  Found Dialog imports, updating`);
      if (!content.includes('DialogTrigger') && content.includes('Dialog,')) {
        content = content.replace(
          /(import\s+\{[^}]*)(Dialog)([^}]*\}\s+from\s+['"]@\/components\/ui\/dialog['"])/,
          '$1$2, DialogTrigger$3'
        );
      }
    }

    if (modified) {
      // Write back the modified content
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ Fixed Dialog component in ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

async function findAndFixDialogComponents() {
  // Find all TSX files in the project
  const tsxFiles = glob.sync('**/*.tsx', {
    cwd: ROOT_DIR,
    ignore: ['**/node_modules/**', '**/build/**', '**/dist/**', '**/.next/**'],
  });

  let fixedFiles = 0;
  const knownIssueFiles = [
    'app/trips/[tripId]/manage/page.tsx',
    'app/trips/create/components/CreateTripForm.tsx',
    'components/use-template-button.tsx',
    'components/trip-management.tsx',
    'components/request-access-dialog.tsx',
    'components/export-calendar-dialog.tsx',
  ];

  console.log(`Found ${knownIssueFiles.length} known issue files and ${tsxFiles.length} total TSX files`);

  // Process known issue files first
  for (const file of knownIssueFiles) {
    const filePath = path.join(ROOT_DIR, file);
    console.log(`Checking known issue file: ${file}`);
    if (fsSync.existsSync(filePath)) {
      console.log(` File exists: ${filePath}`);
      // Print sample content for debugging
      const content = await fs.readFile(filePath, 'utf8');
      const contentPreview = content.substring(0, 200) + '...';
      console.log(` Content preview: ${contentPreview}`);
      
      const fixed = await fixDialogInFile(filePath);
      if (fixed) fixedFiles++;
    } else {
      console.log(` File doesn't exist: ${filePath}`);
    }
  }

  // Then process all other files
  for (const file of tsxFiles) {
    if (!knownIssueFiles.includes(file)) {
      const filePath = path.join(ROOT_DIR, file);
      const fixed = await fixDialogInFile(filePath);
      if (fixed) fixedFiles++;
    }
  }

  console.log(`\nFixed Dialog component issues in ${fixedFiles} files`);
}

// Run the script
findAndFixDialogComponents().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
}); 