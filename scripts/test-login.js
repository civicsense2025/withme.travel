const fetch = require('node-fetch');
const tough = require('tough-cookie');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

const Cookie = tough.Cookie;
const cookieJar = new tough.CookieJar();

/**
 * Test login flow with the provided credentials
 */
async function testLogin() {
  try {
    console.log('Starting login flow test...');

    // 1. First, get a CSRF token
    console.log('Fetching CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!csrfResponse.ok) {
      throw new Error(
        `Failed to get CSRF token: ${csrfResponse.status} ${csrfResponse.statusText}`
      );
    }

    const csrfData = await csrfResponse.json();
    console.log('CSRF token received:', csrfData);

    // Extract the Set-Cookie header and store in the cookie jar
    const cookies = csrfResponse.headers.raw()['set-cookie'];
    if (cookies) {
      cookies.forEach((cookie) => {
        const parsedCookie = Cookie.parse(cookie);
        if (parsedCookie) {
          cookieJar.setCookieSync(parsedCookie, 'http://localhost:3000');
        }
      });
    }

    // Get all cookies from the jar for the next request
    const cookieString = cookieJar.getCookieStringSync('http://localhost:3000');
    console.log('Cookies for next request:', cookieString);

    // 2. Now try to login with the credentials
    console.log('Attempting login...');
    await sleep(1000); // Brief pause between requests

    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.csrfToken,
        Cookie: cookieString,
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      console.error('Login failed:', loginResponse.status, loginData);
      throw new Error(`Login failed: ${loginData.error || 'Unknown error'}`);
    }

    console.log('Login successful:', loginData);

    // Extract auth cookies from login response
    const loginCookies = loginResponse.headers.raw()['set-cookie'];
    if (loginCookies) {
      loginCookies.forEach((cookie) => {
        const parsedCookie = Cookie.parse(cookie);
        if (parsedCookie) {
          cookieJar.setCookieSync(parsedCookie, 'http://localhost:3000');
        }
      });
    }

    // 3. Get user info to verify we're logged in
    console.log('Fetching user info to verify login...');
    await sleep(1000);

    const meResponse = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: cookieJar.getCookieStringSync('http://localhost:3000'),
      },
    });

    const meData = await meResponse.json();

    if (!meResponse.ok) {
      console.error('Failed to get user info:', meResponse.status, meData);
      throw new Error('Failed to verify login');
    }

    console.log('Successfully verified user:', meData);
    console.log('Login test completed successfully!');
  } catch (error) {
    console.error('Login test failed:', error);
  }
}

// Run the test
testLogin();
