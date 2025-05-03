import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

try {
  // Get current directory
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  
  const filePath = join(__dirname, 'app/trips/[tripId]/trip-page-client.tsx');
  const content = readFileSync(filePath, 'utf8');
  
  // Check for balanced braces
  let braceCount = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') braceCount--;
    
    // If at any point we have negative braces, we have a closing brace without an opening one
    if (braceCount < 0) {
      console.error(`Unbalanced braces: extra closing brace at position ${i}`);
      process.exit(1);
    }
  }
  
  if (braceCount !== 0) {
    console.error(`Unbalanced braces: missing ${braceCount} closing braces`);
    process.exit(1);
  }
  
  // Check for extra characters at the end
  const lastChar = content.trim().slice(-1);
  if (lastChar !== '}') {
    console.error(`Unexpected character at the end of file: "${lastChar}"`);
    process.exit(1);
  }
  
  console.log("File syntax appears to be valid.");
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
} 