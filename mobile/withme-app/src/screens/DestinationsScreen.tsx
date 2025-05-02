import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { createSupabaseClient } from '../utils/supabase';
import { Destination } from '../types/supabase';
import { fetchWithCache, clearCacheEntry } from '../utils/cache';
import { useTheme } from '../hooks/useTheme';
import { Text } from '../components/ui/Text';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { TABLES, COLUMNS } from '../constants/database';

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
              <Image
                source={{ uri: destination.image_url }}
                style={styles.destinationImage}
                contentFit="cover"
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

export default function DestinationsScreen({ navigation }: any) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load destinations
  const loadDestinations = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const cacheKey = 'all_destinations';

      if (forceRefresh) {
        await clearCacheEntry(cacheKey);
      }

      // Define the fetcher
      const fetcher = async () => {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from(TABLES.DESTINATIONS)
          .select(`
            id, 
            name, 
            city, 
            country, 
            continent, 
            image_url, 
            description, 
            emoji, 
            byline,
            popularity,
            likes_count,
            avg_cost_per_day,
            highlights,
            safety_rating,
            perfect_for,
            latitude,
            longitude
          `)
          .order('popularity', { ascending: false })
          .limit(100); // Limit to prevent too much data loading

        if (error) {
          throw new Error('Failed to load destinations');
        }
        
        // Process the data to ensure all properties are set
        const processedData = (data as unknown as Destination[]).map(dest => ({
          ...dest,
          // Add a default emoji if not present
          emoji: dest.emoji || getDefaultEmoji(dest.continent),
          // Make sure the image URL is properly formed
          image_url: ensureValidImageUrl(dest.image_url)
        }));
        
        return processedData || [];
      };

      // Fetch using cache utility
      const typedData = await fetchWithCache(cacheKey, fetcher);

      // Group destinations by continent for better organization
      const groupedData = groupDestinationsByContinent(typedData);
      
      setDestinations(typedData);
      setFilteredDestinations(typedData);
    } catch (err) {
      console.error('Error in loadDestinations:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get a default emoji based on continent
  const getDefaultEmoji = (continent?: string | null): string => {
    if (!continent) return '🌎';
    
    const continentEmojis: Record<string, string> = {
      'Africa': '🌍',
      'Asia': '🌏',
      'Europe': '🇪🇺',
      'North America': '🌎',
      'South America': '🌎',
      'Australia': '🦘',
      'Antarctica': '🧊'
    };
    
    return continentEmojis[continent] || '🌎';
  };
  
  // Helper function to ensure valid image URL
  const ensureValidImageUrl = (url?: string | null): string => {
    if (!url) return 'https://withme.travel/images/default-destination.jpg';
    
    // If it's already a full URL, return it
    if (url.startsWith('http')) return url;
    
    // Otherwise, assume it's a relative path and add the base URL
    return `https://withme.travel${url.startsWith('/') ? '' : '/'}${url}`;
  };
  
  // Helper function to group destinations by continent
  const groupDestinationsByContinent = (destinations: Destination[]) => {
    return destinations.reduce<Record<string, Destination[]>>((groups, dest) => {
      const continent = dest.continent || 'Other';
      if (!groups[continent]) {
        groups[continent] = [];
      }
      groups[continent].push(dest);
      return groups;
    }, {});
  };

  // Initial load
  useEffect(() => {
    loadDestinations();
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
        (dest.city?.toLowerCase() || '').includes(query) ||
        (dest.country?.toLowerCase() || '').includes(query) ||
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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDestinations(true);
    setRefreshing(false);
  }, []);

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
      {isLoading && !refreshing ? (
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

            {filteredDestinations.length === 0 && !isLoading && (
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
