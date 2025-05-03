#!/usr/bin/env node

/**
 * Script to fix UI component import issues
 * 
 * This script identifies and fixes common component import issues:
 * 1. Missing buttonVariants export
 * 2. DialogClose import issues
 * 3. MapRef import issues
 * 4. Other component import problems
 */

const fs = require('fs').promises;
const fsSync = require('fs'); // Add standard fs for existsSync and accessSync
const path = require('path');
const glob = require('glob');

const ROOT_DIR = path.resolve(__dirname, '..');

async function fixButtonVariantsImport(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;

    // Check for buttonVariants import
    if (content.includes("import { buttonVariants }") && content.includes("from '@/components/ui/button'")) {
      console.log(`Found buttonVariants import in ${filePath}`);
      
      // Update to use proper import
      content = content.replace(
        /import\s+\{\s*([^}]*?)\s*buttonVariants\s*([^}]*?)\s*\}\s+from\s+['"]@\/components\/ui\/button['"]/g,
        (match, before, after) => {
          // If there are other imports, keep them
          const otherImports = `${before}${after}`.replace(/,\s*,/g, ',').trim();
          
          if (otherImports) {
            return `import { ${otherImports} } from '@/components/ui/button';\nimport { buttonVariants } from '@/components/ui/button/utils';`;
          } else {
            return `import { buttonVariants } from '@/components/ui/button/utils';`;
          }
        }
      );
      
      modified = true;
    }

    if (modified) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ Fixed buttonVariants import in ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error fixing buttonVariants in ${filePath}:`, error);
    return false;
  }
}

async function fixDialogCloseImport(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;

    // Check for DialogClose import
    if (content.includes("DialogClose") && content.includes("from '@/components/ui/dialog'")) {
      console.log(`Found DialogClose reference in ${filePath}`);
      
      // Check if DialogClose is properly imported
      if (content.match(/import\s+\{[^}]*DialogClose[^}]*\}\s+from\s+['"]@\/components\/ui\/dialog['"]/)) {
        console.log(`DialogClose already properly imported in ${filePath}`);
        return false;
      }
      
      // Update to add DialogClose to existing import or add new import
      if (content.match(/import\s+\{[^}]*\}\s+from\s+['"]@\/components\/ui\/dialog['"]/)) {
        // Add DialogClose to existing dialog import
        content = content.replace(
          /import\s+\{([^}]*)\}\s+from\s+['"]@\/components\/ui\/dialog['"]/,
          'import { $1, DialogClose } from \'@/components/ui/dialog\''
        );
      } else {
        // Add new import for DialogClose
        content = content.replace(
          /(import\s+[^;]+;)(\s+)/m,
          '$1\nimport { DialogClose } from \'@/components/ui/dialog\';$2'
        );
      }
      
      modified = true;
    }

    if (modified) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ Fixed DialogClose import in ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error fixing DialogClose in ${filePath}:`, error);
    return false;
  }
}

async function fixMapRefImport(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;

    // Check for MapRef import
    if (content.includes("MapRef") && content.includes("from 'react-map-gl'")) {
      console.log(`Found MapRef reference in ${filePath}`);
      
      // Fix MapRef import by using the correct syntax
      content = content.replace(
        /import\s+\{([^}]*?)MapRef([^}]*?)\}\s+from\s+['"]react-map-gl['"]/g,
        (match, before, after) => {
          // Remove MapRef from the destructured import
          const otherImports = `${before}${after}`.replace(/,\s*,/g, ',').trim();
          
          if (otherImports) {
            return `import { ${otherImports} } from 'react-map-gl';\nimport type { MapRef } from 'react-map-gl';`;
          } else {
            return `import type { MapRef } from 'react-map-gl';`;
          }
        }
      );
      
      modified = true;
    }

    if (modified) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ Fixed MapRef import in ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error fixing MapRef in ${filePath}:`, error);
    return false;
  }
}

async function fixImageComponentAlt(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;

    // Replace alt prop on SVG Image components
    if (content.includes("<Image") && content.includes("alt=")) {
      // Check for SVG imports (LucideIcons)
      const hasSvgImports = /import\s+\{[^}]*\}\s+from\s+['"]lucide-react['"]/g.test(content);
      
      if (hasSvgImports) {
        console.log(`Found potential SVG Image with alt prop in ${filePath}`);
        
        // Replace alt props on SVG Images
        content = content.replace(
          /(<Image[^>]*?\s+)(alt=['"][^'"]*?['"])([^>]*?>)/g,
          (match, before, alt, after) => {
            // Check if this is a SVG component by checking for className with h- or w-
            if (match.includes('className="') && 
                (match.includes('h-') || match.includes('w-'))) {
              return `${before}aria-hidden="true"${after}`;
            }
            return match;
          }
        );
        
        modified = true;
      }
    }

    if (modified) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ Fixed Image alt props in ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error fixing Image alt props in ${filePath}:`, error);
    return false;
  }
}

async function fixSelectItemProps(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;

    // Fix SelectItemProps reference
    if (content.includes("SelectItemProps") && content.includes("from '@/components/ui/select'")) {
      console.log(`Found SelectItemProps reference in ${filePath}`);
      
      // Replace SelectItemProps with SelectProps
      content = content.replace(
        /type\s+SelectItemProps/g,
        'type SelectProps'
      );
      
      content = content.replace(
        /import\s+\{\s*([^}]*?)SelectItemProps([^}]*?)\s*\}\s+from\s+['"]@\/components\/ui\/select['"]/g,
        'import { $1SelectProps$2 } from \'@/components/ui/select\''
      );
      
      modified = true;
    }

    if (modified) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ Fixed SelectItemProps in ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error fixing SelectItemProps in ${filePath}:`, error);
    return false;
  }
}

async function findAndFixComponentImports() {
  // Find all TSX/TS files
  const tsxFiles = glob.sync('**/*.{ts,tsx}', {
    cwd: ROOT_DIR,
    ignore: ['**/node_modules/**', '**/build/**', '**/dist/**', '**/.next/**'],
  });
  
  let fixedButtonVariants = 0;
  let fixedDialogClose = 0;
  let fixedMapRef = 0;
  let fixedImageAlt = 0;
  let fixedSelectProps = 0;

  // Process known problematic files first
  const knownIssueFiles = [
    'components/ui/alert-dialog.tsx',
    'components/ui/calendar.tsx',
    'components/ui/pagination.tsx',
    'components/images/image-search-selector.tsx',
    'components/maps/MultimodalMapView.tsx',
    'components/use-template-button.tsx',
    'app/trips/create/components/CreateTripForm.tsx'
  ];

  // Process known issue files first
  for (const file of knownIssueFiles) {
    const filePath = path.join(ROOT_DIR, file);
    
    // Check if file exists using synchronous method
    if (fsSync.existsSync(filePath)) {
      if (file.includes('alert-dialog.tsx') || file.includes('calendar.tsx') || file.includes('pagination.tsx')) {
        if (await fixButtonVariantsImport(filePath)) fixedButtonVariants++;
      }
      
      if (file.includes('image-search-selector.tsx')) {
        if (await fixDialogCloseImport(filePath)) fixedDialogClose++;
      }
      
      if (file.includes('MultimodalMapView.tsx')) {
        if (await fixMapRefImport(filePath)) fixedMapRef++;
      }
      
      if (file.includes('CreateTripForm.tsx')) {
        if (await fixImageComponentAlt(filePath)) fixedImageAlt++;
      }
      
      if (file.includes('use-template-button.tsx')) {
        if (await fixSelectItemProps(filePath)) fixedSelectProps++;
      }
    }
  }

  // Process all other files
  for (const file of tsxFiles) {
    if (!knownIssueFiles.includes(file)) {
      const filePath = path.join(ROOT_DIR, file);
      
      // Run all fixers
      if (await fixButtonVariantsImport(filePath)) fixedButtonVariants++;
      if (await fixDialogCloseImport(filePath)) fixedDialogClose++;
      if (await fixMapRefImport(filePath)) fixedMapRef++;
      if (await fixImageComponentAlt(filePath)) fixedImageAlt++;
      if (await fixSelectItemProps(filePath)) fixedSelectProps++;
    }
  }

  console.log('\nFix Summary:');
  console.log(`- Fixed buttonVariants imports in ${fixedButtonVariants} files`);
  console.log(`- Fixed DialogClose imports in ${fixedDialogClose} files`);
  console.log(`- Fixed MapRef imports in ${fixedMapRef} files`);
  console.log(`- Fixed Image alt props in ${fixedImageAlt} files`);
  console.log(`- Fixed SelectItemProps in ${fixedSelectProps} files`);
}

// Run the script
findAndFixComponentImports().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
}); 