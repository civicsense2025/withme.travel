#!/usr/bin/env node

/**
 * Simple helper script to analyze and assist with updating Storybook story files
 * to match the new category structure.
 *
 * Usage: node .storybook/update-stories.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all story files
const output = execSync('find . -name "*.stories.tsx" -not -path "./node_modules/*"').toString();
const storyFiles = output.split('\n').filter(Boolean);

// Category mapping suggestions (old to new)
const categoryMappings = {
  Foundation: 'Core UI',
  Layout: 'Core UI/Layout',
  Navigation: 'App Layout/Navigation',
  'Inputs & Forms': 'Core UI/Inputs',
  Display: 'Core UI/Layout',
  Feedback: 'Core UI/Feedback',
  'Overlays & Modals': 'Core UI/Overlay',
  'Data Display': 'Core UI/Data Display',
  'Travel Components': 'Features',
  'Group Features': 'Features',
  'Trip Features': 'Features/Trip',
  'User Components': 'App Layout/User Interface',
  'Design System/Tokens': 'Design System/Tokens',
  'Design System/Foundations': 'Design System',
  'Design System/Components': 'Core UI',
  'Design System/Patterns': 'Design System',
};

// Component-specific suggestions based on file path
const componentMappings = {
  navbar: 'App Layout/Navigation/Navbar',
  'page-header': 'App Layout/Page Containers/PageHeader',
  'page-container': 'App Layout/Page Containers/PageContainer',
  'trip-card': 'Features/Trip/TripCard',
  'destination-card': 'Features/Destinations/DestinationCard',
  itinerary: 'Features/Itinerary',
  feedback: 'Features/Feedback',
  admin: 'App Layout/Admin',
};

console.log(`Found ${storyFiles.length} story files to analyze.\n`);

const results = {
  needsUpdate: [],
  alreadyUpdated: [],
  unknown: [],
};

// Analyze each file
storyFiles.forEach((filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract the title from the Meta definition
    const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);

    if (!titleMatch) {
      results.unknown.push({ file: filePath, reason: 'Could not find title' });
      return;
    }

    const title = titleMatch[1];
    const fileName = path.basename(filePath);
    const componentName = fileName.replace('.stories.tsx', '');

    // Check if this follows our new pattern (has at least two levels)
    const titleParts = title.split('/');

    if (
      titleParts.length >= 2 &&
      ['Design System', 'Core UI', 'Features', 'Product Marketing', 'App Layout'].includes(
        titleParts[0]
      )
    ) {
      results.alreadyUpdated.push({ file: filePath, title });
      return;
    }

    // Try to determine new category
    let suggestedCategory = null;

    // Check component-specific mappings first
    for (const [key, value] of Object.entries(componentMappings)) {
      if (filePath.toLowerCase().includes(key.toLowerCase())) {
        suggestedCategory = value;
        break;
      }
    }

    // If no specific mapping, check the old category mappings
    if (!suggestedCategory && titleParts[0]) {
      suggestedCategory = categoryMappings[titleParts[0]];
    }

    // If we found a suggested category but it doesn't include the component name
    if (suggestedCategory) {
      // Only add component name if it's not already the last part
      const parts = suggestedCategory.split('/');
      if (parts[parts.length - 1] !== componentName) {
        suggestedCategory = `${suggestedCategory}/${componentName}`;
      }
    } else {
      suggestedCategory = `Unknown/${componentName}`;
    }

    results.needsUpdate.push({
      file: filePath,
      currentTitle: title,
      suggestedTitle: suggestedCategory,
    });
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

// Output the results
console.log('============ ANALYSIS RESULTS ============\n');

console.log(`${results.alreadyUpdated.length} files already match the new structure:`);
results.alreadyUpdated.forEach((item) => {
  console.log(`  ✅ ${item.file} (${item.title})`);
});

console.log(`\n${results.needsUpdate.length} files need updating:`);
results.needsUpdate.forEach((item) => {
  console.log(`  🔄 ${item.file}`);
  console.log(`     Current:   ${item.currentTitle}`);
  console.log(`     Suggested: ${item.suggestedTitle}`);
  console.log('');
});

if (results.unknown.length > 0) {
  console.log(`\n${results.unknown.length} files could not be analyzed:`);
  results.unknown.forEach((item) => {
    console.log(`  ❓ ${item.file} (${item.reason})`);
  });
}

console.log('\n============ UPDATE INSTRUCTIONS ============\n');
console.log('To update a file, change the title in the Meta definition:');
console.log('');
console.log('const meta: Meta<typeof Component> = {');
console.log("  title: '[NEW CATEGORY]/[COMPONENT]',");
console.log('  ...');
console.log('};');
console.log('\nSee the migration guide at: http://localhost:6006/?path=/docs/migration-guide');
