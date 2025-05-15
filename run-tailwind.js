// run-tailwind.js
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Locate the tailwindcss module
const tailwindPath = path.resolve(__dirname, 'node_modules/tailwindcss');
console.log('Looking for Tailwind at:', tailwindPath);

if (fs.existsSync(tailwindPath)) {
  console.log('Tailwind found at:', tailwindPath);
  
  try {
    // Try to find the CLI path
    const cliPath = path.join(tailwindPath, 'lib/cli.js');
    
    if (fs.existsSync(cliPath)) {
      console.log('Tailwind CLI found at:', cliPath);
      
      // Execute Tailwind directly with Node
      const command = `node "${cliPath}" -i ./app/globals.css -o ./public/styles.css`;
      console.log('Executing command:', command);
      
      execSync(command, { stdio: 'inherit' });
      console.log('Tailwind CSS compiled successfully!');
    } else {
      console.error('Tailwind CLI not found at expected path:', cliPath);
    }
  } catch (error) {
    console.error('Error executing Tailwind:', error.message);
  }
} else {
  console.error('Tailwind module not found. Installing it now...');
  try {
    execSync('pnpm install -D tailwindcss@latest @tailwindcss/postcss', { stdio: 'inherit' });
    console.log('Tailwind installed, please run this script again.');
  } catch (installError) {
    console.error('Failed to install Tailwind:', installError.message);
  }
}