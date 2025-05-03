import { type ENUMS } from '@/utils/constants/database';

// Re-export the PresenceStatus type from database constants
export type PresenceStatus = (typeof ENUMS.PRESENCE_STATUS)[keyof typeof ENUMS.PRESENCE_STATUS];

export interface CursorPosition {
  x: number;
  y: number;
  timestamp: number;
}

// Basic user presence interface
export interface UserPresence {
  user_id: string;
  status: PresenceStatus;
  editing_item_id?: string | null;
  cursor_position?: CursorPosition | null;
  page_path?: string | null;
  last_active?: string; // ISO timestamp
  id?: string;
  trip_id?: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  // Added to satisfy requirements of various parts of the app
  [key: string]: any;
}

// Extended user presence with profile information
export interface ExtendedUserPresence extends UserPresence {
  email?: string;
  username?: string;
}

// Type for user presence from imports
export interface ImportedUserPresence extends UserPresence {
  profiles?: {
    name: string | null;
    email: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
}

export interface TripSection {
  id: string;
  name: string;
  path: string;
}

export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'reconnecting';

export interface PresenceContextType {
  activeUsers: UserPresence[];
  myPresence: UserPresence | null;
  status: PresenceStatus;
  error: Error | null;
  isLoading: boolean;
  isCleaningUp: boolean;
  connectionState: ConnectionState;
  startEditing: (itemId: string) => void;
  stopEditing: () => void;
  setStatus: (status: PresenceStatus) => void;
  isEditing: boolean;
  editingItemId: string | null;
  recoverPresence: () => Promise<void>;
}
