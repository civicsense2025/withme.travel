#!/usr/bin/env node

/**
 * Script to fix route parameter type safety issues
 * 
 * This script identifies and adds proper null/undefined checks
 * to route parameters in API routes and page components.
 */

const fs = require('fs').promises;
const fsSync = require('fs'); // Add standard fs for synchronous operations
const path = require('path');
const glob = require('glob');

const ROOT_DIR = path.resolve(__dirname, '..');

// Regular expressions for finding unsafe parameter usage
const paramUsageRegex = /([A-Z_]+\.(?:[A-Z_]+|\w+)\s*\(\s*)((?:params\.)?[a-zA-Z0-9_]+)(\s*\))/g;
const routeParamRegex = /\{\s*params\s*:\s*\{\s*([a-zA-Z0-9_]+)\s*(?::\s*string)?(?:\s*\|\s*undefined)?\s*\}\s*\}/;
const exportAsyncFnRegex = /export\s+(?:default\s+)?async\s+function\s+(?:GET|POST|PUT|DELETE|PATCH)\s*\(\s*(?:request\s*(?::\s*[^,)]+)?\s*,\s*)?\{\s*params\s*(?::\s*[^}]+)?\s*\}\s*\)/;

// Regular expressions for finding parameter checks
const paramCheckRegex = /if\s*\(\s*!params(?:\.\w+)?\s*\)/;
const nullCoalescingRegex = new RegExp(`(${paramUsageRegex.source.replace(/\(\?:/g, '(?:').replace(/\((?!\?:)/g, '(?:')})\\s*\\|\\|\\s*["']?[^,);\\]\\}]+["']?`, 'g');

async function fixParameterSafetyInFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    let modified = content;
    let hasModifications = false;

    // Check if this is a route handler file
    const isRouteHandler = exportAsyncFnRegex.test(content);
    
    // Extract route parameter name
    let paramName = '';
    const routeParamMatch = content.match(routeParamRegex);
    if (routeParamMatch) {
      paramName = routeParamMatch[1];
    }

    // Determine if it's a dynamic route by file path
    const isDynamicRoute = filePath.includes('[') && filePath.includes(']');
    
    if (isDynamicRoute && paramName) {
      console.log(`Processing dynamic route file: ${filePath} with param: ${paramName}`);
      
      // Check if there are already param checks in the file
      const hasParamCheck = paramCheckRegex.test(content);
      const hasNullCoalescing = nullCoalescingRegex.test(content);
      
      if (!hasParamCheck && !hasNullCoalescing) {
        // Add parameter safety checks
        let paramCheckCode = '';
        
        if (isRouteHandler) {
          // Add check for route handler
          paramCheckCode = `
  // Ensure required parameter exists
  if (!params.${paramName}) {
    return Response.json({ error: 'Missing required parameter' }, { status: 400 });
  }
  const ${paramName} = params.${paramName};
`;
        } else {
          // Add check for page component
          paramCheckCode = `
  // Ensure required parameter exists
  if (!params.${paramName}) {
    return notFound();
  }
  const ${paramName} = params.${paramName};
`;
        }
        
        // Add the parameter check after the export function line
        modified = modified.replace(
          /export\s+(?:default\s+)?async\s+function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{/,
          match => `${match}${paramCheckCode}`
        );
        
        hasModifications = modified !== content;
      } else {
        console.log(`File ${filePath} already has parameter checks`);
      }
      
      // Replace unsafe parameter usages with null coalescing
      if (!hasNullCoalescing) {
        modified = modified.replace(paramUsageRegex, (match, prefix, param, suffix) => {
          // If the parameter is already using ||, don't modify it
          if (match.includes('||')) return match;
          
          // If it's not the main parameter, don't modify
          if (!param.includes(paramName) && !param.endsWith(paramName)) return match;
          
          return `${prefix}${param} || ''${suffix}`;
        });
        
        if (modified !== content) {
          hasModifications = true;
        }
      }
    }

    if (hasModifications) {
      // Write back the modified content
      await fs.writeFile(filePath, modified, 'utf8');
      console.log(`✅ Fixed parameter safety in ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

async function findAndFixApiParams() {
  // Find all route files in the project
  const routeFiles = glob.sync('app/**/route.{ts,tsx}', {
    cwd: ROOT_DIR,
    ignore: ['**/node_modules/**', '**/build/**', '**/dist/**', '**/.next/**'],
  });

  // Also find page.tsx files in dynamic routes
  const pageFiles = glob.sync('app/**/*/page.{ts,tsx}', {
    cwd: ROOT_DIR,
    ignore: ['**/node_modules/**', '**/build/**', '**/dist/**', '**/.next/**'],
  }).filter(file => file.includes('[') && file.includes(']'));

  let fixedFiles = 0;

  // Process route files
  for (const file of routeFiles) {
    const filePath = path.join(ROOT_DIR, file);
    if (fsSync.existsSync(filePath)) {
      const fixed = await fixParameterSafetyInFile(filePath);
      if (fixed) fixedFiles++;
    }
  }

  // Process page files
  for (const file of pageFiles) {
    const filePath = path.join(ROOT_DIR, file);
    if (fsSync.existsSync(filePath)) {
      const fixed = await fixParameterSafetyInFile(filePath);
      if (fixed) fixedFiles++;
    }
  }

  console.log(`\nFixed parameter safety issues in ${fixedFiles} files`);
}

// Run the script
findAndFixApiParams().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
}); 