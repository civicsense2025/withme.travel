import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('Fixing lucide-react imports in components/debug/auth-debugger.tsx');

// Path to the file
const authDebuggerPath = path.join(projectRoot, 'components', 'debug', 'auth-debugger.tsx');

// First check if the file exists
if (fs.existsSync(authDebuggerPath)) {
  // Fix the imports in auth-debugger.tsx
  let authDebuggerContent = fs.readFileSync(authDebuggerPath, 'utf8');

  // Remove Clock from imports if it exists
  authDebuggerContent = authDebuggerContent.replace(
    /import \{([^}]*?)Clock([^}]*?)\} from ['"]lucide-react['"]/g,
    (match, before, after) => {
      // Clean up any potential double commas or trailing commas
      const icons = `${before}${after}`.replace(/,\s*,/g, ',').replace(/,\s*\}/g, '}');
      return `import {${icons}} from 'lucide-react'`;
    }
  );

  // Write back the file
  fs.writeFileSync(authDebuggerPath, authDebuggerContent, 'utf8');
  console.log('Fixed lucide-react imports in auth-debugger.tsx');
} else {
  console.log('auth-debugger.tsx not found, skipping');
}

// Check and reinstall lucide-react to ensure it's properly resolved
console.log('Reinstalling lucide-react package to resolve module issues');
try {
  execSync('npm install lucide-react@latest', { stdio: 'inherit' });
  console.log('Successfully reinstalled lucide-react');
} catch (error) {
  console.error('Error reinstalling lucide-react:', error);
}

console.log('Running Next.js build to verify changes');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
}

console.log('Fix complete. Please restart your development server.');
