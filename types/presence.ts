import { PresenceStatus } from "@/utils/constants/database";

export interface CursorPosition {
  x: number;
  y: number;
  timestamp?: number;
}

// Basic user presence interface
export interface UserPresence {
  id: string;
  user_id: string; 
  trip_id: string;
  status: PresenceStatus;
  last_active: string;
  document_id?: string;
  editing_item_id?: string;
  cursor_position?: CursorPosition;
  page_path?: string;
}

// Extended user presence with profile information
export interface ExtendedUserPresence extends UserPresence {
  name?: string;
  email?: string;
  avatar_url?: string;
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

export type ConnectionState = 'connected' | 'connecting' | 'disconnected';

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

