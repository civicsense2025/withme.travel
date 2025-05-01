import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('Fixing lucide-react imports in debug/auth-debugger.tsx');

// Path to the file
const authDebuggerPath = path.join(projectRoot, 'components', 'debug', 'auth-debugger.tsx');

// Fix the imports in auth-debugger.tsx
let authDebuggerContent = fs.readFileSync(authDebuggerPath, 'utf8');

// Replace the entire import line
authDebuggerContent = authDebuggerContent.replace(
  /import \{[^}]*Clock[^}]*\} from ['"]lucide-react['"]/,
  'import { X, AlertTriangle, Circle, CheckCircle, RefreshCw, Trash2 } from "lucide-react"'
);

// Write back the file
fs.writeFileSync(authDebuggerPath, authDebuggerContent, 'utf8');
console.log('Fixed lucide-react imports in auth-debugger.tsx');

console.log('Fix complete. Please delete .next and restart your development server.');
