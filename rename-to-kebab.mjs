import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert camelCase or PascalCase to kebab-case
function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

// Recursively find all files with given extensions
async function findFiles(dir, extensions = ['.tsx', '.ts']) {
  let files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', '.next', 'dist', 'build', '.turbo', '.cache', 'coverage'].includes(entry.name)) {
        files = files.concat(await findFiles(fullPath, extensions));
      }
    } else if (extensions.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const targetDir = path.join(__dirname, 'components/features/destinations');
  const mapping = new Map();
  const logLines = ['Original Name => New Name', '--------------------------------'];

  // 1. Create file mapping (any file with at least one 'U' between lowercase words)
  const files = await findFiles(targetDir);
  for (const file of files) {
    const filename = path.basename(file);
    // Match any filename with at least one 'U' between lowercase words
    if (!/[a-z0-9]+U[a-z0-9]+(U[a-z0-9]+)*\.[a-z]+$/.test(filename)) continue;
    const directory = path.dirname(file);
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    // Replace all 'U' with '-' and lowercase
    const kebab = base.replace(/U/g, '-').toLowerCase() + ext;
    const newPath = path.join(directory, kebab);
    mapping.set(file, newPath);
    logLines.push(`${filename} => ${kebab}`);
  }
  await fs.writeFile(path.join(__dirname, 'rename-mapping.txt'), logLines.join('\n'), 'utf8');

  // 2. Update imports in all code files
  const allFiles = await findFiles(__dirname, ['.tsx', '.ts', '.jsx', '.js']);
  for (const file of allFiles) {
    if (file.includes('node_modules') || file.includes('.git')) continue;
    let content = await fs.readFile(file, 'utf8');
    let modified = false;
    for (const [oldPath, newPath] of mapping.entries()) {
      const oldBase = path.basename(oldPath, path.extname(oldPath));
      const newBase = path.basename(newPath, path.extname(newPath));
      // Replace import paths and named imports
      const patterns = [
        new RegExp(`(['\"])${oldBase}(['\"])`, 'g'),
        new RegExp(`(['\"])${oldBase}/index(['\"])`, 'g'),
        new RegExp(`import\\s+${oldBase}\\s+from`, 'g'),
        new RegExp(`import\\s+{\\s*${oldBase}\\s*}\\s+from`, 'g'),
      ];
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          content = content.replace(pattern, (match, p1, p2) => {
            if (p1 && p2) return `${p1}${newBase}${p2}`;
            return match.replace(oldBase, newBase);
          });
          modified = true;
        }
      }
    }
    if (modified) {
      await fs.writeFile(file, content, 'utf8');
      console.log(`Updated imports in ${file}`);
    }
  }

  // 3. Rename files
  for (const [oldPath, newPath] of mapping.entries()) {
    await fs.rename(oldPath, newPath);
    console.log(`Renamed: ${oldPath} -> ${newPath}`);
  }
  console.log('\nMigration completed! Check rename-mapping.txt for details.');
}

main().catch(console.error); 