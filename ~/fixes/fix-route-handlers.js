#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get list of files from command line arguments or use a default pattern
const files = process.argv.slice(2);

// Patterns to fix in the files
const patterns = [
  // Fix 1: Fix the params Promise syntax issue with extra parentheses and braces
  {
    pattern: /\{ params \}: \{ params: Promise<\{ ([a-zA-Z0-9_]+): string \}> \} \)/g,
    replacement: '{ params }: { params: Promise<{ $1: string }> }'
  },
  // Fix 2: Fix any additional braces after function declarations
  {
    pattern: /\) {[\s\r\n]+}/g,
    replacement: ') {'
  },
  // Fix 3: Remove unnecessary braces at the start of functions
  {
    pattern: /(export async function [A-Z]+ \([^)]*\) {)[\s\r\n]+{/g,
    replacement: '$1'
  },
  // Fix 4: Remove unnecessary standalone braces
  {
    pattern: /^[\s\r\n]*}[\s\r\n]*{[\s\r\n]*/gm,
    replacement: ''
  },
  // Fix 5: Fix indentation issues
  {
    pattern: /^}[\s\r\n]+(try|const|let|var|if|for|while|switch|return|console)/gm,
    replacement: '  $1'
  },
  // Fix 6: Fix double closing braces
  {
    pattern: /}[\s\r\n]+}[\s\r\n]+(return|if|try|console)/gm,
    replacement: '  }\n  $1'
  },
  // Fix 7: Replace database table constants with direct strings
  {
    pattern: /(from|\.from)\(TABLES\.([A-Z_]+)\)/g,
    replacement: (match, func, table) => {
      // Convert the table name to lowercase and snake case
      const tableName = table.toLowerCase().replace(/_/g, '_');
      return `${func}('${tableName}')`;
    }
  },
  // Fix 8: Replace database field constants with direct strings
  {
    pattern: /\.eq\(FIELDS\.([A-Z_]+)\.([A-Z_]+), /g,
    replacement: (match, table, field) => {
      // Convert the field name to lowercase and snake case
      const fieldName = field.toLowerCase().replace(/_/g, '_');
      return `.eq('${fieldName}', `;
    }
  },
  // Fix 9: Remove type imports for database constants
  {
    pattern: /import \{ (?:type )?([A-Z_]+(?:, (?:type )?[A-Z_]+)*) \} from '@\/utils\/constants\/database';/g,
    replacement: (match, imports) => {
      // If we're importing anything other than types, leave the import
      if (imports.includes('TABLES') || imports.includes('FIELDS') || imports.includes('ENUMS')) {
        return '// Direct table/field names used instead of imports';
      } else {
        return match; // Leave other imports alone
      }
    }
  }
];

console.log(`Processing ${files.length} files...`);

let fixedFiles = 0;
let processedFiles = 0;

files.forEach(file => {
  try {
    processedFiles++;
    if (!fs.existsSync(file)) {
      console.error(`File not found: ${file}`);
      return;
    }

    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;

    // Apply all patterns to the file
    patterns.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });

    // Check if the file was modified
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`Fixed: ${file}`);
      fixedFiles++;
    }
  } catch (error) {
    console.error(`Error processing file ${file}:`, error);
  }
});

console.log(`\nCompleted processing ${processedFiles} files. Fixed ${fixedFiles} files.`); 