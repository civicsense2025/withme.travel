/// <reference types="next" />
/// <reference types="next/types/global" />

// Only keep essential module declarations that are actually used
declare module '@/lib/utils' {
  export function cn(...inputs: (string | undefined | null | boolean | Record<string, boolean>)[]): string;
  export function formatDate(date: Date | string | number): string;
}

declare module '@/lib/auth/supabase' {
  import { SupabaseClient, Session } from '@supabase/supabase-js';
  export function createClient(): SupabaseClient;
  export function getSession(): Promise<Session | null>;
}

// Remove wildcard module declarations as they can cause issues
// Remove shadcn component declarations - these should come from their own types
// Remove JSX namespace extension as it's not needed with modern Next.js

// Simplified project-specific types
interface User {
  id: string;
  email?: string;
  name?: string;
}

interface Trip {
  id: string;
  title: string;
  description?: string;
  created_at: string;
}

interface Destination {
  id: string;
  name: string | null;
}

// Database types for Supabase
declare namespace Database {
  interface Tables {
    users: User;
    trips: Trip;
    destinations: Destination;
  }
}