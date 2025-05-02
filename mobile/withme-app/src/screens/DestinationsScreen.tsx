import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { createSupabaseClient } from '../utils/supabase';
import { Destination, Trip } from '../types/supabase';
import { fetchWithCache, clearCacheEntry } from '../utils/cache';
import { useTheme } from '../hooks/useTheme';
import { Text } from '../components/ui/Text';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TripCard } from '../components/TripCard';
import { Feather } from '@expo/vector-icons';

const MemoizedTripCard = memo(TripCard);

interface DestinationCardProps {
  destination: Destination;
  onPress: (destination: Destination) => void;
}

const DestinationCard = memo(({ destination, onPress }: DestinationCardProps) => {
  const theme = useTheme();

  const handlePress = () => {
    onPress(destination);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={styles.destinationCardContainer}
    >
      <Card variant="elevated" style={styles.destinationCard}>
        {destination.image_url ? (
          <View style={styles.destinationImageContainer}>
            <Card variant="elevated" padding="none" style={styles.destinationImageCard}>
              {/* Use Image or fastImage component for production */}
              <img
                src={destination.image_url}
                style={styles.destinationImage}
                alt={destination.city}
              />
            </Card>
          </View>
        ) : (
          <View
            style={[styles.destinationPlaceholder, { backgroundColor: theme.colors.travelPeach }]}
          />
        )}

        <View style={styles.destinationContent}>
          <Text variant="h4" weight="semibold" numberOfLines={1}>
            {destination.city}
          </Text>
          <Text variant="body2" color="muted">
            {destination.country}
            {destination.continent ? ` • ${destination.continent}` : ''}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
});

// Section for trips grouped by month
interface TripSection {
  month: string;
  title: string;
  data: Trip[];
}

export default function DestinationsScreen({ navigation }: any) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<TripSection[]>([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load destinations
  const loadDestinations = async (forceRefresh = false) => {
    try {
      setIsLoadingDestinations(true);
      setError(null);

      const cacheKey = 'all_destinations';

      if (forceRefresh) {
        await clearCacheEntry(cacheKey);
      }

      // Define the fetcher
      const fetcher = async () => {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .order('city', { ascending: true });

        if (error) {
          throw new Error('Failed to load destinations');
        }
        return (data as unknown as Destination[]) || [];
      };

      // Fetch using cache utility
      const typedData = await fetchWithCache(cacheKey, fetcher);

      setDestinations(typedData);
      setFilteredDestinations(typedData);
    } catch (err) {
      console.error('Error in loadDestinations:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoadingDestinations(false);
    }
  };

  // Load trips and organize by month
  const loadTrips = async (forceRefresh = false) => {
    try {
      setIsLoadingTrips(true);

      const cacheKey = 'upcoming_trips';

      if (forceRefresh) {
        await clearCacheEntry(cacheKey);
      }

      // Define the fetcher
      const fetcher = async () => {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .order('start_date', { ascending: true });

        if (error) {
          throw new Error('Failed to load trips');
        }
        return (data as unknown as Trip[]) || [];
      };

      // Fetch using cache utility
      const trips = await fetchWithCache(cacheKey, fetcher);

      // Group trips by month
      const now = new Date();
      const tripsByMonth: Record<string, Trip[]> = {};
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      // Add trips with no start date to "Unscheduled" category
      tripsByMonth['Unscheduled'] = [];

      trips.forEach((trip) => {
        if (!trip.start_date) {
          tripsByMonth['Unscheduled'].push(trip);
          return;
        }

        const startDate = new Date(trip.start_date);
        const monthYear = `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;

        if (!tripsByMonth[monthYear]) {
          tripsByMonth[monthYear] = [];
        }

        tripsByMonth[monthYear].push(trip);
      });

      // Convert to array format for SectionList
      const sections: TripSection[] = Object.keys(tripsByMonth)
        .filter((month) => tripsByMonth[month].length > 0) // Only include months with trips
        .map((month) => ({
          month,
          title: month === 'Unscheduled' ? 'Unscheduled Trips' : `Trips in ${month}`,
          data: tripsByMonth[month],
        }));

      setUpcomingTrips(sections);
    } catch (err) {
      console.error('Error in loadTrips:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoadingTrips(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadDestinations();
    loadTrips();
  }, []);

  // Handle search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDestinations(destinations);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = destinations.filter(
      (dest) =>
        dest.city.toLowerCase().includes(query) ||
        dest.country.toLowerCase().includes(query) ||
        (dest.continent && dest.continent.toLowerCase().includes(query))
    );

    setFilteredDestinations(filtered);
  }, [searchQuery, destinations]);

  // Navigation handlers
  const handleDestinationPress = useCallback(
    (destination: Destination) => {
      navigation.navigate('DestinationDetail', { destinationId: destination.id });
    },
    [navigation]
  );

  const handleTripPress = useCallback(
    (tripId: string) => {
      navigation.navigate('TripDetail', { tripId });
    },
    [navigation]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadDestinations(true), loadTrips(true)]);
    setRefreshing(false);
  }, []);

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
                  onPress={handleTripPress}
                  style={styles.tripCard}
                />
              </View>
            ))}

            <TouchableOpacity
              style={styles.createTripCard}
              onPress={() => navigation.navigate('CreateTripStep1')}
            >
              <Card variant="bordered" style={styles.createTripCardInner}>
                <Feather name="plus-circle" size={36} color={theme.colors.primary} />
                <Text
                  variant="body1"
                  weight="medium"
                  color="primary"
                  style={{ marginTop: theme.spacing['2'] }}
                >
                  Create New Trip
                </Text>
              </Card>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    },
    [handleTripPress, navigation, theme]
  );

  // Main render
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search header */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <Input
          placeholder="Search destinations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Feather name="search" size={18} color={theme.colors.mutedForeground} />}
          containerStyle={styles.searchInputContainer}
        />
      </View>

      {/* Loading state */}
      {isLoadingDestinations && isLoadingTrips && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text
            variant="body1"
            color="custom"
            customColor={theme.colors.destructive}
            style={{ marginBottom: theme.spacing['4'] }}
          >
            {error}
          </Text>
          <Button label="Retry" onPress={handleRefresh} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* Upcoming trips sections */}
          {upcomingTrips.length > 0 ? (
            <>
              <Text variant="h2" weight="bold" style={styles.mainTitle}>
                Your Trips
              </Text>

              {upcomingTrips.map((section) => (
                <View key={section.month}>{renderTripSection({ section })}</View>
              ))}

              <View style={styles.sectionDivider} />
            </>
          ) : (
            !isLoadingTrips && (
              <View style={styles.noTripsContainer}>
                <Card variant="subtle" style={styles.noTripsCard}>
                  <Text variant="h4" weight="semibold" style={{ marginBottom: theme.spacing['2'] }}>
                    No trips planned yet
                  </Text>
                  <Text variant="body2" color="muted" style={{ marginBottom: theme.spacing['4'] }}>
                    Start planning your next adventure!
                  </Text>
                  <Button
                    label="Create Your First Trip"
                    variant="primary"
                    onPress={() => navigation.navigate('CreateTripStep1')}
                  />
                </Card>
                <View style={styles.sectionDivider} />
              </View>
            )
          )}

          {/* Destinations section */}
          <View style={styles.destinationsSection}>
            <Text variant="h2" weight="bold" style={styles.mainTitle}>
              Explore Destinations
            </Text>
            <Text variant="body1" color="muted" style={styles.mainSubtitle}>
              Discover new places to add to your bucket list
            </Text>

            <View style={styles.destinationsGrid}>
              {filteredDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  onPress={handleDestinationPress}
                />
              ))}
            </View>

            {filteredDestinations.length === 0 && !isLoadingDestinations && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>🌍</Text>
                <Text variant="body1" weight="medium" style={styles.emptyStateText}>
                  {searchQuery
                    ? `No destinations found matching "${searchQuery}"`
                    : 'No destinations available yet'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  searchInputContainer: {
    marginBottom: 0,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mainTitle: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  mainSubtitle: {
    paddingHorizontal: 16,
    marginBottom: 16,
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
  },
  sectionDivider: {
    height: 16,
  },
  noTripsContainer: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  noTripsCard: {
    padding: 16,
    alignItems: 'center',
  },
  destinationsSection: {
    flex: 1,
  },
  destinationsGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  destinationCardContainer: {
    width: '48%',
    marginBottom: 16,
  },
  destinationCard: {
    overflow: 'hidden',
  },
  destinationImageContainer: {
    marginBottom: 8,
  },
  destinationImageCard: {
    aspectRatio: 1.5,
    overflow: 'hidden',
  },
  destinationImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  destinationPlaceholder: {
    aspectRatio: 1.5,
    borderRadius: 8,
    marginBottom: 8,
  },
  destinationContent: {
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    textAlign: 'center',
  },
});
