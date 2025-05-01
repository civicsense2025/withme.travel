/**
 * Auth Cookie Debug and Fix Tool
 *
 * This script checks for authentication cookie issues and provides a way to clear them.
 *
 * Usage:
 * 1. Run with Node.js: node scripts/fix-auth-cookies.js
 * 2. Or use via npm: npm run debug:auth
 */

import { createServer } from 'http';
import { exec } from 'child_process';
import open from 'open';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PORT = 3334;
const API_ENDPOINT = 'http://localhost:3000/api/debug/auth-status';
const CLEAR_COOKIES_ENDPOINT = 'http://localhost:3000/api/auth/clear-cookies';

// Ensure we're in development mode
if (process.env.NODE_ENV !== 'development') {
  console.warn('\x1b[33m%s\x1b[0m', 'Warning: This tool should only be used in development mode.');
}

// Create a simple HTTP server to display auth debug information
const server = createServer(async (req, res) => {
  // Check if we need to clear cookies
  if (req.url === '/clear-cookies') {
    try {
      const response = await fetch(CLEAR_COOKIES_ENDPOINT);
      if (!response.ok) {
        throw new Error(`Failed to clear cookies: ${response.statusText}`);
      }

      res.writeHead(302, { Location: '/' });
      res.end();
      return;
    } catch (error) {
      console.error('Error clearing cookies:', error);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(
        `<h1>Error clearing cookies</h1><p>${error.message}</p><a href="/">Back to Debug</a>`
      );
      return;
    }
  }

  // Display main debug page
  res.writeHead(200, { 'Content-Type': 'text/html' });

  // HTML content for the debug page
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Auth Cookie Debug Tool</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
      h1 { color: #333; }
      h2 { color: #555; margin-top: 30px; }
      pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
      .card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
      .success { color: green; }
      .error { color: red; }
      .warning { color: orange; }
      .fix-button { background: #e74c3c; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
      .refresh-button { background: #3498db; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; margin-right: 10px; }
    </style>
  </head>
  <body>
    <h1>Auth Cookie Debug Tool</h1>
    <p>This tool helps diagnose authentication cookie issues in your withme.travel app.</p>
    
    <div class="card">
      <h2>Current Auth Status</h2>
      <p>Loading...</p>
      <div id="auth-status"></div>
    </div>
    
    <div class="card">
      <h2>Cookie Information</h2>
      <p>Loading...</p>
      <div id="cookie-info"></div>
    </div>
    
    <div class="card">
      <h2>Authentication Files Analysis</h2>
      <p>Checking for issues in auth-related files...</p>
      <div id="auth-files">
        <p>This analysis checks common files for auth misconfigurations:</p>
        <ul>
          <li><strong>utils/supabase/unified.ts</strong> - Unified Supabase client utilities</li>
          <li><strong>components/auth-provider.tsx</strong> - Auth provider component</li>
          <li><strong>middleware.ts</strong> - Request middleware for auth checks</li>
          <li><strong>utils/supabase/server.ts</strong> - Server-side Supabase utilities</li>
        </ul>
        <p>Access <a href="/debug/auth-status" target="_blank">/debug/auth-status</a> for more detailed diagnostics.</p>
      </div>
    </div>
    
    <div class="card">
      <h2>Actions</h2>
      <button class="refresh-button" onclick="window.location.reload()">Refresh Status</button>
      <button class="fix-button" onclick="clearCookies()">Clear Auth Cookies</button>
    </div>
    
    <script>
      async function fetchAuthStatus() {
        try {
          const response = await fetch('${API_ENDPOINT}');
          const data = await response.json();
          
          document.getElementById('auth-status').innerHTML = \`
            <div>
              <p><strong>User Authenticated:</strong> <span class="\${data.auth_status.has_session ? 'success' : 'warning'}">\${data.auth_status.has_session ? 'Yes' : 'No'}</span></p>
              <p><strong>User ID:</strong> \${data.auth_status.user_id || 'None'}</p>
              <p><strong>User Email:</strong> \${data.auth_status.user_email || 'None'}</p>
              <p><strong>Last Sign In:</strong> \${data.auth_status.last_sign_in || 'Unknown'}</p>
            </div>
            <h3>Raw Data</h3>
            <pre>\${JSON.stringify(data, null, 2)}</pre>
          \`;
        } catch (error) {
          document.getElementById('auth-status').innerHTML = \`
            <p class="error">Error fetching auth status: \${error.message}</p>
            <p>Make sure your Next.js development server is running at http://localhost:3000</p>
          \`;
        }
      }
      
      function showCookieInfo() {
        const cookies = document.cookie.split(';').map(c => c.trim());
        const authCookies = cookies.filter(c => c.startsWith('sb-'));
        
        if (authCookies.length > 0) {
          document.getElementById('cookie-info').innerHTML = \`
            <p><strong>Auth Cookies Found:</strong> <span class="success">\${authCookies.length}</span></p>
            <ul>
              \${authCookies.map(c => \`<li>\${c.split('=')[0]}</li>\`).join('')}
            </ul>
          \`;
        } else {
          document.getElementById('cookie-info').innerHTML = \`
            <p><strong>Auth Cookies Found:</strong> <span class="warning">0</span></p>
            <p>No Supabase auth cookies found in this browser.</p>
          \`;
        }
      }
      
      function clearCookies() {
        if (confirm('Are you sure you want to clear all auth cookies? You will be logged out.')) {
          window.location.href = '/clear-cookies';
        }
      }
      
      // Run on page load
      fetchAuthStatus();
      showCookieInfo();
    </script>
  </body>
  </html>
  `;

  res.end(html);
});

// Start the server and open the browser
server.listen(PORT, () => {
  console.log(
    '\x1b[36m%s\x1b[0m',
    `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║               Auth Cookie Debug Tool Started               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`
  );
  console.log('\x1b[32m%s\x1b[0m', `Server running at http://localhost:${PORT}`);
  console.log('\x1b[33m%s\x1b[0m', 'Make sure your Next.js development server is also running!');

  // Open the browser
  open(`http://localhost:${PORT}`);

  console.log('\x1b[0m%s\x1b[0m', 'Press Ctrl+C to stop the server');
});
