/**
 * CSRF Protection Utilities
 * 
 * This module provides functions for generating and validating CSRF tokens
 * to protect against cross-site request forgery attacks.
 */

import { randomBytes, createHash } from 'crypto';

const CSRF_COOKIE_NAME = 'withme_csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const TOKEN_EXPIRY = 3600 * 1000; // 1 hour in milliseconds

interface CsrfToken {
  token: string;
  expires: number;
}

/**
 * Generate a secure CSRF token
 * 
 * @returns {CsrfToken} An object containing the token and expiration time
 */
export function generateCsrfToken(): CsrfToken {
  // Generate a random token
  const randomToken = randomBytes(32).toString('hex');
  
  // Set expiry time (current time + 1 hour)
  const expires = Date.now() + TOKEN_EXPIRY;
  
  // Create a hash of the token with the expiry time for validation
  const token = createHash('sha256')
    .update(`${randomToken}${expires}`)
    .digest('hex');
  
  return { token, expires };
}

/**
 * Create a secure same-site cookie value for the CSRF token
 * 
 * @param {CsrfToken} csrfToken - The CSRF token object
 * @returns {string} Cookie value string
 */
export function createCsrfCookie(csrfToken: CsrfToken): string {
  return `${CSRF_COOKIE_NAME}=${csrfToken.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${TOKEN_EXPIRY / 1000}; Secure`;
}

/**
 * Validate a CSRF token from a request
 * 
 * @param {string} cookieToken - Token from cookie
 * @param {string} headerToken - Token from request header
 * @returns {boolean} Whether the token is valid
 */
export function validateCsrfToken(cookieToken: string, headerToken: string): boolean {
  // If either token is missing, validation fails
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  // Simple comparison for now
  return cookieToken === headerToken;
}

/**
 * Server-side utility to extract and validate CSRF token from a request
 * 
 * @param {Request} request - The request object
 * @returns {boolean} Whether the CSRF token is valid
 */
export function validateRequestCsrfToken(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie');
  const csrfToken = request.headers.get(CSRF_HEADER_NAME);
  
  if (!cookieHeader || !csrfToken) {
    return false;
  }
  
  // Extract the CSRF token from cookies
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const csrfCookie = cookies.find(cookie => cookie.startsWith(`${CSRF_COOKIE_NAME}=`));
  
  if (!csrfCookie) {
    return false;
  }
  
  const cookieToken = csrfCookie.split('=')[1];
  
  return validateCsrfToken(cookieToken, csrfToken);
}

/**
 * Constants for client-side use
 */
export const CSRF = {
  COOKIE_NAME: CSRF_COOKIE_NAME,
  HEADER_NAME: CSRF_HEADER_NAME
}; 