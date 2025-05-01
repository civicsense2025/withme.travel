# Test info

- Name: Registration Flow >> shows registration form
- Location: /Users/tanho/Projects/withme.travel-main/tests/auth.spec.js:182:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /sign up|create|register|account/i })
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /sign up|create|register|account/i })

    at /Users/tanho/Projects/withme.travel-main/tests/auth.spec.js:190:114
```

# Page snapshot

```yaml
- link "Skip to content":
    - /url: '#main-content'
- banner:
    - text: 🤝 withme.travel
    - navigation:
        - link "support us":
            - /url: /support
    - button "Open search menu":
        - img
    - button "Toggle theme":
        - img
        - img
    - link "manage my trips":
        - /url: /login?redirect=/trips/create
        - button "manage my trips":
            - img
            - text: manage my trips
- text: create an account join withme.travel and start planning adventures with friends name
- textbox "name"
- text: email
- textbox "email"
- text: password
- textbox "password"
- button:
    - img
- button "create account"
- text: or continue with
- button "sign up with google"
- paragraph:
    - text: By creating an account, you agree to our Terms of Service and Privacy Policy. Already have an account?
    - link "sign in":
        - /url: /login
- text: ✨
- heading "No-frills planning" [level=3]
- paragraph: Simple tools, clean interface
- text: 👋
- heading "Better with friends" [level=3]
- paragraph: Collaborate in real-time
- text: 🚀
- heading "Easy to use" [level=3]
- paragraph: Start planning in seconds
- contentinfo:
    - text: 🤝 withme.travel
    - paragraph: Plan trips with friends without the chaos. Make group travel fun again.
    - heading "Continents" [level=3]
    - list:
        - listitem:
            - link "africa":
                - /url: /continents/africa
        - listitem:
            - link "asia":
                - /url: /continents/asia
        - listitem:
            - link "europe":
                - /url: /continents/europe
        - listitem:
            - link "north america":
                - /url: /continents/north-america
        - listitem:
            - link "south america":
                - /url: /continents/south-america
        - listitem:
            - link "oceania":
                - /url: /continents/oceania
    - list:
        - listitem:
            - link "Destinations":
                - /url: /destinations
        - listitem:
            - link "Itineraries":
                - /url: /itineraries
        - listitem:
            - link "Plan a Trip":
                - /url: /trips/create
        - listitem:
            - link "Support Us":
                - /url: /support
        - listitem:
            - link "Terms of Service":
                - /url: /terms
        - listitem:
            - link "Privacy Policy":
                - /url: /privacy
    - paragraph: © 2025 withme.travel. all rights reserved.
    - link "Twitter":
        - /url: https://twitter.com/withmetravel
        - text: Twitter
        - img
    - link "Instagram":
        - /url: https://instagram.com/withmetravel
        - text: Instagram
        - img
- paragraph:
    - text: We use cookies to enhance your experience on our site. They help us understand how you use our site and personalize content. By continuing to use withme.travel, you agree to our
    - link "privacy policy":
        - /url: /privacy
    - text: .
- button "Accept Cookies"
- button "Close":
    - img
    - text: Close
- region "Notifications (F8)":
    - list
- text: Auth Debugger
- img
- text: Logged out
- button:
    - img
- tablist:
    - tab "Auth State" [selected]
    - tab "Tokens"
    - tab "Requests"
    - tab "Errors"
    - tab "Cookies"
- tabpanel "Auth State":
    - text: 'Status: Not authenticated User ID: None Email: None Profile ID: None Hydrated: Yes Session: None'
    - button "Refresh":
        - img
        - text: Refresh
    - button "Logout + Clear":
        - img
        - text: Logout + Clear
- alert
- button "Open Next.js Dev Tools":
    - img
- button "Open issues overlay": 1 Issue
- button "Collapse issues badge":
    - img
```

# Test source

```ts
   90 |     await page.goto('/login');
   91 |     await page.waitForLoadState('networkidle');
   92 |
   93 |     // Find and click the submit button (the one that's not the Google sign-in button)
   94 |     await page.locator('button[type="submit"]:has-text("sign in")').click();
   95 |
   96 |     // Wait for form validation errors to appear
   97 |     await page.waitForTimeout(500);
   98 |
   99 |     // Either a browser validation error will show or a custom error message
  100 |     // Let's check if form validation prevents submission first
  101 |     const emailInput = page.locator('input[name="email"]');
  102 |     const isEmailValid = await emailInput.evaluate(el => el.validity.valid);
  103 |
  104 |     if (!isEmailValid) {
  105 |       console.log('Browser validation caught empty email');
  106 |     } else {
  107 |       // If browser validation didn't catch it, look for custom error text
  108 |       await expect(page.locator('.text-destructive')).toBeVisible();
  109 |     }
  110 |   });
  111 |
  112 |   test('shows error for invalid credentials', async ({ page }) => {
  113 |     await page.goto('/login');
  114 |     await page.waitForLoadState('networkidle');
  115 |
  116 |     // Fill the form with invalid credentials
  117 |     await page.locator('input[name="email"]').fill(INVALID_EMAIL);
  118 |     await page.locator('input[name="password"]').fill(INVALID_PASSWORD);
  119 |
  120 |     // Submit the form
  121 |     await page.locator('button[type="submit"]:has-text("sign in")').click();
  122 |
  123 |     // Look for the error message - most likely in a div with role="alert"
  124 |     await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
  125 |   });
  126 |
  127 |   test('redirects after successful login', async ({ page }) => {
  128 |     // Skip this test if no valid credentials are provided
  129 |     test.skip(!process.env.TEST_EMAIL || !process.env.TEST_PASSWORD,
  130 |       'Skipped because no valid test credentials provided (use TEST_EMAIL and TEST_PASSWORD env vars)');
  131 |
  132 |     await page.goto('/login');
  133 |     await page.waitForLoadState('networkidle');
  134 |
  135 |     // Fill the form with valid credentials
  136 |     await page.locator('input[name="email"]').fill(TEST_EMAIL);
  137 |     await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  138 |
  139 |     // Submit the form
  140 |     await page.locator('button[type="submit"]:has-text("sign in")').click();
  141 |
  142 |     // Wait for navigation - we know from login-form.tsx that it redirects to whatever is in redirectPath
  143 |     // or defaults to '/' - so check for any navigation away from login
  144 |     await expect(page).not.toHaveURL(/login/, { timeout: 10000 });
  145 |   });
  146 |
  147 |   test('toggles password visibility', async ({ page }) => {
  148 |     await page.goto('/login');
  149 |     await page.waitForLoadState('networkidle');
  150 |
  151 |     // Check that password is initially hidden
  152 |     const passwordInput = page.locator('input[name="password"]');
  153 |     expect(await passwordInput.getAttribute('type')).toBe('password');
  154 |
  155 |     // Click the eye icon button (it's inside the password input container)
  156 |     await page.locator('button.right-0').click();
  157 |
  158 |     // Check that password is now visible
  159 |     expect(await passwordInput.getAttribute('type')).toBe('text');
  160 |
  161 |     // Click again to hide
  162 |     await page.locator('button.right-0').click();
  163 |
  164 |     // Check that password is hidden again
  165 |     expect(await passwordInput.getAttribute('type')).toBe('password');
  166 |   });
  167 |
  168 |   test('navigates to forgot password page', async ({ page }) => {
  169 |     await page.goto('/login');
  170 |     await page.waitForLoadState('networkidle');
  171 |
  172 |     // Click the forgot password link
  173 |     await page.locator('a:has-text("forgot password?")').click();
  174 |
  175 |     // Check that we're navigated to the forgot password page
  176 |     await expect(page).toHaveURL(/forgot-password/);
  177 |   });
  178 | });
  179 |
  180 | // Update registration flow tests with more reliable selectors
  181 | test.describe('Registration Flow', () => {
  182 |   test('shows registration form', async ({ page }) => {
  183 |     await page.goto('/signup');
  184 |     await page.waitForLoadState('networkidle');
  185 |
  186 |     // Debug: take screenshot for inspection
  187 |     await page.screenshot({ path: 'test-results/signup-page-debug.png' });
  188 |
  189 |     // Look for any heading that might indicate signup form with more flexibility
> 190 |     await expect(page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /sign up|create|register|account/i })).toBeVisible();
      |                                                                                                                  ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  191 |
  192 |     // Check for form inputs more generically
  193 |     await expect(page.locator('input[type="email"]')).toBeVisible();
  194 |     await expect(page.locator('input[type="password"]')).toBeVisible();
  195 |
  196 |     // Look for submit button that likely contains signup text
  197 |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  198 |   });
  199 |
  200 |   // Add more registration tests as needed
  201 | });
```
