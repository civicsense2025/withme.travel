const fs = require('fs');
const path = require('path');
const glob = require('glob');

const DRY_RUN = process.argv.includes('--dry-run');
const COMPONENTS_DIR = path.join(process.cwd(), 'components');

// Only process files in /components with U delimiter in the basename
function shouldRename(filePath) {
  if (!filePath.startsWith(COMPONENTS_DIR)) return false;
  const base = path.basename(filePath, path.extname(filePath));
  // Only match U between alphanumerics (not at start/end)
  return /[a-zA-Z0-9]U[a-zA-Z0-9]/.test(base);
}

// Convert all U delimiters in basename to hyphens, then lowercase
function uToKebab(filename) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  return base.replace(/U/g, '-').toLowerCase() + ext;
}

// Find all files in /components with U delimiter
const files = glob.sync('**/*U*.@(ts|tsx|js|jsx)', {
  cwd: COMPONENTS_DIR,
  absolute: true,
  nodir: true,
  ignore: [
    '**/node_modules/**',
    '**/.git/**',
    '**/scripts/**',
    '**/types/**',
    '**/utils/**',
    '**/stories/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/out/**',
    '**/.*',
  ],
});

const renameMap = {};
for (const file of files) {
  if (!shouldRename(file)) continue;
  const dir = path.dirname(file);
  const ext = path.extname(file);
  const base = path.basename(file);
  const newBase = uToKebab(base);
  if (base !== newBase) {
    renameMap[file] = path.join(dir, newBase);
  }
}

console.log('--- Files to rename:');
Object.entries(renameMap).forEach(([from, to]) => {
  console.log(`Would rename: ${path.relative(process.cwd(), from)} -> ${path.relative(process.cwd(), to)}`);
});

// Update imports in all files under /components
const allComponentFiles = glob.sync('**/*.@(ts|tsx|js|jsx)', {
  cwd: COMPONENTS_DIR,
  absolute: true,
  nodir: true,
  ignore: [
    '**/node_modules/**',
    '**/.git/**',
    '**/scripts/**',
    '**/types/**',
    '**/utils/**',
    '**/stories/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/out/**',
    '**/.*',
  ],
});

const importUpdates = [];
for (const codeFile of allComponentFiles) {
  let content = fs.readFileSync(codeFile, 'utf8');
  let updated = false;
  for (const [oldPath, newPath] of Object.entries(renameMap)) {
    const oldRel = './' + path.relative(path.dirname(codeFile), oldPath).replace(/\\/g, '/').replace(/\.[tj]sx?$/, '');
    const newRel = './' + path.relative(path.dirname(codeFile), newPath).replace(/\\/g, '/').replace(/\.[tj]sx?$/, '');
    // Replace import paths (with or without extension)
    const regex = new RegExp(`(['"\`])${oldRel}($1)`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `$1${newRel}$2`);
      updated = true;
    }
  }
  if (updated) {
    importUpdates.push(codeFile);
    if (!DRY_RUN) {
      fs.writeFileSync(codeFile, content, 'utf8');
    }
  }
}

console.log('--- Import paths updated in:');
importUpdates.forEach(f => {
  console.log(path.relative(process.cwd(), f));
});

// Actually rename files (if not dry-run)
if (!DRY_RUN) {
  for (const [from, to] of Object.entries(renameMap)) {
    fs.renameSync(from, to);
  }
}

console.log(`\nMigration ${DRY_RUN ? 'dry-run' : 'complete'}!`); 