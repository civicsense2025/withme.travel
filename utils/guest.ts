import { v4 as uuidv4 } from 'uuid';
import type { GuestInfo } from '@/types/group-ideas';

/**
 * Helper functions for working with guest users
 */

/**
 * Check if a guest token exists in cookies - safe for server components
 * Must be used in an async context
 */
export async function getGuestToken(): Promise<string | null> {
  try {
    // Only import and use server-side cookies when in a server context
    if (typeof window === 'undefined') {
      // Dynamic import to prevent errors in client components
      const { cookies } = require('next/headers');
      // Get the cookie value - cookies() must be awaited in Next.js
      const cookieStore = await cookies();
      return cookieStore.get('guest_token')?.value || null;
    } else {
      // Client-side fallback using browser cookies
      return (
        document.cookie
          .split('; ')
          .find((row) => row.startsWith('guest_token='))
          ?.split('=')[1] || null
      );
    }
  } catch (error) {
    console.error('Error getting guest token:', error);
    return null;
  }
}

/**
 * Set a guest token in cookies - safe for server components
 * Must be used in an async context
 */
export function setGuestToken(token: string | null = null): string {
  // Use existing token or generate a new one
  const guestToken = token || uuidv4();

  try {
    // Server-side vs. client-side cookie setting
    if (typeof window === 'undefined') {
      // Dynamic import for server-side
      const { cookies } = require('next/headers');
      // Get the cookie store
      cookies().set({
        name: 'guest_token',
        value: guestToken,
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
    } else {
      // Client-side cookie setting
      const expires = new Date();
      expires.setDate(expires.getDate() + 30); // 30 days
      document.cookie = `guest_token=${guestToken}; path=/; expires=${expires.toUTCString()}; ${
        window.location.protocol === 'https:' ? 'secure; ' : ''
      }`;
    }

    return guestToken;
  } catch (error) {
    console.error('Error setting guest token:', error);
    return guestToken;
  }
}

/**
 * Get guest user info from a token
 */
export function getGuestInfo(token: string): GuestInfo | null {
  if (!token) return null;

  // For now, just return a minimal guest info object
  // In a real implementation, you might store guest info in a database
  return {
    token: token,
    name: `Guest-${token.substring(0, 6)}`,
    // avatar_url is optional, so we can omit it
  };
}

/**
 * Clear guest token from cookies
 * Must be used in an async context
 */
export function clearGuestToken(): void {
  try {
    if (typeof window === 'undefined') {
      // Server-side
      const { cookies } = require('next/headers');
      cookies().delete('guest_token');
    } else {
      // Client-side
      document.cookie = 'guest_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  } catch (error) {
    console.error('Error clearing guest token:', error);
  }
}

/**
 * Utility functions for handling guest users and tokens
 * This provides a consistent interface for managing guest state across the application
 */

const GUEST_TOKEN_KEY = 'withme_guest_token';
const GUEST_NAME_KEY = 'withme_guest_name';
const USER_TESTING_COHORT_KEY = 'withme_user_testing_cohort';

/**
 * Guest user utilities for client-side usage
 * Handles anonymous users, guest tokens, and user testing sessions
 */
const clientGuestUtils = {
  /**
   * Store a guest token in localStorage
   */
  setToken: (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(GUEST_TOKEN_KEY, token);
  },

  /**
   * Get the current guest token from localStorage
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(GUEST_TOKEN_KEY);
  },

  /**
   * Clear the guest token from localStorage
   */
  clearToken: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GUEST_TOKEN_KEY);
  },
  
  /**
   * Set a user testing cohort in localStorage
   */
  setCohort: (cohort: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_TESTING_COHORT_KEY, cohort);
  },
  
  /**
   * Get the current user testing cohort from localStorage
   */
  getCohort: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(USER_TESTING_COHORT_KEY);
  },

  /**
   * Set a guest display name
   */
  setName: (name: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(GUEST_NAME_KEY, name);
  },

  /**
   * Get the current guest display name
   */
  getName: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(GUEST_NAME_KEY);
  },
  
  /**
   * Check if the user has an active user testing session
   * First checks localStorage, then falls back to API check if user is authenticated
   */
  hasActiveSession: async (): Promise<boolean> => {
    // First check localStorage for a token
    const token = clientGuestUtils.getToken();
    if (token) {
      try {
        // Validate the token by calling the API
        const response = await fetch(`/api/research/user-testing-session/${token}`);
        
        // If successful, refresh the cohort information
        if (response.ok) {
          const data = await response.json();
          if (data.session?.cohort) {
            clientGuestUtils.setCohort(data.session.cohort);
          }
          return true;
        }
        
        // Token exists but is invalid - clear it
        if (response.status === 404) {
          clientGuestUtils.clearToken();
        }
        
        return false;
      } catch (error) {
        console.error('Error checking session token:', error);
        // Don't clear token on network errors, might be temporary
        return false;
      }
    }
    
    // No token in localStorage, check if user is logged in and has a session
    try {
      const response = await fetch('/api/research/user-testing-session');
      
      if (response.ok) {
        const data = await response.json();
        
        // If user has a session, store the token for future use
        if (data.session?.token) {
          clientGuestUtils.setToken(data.session.token);
          
          // Also store cohort if available
          if (data.session?.cohort) {
            clientGuestUtils.setCohort(data.session.cohort);
          }
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking user session:', error);
      return false;
    }
  },
  
  /**
   * Fetch the user testing session details including cohort
   * Uses either localStorage token or authenticated user session
   */
  getSession: async () => {
    try {
      const token = clientGuestUtils.getToken();
      let url = '/api/research/user-testing-session';
      
      // If token exists in localStorage, use it to fetch the session
      if (token) {
        url = `${url}/${token}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }
      
      const data = await response.json();
      
      // Update localStorage with latest token and cohort
      if (data.session?.token) {
        clientGuestUtils.setToken(data.session.token);
      }
      
      if (data.session?.cohort) {
        clientGuestUtils.setCohort(data.session.cohort);
      }
      
      return data.session;
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  },
  
  /**
   * Renew an expired user testing session token
   */
  renewSession: async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/research/user-testing-session/${token}/renew`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      
      // Update localStorage with renewed token
      if (data.session?.token) {
        clientGuestUtils.setToken(data.session.token);
        
        // Also store cohort if available
        if (data.session?.cohort) {
          clientGuestUtils.setCohort(data.session.cohort);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error renewing session:', error);
      return false;
    }
  }
};

/**
 * Generate temporary guest info with a name
 */
export function generateGuestInfo(token: string | null = null): GuestInfo {
  const guestToken = token || uuidv4();

  return {
    token: guestToken,
    name: `Guest-${guestToken.substring(0, 6)}`,
  };
}

/**
 * Generate a client-side storage key for guest data
 */
export function getGuestStorageKey(groupId: string): string {
  return `withme:guest:${groupId}`;
}

/**
 * Creates a function to set app.guest_token setting in Supabase
 */
export function createSetGuestTokenFunction(supabase: any) {
  return async (token: string) => {
    if (!token) return;

    try {
      await supabase.rpc('set_app_setting', {
        setting_name: 'app.guest_token',
        setting_value: token,
      });
      return true;
    } catch (error) {
      console.error('Error setting guest token in Supabase:', error);
      return false;
    }
  };
}

/**
 * Client-side function to save guest info in localStorage
 */
export function storeGuestLocally(groupId: string, guestInfo: GuestInfo): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getGuestStorageKey(groupId);
    localStorage.setItem(key, JSON.stringify(guestInfo));
  } catch (error) {
    console.error('Error storing guest info locally:', error);
  }
}

/**
 * Client-side function to retrieve guest info from localStorage
 */
export function getLocalGuestInfo(groupId: string): GuestInfo | null {
  if (typeof window === 'undefined') return null;

  try {
    const key = getGuestStorageKey(groupId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting local guest info:', error);
    return null;
  }
}

/**
 * Clear guest data on client side
 */
export function clearGuestData(groupId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getGuestStorageKey(groupId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing guest data:', error);
  }
}

// Server-side implementation might be needed for SSR contexts
export const serverGuestUtils = {
  // Server-side implementations would go here
};

export default clientGuestUtils;
