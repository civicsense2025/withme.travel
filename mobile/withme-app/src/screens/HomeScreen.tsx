import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { createSupabaseClient } from '../utils/supabase';
import { Trip } from '../types/supabase';
import { TABLES, COLUMNS } from '../constants/database';
import * as dbUtils from '../utils/database';
import { fetchWithCache, clearCacheEntry } from '../utils/cache';
import { useTheme } from '../hooks/useTheme';
import { Text, Button } from '../components/ui'; // Import themed components
import { TripCard as ThemedTripCard } from '../components/TripCard'; // Import themed TripCard

// Dev flag for debugging (set to false in production)
const DEBUG_MODE = __DEV__; // Keep debug mode for dev builds

const MemoizedTripCard = memo(ThemedTripCard);

export default function HomeScreen({ navigation }: any) {
  const theme = useTheme();
  const styles = createStyles(theme); // Create styles using theme
  const { user, signOut, profile, isLoading: authLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
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

  const loadTrips = async (forceRefresh = false) => {
    try {
      debugLog('Loading trips started', { forceRefresh });
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        debugLog('No user ID found, skipping trip loading');
        setTrips([]);
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
          const tripsData = await dbUtils.getByForeignKey(
            TABLES.TRIPS,
            COLUMNS.CREATED_BY,
            user.id,
            { column: COLUMNS.UPDATED_AT, ascending: false }
          );
          debugLog('Fresh trips fetched', { count: tripsData?.length || 0 });
          return (tripsData as unknown as Trip[]) || [];
        };

        const tripsData = await fetchWithCache(cacheKey, fetcher);
        debugLog('Trips loaded (from cache or fresh)', { count: tripsData.length });
        if (tripsData.length > 0) debugLog('Sample trip data:', tripsData[0]);

        setTrips(tripsData);
      } catch (queryError) {
        debugLog('Error loading trips (cache/fetch):', queryError);
        setError(
          `Failed to load trips: ${queryError instanceof Error ? queryError.message : 'Unknown error'}`
        );
      }
    } catch (error) {
      debugLog('Outer error in loadTrips:', error);
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Use the themed TripCard component
  const renderTripItem = useCallback(
    ({ item }: { item: Trip }) => (
      <MemoizedTripCard
        id={item.id}
        name={item.name}
        description={item.description}
        imageUrl={item.image_url || null} // Pass image URL
        dates={{ start: item.start_date, end: item.end_date }}
        location={item.destination_city || undefined} // Pass location
        onPress={handleNavigateToTripDetail}
        style={styles.tripCardItem} // Add specific margin/padding if needed
      />
    ),
    [handleNavigateToTripDetail, styles.tripCardItem]
  );

  const handleNavigateToCreateTrip = useCallback(() => {
    debugLog('Navigating to create trip screen');
    navigation.navigate('CreateTripStep1');
  }, [navigation]);

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
        <Text variant="h2" weight="bold" style={styles.title}>
          Your Trips
        </Text>

        {isLoading && !refreshing ? (
          <View style={styles.centeredMessageContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="body1" color="muted" style={{ marginTop: theme.spacing['3'] }}>
              Loading trips...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centeredMessageContainer}>
            <Text variant="body1" color="destructive" style={{ textAlign: 'center' }}>
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
          <FlatList
            data={trips}
            keyExtractor={(item) => item.id}
            renderItem={renderTripItem}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={styles.listContentContainer}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={5}
            initialNumToRender={5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          />
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
      paddingHorizontal: theme.spacing['4'],
    },
    title: {
      marginTop: theme.spacing['4'],
      marginBottom: theme.spacing['4'],
    },
    centeredMessageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing['5'],
    },
    listContentContainer: {
      paddingBottom: theme.spacing['8'], // Ensure space at the bottom
    },
    tripCardItem: {
      marginBottom: theme.spacing['4'], // Space between cards
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
