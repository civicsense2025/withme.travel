import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('=== Running comprehensive project fixes ===');

// 1. Fix the CSRF provider issues
console.log('\n🔧 Fixing CSRF provider types...');
const csrfProviderPath = path.join(projectRoot, 'components', 'csrf-provider.tsx');

if (fs.existsSync(csrfProviderPath)) {
  let csrfContent = fs.readFileSync(csrfProviderPath, 'utf8');

  // Fix return type declaration
  csrfContent = csrfContent.replace(
    /const refreshCsrfToken = useCallback\(async \(\)(?:\s*:|(?!\s*:))/,
    'const refreshCsrfToken = useCallback(async (): Promise<string | null> =>'
  );

  // Fix function to ensure it returns values
  csrfContent = csrfContent.replace(
    /if \(newToken\) \{([\s\S]*?)console\.debug\(`\[CSRF\] Scheduling next refresh in \${refreshIn\}ms`\);([\s\S]*?)refreshTimeoutRef\.current = setTimeout\(\(\) => \{([\s\S]*?)refreshCsrfToken\(\);([\s\S]*?)\}, refreshIn\);([\s\S]*?)\} else \{/,
    (match, p1, p2, p3, p4, p5) => {
      return `if (newToken) {${p1}console.debug(\`[CSRF] Scheduling next refresh in \${refreshIn}ms\`);${p2}refreshTimeoutRef.current = setTimeout(() => {${p3}refreshCsrfToken();${p4}}, refreshIn);${p5}return newToken;\n      } else {`;
    }
  );

  // Add return null to the else branch
  csrfContent = csrfContent.replace(
    /console\.error\('\[CSRF\] Failed to refresh token'\);([\s\S]*?)refreshTimeoutRef\.current = setTimeout\(\(\) => \{([\s\S]*?)refreshCsrfToken\(\);([\s\S]*?)\}, 10000\); \/\/ Try again in 10 seconds([\s\S]*?)\}/,
    (match, p1, p2, p3, p4) => {
      return `console.error('[CSRF] Failed to refresh token');${p1}refreshTimeoutRef.current = setTimeout(() => {${p2}refreshCsrfToken();${p3}}, 10000); // Try again in 10 seconds${p4}return null;\n      }`;
    }
  );

  // Add return null to the catch block
  csrfContent = csrfContent.replace(
    /\} catch \(err\) \{([\s\S]*?)console\.error\('\[CSRF\] Error refreshing token:', err\);([\s\S]*?)refreshTimeoutRef\.current = setTimeout\(\(\) => \{([\s\S]*?)refreshCsrfToken\(\);([\s\S]*?)\}, 10000\); \/\/ Try again in 10 seconds([\s\S]*?)\} finally/,
    (match, p1, p2, p3, p4, p5) => {
      return `} catch (err) {${p1}console.error('[CSRF] Error refreshing token:', err);${p2}refreshTimeoutRef.current = setTimeout(() => {${p3}refreshCsrfToken();${p4}}, 10000); // Try again in 10 seconds${p5}return null;\n    } finally`;
    }
  );

  fs.writeFileSync(csrfProviderPath, csrfContent, 'utf8');
  console.log('✅ CSRF provider types fixed successfully.');
} else {
  console.log('❌ CSRF provider file not found.');
}

// 2. Fix the Lucide imports in auth-debugger.tsx
console.log('\n🔧 Fixing lucide-react imports...');
const authDebuggerPath = path.join(projectRoot, 'components', 'debug', 'auth-debugger.tsx');

if (fs.existsSync(authDebuggerPath)) {
  let authDebuggerContent = fs.readFileSync(authDebuggerPath, 'utf8');

  // First check if it contains Clock
  if (authDebuggerContent.includes('Clock')) {
    // Replace the entire import line
    authDebuggerContent = authDebuggerContent.replace(
      /import \{[^}]*Clock[^}]*\} from ['"]lucide-react['"]/,
      'import { X, AlertTriangle, Circle, CheckCircle, RefreshCw, Trash2 } from "lucide-react"'
    );

    fs.writeFileSync(authDebuggerPath, authDebuggerContent, 'utf8');
    console.log('✅ Lucide imports fixed in auth-debugger.tsx');
  } else {
    console.log('ℹ️ No Clock import found in auth-debugger.tsx, already fixed.');
  }
} else {
  console.log('❌ Auth debugger file not found.');
}

// 3. Clean up Next.js cache
console.log('\n🔧 Cleaning up Next.js cache...');
try {
  // Use fs to remove directory
  const nextDir = path.join(projectRoot, '.next');
  if (fs.existsSync(nextDir)) {
    console.log('Removing .next directory...');
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ .next directory removed successfully.');
  } else {
    console.log('ℹ️ .next directory not found, skipping cleanup.');
  }
} catch (error) {
  console.error('❌ Error cleaning up Next.js cache:', error);
}

console.log('\n=== All fixes applied ===');
console.log('\nPlease restart your development server to apply the changes:');
console.log('\nnpm run dev');
