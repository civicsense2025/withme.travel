#!/usr/bin/env node

/**
 * Script to fix common issues in API routes:
 * 1. Update Supabase client imports to use @supabase/ssr
 * 2. Fix route parameters handling with Promise<...>
 * 3. Update constants imports from database.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_ROUTES_DIR = path.join(path.resolve(__dirname, '..'), 'app', 'api');
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Logging utilities
const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  warn: (msg) => console.log(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  verbose: (msg) => VERBOSE && console.log(`[VERBOSE] ${msg}`),
};

// Helper to count occurrences in a file
function countOccurrences(text, pattern) {
  return (text.match(new RegExp(pattern, 'g')) || []).length;
}

// Fix imports in a file
function fixImports(content) {
  // Fix Supabase imports
  let newContent = content
    // Update direct imports from auth-helpers-nextjs to @supabase/ssr
    .replace(
      /import\s+\{\s*createRouteHandlerClient\s*(?:,\s*[\w{}:\s,]*)\s*\}\s*from\s+['"]@supabase\/auth-helpers-nextjs['"]/g,
      `import { createRouteHandlerClient } from '@supabase/ssr'`
    )
    .replace(
      /import\s+\{\s*createServerComponentClient\s*(?:,\s*[\w{}:\s,]*)\s*\}\s*from\s+['"]@supabase\/auth-helpers-nextjs['"]/g,
      `import { createServerComponentClient } from '@supabase/ssr'`
    )
    // Then redirect @supabase/ssr imports to our server utility
    .replace(
      /import\s+\{\s*createRouteHandlerClient\s*(?:,\s*[\w{}:\s,]*)\s*\}\s*from\s+['"]@supabase\/ssr['"]/g,
      `import { createRouteHandlerClient } from '@/utils/supabase/server'`
    )
    .replace(
      /import\s+\{\s*createServerComponentClient\s*(?:,\s*[\w{}:\s,]*)\s*\}\s*from\s+['"]@supabase\/ssr['"]/g,
      `import { createServerComponentClient } from '@/utils/supabase/server'`
    )
    // Replace unified.ts imports with server.ts imports
    .replace(
      /import\s+\{\s*getRouteHandlerClient\s*(?:,\s*[\w{}:\s,]*)\s*\}\s*from\s+['"]@\/utils\/supabase\/unified['"]/g,
      `import { createRouteHandlerClient } from '@/utils/supabase/server'`
    )
    .replace(
      /import\s+\{\s*getServerSession\s*(?:,\s*[\w{}:\s,]*)\s*\}\s*from\s+['"]@\/utils\/supabase\/unified['"]/g,
      `import { getServerSession } from '@/utils/supabase/server'`
    )
    // Add missing database constant imports - fix typos, missing imports
    .replace(
      /import\s+\{\s*(?:TABLES|DB_TABLES)(?:\s*,\s*[\w{}:\s,]*)*\s*\}\s*from\s+['"]@\/utils\/constants(?:\/database)?['"]/g,
      `import { TABLES, FIELDS, ENUMS } from '@/utils/constants/database'`
    )
    // Fix imports that only have FIELDS or ENUMS
    .replace(
      /import\s+\{\s*(?:FIELDS|DB_FIELDS)(?:\s*,\s*[\w{}:\s,]*)*\s*\}\s*from\s+['"]@\/utils\/constants(?:\/database)?['"]/g,
      `import { TABLES, FIELDS, ENUMS } from '@/utils/constants/database'`
    )
    .replace(
      /import\s+\{\s*(?:ENUMS|DB_ENUMS)(?:\s*,\s*[\w{}:\s,]*)*\s*\}\s*from\s+['"]@\/utils\/constants(?:\/database)?['"]/g,
      `import { TABLES, FIELDS, ENUMS } from '@/utils/constants/database'`
    );

  // Replace createClient with createRouteHandlerClient
  newContent = newContent.replace(
    /import\s+\{\s*createClient\s*\}\s*from\s+['"]@supabase\/supabase-js['"]/g,
    `import { createRouteHandlerClient } from '@/utils/supabase/server'`
  );

  // Replace getRouteHandlerClient function calls with createRouteHandlerClient
  newContent = newContent.replace(
    /(?:await\s+)?getRouteHandlerClient\s*\(\s*(?:request)?\s*\)/g,
    'await createRouteHandlerClient(request)'
  );

  // Replace direct createClient calls with createRouteHandlerClient
  newContent = newContent.replace(
    /const\s+supabase\s*=\s*createClient\s*\((.*?)\)/g,
    'const supabase = await createRouteHandlerClient(request)'
  );

  // Replace getServerSession() destructuring pattern
  newContent = newContent.replace(
    /const\s+\{\s*session\s*\}\s*=\s*(?:await\s+)?getServerSession\(\)/g,
    'const { data: { session } } = await getServerSession()'
  );

  // Add proper Promise<> type for route parameters
  newContent = newContent.replace(
    /\{\s*params\s*\}:\s*\{\s*params:\s*\{\s*([a-zA-Z0-9_]+):\s*string\s*\}\s*\}/g,
    '{ params }: { params: Promise<{ $1: string }> }'
  );

  return newContent;
}

// Process a single file
async function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = fixImports(content);

    if (content !== newContent) {
      const changes = {
        supabaseImports:
          countOccurrences(content, '@supabase\\/auth-helpers-nextjs') -
          countOccurrences(newContent, '@supabase\\/auth-helpers-nextjs'),
        unifiedImports:
          countOccurrences(content, '@\\/utils\\/supabase\\/unified') -
          countOccurrences(newContent, '@\\/utils\\/supabase\\/unified'),
        routeHandlerCalls:
          countOccurrences(content, 'getRouteHandlerClient') -
          countOccurrences(newContent, 'getRouteHandlerClient'),
        sessionCalls:
          countOccurrences(content, 'getServerSession') -
          countOccurrences(newContent, 'getServerSession'),
        paramTypes:
          countOccurrences(newContent, 'params: Promise<') -
          countOccurrences(content, 'params: Promise<'),
      };

      const totalChanges = Object.values(changes).reduce((sum, val) => sum + Math.abs(val), 0);

      log.verbose(`Changes for ${filePath}: ${JSON.stringify(changes)}`);

      if (totalChanges > 0) {
        if (!DRY_RUN) {
          fs.writeFileSync(filePath, newContent, 'utf8');
          log.success(`Fixed ${totalChanges} issues in ${filePath}`);
        } else {
          log.info(`Would fix ${totalChanges} issues in ${filePath} (dry run)`);
        }
        return { path: filePath, fixed: true, changes };
      } else {
        log.verbose(`No changes needed for ${filePath}`);
        return { path: filePath, fixed: false };
      }
    } else {
      log.verbose(`No changes needed for ${filePath}`);
      return { path: filePath, fixed: false };
    }
  } catch (error) {
    log.error(`Error processing ${filePath}: ${error.message}`);
    return { path: filePath, fixed: false, error: error.message };
  }
}

// Main function to run the script
async function main() {
  log.info(`Starting API routes fix script ${DRY_RUN ? '(DRY RUN)' : ''}`);

  // Find all API route files
  const files = await glob('**/*.ts', { cwd: API_ROUTES_DIR, absolute: true });

  log.info(`Found ${files.length} API route files`);

  // Process all files
  const results = await Promise.all(files.map(processFile));

  // Summarize results
  const fixedFiles = results.filter((r) => r.fixed);
  const errorFiles = results.filter((r) => r.error);

  log.info(`\n---- SUMMARY ----`);
  log.info(`Total files processed: ${files.length}`);
  log.success(`Files fixed: ${fixedFiles.length}`);
  log.warn(`Files with errors: ${errorFiles.length}`);

  if (errorFiles.length > 0) {
    log.warn(`\nFiles with errors:`);
    errorFiles.forEach((f) => log.warn(`- ${f.path}: ${f.error}`));
  }

  if (DRY_RUN) {
    log.info(`\nThis was a dry run. No actual changes were made.`);
    log.info(`Run without --dry-run to apply changes.`);
  }
}

// Run main function
main().catch((error) => {
  log.error(`Script failed: ${error.message}`);
  process.exit(1);
});

// Path to the cookie utility file
const COOKIE_UTILITY_PATH = path.join('utils', 'api-helpers', 'cookie-handlers.ts');

// Content of the utility file
const COOKIE_UTILITY_CONTENT = `/**
 * Cookie handling utilities for API routes in Next.js 15
 * 
 * This provides a consistent pattern for handling cookies in API routes
 * with the Promise-based cookies() API introduced in Next.js 15.
 */
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import type { CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Ensure environment variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates cookie handlers for use with Supabase clients in API routes
 * Properly handles the Promise-based cookies() API in Next.js 15
 */
export async function createApiCookieHandlers() {
  const cookieStore = await cookies();
  
  return {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      try {
        cookieStore.set({ name, value, ...options });
      } catch (e) {
        // Cannot set cookies in some contexts
        console.warn('Failed to set cookie:', e);
      }
    },
    remove(name: string, options: CookieOptions) {
      try {
        cookieStore.set({ name, value: '', ...options, maxAge: 0 });
      } catch (e) {
        // Cannot remove cookies in some contexts
        console.warn('Failed to remove cookie:', e);
      }
    }
  };
}

/**
 * Creates a Supabase client for use in API routes
 * Handles cookies properly with the Promise-based cookies() API in Next.js 15
 */
export async function createApiRouteClient() {
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: await createApiCookieHandlers()
    }
  );
}
`;

// Create the utility file
async function createUtilityFile() {
  try {
    // Make sure the directory exists
    const dir = path.dirname(COOKIE_UTILITY_PATH);
    try {
      await mkdir(dir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }

    // Write the utility file
    await writeFile(COOKIE_UTILITY_PATH, COOKIE_UTILITY_CONTENT);
    console.log(`✅ Created cookie handling utility at ${COOKIE_UTILITY_PATH}`);

    // Log usage instructions
    console.log(`
🔧 How to fix API routes:

Replace this pattern:

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        async async set(name: string, value: string, options: CookieOptions) { // Double async!
          try {
            await cookieStore.set({ name, value, ...options });
          } catch (e) {
            /* ignore */
          }
        },
        // ...etc
      }
    }
  );

With this pattern:

  import { createApiRouteClient } from '@/utils/api-helpers/cookie-handlers';

  // In your API handler
  const supabase = await createApiRouteClient();
  
This will fix all API routes consistently with proper cookie handling.
`);
  } catch (error) {
    console.error('Error creating utility file:', error);
    process.exit(1);
  }
}

// Run the script
createUtilityFile();
