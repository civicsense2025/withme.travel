// extract-db-objects.js (ESM version)
import fs from 'node:fs';
import path from 'node:path';

if (process.argv.length < 3) {
  console.error('Usage: node extract-db-objects.js path/to/your.sql');
  process.exit(1);
}

const filePath = process.argv[2];
const sql = fs.readFileSync(filePath, 'utf8');

// Regex patterns for constraints, policies, triggers
const constraintPattern = /CONSTRAINT\s+([^\s]+)[\s\S]*?(?=,|$)/gi;
const policyPattern = /(CREATE|ALTER|DROP)\s+POLICY[\s\S]*?;/gi;
const triggerPattern = /(CREATE|ALTER|DROP)\s+TRIGGER[\s\S]*?;/gi;

// Extract constraints
console.log('--- CONSTRAINTS ---');
let match;
while ((match = constraintPattern.exec(sql)) !== null) {
  const start = match.index;
  const end = sql.indexOf(',', start + 1);
  const semicolon = sql.indexOf(';', start + 1);
  const stop = end === -1 || (semicolon !== -1 && semicolon < end) ? semicolon : end;
  const constraintDef = sql.substring(start, stop !== -1 ? stop : undefined).trim();
  console.log(constraintDef.replace(/\s+/g, ' '));
}

// Extract policies
console.log('\n--- POLICIES ---');
const policies = sql.match(policyPattern);
if (policies) {
  policies.forEach((policy) => {
    console.log(policy.replace(/\s+/g, ' '));
  });
}

// Extract triggers
console.log('\n--- TRIGGERS ---');
const triggers = sql.match(triggerPattern);
if (triggers) {
  triggers.forEach((trigger) => {
    console.log(trigger.replace(/\s+/g, ' '));
  });
}
