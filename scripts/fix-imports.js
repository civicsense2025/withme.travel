import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current file directory with ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all TypeScript files in the app directory
const getAllFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (
      (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) &&
      !filePath.includes('node_modules') &&
      !filePath.includes('.next')
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
};

// Fix imports in a file
const fixImports = (filePath) => {
  try {
    console.log(`Processing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix database constants imports
    if (
      content.includes('DB_TABLES') ||
      content.includes('DB_FIELDS') ||
      content.includes('DB_ENUMS')
    ) {
      // Import for legacy constants
      const legacyImport =
        /import\s+\{\s*(DB_TABLES|DB_FIELDS|DB_ENUMS)(?:,\s*(DB_TABLES|DB_FIELDS|DB_ENUMS))?(?:,\s*(DB_TABLES|DB_FIELDS|DB_ENUMS))?\s*\}\s*from\s*['"]@\/utils\/constants\/database['"];?/g;

      // Replace with modern imports
      content = content.replace(legacyImport, (match) => {
        let newImport = 'import { ';

        if (match.includes('DB_TABLES')) newImport += 'TABLES, ';
        if (match.includes('DB_FIELDS')) newImport += 'FIELDS, ';
        if (match.includes('DB_ENUMS')) newImport += 'ENUMS, ';

        // Remove trailing comma if present
        newImport = newImport.replace(/, $/, '');

        newImport += ' } from "@/utils/constants/database";';
        return newImport;
      });

      // Replace usage in the code
      content = content
        .replace(/DB_TABLES/g, 'TABLES')
        .replace(/DB_FIELDS/g, 'FIELDS')
        .replace(/DB_ENUMS/g, 'ENUMS');

      modified = true;
    }

    // Fix Supabase server client imports
    if (content.includes('createSupabaseServerClient') || content.includes('createApiClient')) {
      content = content
        .replace(
          /import\s+\{\s*createSupabaseServerClient\s*\}\s*from\s*['"]@\/utils\/supabase\/server['"];?/g,
          'import { createServerSupabaseClient } from "@/utils/supabase/server";'
        )
        .replace(
          /import\s+\{\s*createApiClient\s*\}\s*from\s*['"]@\/utils\/supabase\/server['"];?/g,
          'import { createServerSupabaseClient } from "@/utils/supabase/server";'
        )
        .replace(
          /import\s+\{\s*createRouteHandlerClient\s*\}\s*from\s*['"]@\/utils\/supabase\/server['"];?/g,
          'import { createServerSupabaseClient } from "@/utils/supabase/server";'
        )
        .replace(/createSupabaseServerClient\(/g, 'createServerSupabaseClient(')
        .replace(/createApiClient\(/g, 'createServerSupabaseClient(')
        .replace(/createRouteHandlerClient\(/g, 'createServerSupabaseClient(');

      modified = true;
    }

    // Fix TRIP_ROLES import and references
    if (content.includes('TRIP_ROLES') && !content.includes('import { TRIP_ROLES }')) {
      // Add import if needed
      if (!content.includes('import { ENUMS }')) {
        if (content.includes('from "@/utils/constants/database"')) {
          content = content.replace(
            /import\s+\{([^}]*)\}\s*from\s*["']@\/utils\/constants\/database["'];?/g,
            (match, imports) => `import { ${imports}, ENUMS } from "@/utils/constants/database";`
          );
        } else {
          // Add new import line
          content = `import { ENUMS } from "@/utils/constants/database";\n${content}`;
        }
      }

      // Replace direct TRIP_ROLES references with ENUMS.TRIP_ROLES
      content = content.replace(/TRIP_ROLES\.([A-Z_]+)/g, 'ENUMS.TRIP_ROLES.$1');

      modified = true;
    }

    // Fix empty params object access on route handlers
    // This pattern is causing the most errors in Next.js 15
    if (
      filePath.includes('/api/') &&
      filePath.includes('/route.ts') &&
      content.includes('params.')
    ) {
      content = content.replace(/const\s+\{([^}]+)\}\s*=\s*params;/g, 'const {$1} = await params;');
      content = content.replace(/params\.([a-zA-Z0-9_]+)/g, '(await params).$1');
      modified = true;
    }

    // Fix searchParams possibly null errors
    if (content.includes('searchParams.')) {
      content = content.replace(/searchParams\.get\(/g, 'searchParams?.get(');
      content = content.replace(/searchParams\.forEach\(/g, 'searchParams?.forEach(');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed imports in ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
};

// Main script
console.log('Starting import fix script...');
const appDir = path.join(__dirname, '..', 'app');
const utilsDir = path.join(__dirname, '..', 'utils');
const componentsDir = path.join(__dirname, '..', 'components');

const files = [...getAllFiles(appDir), ...getAllFiles(utilsDir), ...getAllFiles(componentsDir)];

let fixedCount = 0;
files.forEach((file) => {
  if (fixImports(file)) {
    fixedCount++;
  }
});

console.log(`\nFixed imports in ${fixedCount} files out of ${files.length} total files.`);
console.log('Next step: Run TypeScript check with: npx tsc --noEmit');
console.log('If errors persist, address them manually or enhance this script.');
