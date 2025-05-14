// extract-all-tables.mjs
import { readFile, writeFile } from 'fs/promises';

const INPUT_FILE = './data.sql'; // Path to your data.sql
const OUTPUT_FILE = './all_tables_import.sql';

// This regex matches any INSERT INTO public.<table> ...;
const insertRegex = /^INSERT INTO public\.[a-zA-Z0-9_]+\b.*;/gm;

const header = `
-- Extracted INSERT statements for ALL tables in public schema
-- You can import this file into your Postgres/Supabase instance.
SET session_replication_role = replica;
`;

const footer = `
SET session_replication_role = DEFAULT;
`;

async function extractInserts() {
  const sql = await readFile(INPUT_FILE, 'utf8');
  const matches = sql.match(insertRegex);

  if (!matches || matches.length === 0) {
    console.log('No INSERT statements found.');
    return;
  }

  const output = [header, ...matches, footer].join('\n\n');
  await writeFile(OUTPUT_FILE, output, 'utf8');
  console.log(`Extracted ${matches.length} statements to ${OUTPUT_FILE}`);
}

extractInserts().catch((err) => {
  console.error('Error extracting inserts:', err);
});
