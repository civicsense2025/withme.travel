import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the file
const filePath = path.join(path.resolve(__dirname, '..'), 'components', 'csrf-provider.tsx');

console.log('Fixing CSRF provider at path:', filePath);

// Read the file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    process.exit(1);
  }

  // Fix the refreshCsrfToken function to ensure it returns string | null
  let modifiedContent = data;

  // First, make sure refreshCsrfToken explicitly returns Promise<string | null>
  modifiedContent = modifiedContent.replace(
    /const refreshCsrfToken = useCallback\(async \(\)\s*=>/,
    'const refreshCsrfToken = useCallback(async (): Promise<string | null> =>'
  );

  // Add return statements in the function
  modifiedContent = modifiedContent.replace(
    /if \(newToken\) {([\s\S]*?)}\s*else\s*{([\s\S]*?)}/m,
    (match, ifBlock, elseBlock) => {
      // Check if the ifBlock already has a return statement
      if (!ifBlock.includes('return newToken;')) {
        ifBlock += '\n      return newToken;';
      }

      // Check if the elseBlock already has a return statement
      if (!elseBlock.includes('return null;')) {
        elseBlock += '\n      return null;';
      }

      return `if (newToken) {${ifBlock}} else {${elseBlock}}`;
    }
  );

  // Make sure the catch block returns null
  modifiedContent = modifiedContent.replace(
    /} catch \(err\) {([\s\S]*?)}\s*finally/m,
    (match, catchBlock) => {
      // Check if the catchBlock already has a return statement
      if (!catchBlock.includes('return null;')) {
        catchBlock += '\n      return null;';
      }

      return `} catch (err) {${catchBlock}} finally`;
    }
  );

  // Write the modified content back to the file
  fs.writeFile(filePath, modifiedContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      process.exit(1);
    }

    console.log('CSRF Provider successfully updated with proper return types.');
  });
});
