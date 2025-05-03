import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory with ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all TypeScript files in the route handlers
const getAllRouteHandlers = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllRouteHandlers(filePath, fileList);
    } else if (
      filePath.endsWith('route.ts') &&
      !filePath.includes('node_modules') &&
      !filePath.includes('.next')
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
};

// Fix params access in a file
const fixParamsAccess = (filePath) => {
  try {
    console.log(`Processing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern for direct params access
    const directParamsAccess = /params\.([a-zA-Z0-9_]+)/g;
    if (content.includes('params.')) {
      content = content.replace(directParamsAccess, '(await params).$1');
      modified = true;
    }

    // Pattern for destructuring params
    const destructuringParams = /const\s+\{([^}]+)\}\s*=\s*params/g;
    if (content.match(destructuringParams)) {
      content = content.replace(destructuringParams, 'const {$1} = await params');
      modified = true;
    }

    // Pattern for function args with params
    const functionArgs = /\(\s*request\s*,\s*\{\s*params\s*\}\s*\)/g;
    if (content.match(functionArgs)) {
      content = content.replace(functionArgs, '(request, { params })');
      modified = true;
    }

    // Pattern for optional chaining with params
    const optionalParams = /params\?\./g;
    if (content.match(optionalParams)) {
      content = content.replace(optionalParams, '(await params)?.');
      modified = true;
    }

    // Pattern for searchParams direct access
    const searchParamsAccess = /searchParams\./g;
    if (content.match(searchParamsAccess)) {
      content = content.replace(searchParamsAccess, 'searchParams?.');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed params access in ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
};

// Main script
console.log('Starting Next.js 15 route params fix script...');
const appDir = path.join(__dirname, '..', 'app');

const files = getAllRouteHandlers(appDir);

let fixedCount = 0;
files.forEach((file) => {
  if (fixParamsAccess(file)) {
    fixedCount++;
  }
});

console.log(
  `\nFixed params access in ${fixedCount} files out of ${files.length} total route handlers.`
);
console.log('Next step: Run Next.js build to see if errors are resolved');
