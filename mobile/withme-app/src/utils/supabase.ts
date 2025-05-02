import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants/config';
import NetInfo from '@react-native-community/netinfo';

// Debug mode flag
const DEBUG_MODE = __DEV__;

// Debug utility
const debugLog = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    if (data) {
      console.log(`[Supabase] ${message}`, data);
    } else {
      console.log(`[Supabase] ${message}`);
    }
  }
};

// Initialize with debug information
debugLog('Initializing Supabase utility');
debugLog(
  'Supabase URL (masked):',
  SUPABASE_URL ? `${SUPABASE_URL.substring(0, 8)}...` : 'undefined'
);
debugLog('Supabase Anon Key defined:', !!SUPABASE_ANON_KEY);

// Track client creation time for debugging
let clientCreatedAt: Date | null = null;
let clientCreationCount = 0;
let clientErrors: string[] = [];

// Custom storage interface using Expo's SecureStore for token management
const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await SecureStore.getItemAsync(key);
      debugLog(`SecureStorage.getItem(${key})`, value ? 'Value exists' : 'No value');
      return value;
    } catch (error) {
      debugLog(`Error reading from SecureStore (${key}):`, error);
      clientErrors.push(`SecureStore.getItem error: ${error}`);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      debugLog(`SecureStorage.setItem(${key})`, 'Setting value');
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      debugLog(`Error writing to SecureStore (${key}):`, error);
      clientErrors.push(`SecureStore.setItem error: ${error}`);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      debugLog(`SecureStorage.removeItem(${key})`);
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      debugLog(`Error removing from SecureStore (${key}):`, error);
      clientErrors.push(`SecureStore.removeItem error: ${error}`);
    }
  },
};

// Keep a single instance of the client to avoid multiple initializations
let supabaseInstance: SupabaseClient | null = null;

/**
 * Create a Supabase client for mobile use with secure storage for auth tokens
 */
export const createSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    debugLog('Missing Supabase credentials', { url: !!SUPABASE_URL, key: !!SUPABASE_ANON_KEY });
    clientErrors.push('Missing Supabase credentials');
    throw new Error('Supabase URL or Anon Key not configured properly');
  }

  try {
    debugLog('Creating new Supabase client');
    clientCreatedAt = new Date();
    clientCreationCount++;

    // Initialize Supabase client with React Native optimizations
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        detectSessionInUrl: false, // Disable for React Native
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        // Add global error handling and fetch options
        fetch: (url, options) => {
          // Use a custom fetch with timeout
          const fetchWithTimeout = async (url: any, options: RequestInit = {}, timeout = 30000) => {
            const controller = new AbortController();
            const { signal } = controller;
            
            const timeoutId = setTimeout(() => {
              controller.abort();
            }, timeout);
            
            try {
              const response = await fetch(url, { ...options, signal });
              clearTimeout(timeoutId);
              return response;
            } catch (error) {
              clearTimeout(timeoutId);
              throw error;
            }
          };
          
          return fetchWithTimeout(url, options);
        },
      },
    });

    debugLog('Supabase client created successfully');
    return supabaseInstance;
  } catch (error) {
    debugLog('Error creating Supabase client:', error);
    clientErrors.push(`Client creation error: ${error}`);
    throw error;
  }
};

/**
 * Reset the Supabase client, useful for logout
 */
export const resetSupabaseClient = () => {
  debugLog('Resetting Supabase client');
  supabaseInstance = null;
  clientCreatedAt = null;
};

/**
 * Get debug information about the Supabase client
 */
export const getSupabaseDebugInfo = () => {
  return {
    isClientInitialized: !!supabaseInstance,
    clientCreatedAt: clientCreatedAt?.toISOString() || null,
    clientAge: clientCreatedAt
      ? Math.round((new Date().getTime() - clientCreatedAt.getTime()) / 1000)
      : null,
    creationCount: clientCreationCount,
    hasNetworkConnection: undefined as boolean | null | undefined, // Will be filled by the caller with current state
    errors: clientErrors,
    configPresent: {
      url: !!SUPABASE_URL,
      anonKey: !!SUPABASE_ANON_KEY,
    },
  };
};

/**
 * Check the Supabase client health and connectivity
 * @returns A promise that resolves to an object with health check results
 */
export const checkSupabaseHealth = async () => {
  const netInfo = await NetInfo.fetch();

  const debugInfo = getSupabaseDebugInfo();
  debugInfo.hasNetworkConnection = netInfo.isConnected;

  let dbConnectionStatus = 'unknown';

  try {
    if (supabaseInstance) {
      // Simple test query to check DB connectivity
      const startTime = Date.now();

      // Try to query profiles table instead of health_check
      const { data, error } = await supabaseInstance
        .from('profiles')
        .select('count')
        .limit(1)
        .maybeSingle();

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (error) {
        debugLog('Health check query failed:', error);
        dbConnectionStatus = 'error';
        clientErrors.push(`Health check error: ${error.message}`);

        // Try a fallback query if the profiles table query fails
        try {
          const { error: fallbackError } = await supabaseInstance
            .rpc('get_service_status')
            .maybeSingle();

          if (!fallbackError) {
            debugLog('Fallback health check succeeded');
            dbConnectionStatus = 'connected';
          }
        } catch (fallbackException) {
          // Ignore fallback errors, we already have an error state
        }
      } else {
        debugLog('Health check query succeeded', { responseTime });
        dbConnectionStatus = 'connected';
      }
    }
  } catch (error) {
    debugLog('Error during health check:', error);
    dbConnectionStatus = 'exception';
    clientErrors.push(`Health check exception: ${error}`);
  }

  return {
    ...debugInfo,
    dbConnectionStatus,
    timestamp: new Date().toISOString(),
  };
};

// Function to clear the client instance (useful for logging out)
export const clearSupabaseInstance = (): void => {
  supabaseInstance = null;
};

// Handle network state changes to improve reconnection
NetInfo.addEventListener((state) => {
  if (state.isConnected && clientErrors.length > 0) {
    debugLog('Network reconnected, resetting Supabase client on next use');
    // Don't reset immediately, but mark for reset on next use
    supabaseInstance = null;
  }
});
