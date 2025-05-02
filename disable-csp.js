// Manual test of CSP disabling logic in next.config.mjs
const fs = require('fs');
const path = require('path');

// Set environment variable manually
process.env.DISABLE_CSP = 'true';
console.log('Set DISABLE_CSP =', process.env.DISABLE_CSP);

// Load next.config.mjs as ESM using dynamic import
(async () => {
  try {
    // Convert next.config.mjs to a temporary JS file to require it
    const configPath = path.resolve('./next.config.mjs');
    const tempJsPath = path.resolve('./next.config.temp.js');

    // Read the MJS file
    const configContent = fs.readFileSync(configPath, 'utf8');

    // Convert export default to module.exports
    const jsContent = configContent
      .replace(/export\s+default/g, 'module.exports =')
      .replace(/import\s+.*?from\s+['"].*?['"]/g, '// $&');

    // Write temporary JS file
    fs.writeFileSync(tempJsPath, jsContent);

    // Require the JS file
    const nextConfig = require('./next.config.temp.js');

    // Call headers function
    if (nextConfig.headers) {
      console.log('Calling headers function from next.config.mjs...');
      const headers = await nextConfig.headers();
      console.log('Headers result:', JSON.stringify(headers, null, 2));
    } else {
      console.log('No headers function found in next.config.mjs');
    }

    // Clean up
    fs.unlinkSync(tempJsPath);
  } catch (error) {
    console.error('Error testing CSP disabling:', error);
  }
})();
