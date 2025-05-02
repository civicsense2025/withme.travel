import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { createSupabaseClient } from '../utils/supabase';
import { Trip } from '../types/supabase';
import { TABLES, COLUMNS, ENUM_VALUES } from '../constants/database';
import * as dbUtils from '../utils/database';
import { fetchWithCache, clearCacheEntry } from '../utils/cache';
import { useTheme } from '../hooks/useTheme';
import { Text, Button } from '../components/ui'; // Import themed components
import { TripCard as ThemedTripCard } from '../components/TripCard'; // Import themed TripCard
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dev flag for debugging (set to false in production)
const DEBUG_MODE = __DEV__; // Keep debug mode for dev builds

const MemoizedTripCard = memo(ThemedTripCard);

// Section for trips grouped by month
interface TripSection {
  month: string;
  title: string;
  data: Trip[];
}

export default function HomeScreen({ navigation }: any) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme); // Create styles using theme
  const { user, signOut, profile, isLoading: authLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripSections, setTripSections] = useState<TripSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, string>>({});

  // --- Debugging Functions (No theme changes needed) ---
  const debugLog = (message: string, data?: any) => {
    if (DEBUG_MODE) {
      console.log(`[HomeScreen] ${message}`, data || '');
      // Store important debug info for display
      if (data) {
        setDebugInfo((prev: Record<string, string>) => ({
          ...prev,
          [message]: JSON.stringify(data, null, 2),
        }));
      } else {
        setDebugInfo((prev: Record<string, string>) => ({
          ...prev,
          [message]: new Date().toISOString(),
        }));
      }
    }
  };

  const loadTripsDirectly = async () => {
    try {
      debugLog('Attempting direct Supabase query');
      setError(null);
      const supabase = createSupabaseClient();
      if (!user?.id) {
        debugLog('No user ID found, skipping direct query');
        return;
      }
      const { data, error } = await supabase.from('trips').select('*').eq('created_by', user.id);
      if (error) {
        debugLog('Direct Supabase error:', error);
        setError(`Direct query failed: ${error.message}`);
        return;
      }
      debugLog('Direct query results:', { count: data?.length || 0 });
      if (data && data.length > 0) debugLog('Sample direct trip data:', data[0]);
    } catch (e) {
      debugLog('Exception in direct query:', e);
    }
  };
  // -----------------------------------------------------

  // Group trips by month
  const organizeTripsByMonth = (trips: Trip[]) => {
    // Group trips by month
    const tripsByMonth: Record<string, Trip[]> = {};
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Add special categories
    tripsByMonth['Upcoming'] = [];
    tripsByMonth['In Progress'] = [];
    tripsByMonth['Planning'] = [];
    tripsByMonth['Unscheduled'] = [];
    tripsByMonth['Past'] = [];

    const now = new Date();
    
    trips.forEach((trip) => {
      // First categorize by status
      if (trip.status === ENUM_VALUES.TRIP_STATUS.UPCOMING) {
        tripsByMonth['Upcoming'].push(trip);
      } 
      else if (trip.status === ENUM_VALUES.TRIP_STATUS.IN_PROGRESS) {
        tripsByMonth['In Progress'].push(trip);
      }
      else if (trip.status === ENUM_VALUES.TRIP_STATUS.PLANNING) {
        tripsByMonth['Planning'].push(trip);
      }
      else if (trip.status === ENUM_VALUES.TRIP_STATUS.COMPLETED) {
        tripsByMonth['Past'].push(trip);
      }
      else if (!trip.start_date) {
        tripsByMonth['Unscheduled'].push(trip);
      } 
      else {
        // Then also categorize by month for normal display
        const startDate = new Date(trip.start_date);
        const monthYear = `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;

        if (!tripsByMonth[monthYear]) {
          tripsByMonth[monthYear] = [];
        }

        tripsByMonth[monthYear].push(trip);
      }
    });

    // Convert to array format for sections
    const sections: TripSection[] = Object.keys(tripsByMonth)
      .filter((month) => tripsByMonth[month].length > 0) // Only include months with trips
      .map((month) => {
        // Set custom titles for special categories
        let title = month;
        if (month === 'Upcoming') title = '🗓️ Upcoming Trips';
        else if (month === 'In Progress') title = '✈️ Current Trips';
        else if (month === 'Planning') title = '📝 Planning';
        else if (month === 'Unscheduled') title = '⏱️ Unscheduled Trips';
        else if (month === 'Past') title = '📚 Past Trips';
        else title = `Trips in ${month}`;
        
        return {
          month,
          title,
          data: tripsByMonth[month],
        };
      });

    // Sort sections in a logical order: In Progress, Upcoming, Planning, monthly sections, Past, Unscheduled
    return sections.sort((a, b) => {
      const order = {
        'In Progress': 1,
        'Upcoming': 2,
        'Planning': 3,
        'Past': 98,
        'Unscheduled': 99
      };
      
      const orderA = order[a.month as keyof typeof order] || 50;
      const orderB = order[b.month as keyof typeof order] || 50;
      
      return orderA - orderB;
    });
  };

  const loadTrips = async (forceRefresh = false) => {
    try {
      debugLog('Loading trips started', { forceRefresh });
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        debugLog('No user ID found, skipping trip loading');
        setTrips([]);
        setTripSections([]);
        setIsLoading(false);
        return;
      }

      const cacheKey = `user_${user.id}_trips`;

      if (forceRefresh) {
        await clearCacheEntry(cacheKey);
        debugLog('Cache cleared for trips due to force refresh');
      }

      try {
        const fetcher = async () => {
          debugLog(`Fetching fresh trips for user: ${user.id}`);
          
          // Get trips using the available database utility
          const supabase = createSupabaseClient();
          
          // Add a timeout for the Supabase query
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Query timeout after 15 seconds')), 15000);
          });
          
          // Use raw query for more flexibility
          const queryPromise = supabase
            .from(TABLES.TRIPS)
            .select(`
              id, 
              name, 
              description, 
              start_date, 
              end_date, 
              destination_name, 
              destination_id, 
              cover_image_url, 
              trip_emoji, 
              status, 
              member_count, 
              travelers_count,
              privacy_setting
            `)
            .eq(COLUMNS.CREATED_BY, user.id)
            .order(COLUMNS.START_DATE, { ascending: true });
          
          // Race between the query and the timeout
          const { data: tripsData, error } = await Promise.race([
            queryPromise,
            timeoutPromise.then(() => {
              throw new Error('Query timeout after 15 seconds');
            })
          ]) as any;
          
          if (error) {
            debugLog('Error fetching trips:', error);
            throw error;
          }
          
          // If we get here but tripsData is null/undefined, return an empty array
          if (!tripsData) {
            debugLog('No trips data returned (null/undefined)');
            return [];
          }
          
          // Sort the trips in memory for better organization
          const sortedTrips = sortTripsByStatus(tripsData as Trip[]);
          
          debugLog('Fresh trips fetched', { count: sortedTrips?.length || 0 });
          return sortedTrips || [];
        };

        // Add a timeout for the entire fetch with cache operation
        const fetchWithTimeout = async () => {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Fetch with cache timeout after ‎30 seconds')), 30000);
          });
          
          return Promise.race([
            fetchWithCache(cacheKey, fetcher),
            timeoutPromise
          ]);
        };

        try {
          const tripsData = await fetchWithTimeout() as Trip[];
          debugLog('Trips loaded (from cache or fresh)', { count: tripsData.length });
          if (tripsData.length > 0) debugLog('Sample trip data:', tripsData[0]);

          setTrips(tripsData);
          
          // Organize trips by month
          const sections = organizeTripsByMonth(tripsData);
          setTripSections(sections);
        } catch (timeoutError) {
          debugLog('Timeout error:', timeoutError);
          setError(`Request timed out. Please check your connection and try again.`);
          
          // Try to load from cache as a fallback
          try {
            const cachedItem = await AsyncStorage.getItem(cacheKey);
            if (cachedItem) {
              const entry = JSON.parse(cachedItem);
              debugLog('Using expired cache as fallback after timeout');
              
              setTrips(entry.data);
              const sections = organizeTripsByMonth(entry.data);
              setTripSections(sections);
            }
          } catch (cacheError) {
            debugLog('Cache fallback error:', cacheError);
          }
        }
      } catch (queryError) {
        debugLog('Error loading trips (cache/fetch):', queryError);
        setError(
          `Failed to load trips: ${queryError instanceof Error ? queryError.message : 'Unknown error'}`
        );
      }
    } catch (error) {
      debugLog('Exception in loadTrips:', error);
      setError(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    debugLog('Home screen mounted or user changed', { userId: user?.id, authLoading });
    loadTrips();
  }, [user]);

  const onRefresh = useCallback(() => {
    debugLog('Manual refresh triggered');
    setRefreshing(true);
    loadTrips(true);
  }, []);

  // --- Debugging Render Functions (Needs Theming) ---
  const renderDebugInfo = () => {
    if (!DEBUG_MODE) return null;

    return (
      <TouchableOpacity
        style={styles.debugBox}
        onPress={() => {
          const debugPayload = {
            debugData: {
              auth: { userId: user?.id, authLoading, profile: !!profile },
              appState: { isLoading, refreshing, tripsCount: trips.length },
              error: error || 'none',
              debugLog: debugInfo,
            },
          };
          debugLog('Navigating to Debug screen with payload:', debugPayload);
          navigation.dispatch(
            CommonActions.navigate({
              name: 'Debug',
              params: debugPayload,
            })
          );
        }}
      >
        <Text variant="caption" color="custom" customColor={theme.isDark ? '#000' : '#fff'}>
          🔍 Debug ({Object.keys(debugInfo).length})
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEnhancedDebugView = () => {
    if (!DEBUG_MODE) return null;

    return (
      <View style={styles.enhancedDebugContainer}>
        <Text variant="h4" weight="bold" style={styles.debugHeader}>
          DEBUG INFORMATION
        </Text>
        <Text style={styles.debugItem}>Auth State: {user?.id ? 'Logged In' : 'Not Logged In'}</Text>
        <Text style={styles.debugItem}>User ID: {user?.id || 'none'}</Text>
        <Text style={styles.debugItem}>Loading State: {isLoading ? 'Loading' : 'Idle'}</Text>
        <Text style={styles.debugItem}>Trips Count: {trips.length}</Text>
        {error && <Text style={styles.debugError}>Error: {error}</Text>}

        <Text variant="body2" weight="semibold" style={styles.debugSubheader}>
          Log:
        </Text>
        <ScrollView style={styles.debugLogScroll}>
          {Object.entries(debugInfo).map(([key, value], index) => (
            <Text key={index} style={styles.debugLogItem}>
              {key}: {String(value)}
            </Text>
          ))}
        </ScrollView>

        <Button
          label="Retry Loading"
          variant="secondary"
          size="sm"
          style={styles.debugButton}
          onPress={() => loadTrips()}
        />
        <Button
          label="Direct Query"
          variant="secondary"
          size="sm"
          style={[styles.debugButton, styles.directQueryButton]}
          onPress={loadTripsDirectly}
        />
      </View>
    );
  };
  // -------------------------------------------------------

  const handleNavigateToTripDetail = useCallback(
    (tripId: string) => {
      debugLog('Navigating to trip details', { tripId });
      navigation.navigate('TripDetail', { tripId });
    },
    [navigation]
  );

  const handleNavigateToCreateTrip = useCallback(() => {
    debugLog('Navigating to create trip screen');
    navigation.navigate('CreateTripStep1');
  }, [navigation]);

  // Render a trip section with horizontal carousel
  const renderTripSection = useCallback(
    ({ section }: { section: TripSection }) => {
      if (section.data.length === 0) return null;

      return (
        <View style={styles.tripSection}>
          <Text variant="h3" weight="bold" style={styles.sectionTitle}>
            {section.title}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tripCarousel}
          >
            {section.data.map((trip) => (
              <View key={trip.id} style={styles.tripCardContainer}>
                <MemoizedTripCard
                  id={trip.id}
                  name={trip.name}
                  description={trip.description}
                  imageUrl={trip.image_url || null}
                  dates={{
                    start: trip.start_date,
                    end: trip.end_date,
                  }}
                  location={trip.destination_city || undefined}
                  onPress={handleNavigateToTripDetail}
                  style={styles.tripCard}
                />
              </View>
            ))}

            <TouchableOpacity
              style={styles.createTripCard}
              onPress={handleNavigateToCreateTrip}
            >
              <View style={styles.createTripCardInner}>
                <Feather name="plus-circle" size={36} color={theme.colors.primary} />
                <Text
                  variant="body1"
                  weight="medium"
                  color="primary"
                  style={{ marginTop: theme.spacing['2'] }}
                >
                  Create New Trip
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    },
    [handleNavigateToTripDetail, handleNavigateToCreateTrip, theme]
  );

  // Updated Empty State using themed components
  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyStateContainer}>
        <Text variant="h1" style={styles.emptyStateEmoji}>
          ✈️
        </Text>
        <Text variant="body1" color="muted" style={styles.emptyStateText}>
          No trips found. Create your first trip to get started!
        </Text>
        <Button
          label="Create Trip"
          variant="primary"
          size="lg"
          onPress={handleNavigateToCreateTrip}
          style={styles.emptyStateButton}
        />
        {DEBUG_MODE && renderEnhancedDebugView()}
      </View>
    ),
    [handleNavigateToCreateTrip, styles, theme, DEBUG_MODE, renderEnhancedDebugView]
  );

  // Add this new helper function for sorting trips by status
  const sortTripsByStatus = (trips: Trip[]) => {
    const statusOrder = {
      [ENUM_VALUES.TRIP_STATUS.IN_PROGRESS]: 1,
      [ENUM_VALUES.TRIP_STATUS.UPCOMING]: 2,
      [ENUM_VALUES.TRIP_STATUS.PLANNING]: 3,
      [ENUM_VALUES.TRIP_STATUS.COMPLETED]: 4,
      [ENUM_VALUES.TRIP_STATUS.CANCELLED]: 5
    };
    
    return [...trips].sort((a, b) => {
      // First sort by status
      const statusA = a.status ? statusOrder[a.status as keyof typeof statusOrder] || 99 : 99;
      const statusB = b.status ? statusOrder[b.status as keyof typeof statusOrder] || 99 : 99;
      
      if (statusA !== statusB) {
        return statusA - statusB;
      }
      
      // Then sort by date if statuses are the same
      if (!a.start_date) return 1;  // No date goes last
      if (!b.start_date) return -1; // No date goes last
      
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    });
  };

  return (
    <View style={styles.container}>
      {renderDebugInfo()}

      {/* Header with themed components */}
      <View style={styles.headerContainer}>
        <Text variant="h3" weight="bold">
          Hello, {profile?.name || user?.email || 'Traveler'} 👋
        </Text>
        <Button label="Sign Out" variant="ghost" size="sm" onPress={signOut} />
      </View>

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {isLoading && !refreshing ? (
          <View style={styles.centeredMessageContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="body1" color="muted" style={{ marginTop: theme.spacing['3'] }}>
              Loading trips...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centeredMessageContainer}>
            <Text variant="body1" color="custom" customColor={theme.colors.destructive} style={{ textAlign: 'center' }}>
              {error}
            </Text>
            <Button
              label="Retry"
              variant="primary"
              onPress={() => loadTrips()}
              style={{ marginTop: theme.spacing['4'] }}
            />
            {DEBUG_MODE && renderEnhancedDebugView()}
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          >
            <Text variant="h2" weight="bold" style={styles.mainTitle}>
              Your Trips
            </Text>

            {tripSections.length > 0 ? (
              tripSections.map((section) => (
                <View key={section.month}>
                  {renderTripSection({ section })}
                </View>
              ))
            ) : (
              renderEmptyState()
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

// Create styles using the theme
const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing['4'],
      paddingVertical: theme.spacing['3'],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.card, // Give header a card background
    },
    contentContainer: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    mainTitle: {
      paddingHorizontal: 16,
      marginTop: 16,
      marginBottom: 4,
    },
    centeredMessageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing['5'],
    },
    tripSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    tripCarousel: {
      paddingLeft: 16,
      paddingRight: 8,
    },
    tripCardContainer: {
      width: 280,
      marginRight: 8,
    },
    tripCard: {
      height: 180,
    },
    createTripCard: {
      width: 150,
      height: 180,
      marginRight: 16,
    },
    createTripCardInner: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
    },
    emptyStateContainer: {
      marginTop: theme.spacing['8'],
      padding: theme.spacing['5'],
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateEmoji: {
      fontSize: 64,
      marginBottom: theme.spacing['4'],
    },
    emptyStateText: {
      textAlign: 'center',
      marginBottom: theme.spacing['5'],
    },
    emptyStateButton: {
      // Button styles are handled internally
    },
    // Debug Styles (Mostly kept as is, but use theme colors/spacing where appropriate)
    debugBox: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 999,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      paddingVertical: theme.spacing['1'],
      paddingHorizontal: theme.spacing['2'],
      borderRadius: theme.borderRadius.md,
    },
    enhancedDebugContainer: {
      marginTop: theme.spacing['5'],
      padding: theme.spacing['3'],
      backgroundColor: theme.isDark ? '#555' : '#333',
      borderRadius: theme.borderRadius.lg,
      width: '90%',
      alignSelf: 'center',
    },
    debugHeader: {
      color: '#fff',
      textAlign: 'center',
      marginBottom: theme.spacing['2'],
    },
    debugSubheader: {
      color: '#fff',
      marginTop: theme.spacing['3'],
      marginBottom: theme.spacing['1'],
    },
    debugItem: {
      color: '#ccc',
      fontSize: 12,
      marginBottom: theme.spacing['1'],
    },
    debugError: {
      color: '#ff8888',
      fontSize: 12,
      marginTop: theme.spacing['1'],
      marginBottom: theme.spacing['1'],
    },
    debugLogScroll: {
      maxHeight: 150,
      backgroundColor: theme.isDark ? '#333' : '#222',
      padding: theme.spacing['2'],
      borderRadius: theme.borderRadius.md,
    },
    debugLogItem: {
      color: '#80ff80',
      fontSize: 10,
      marginBottom: 2,
      fontFamily: 'monospace',
    },
    debugButton: {
      marginTop: theme.spacing['3'],
      alignSelf: 'center',
    },
    directQueryButton: {
      marginTop: theme.spacing['2'],
      backgroundColor: '#664', // Keep distinct color
    },
  });
