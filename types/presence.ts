/**
 * Types for presence features in the application
 */

// Connection status types
export type ConnectionState = 'connected' | 'disconnected' | 'connecting';

export type UserPresenceStatus = 'online' | 'offline' | 'away' | 'editing';

// Base user presence interface
export interface UserPresence {
  user_id: string;
  trip_id: string;
  status: UserPresenceStatus;
  last_active: string;
  name?: string;
  email?: string;
  avatar_url?: string | null;
}

// Extended user presence with additional properties
export interface ExtendedUserPresence extends UserPresence {
  editing_item_id?: string | null;
  cursor_position?: { x: number; y: number } | null;
  page_path?: string;
}

// User presence with imported flag
export interface ImportedUserPresence extends UserPresence {
  imported?: boolean;
}

// Presence context type that provides presence data and methods
export interface PresenceContextType {
  activeUsers: (UserPresence | ExtendedUserPresence)[];
  myPresence: ExtendedUserPresence | null;
  connectionState: ConnectionState;
  error: Error | null;
  recoverPresence: () => Promise<void>;
}