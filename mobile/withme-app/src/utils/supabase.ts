import { createClient } from '@supabase/supabase-js';
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
debugLog('Supabase URL (masked):', SUPABASE_URL ? `${SUPABASE_URL.substring(0, 8)}...` : 'undefined');
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

// Singleton Supabase client to reuse across the app
let supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * Create a Supabase client for mobile use with secure storage for auth tokens
 */
export const createSupabaseClient = () => {
  // Track when client was requested
  const requestTime = new Date();
  
  if (supabaseClient) {
    debugLog('Returning existing Supabase client', {
      createdAt: clientCreatedAt,
      ageMs: clientCreatedAt ? requestTime.getTime() - clientCreatedAt.getTime() : 'unknown',
    });
    return supabaseClient;
  }

  clientCreationCount++;
  debugLog(`Creating new Supabase client (attempt #${clientCreationCount})`);

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const error = 'Missing Supabase configuration. Check your environment variables.';
    debugLog('Configuration error:', error);
    clientErrors.push(error);
    throw new Error(error);
  }

  // Check network connectivity first
  NetInfo.fetch().then(state => {
    debugLog('Network state', {
      isConnected: state.isConnected,
      type: state.type,
      details: state,
    });
    
    if (!state.isConnected) {
      clientErrors.push(`No network connection: ${state.type}`);
    }
  });

  // Try to initialize the client
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: secureStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    
    clientCreatedAt = new Date();
    debugLog('Supabase client created successfully', {
      timestamp: clientCreatedAt.toISOString(),
      creationTimeMs: clientCreatedAt.getTime() - requestTime.getTime(),
    });
    
    return supabaseClient;
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
  supabaseClient = null;
  clientCreatedAt = null;
};

/**
 * Get debug information about the Supabase client
 */
export const getSupabaseDebugInfo = () => {
  return {
    isClientInitialized: !!supabaseClient,
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
    if (supabaseClient) {
      // Simple test query to check DB connectivity
      const startTime = Date.now();
      const { data, error } = await supabaseClient
        .from('health_check')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (error) {
        debugLog('Health check query failed:', error);
        dbConnectionStatus = 'error';
        clientErrors.push(`Health check error: ${error.message}`);
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
