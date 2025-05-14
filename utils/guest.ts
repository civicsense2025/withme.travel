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
 * Client-side utilities for guest token management
 */
export const clientGuestUtils = {
  /**
   * Get guest token from localStorage
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('guest_token');
  },

  /**
   * Set guest token in localStorage
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('guest_token', token);
  },

  /**
   * Remove guest token from localStorage
   */
  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('guest_token');
  },

  /**
   * Check if current user is a guest (has token but not authenticated)
   */
  isGuest(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('guest_token');
  },
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
