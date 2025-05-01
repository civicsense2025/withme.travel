#!/usr/bin/env node

/**
 * This script fixes inconsistent useAuth imports across the project.
 * It changes all imports from '@/components/auth-provider' to '@/lib/hooks/use-auth'.
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Directories to search
const searchDirs = ['app', 'components', 'hooks', 'contexts', 'lib', 'utils'];

const excluded = ['node_modules', '.next', '.git'];

console.log('🔍 Searching for inconsistent useAuth imports...');

// Get files with useAuth imports from components/auth-provider
try {
  const { stdout } = await execAsync(
    `grep -r "import { useAuth } from '@/components/auth-provider'" --include="*.tsx" --include="*.ts" ${searchDirs.join(' ')}`
  );

  const files = stdout
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const match = line.match(/^([^:]+):/);
      return match ? match[1] : null;
    })
    .filter((file) => file !== null);

  if (files.length === 0) {
    console.log('✅ No inconsistent imports found!');
    process.exit(0);
  }

  console.log(`🔧 Found ${files.length} files with inconsistent imports.`);

  // Fix each file
  let fixedCount = 0;
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const updatedContent = content.replace(
        /import\s+\{\s*useAuth\s*\}\s+from\s+['"]@\/components\/auth-provider['"]/g,
        "import { useAuth } from '@/lib/hooks/use-auth'"
      );

      if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent);
        fixedCount++;
        console.log(`✓ Fixed: ${filePath}`);
      }
    } catch (err) {
      console.error(`❌ Error fixing ${filePath}:`, err);
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} of ${files.length} files.`);
} catch (error) {
  // Handle case where grep finds nothing
  if (error.code === 1 && error.stdout?.trim() === '') {
    console.log('✅ No inconsistent imports found!');
    process.exit(0);
  }

  console.error('❌ Error:', error.message);
  process.exit(1);
}
