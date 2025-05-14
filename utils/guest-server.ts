'use server';

import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import type { GuestInfo } from '@/types/group-ideas';

/**
 * Server-side helper functions for working with guest users
 */

/**
 * Get guest token from server-side cookie
 */
export async function getGuestTokenServer(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('guest_token')?.value || null;
  } catch (error) {
    console.error('Error getting server guest token:', error);
    return null;
  }
}

/**
 * Set guest token in server-side cookie
 */
export async function setGuestTokenServer(token: string | null = null): Promise<string> {
  const guestToken = token || uuidv4();

  try {
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'guest_token',
      value: guestToken,
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
  } catch (error) {
    console.error('Error setting server guest token:', error);
  }

  return guestToken;
}

/**
 * Clear guest token from server-side cookie
 */
export async function clearGuestTokenServer(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('guest_token');
  } catch (error) {
    console.error('Error clearing server guest token:', error);
  }
}

/**
 * Get guest info from a token (server-side implementation)
 */
export async function getGuestInfoServer(token: string): Promise<GuestInfo | null> {
  if (!token) return null;

  // For now, just return a minimal guest info object
  // In a production implementation, you might fetch from a database
  return {
    token: token,
    name: `Guest-${token.substring(0, 6)}`,
  };
}
