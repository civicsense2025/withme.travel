// Simple HTTP proxy server for local development
// that adds proper CSP headers to support Supabase WebSockets
import http from 'http';
import https from 'https';
import { parse } from 'url';

const PORT = 3001;
const TARGET_HOST = 'localhost';
const TARGET_PORT = 3000;

// Create a server
const server = http.createServer((req, res) => {
  // Parse the request URL
  const parsedUrl = parse(req.url);

  // Set up the proxy request options
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  // Create a proxy request
  const proxyReq = http.request(options, (proxyRes) => {
    // Copy all response headers
    Object.keys(proxyRes.headers).forEach((key) => {
      // Skip existing CSP headers - we'll add our own
      if (key.toLowerCase() !== 'content-security-policy') {
        res.setHeader(key, proxyRes.headers[key]);
      }
    });

    // Add our custom CSP header with WebSocket support
    res.setHeader(
      'Content-Security-Policy',
      `default-src 'self'; 
       script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.vercel-scripts.com; 
       style-src 'self' 'unsafe-inline'; 
       img-src 'self' blob: data: https://*; 
       font-src 'self'; 
       object-src 'none'; 
       base-uri 'self'; 
       form-action 'self'; 
       frame-ancestors 'none'; 
       connect-src 'self' https://*.supabase.co wss://*.supabase.io wss://*.supabase.co https://*.vercel-scripts.com https://vitals.vercel-insights.com https://maps.googleapis.com https://www.google-analytics.com https://*.google.com https://api.stripe.com; 
       upgrade-insecure-requests;`.replace(/\s+/g, ' ')
    );

    // Set status code
    res.statusCode = proxyRes.statusCode;

    // Pipe the response data
    proxyRes.pipe(res);
  });

  // Forward the request body
  req.pipe(proxyReq);

  // Handle errors
  proxyReq.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    res.statusCode = 500;
    res.end('Proxy error');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}/`);
  console.log(`Forwarding requests to http://${TARGET_HOST}:${TARGET_PORT}/`);
  console.log('With custom CSP headers for Supabase WebSockets');
});
