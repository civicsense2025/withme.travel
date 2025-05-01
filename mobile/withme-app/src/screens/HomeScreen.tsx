import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { createSupabaseClient } from '../utils/supabase';
import { Trip } from '../types/supabase';
import { TABLES, COLUMNS } from '../constants/database';
import * as dbUtils from '../utils/database';

// Dev flag for debugging (set to false in production)
const DEBUG_MODE = __DEV__;

export default function HomeScreen({ navigation }: any) {
  const { user, signOut, profile, isLoading: authLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug function
  const debugLog = (message: string, data?: any) => {
    if (DEBUG_MODE) {
      if (data) {
        console.log(`[HomeScreen] ${message}`, data);
      } else {
        console.log(`[HomeScreen] ${message}`);
      }
    }
  };

  const loadTrips = async () => {
    try {
      debugLog('Loading trips started');
      debugLog('Auth state:', { userId: user?.id, authLoading });
      
      setIsLoading(true);
      setError(null);

      // Artificial delay to help debug
      if (DEBUG_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Skip if no user
      if (!user?.id) {
        debugLog('No user ID found, skipping trip loading');
        setTrips([]);
        setIsLoading(false);
        return;
      }
      
      try {
        debugLog(`Fetching trips for user: ${user.id}`);
        
        // Using the database utility function
        const tripsData = await dbUtils.getByForeignKey(
          TABLES.TRIPS,
          COLUMNS.CREATED_BY,
          user.id,
          { column: COLUMNS.UPDATED_AT, ascending: false }
        );
        
        debugLog(`Loaded ${tripsData.length} trips successfully`);
        setTrips(tripsData as unknown as Trip[]);
      } catch (queryError) {
        debugLog('Error in Supabase query:', queryError);
        setError('Database query failed');
      }
    } catch (error) {
      debugLog('Error in loadTrips:', error);
      setError('An unexpected error occurred');
    } finally {
      debugLog('Finished loading trips');
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    debugLog('Home screen mounted or user changed', { userId: user?.id, authLoading });
    loadTrips();
  }, [user]);

  const onRefresh = () => {
    debugLog('Manual refresh triggered');
    setRefreshing(true);
    loadTrips();
  };

  // Show debugging overlay in development mode
  const renderDebugInfo = () => {
    if (!DEBUG_MODE) return null;
    
    return (
      <TouchableOpacity 
        style={styles.debugBox}
        onPress={() => {
          Alert.alert(
            'Debug Info',
            `Auth Loading: ${authLoading}\nUser ID: ${user?.id || 'none'}\nLoading: ${isLoading}\nTrips Count: ${trips.length}\nError: ${error || 'none'}`
          );
        }}
      >
        <Text style={styles.debugText}>🔍 Debug</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderDebugInfo()}
      
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello, {profile?.name || user?.email || 'Traveler'}
        </Text>
        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={signOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.title}>Your Trips</Text>
      
      {isLoading && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0066ff" />
          <Text style={styles.loaderText}>Loading trips...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadTrips}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.tripCard}
              onPress={() => {
                debugLog('Navigating to trip details', { tripId: item.id });
                navigation.navigate('TripDetail', { tripId: item.id });
              }}
            >
              <View style={styles.tripInfo}>
                <Text style={styles.tripEmoji}>{item.trip_emoji || '✈️'}</Text>
                <View>
                  <Text style={styles.tripName}>{item.name}</Text>
                  {item.start_date && (
                    <Text style={styles.tripDate}>
                      {new Date(item.start_date).toLocaleDateString()} 
                      {item.end_date && ` - ${new Date(item.end_date).toLocaleDateString()}`}
                    </Text>
                  )}
                  <Text style={styles.tripStatus}>{item.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No trips found. Create your first trip to get started!
              </Text>
              <TouchableOpacity 
                style={styles.createTripButton}
                onPress={() => {
                  // Navigate to create trip when implemented
                  // navigation.navigate('CreateTrip');
                  alert('Create trip feature will be available soon');
                }}
              >
                <Text style={styles.createTripButtonText}>Create Trip</Text>
              </TouchableOpacity>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0066ff']}
            />
          }
        />
      )}
      
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => {
          // Navigate to create trip when implemented
          // navigation.navigate('CreateTrip');
          alert('Create trip feature will be available soon');
        }}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  signOutButton: {
    padding: 8,
  },
  signOutText: {
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
  },
  loader: {
    marginTop: 20,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: '#666',
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  tripName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  tripStatus: {
    fontSize: 14,
    color: '#0066ff',
    textTransform: 'capitalize',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  createTripButton: {
    backgroundColor: '#0066ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createTripButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0066ff',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  debugBox: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
  },
});
