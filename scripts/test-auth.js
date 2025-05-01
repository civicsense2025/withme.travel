/**
 * Authentication System Test Script
 *
 * This script tests the complete authentication system including:
 * 1. Login with invalid credentials
 * 2. Login with valid credentials
 * 3. Session persistence
 * 4. User data retrieval
 * 5. Logout functionality
 *
 * Usage:
 *   node scripts/test-auth.js [email] [password] [environment]
 *
 * Environments:
 *   local (default) - http://localhost:3000
 *   staging - https://staging.withme.travel
 *   production - https://withme.travel
 */

// Process command line arguments
const args = process.argv.slice(2);
const testEmail = args[0] || 'test@example.com';
const testPassword = args[1] || 'testpassword';
const environment = args[2] || 'local';

// Set base URL based on environment
let API_BASE;
switch (environment.toLowerCase()) {
  case 'production':
  case 'prod':
    API_BASE = 'https://withme.travel';
    break;
  case 'staging':
  case 'stage':
    API_BASE = 'https://staging.withme.travel';
    break;
  case 'local':
  default:
    API_BASE = 'http://localhost:3000';
    break;
}

async function testAuthSystem() {
  console.log('🔐 Starting Authentication System Test\n');
  console.log(`Environment: ${environment}`);
  console.log(`API Base URL: ${API_BASE}`);
  console.log(`Using test account: ${testEmail}`);

  let cookies = null;
  let authCookies = null;
  let userId = null;

  // Store response cookies
  function extractCookies(response) {
    const setCookie = response.headers.get('set-cookie');
    if (!setCookie) return null;

    return setCookie;
  }

  // Helper to make authenticated requests
  async function authedFetch(url, options = {}) {
    try {
      const headers = new Headers(options.headers || {});

      const allCookies = [cookies, authCookies].filter(Boolean).join('; ');
      if (allCookies) {
        headers.set('Cookie', allCookies);
      }
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      // Update cookies if provided
      const newCookies = extractCookies(response);
      if (newCookies) {
        authCookies = newCookies;
      }

      return response;
    } catch (error) {
      // Check if it's a connection error
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Connection refused. Make sure the server at ${url} is running.`);
      }
      throw error;
    }
  }

  // Check if server is running first with a connection test
  try {
    await fetch(`${API_BASE}`, { method: 'HEAD' }).catch((error) => {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to ${API_BASE}. Is the server running?`);
      }
      throw error;
    });
  } catch (connError) {
    console.error(`❌ Connection error: ${connError.message}`);
    console.log('\n💡 Tips:');
    console.log('   - For local testing, make sure your development server is running');
    console.log(
      '   - To test against staging or production, use: node scripts/test-auth.js user@example.com password staging'
    );
    process.exit(1);
  }

  // Step 1: Test login with invalid credentials
  // Step 1: Test login with invalid credentials
  try {
    console.log('\n1️⃣ Testing login with invalid credentials...');
    const response = await authedFetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'definitely-wrong-password',
      }),
    });

    const data = await response.json().catch(() => ({}));

    console.log('   Status:', response.status);

    if (response.status === 401) {
      console.log('✅ Correctly rejected invalid credentials');
    } else {
      console.log('⚠️ Unexpected response for invalid credentials');
      console.log('   Response:', data);
    }
  } catch (error) {
    console.error('❌ Error testing invalid login:', error.message);
  }

  // Step 2: Test login with valid credentials
  try {
    console.log('\n2️⃣ Testing login with valid credentials...');
    const response = await authedFetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const data = await response.json().catch(() => ({}));

    console.log('   Status:', response.status);

    if (response.ok) {
      console.log('✅ Successfully logged in!');
      if (data.user) {
        userId = data.user.id;
        console.log('   User ID:', userId);
      }
      // Extract and save auth cookies
      authCookies = extractCookies(response);
      console.log('   Auth Cookies Set:', !!authCookies);
    } else {
      console.log('❌ Login failed');
      console.log('   Error:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Error testing valid login:', error.message);
  }

  // Step 3: Check session - Get user data
  if (authCookies) {
    try {
      console.log('\n3️⃣ Testing session by retrieving user data...');
      const response = await authedFetch(`${API_BASE}/api/auth/me`, {
        method: 'GET',
      });

      const data = await response.json().catch(() => ({}));

      console.log('   Status:', response.status);

      if (response.ok && data.user) {
        console.log('✅ Successfully retrieved user data');
        console.log('   Email:', data.user.email);
        console.log('   ID matches:', data.user.id === userId);
      } else {
        console.log('❌ Failed to retrieve user data');
        console.log('   Error:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Error testing session:', error.message);
    }
  } else {
    console.log('\n3️⃣ Skipping session test (not logged in)');
  }

  // Step 4: Test logout
  if (authCookies) {
    try {
      console.log('\n4️⃣ Testing logout functionality...');
      const response = await authedFetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
      });

      const data = await response.json().catch(() => ({}));

      console.log('   Status:', response.status);

      if (response.ok) {
        console.log('✅ Successfully logged out');
      } else {
        console.log('❌ Logout failed');
        console.log('   Error:', data.error || 'Unknown error');
      }

      // Verify logout by trying to access user data again
      console.log('\n   Verifying logout by accessing user data again...');
      const verifyResponse = await authedFetch(`${API_BASE}/api/auth/me`, {
        method: 'GET',
      });

      console.log('   Status:', verifyResponse.status);

      if (verifyResponse.status === 401) {
        console.log('✅ Confirmed logout - Unauthorized as expected');
      } else {
        console.log('⚠️ Unexpected response after logout');
        const verifyData = await verifyResponse.json().catch(() => ({}));
        console.log('   Response:', verifyData);
      }
    } catch (error) {
      console.error('❌ Error testing logout:', error.message);
    }
  } else {
    console.log('\n4️⃣ Skipping logout test (not logged in)');
  }
  console.log('\n🏁 Authentication System Test Completed');
}

// Use fetch for Node.js
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Run the test
testAuthSystem().catch((error) => {
  console.error('❌ Unhandled error in test script:', error);
  process.exit(1);
});
