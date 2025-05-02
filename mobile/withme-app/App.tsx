<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
=======
import React from 'react';
>>>>>>> a07d631d04d45af415c90c18b62199d289862037
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/hooks/useAuth';
import Navigation from './src/navigation';
<<<<<<< HEAD
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { checkSupabaseHealth } from './src/utils/supabase';
import NetInfo from '@react-native-community/netinfo';
=======
>>>>>>> a07d631d04d45af415c90c18b62199d289862037

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

<<<<<<< HEAD
// Debug mode flag
const DEBUG_MODE = __DEV__;

// Global error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{this.state.error?.message}</Text>
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.restartButtonText}>Try Again</Text>
          </TouchableOpacity>
          {DEBUG_MODE && (
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={() => {
                Alert.alert(
                  'Error Details',
                  `${this.state.error?.name}: ${this.state.error?.message}\n\n${this.state.error?.stack}`
                );
              }}
            >
              <Text style={styles.debugButtonText}>Debug Info</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

// Debug component for development
function DebugOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [networkInfo, setNetworkInfo] = useState<any>(null);

  useEffect(() => {
    // Check network state
    NetInfo.fetch().then(state => {
      setNetworkInfo(state);
    });

    // Monitor connection changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkInfo(state);
    });

    // Set up periodic health checks
    const checkHealth = async () => {
      try {
        const health = await checkSupabaseHealth();
        setDbHealth(health);
      } catch (error) {
        console.error('Health check error:', error);
      }
    };
    
    checkHealth();
    const intervalId = setInterval(checkHealth, 10000); // Check every 10 seconds
    
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  if (!DEBUG_MODE) return null;

  if (!isVisible) {
    return (
      <TouchableOpacity
        style={styles.debugToggle}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.debugToggleText}>🔍</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.debugOverlay}>
      <View style={styles.debugHeader}>
        <Text style={styles.debugTitle}>Debug Info</Text>
        <TouchableOpacity onPress={() => setIsVisible(false)}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.debugSection}>
        <Text style={styles.debugSectionTitle}>Network</Text>
        <Text style={styles.debugText}>
          Connected: {String(networkInfo?.isConnected)}
        </Text>
        <Text style={styles.debugText}>
          Type: {networkInfo?.type}
        </Text>
      </View>
      
      <View style={styles.debugSection}>
        <Text style={styles.debugSectionTitle}>Database</Text>
        <Text style={styles.debugText}>
          Client Initialized: {String(dbHealth?.isClientInitialized)}
        </Text>
        <Text style={styles.debugText}>
          Status: {dbHealth?.dbConnectionStatus || 'Unknown'}
        </Text>
        <Text style={styles.debugText}>
          Creation Count: {dbHealth?.creationCount || 0}
        </Text>
      </View>
      
      {dbHealth?.errors.length > 0 && (
        <View style={styles.debugSection}>
          <Text style={styles.debugSectionTitle}>Errors ({dbHealth.errors.length})</Text>
          {dbHealth.errors.map((err: string, i: number) => (
            <Text key={i} style={styles.errorText} numberOfLines={1}>
              {err}
            </Text>
          ))}
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.checkButton}
        onPress={async () => {
          try {
            const health = await checkSupabaseHealth();
            setDbHealth(health);
            Alert.alert('Health Check', 'Database connection checked');
          } catch (error) {
            Alert.alert('Health Check Error', String(error));
          }
        }}
      >
        <Text style={styles.checkButtonText}>Check Connection</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Navigation />
            {DEBUG_MODE && <DebugOverlay />}
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  restartButton: {
    backgroundColor: '#0066ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  restartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  debugButtonText: {
    color: '#fff',
  },
  debugToggle: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  debugToggleText: {
    fontSize: 20,
  },
  debugOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 15,
    zIndex: 999,
    maxHeight: '50%',
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  debugTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    color: '#fff',
    fontSize: 18,
  },
  debugSection: {
    marginBottom: 10,
  },
  debugSectionTitle: {
    color: '#0066ff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugText: {
    color: '#ddd',
    fontSize: 12,
    marginBottom: 3,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginBottom: 3,
  },
  checkButton: {
    backgroundColor: '#555',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 12,
  },
});
=======
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
>>>>>>> a07d631d04d45af415c90c18b62199d289862037
