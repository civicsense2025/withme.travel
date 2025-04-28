export type PresenceStatus = 'online' | 'away' | 'offline' | 'editing';

export interface CursorPosition {
  x: number;
  y: number;
  timestamp?: number;
}

export interface UserPresence {
  id: string;
  user_id: string;
  trip_id: string;
  status: PresenceStatus;
  last_active: string;
  cursor_position?: CursorPosition | null;
  editing_item_id?: string | null;
  page_path?: string | null;
  created_at?: string;
  updated_at?: string;
  // Additional user details from joins
  name?: string | null;
  avatar_url?: string | null;
  email?: string | null;
  profiles?: {
    name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
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

