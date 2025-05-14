import { Session, User } from '@supabase/supabase-js';
import { AuthError } from './errors';

// User profile interface
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Extended user type with profile
export interface AppUser extends User {
  profile: UserProfile | null;
}

// Auth state interface
export interface AuthState {
  session: Session | null;
  user: AppUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: AuthError | null;
  isRefreshing: boolean;
  lastRefresh: number | null;
}

// Auth action types
export type AuthAction =
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_USER'; payload: AppUser | null }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: AuthError | null }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_LAST_REFRESH'; payload: number }
  | { type: 'CLEAR_STATE' };

// Initial auth state
export const initialAuthState: AuthState = {
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  error: null,
  isRefreshing: false,
  lastRefresh: null,
};

// Auth state reducer
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_SESSION':
      return {
        ...state,
        session: action.payload,
        // Clear error when session is set
        error: action.payload ? null : state.error,
      };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        // Clear error when user is set
        error: action.payload ? null : state.error,
      };

    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isRefreshing: false,
      };

    case 'SET_REFRESHING':
      return {
        ...state,
        isRefreshing: action.payload,
        // Clear error when starting refresh
        error: action.payload ? null : state.error,
      };

    case 'SET_LAST_REFRESH':
      return {
        ...state,
        lastRefresh: action.payload,
      };

    case 'CLEAR_STATE':
      return {
        ...initialAuthState,
        isLoading: false,
      };

    default:
      return state;
  }
}

// Helper functions for state updates
export function createSetSessionAction(session: Session | null): AuthAction {
  return { type: 'SET_SESSION', payload: session };
}

export function createSetUserAction(user: AppUser | null): AuthAction {
  return { type: 'SET_USER', payload: user };
}

export function createSetProfileAction(profile: UserProfile | null): AuthAction {
  return { type: 'SET_PROFILE', payload: profile };
}

export function createSetLoadingAction(isLoading: boolean): AuthAction {
  return { type: 'SET_LOADING', payload: isLoading };
}

export function createSetErrorAction(error: AuthError | null): AuthAction {
  return { type: 'SET_ERROR', payload: error };
}

export function createSetRefreshingAction(isRefreshing: boolean): AuthAction {
  return { type: 'SET_REFRESHING', payload: isRefreshing };
}

export function createSetLastRefreshAction(timestamp: number): AuthAction {
  return { type: 'SET_LAST_REFRESH', payload: timestamp };
}

export function createClearStateAction(): AuthAction {
  return { type: 'CLEAR_STATE' };
}

// Type guard for checking if user has admin privileges
export function isAdmin(user: AppUser | null): boolean {
  return Boolean(user?.profile?.is_admin);
}

// Type guard for checking if user is authenticated
export function isAuthenticated(state: AuthState): boolean {
  return Boolean(state.session && state.user);
}

// Type guard for checking if session needs refresh
export function needsRefresh(state: AuthState): boolean {
  if (!state.session || !state.lastRefresh) {
    return false;
  }

  const refreshInterval = 5 * 60 * 1000; // 5 minutes
  return Date.now() - state.lastRefresh > refreshInterval;
}

// Helper to extract user data from session
export function extractUserFromSession(session: Session | null): User | null {
  return session?.user ?? null;
}

// Helper to create AppUser from User and Profile
export function createAppUser(user: User, profile: UserProfile | null): AppUser {
  return {
    ...user,
    profile,
  };
}

// Helper to check if state update is needed
export function needsStateUpdate(
  currentState: AuthState,
  newSession: Session | null,
  newUser: User | null
): boolean {
  // Check if session has changed
  const sessionChanged = Boolean(
    currentState.session?.access_token !== newSession?.access_token ||
      currentState.session?.refresh_token !== newSession?.refresh_token
  );

  // Check if user has changed
  const userChanged = Boolean(
    currentState.user?.id !== newUser?.id || currentState.user?.email !== newUser?.email
  );

  return sessionChanged || userChanged;
}
export { AuthError };
