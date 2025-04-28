import { NextResponse } from 'next/server'
import { DB_TABLES } from '@/utils/constants/database'
import type { Database } from '@/types/database.types'
import { cookies } from 'next/headers'
import { headers } from 'next/headers'
import { rateLimit } from '@/utils/middleware/rate-limit'
import { validateRequestCsrfToken } from '@/utils/csrf'
import { sanitizeAuthCredentials } from '@/utils/sanitize'
import { validateRequestMiddleware, loginSchema } from '@/utils/validation'
import { EmailService } from '@/lib/services/email-service'
import { UAParser } from 'ua-parser-js'
import { createApiClient } from '@/utils/supabase/server'

// Rate limiting configuration for login attempts
// 10 attempts per minute per IP address
const loginRateLimiter = rateLimit({
  limit: 10,
  windowMs: 60, // 1 minute
});

// Function to check if the login is suspicious based on IP and user agent
async function isSuspiciousLogin(
  supabase: any, 
  userId: string, 
  ipAddress: string, 
  userAgent: string
): Promise<boolean> {
  try {
    // Check if we have previous login records for this user
    const { data: loginHistory, error } = await supabase
      .from(DB_TABLES.USER_LOGIN_HISTORY || 'user_login_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error || !loginHistory || loginHistory.length === 0) {
      // First login or error retrieving data - not suspicious yet
      // But we should record this login
      return false;
    }
    
    // Check if this IP has been used before by the user
    const knownIp = loginHistory.some(record => record.ip_address === ipAddress);
    
    // If it's a new IP, then consider it suspicious
    return !knownIp;
  } catch (err) {
    console.error('Error checking suspicious login:', err);
    // If there's an error, we can't determine if it's suspicious
    // Better to be safe and return false to avoid false positives
    return false;
  }
}

// Record the login in the user's login history
async function recordLoginAttempt(
  supabase: any, 
  userId: string, 
  ipAddress: string, 
  userAgent: string, 
  success: boolean
): Promise<void> {
  try {
    // Parse user agent to get browser and device info
    const parser = new UAParser(userAgent);
    const browserInfo = parser.getBrowser();
    const deviceInfo = parser.getDevice();
    const osInfo = parser.getOS();
    
    // Insert login record
    await supabase
      .from(DB_TABLES.USER_LOGIN_HISTORY || 'user_login_history')
      .insert({
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        browser: `${browserInfo.name || 'Unknown'} ${browserInfo.version || ''}`,
        device: deviceInfo.model ? `${deviceInfo.vendor || ''} ${deviceInfo.model || ''}` : 'Unknown',
        os: `${osInfo.name || 'Unknown'} ${osInfo.version || ''}`,
        success: success
      });
  } catch (err) {
    // Don't fail the login process if recording fails
    console.error('Error recording login attempt:', err);
  }
}

// Handler for login requests after validation
async function loginHandler(request: Request, validatedData: { email: string; password: string }) {
  const requestUrl = new URL(request.url)
  
  // Apply rate limiting to login requests
  const rateLimitResult = await loginRateLimiter(request as any);
  if (rateLimitResult) {
    // Rate limit was hit, return the error response
    return rateLimitResult;
  }
  
  // Validate CSRF token
  if (!validateRequestCsrfToken(request)) {
    console.error('CSRF token validation failed for login attempt');
    return NextResponse.json({ error: "Invalid security token" }, { status: 403 });
  }

  // Get IP address and user agent
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';
  
  // Use the validated and sanitized data
  const { email, password } = sanitizeAuthCredentials(validatedData);

  try {
    // Create a Supabase client with the route handler configuration
    const supabase = await createApiClient();

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Log the specific Supabase error for debugging
      console.error("Supabase Sign In Error:", error.message);
      
      // Record the failed login attempt if we can identify the user
      if (error.message.includes("Invalid login credentials")) {
        // Try to find the user by email to record the failed attempt
        const { data: userData } = await supabase
          .from(DB_TABLES.PROFILES)
          .select('id')
          .eq('email', email)
          .maybeSingle();
          
        if (userData?.id) {
          await recordLoginAttempt(supabase, userData.id, ipAddress, userAgent, false);
        }
      }
      
      // Provide a more specific error message based on the error type
      let clientErrorMessage = "Invalid login credentials";
      let statusCode = 401;
      
      if (error.message.includes("Email not confirmed")) {
        clientErrorMessage = "Email not confirmed. Please check your inbox to verify your account.";
      } else if (error.message.includes("Invalid login credentials")) {
        clientErrorMessage = "Invalid email or password. Please try again.";
      } else if (error.message.includes("rate limit")) {
        clientErrorMessage = "Too many login attempts. Please try again later.";
        statusCode = 429; // Too Many Requests
      }
      
      return NextResponse.json({ error: clientErrorMessage }, { status: statusCode });
    }

    // Check if we actually got a valid user and session
    if (!data.user || !data.session) {
      console.error("API Login: Authentication succeeded but missing user or session data");
      return NextResponse.json({ 
        error: "Authentication succeeded but session could not be established" 
      }, { status: 500 });
    }

    // Record successful login attempt
    await recordLoginAttempt(supabase, data.user.id, ipAddress, userAgent, true);
    
    // Check if this is a suspicious login 
    const suspicious = await isSuspiciousLogin(supabase, data.user.id, ipAddress, userAgent);
    
    // If suspicious, send notification email
    if (suspicious) {
      console.log(`Suspicious login detected for user ${data.user.id}`);
      
      // Parse user agent for better display
      const parser = new UAParser(userAgent);
      const browserInfo = parser.getBrowser();
      const browserName = `${browserInfo.name || 'Unknown'} ${browserInfo.version || ''}`;
      
      // Format date in a user-friendly way
      const loginTime = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium'
      });
      
      // Send notification email
      EmailService.sendSuspiciousLoginNotification({
        to: data.user.email || email,
        name: data.user.user_metadata?.name,
        ipAddress,
        browser: browserName,
        loginTime,
        supportEmail: 'support@withme.travel'
      }).catch(err => {
        console.error('Failed to send suspicious login notification:', err);
      });
    }

    // Log successful login
    console.log(`API Login: User ${data.user.id} successfully authenticated`);

    // Explicitly refresh the session to ensure cookies are properly set
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session refresh error:", sessionError.message);
      return NextResponse.json({ error: "Failed to establish session" }, { status: 500 });
    }

    // Fetch user profile to return along with auth data
    let profileData = null;
    try {
      const { data: profile, error: profileError } = await supabase
        .from(DB_TABLES.PROFILES)
        .select('id, name, avatar_url, username, is_admin')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profileError && profile) {
        profileData = profile;
      }
    } catch (profileError) {
      console.warn("API Login: Error fetching profile after successful login:", profileError);
      // Continue even if profile fetch fails - don't fail the login
    }

    // Return user, session, and profile data to help client-side state management
    return NextResponse.json({ 
      success: true,
      message: "Successfully authenticated",
      user: data.user,
      session: sessionData.session,
      profile: profileData
    }, { status: 200 });

  } catch (error: any) {
    console.error("API Login Route Error:", error); // Log unexpected errors
    return NextResponse.json({ error: "An unexpected error occurred during login" }, { status: 500 });
  }
}

// Export the POST handler with validation middleware
export const POST = validateRequestMiddleware(loginSchema, loginHandler);
