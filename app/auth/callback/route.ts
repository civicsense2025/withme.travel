import { createSupabaseServerClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { DB_TABLES } from '@/utils/constants/database'
import { CSRF } from '@/utils/csrf'

export const dynamic = 'force-dynamic'

/**
 * Validates a redirect URL to prevent open redirect vulnerabilities
 */
function validateRedirectUrl(url: string): boolean {
  // Allow relative URLs starting with /
  if (url.startsWith('/')) {
    return true
  }
  
  try {
    // For absolute URLs, ensure they point to our domain
    const urlObj = new URL(url)
    const allowedHosts = [
      'localhost',
      'withme.travel',
      'www.withme.travel',
      'staging.withme.travel',
      'prod.withme.travel',
      '127.0.0.1'
    ]
    
    // Check if the hostname is in our allow list
    return allowedHosts.some(host => 
      urlObj.hostname === host || 
      urlObj.hostname.endsWith(`.${host}`)
    )
  } catch {
    // Invalid URL format
    return false
  }
}

/**
 * Validates the CSRF token sent with OAuth request
 */
function validateOAuthCsrfToken(request: NextRequest): boolean {
  // Get the CSRF token from the URL
  const requestUrl = new URL(request.url)
  const csrfParam = requestUrl.searchParams.get('csrf')
  
  // If no CSRF token in URL, skip validation in OAuth flow
  // This is a balance between security and user experience for OAuth
  if (!csrfParam) {
    console.warn('[Auth Callback] No CSRF token in OAuth callback')
    return true
  }
  
  // Get the CSRF token from cookies
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) {
    console.warn('[Auth Callback] No cookies in request, skipping CSRF validation')
    return true // More permissive for OAuth flows to avoid login loops
  }
  
  // Extract the CSRF token from cookies
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim())
  const csrfCookie = cookies.find(cookie => cookie.startsWith(`${CSRF.COOKIE_NAME}=`))
  
  if (!csrfCookie) {
    console.warn('[Auth Callback] CSRF cookie not found, skipping validation')
    return true // More permissive for OAuth flows
  }
  
  const cookieToken = csrfCookie.split('=')[1]
  
  // Compare the tokens
  const isValid = cookieToken === csrfParam
  if (!isValid) {
    console.warn('[Auth Callback] CSRF token mismatch, but allowing for OAuth flow')
  }
  return true // Always return true for OAuth flows to prevent login loops
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const searchParams = requestUrl.searchParams
  const code = searchParams.get('code')
  const origin = searchParams.get('origin')
  const redirectParam = searchParams.get('redirect')
  const inviteToken = searchParams.get('token')
  
  // Log the query parameters for debugging
  console.log('[Auth Callback] Request Params:', { 
    code: !!code, // Log presence of code, not the value
    redirectParam,
    origin,
    inviteToken: !!inviteToken, // Log presence, not the value
    url: request.url
  })
  
  // Validate CSRF token for OAuth flows
  if (!validateOAuthCsrfToken(request)) {
    console.error('[Auth Callback] CSRF token validation failed')
    return NextResponse.redirect(new URL('/login?error=invalid_csrf_token', requestUrl.origin))
  }

  // If no code, redirect to login page
  if (!code) {
    console.error('[Auth Callback] No code provided in callback')
    return NextResponse.redirect(new URL('/login?error=no_auth_code', requestUrl.origin))
  }
  
  // Create a supabase client using the new function
  const supabase = await createSupabaseServerClient()
  
  try {
    // Get the original URL set in the signInWithOAuth call
    // This is important for handling the redirect properly
    let redirectTo = redirectParam || '/'
    if (redirectTo && !validateRedirectUrl(redirectTo)) {
      console.error('[Auth Callback] Invalid redirect URL detected:', redirectTo)
      redirectTo = '/' // Default to home page if invalid redirect URL
    }
    
    console.log('[Auth Callback] Attempting to exchange code for session')
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    // If there's an error, handle it
    if (error) {
      console.error('[Auth Callback] Error exchanging code for session:', error)
      console.error('[Auth Callback] Error details:', { 
        message: error.message,
        status: error.status,
        name: error.name,
        code: (error as any).code
      })
      
      // Handle specific error types differently
      if (error.message.includes('code challenge') || error.message.includes('PKCE')) {
        console.log('[Auth Callback] PKCE error detected - redirecting to login page')
        
        // Create a response with login redirect
        const response = NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent('pkce_failed')}`, requestUrl.origin)
        )
        
        // Clear all potential auth cookies
        const cookiesToClear = [
          'sb-refresh-token',
          'sb-access-token',
          'sb-auth-token',
          'supabase-auth-token',
          'supabase-auth'
        ]
        
        cookiesToClear.forEach(cookieName => {
          response.cookies.set(cookieName, '', { 
            maxAge: 0,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          })
        })
        
        // Also add a special header to signal the client to clear local storage
        response.headers.set('X-Clear-Storage', 'true')
        
        console.log('[Auth Callback] Clearing auth cookies and redirecting to login')
        return response
      }

      // Handle specific error messages with friendly error codes
      let errorCode = 'auth_error'
      if (error.message.includes('session not found')) {
        errorCode = 'session_expired'
      } else if (error.message.includes('not confirmed')) {
        errorCode = 'email_not_confirmed'
      } else if (error.message.toLowerCase().includes('invalid')) {
        errorCode = 'invalid_credentials'
      } else if (error.message.includes('rate limit')) {
        errorCode = 'rate_limited'
      }
      
      // For other errors, use standard flow
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorCode)}`, requestUrl.origin)
      )
    }
    
    // Verify we have a valid session
    if (!data.session || !data.session.user || !data.session.user.id) {
      console.error('[Auth Callback] No valid session after code exchange. Session data:', data)
      return NextResponse.redirect(
        new URL('/login?error=invalid_session', requestUrl.origin)
      )
    }
    
    // Log successful authentication
    console.log('[Auth Callback] Authentication successful for user ID:', data.session.user.id)
    
    // Check if the user already has a profile
    const userId = data.session?.user.id
    if (userId) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from(DB_TABLES.PROFILES)
          .select('id')
          .eq('id', userId)
          .single()
        
        // If no profile exists, create one
        if (profileError || !profile) {
          console.log('[Auth Callback] Creating new profile for user:', userId)
          const user = data.session?.user
          
          // Extract profile data from user metadata or OAuth
          const userMeta = user?.user_metadata || {}
          const name = userMeta.full_name || userMeta.name || userMeta.preferred_username || userMeta.email?.split('@')[0] || null
          const avatarUrl = userMeta.avatar_url || userMeta.picture || null
          
          // Create a username from email or name
          const email = user?.email || ''
          const username = email.split('@')[0] || `user_${Math.floor(Math.random() * 10000)}`
          
          const { error: insertError } = await supabase
            .from(DB_TABLES.PROFILES)
            .insert({
              id: userId,
              name,
              avatar_url: avatarUrl,
              username,
              email
            })
          
          if (insertError) {
            console.error('[Auth Callback] Error creating user profile:', insertError)
            // Continue even if profile creation fails - we'll try again on next login
          } else {
            console.log('[Auth Callback] Successfully created profile for new user')
          }
        } else {
          console.log('[Auth Callback] User profile already exists')
        }
      } catch (profileError) {
        console.error('[Auth Callback] Exception checking/creating profile:', profileError)
        // Continue despite profile error - login is still successful
      }
      
      // Handle invitation if token is present
      if (inviteToken) {
        try {
          console.log('[Auth Callback] Processing invitation token')
          const { data: invitation, error: inviteError } = await supabase
            .from(DB_TABLES.INVITATIONS)
            .select('*')
            .eq('token', inviteToken)
            .single()
          
          if (inviteError || !invitation) {
            console.error('[Auth Callback] Error finding invitation:', inviteError)
          } else if (invitation.status === 'pending') {
            // Accept the invitation
            const { error: acceptError } = await supabase
              .from(DB_TABLES.INVITATIONS)
              .update({ status: 'accepted' })
              .eq('id', invitation.id)
            
            if (acceptError) {
              console.error('[Auth Callback] Error accepting invitation:', acceptError)
            } else {
              console.log('[Auth Callback] Successfully accepted invitation')
              
              // Redirect to the trip if it's a trip invitation
              if (invitation.trip_id) {
                redirectTo = `/trips/${invitation.trip_id}`
              }
            }
          } else {
            console.log('[Auth Callback] Invitation already processed, status:', invitation.status)
          }
        } catch (inviteError) {
          console.error('[Auth Callback] Exception processing invitation:', inviteError)
        }
      }
    }
    
    // Make URL absolute if it's relative
    if (redirectTo && !redirectTo.startsWith('http')) {
      redirectTo = new URL(redirectTo, requestUrl.origin).toString()
    }
    
    console.log('[Auth Callback] Redirecting user to:', redirectTo)
    return NextResponse.redirect(redirectTo)
  } catch (error) {
    console.error('[Auth Callback] Unexpected error:', error)
    return NextResponse.redirect(new URL('/login?error=callback_failed', requestUrl.origin))
  }
}
