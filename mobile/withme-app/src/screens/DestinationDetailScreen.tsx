import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  useWindowDimensions,
  ImageBackground,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import RenderHtml, { MixedStyleDeclaration } from 'react-native-render-html';
import { createSupabaseClient } from '../utils/supabase';
import { Destination, Trip } from '../types/supabase';
import { TABLES, COLUMNS } from '../constants/database';
import * as dbUtils from '../utils/database';
import { getCountryFlag, getContinentEmoji } from '../utils/emojiUtils';
import { useTheme } from '../hooks/useTheme';
import { Text, Button, Card } from '../components/ui';
import { TripCard } from '../components/TripCard';
import { Feather } from '@expo/vector-icons';

// Debug flag for development
const DEBUG_MODE = __DEV__;

// Example blurhash placeholder
const blurhash = 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH'; // Use a relevant blurhash if possible

export default function DestinationDetailScreen({ route, navigation }: any) {
  const { destinationId } = route.params;
  const theme = useTheme();
  const styles = createStyles(theme);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [relatedTrips, setRelatedTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { width: windowWidth } = useWindowDimensions();

  // Debug function
  const debugLog = (message: string, data?: any) => {
    if (DEBUG_MODE) {
      if (data) {
        console.log(`[DestinationDetail] ${message}`, data);
      } else {
        console.log(`[DestinationDetail] ${message}`);
      }
    }
  };

  const loadDestinationData = useCallback(async () => {
    try {
      debugLog('Loading destination data started', { destinationId });
      setIsLoading(true);
      setError(null);

      const supabase = createSupabaseClient();

      // Load destination details and related trips in parallel
      const [destinationResult, tripsResult] = await Promise.all([
        supabase.from(TABLES.DESTINATIONS).select('*').eq(COLUMNS.ID, destinationId).single(),
        supabase
          .from(TABLES.TRIPS)
          .select('*')
          .eq(COLUMNS.DESTINATION_ID, destinationId)
          .order(COLUMNS.CREATED_AT, { ascending: false })
          .limit(5),
      ]);

      const { data: destinationData, error: destinationError } = destinationResult;
      const { data: tripsData, error: tripsError } = tripsResult;

      if (destinationError) {
        debugLog('Error loading destination:', destinationError);
        setError('Failed to load destination details');
        return;
      }

      // Set destination data
      setDestination(destinationData as unknown as Destination);
      debugLog('Destination loaded', destinationData);

      if (tripsError) {
        debugLog('Error loading related trips:', tripsError);
        // Don't set error here, just log it - we still have the destination data
      } else {
        setRelatedTrips((tripsData as unknown as Trip[]) || []);
        debugLog('Related trips loaded', { count: tripsData?.length || 0 });
      }
    } catch (err) {
      debugLog('Error in loadDestinationData:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [destinationId]);

  useEffect(() => {
    // Set screen title
    navigation.setOptions({
      title: destination?.city || 'Destination',
      headerBackTitleVisible: false,
    });
  }, [destination, navigation]);

  useEffect(() => {
    loadDestinationData();
  }, [loadDestinationData]);

  const handleOpenMap = () => {
    if (!destination?.latitude || !destination?.longitude) {
      Alert.alert(
        'Map Unavailable',
        'Location coordinates are not available for this destination.'
      );
      return;
    }

    const url = `https://maps.google.com/?q=${destination.latitude},${destination.longitude}`;
    Linking.openURL(url).catch((err) => {
      debugLog('Error opening map:', err);
      Alert.alert('Cannot Open Map', 'Unable to open map application.');
    });
  };

  const handleViewTrip = useCallback(
    (tripId: string) => {
      navigation.navigate('TripDetail', { tripId });
    },
    [navigation]
  );

  const handleAddToTrip = useCallback(() => {
    // TODO: Implement logic to add destination to an existing or new trip
    Alert.alert('Add to Trip', 'Functionality coming soon!');
  }, []);

  // Sanitized description for HTML rendering
  const rawDescription = destination?.description || '';
  const sanitizedDescription = rawDescription.replace(/\\"/g, '"').replace(/\\n/g, '<br/>');

  // Styles for HTML tags based on theme
  const htmlTagsStyles: Record<string, MixedStyleDeclaration> = {
    p: {
      fontSize: theme.typography.fontSizes.base,
      lineHeight: theme.typography.lineHeights.normal * theme.typography.fontSizes.base,
      color: theme.colors.foreground,
    },
    a: { color: theme.colors.primary, textDecorationLine: 'none' },
    li: {
      fontSize: theme.typography.fontSizes.base,
      lineHeight: theme.typography.lineHeights.normal * theme.typography.fontSizes.base,
      color: theme.colors.foreground,
      marginBottom: theme.spacing['2'],
    },
    h1: {
      fontSize: theme.typography.fontSizes['2xl'],
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.foreground,
      marginVertical: theme.spacing['3'],
    },
    h2: {
      fontSize: theme.typography.fontSizes.xl,
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.foreground,
      marginVertical: theme.spacing['2.5'],
    },
    h3: {
      fontSize: theme.typography.fontSizes.lg,
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.foreground,
      marginVertical: theme.spacing['2'],
    },
  };

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="body1" color="muted" style={{ marginTop: theme.spacing['3'] }}>
          Loading destination...
        </Text>
      </View>
    );
  }

  if (error || !destination) {
    return (
      <View style={styles.centeredContainer}>
        <Text variant="body1" color="destructive" style={styles.errorText}>
          {error || 'Destination not found'}
        </Text>
        <Button label="Retry" onPress={loadDestinationData} />
        <Button
          label="Go Back"
          variant="ghost"
          onPress={() => navigation.goBack()}
          style={{ marginTop: theme.spacing['3'] }}
        />
      </View>
    );
  }

  // Get the cover image URL from image_url field
  const coverImageUrl = destination.image_url;

  return (
    <ScrollView style={styles.container}>
      {/* Hero Image Section */}
      <View style={styles.heroContainer}>
        {coverImageUrl ? (
          <ImageBackground
            source={{ uri: coverImageUrl }}
            style={styles.heroImageBackground}
            imageStyle={styles.heroImageStyle}
          >
            <View style={styles.heroOverlay} />
          </ImageBackground>
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroPlaceholderEmoji}>
              {getContinentEmoji(destination.continent)}
            </Text>
          </View>
        )}

        {/* Header Content within Hero */}
        <View style={styles.headerContentContainer}>
          <Text variant="h1" weight="bold" style={styles.cityName}>
            {destination.city}
          </Text>
          <View style={styles.countryContainer}>
            <Text style={styles.countryFlag}>{getCountryFlag(destination.country)}</Text>
            <Text variant="h4" weight="medium" style={styles.countryName}>
              {destination.country}
            </Text>
          </View>
        </View>
      </View>

      {/* Content Sections */}
      <View style={styles.contentPadding}>
        {/* Call to Action Button */}
        <Button
          label="Add to Trip"
          variant="primary"
          size="lg"
          icon={<Feather name="plus" size={20} color={theme.colors.travelPurpleForeground} />}
          onPress={handleAddToTrip}
          style={styles.addToTripButton}
        />

        {/* About Section */}
        <Card style={styles.sectionCard}>
          <Text variant="h3" weight="semibold" style={styles.sectionTitle}>
            About
          </Text>
          {sanitizedDescription ? (
            <RenderHtml
              contentWidth={windowWidth - theme.spacing['4'] * 4} // Adjust for padding
              source={{ html: sanitizedDescription }}
              tagsStyles={htmlTagsStyles}
            />
          ) : (
            <Text variant="body1" color="muted">
              No description available for this destination.
            </Text>
          )}
        </Card>

        {/* Location Section */}
        {destination.latitude && destination.longitude && (
          <Card style={styles.sectionCard}>
            <Text variant="h3" weight="semibold" style={styles.sectionTitle}>
              Location
            </Text>
            <View style={styles.locationContent}>
              <Feather name="map-pin" size={20} color={theme.colors.mutedForeground} />
              <Text variant="body1" color="muted" style={styles.coordinates}>
                {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
              </Text>
            </View>
            <Button
              label="Open in Maps"
              variant="outline"
              size="md"
              onPress={handleOpenMap}
              style={styles.mapButton}
            />
          </Card>
        )}

        {/* Related Trips Section */}
        {relatedTrips.length > 0 && (
          <View style={styles.sectionCard}>
            <Text variant="h3" weight="semibold" style={styles.sectionTitle}>
              Trips Featuring {destination.city}
            </Text>
            <FlatList
              data={relatedTrips}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.relatedTripContainer}>
                  <TripCard
                    id={item.id}
                    name={item.name}
                    imageUrl={item.image_url ?? null} // Ensure null if undefined
                    dates={{ start: item.start_date, end: item.end_date }}
                    onPress={handleViewTrip}
                    compact={true} // Use compact style for horizontal list
                  />
                </View>
              )}
              contentContainerStyle={styles.relatedTripsList}
            />
          </View>
        )}

        {/* Placeholder for more sections like activities, restaurants etc. */}
        <View style={{ height: 50 }} />
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centeredContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing['5'],
      backgroundColor: theme.colors.background,
    },
    errorText: {
      textAlign: 'center',
      marginBottom: theme.spacing['4'],
    },
    heroContainer: {
      height: 300, // Adjust height as needed
      justifyContent: 'flex-end',
      position: 'relative',
    },
    heroImageBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.muted, // Placeholder color
    },
    heroImageStyle: {
      // No specific style needed if using background image
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.3)', // Dark overlay for text contrast
    },
    heroPlaceholder: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.travelPeach, // Use a travel color
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroPlaceholderEmoji: {
      fontSize: 80,
      opacity: 0.7,
    },
    headerContentContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: theme.spacing['4'],
    },
    cityName: {
      color: '#fff',
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
      marginBottom: theme.spacing['1'],
    },
    countryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    countryFlag: {
      fontSize: 20,
      marginRight: theme.spacing['2'],
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 1,
    },
    countryName: {
      color: 'rgba(255, 255, 255, 0.9)',
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    contentPadding: {
      padding: theme.spacing['4'],
    },
    addToTripButton: {
      marginVertical: theme.spacing['2'],
      marginBottom: theme.spacing['5'],
    },
    sectionCard: {
      marginBottom: theme.spacing['5'],
      padding: theme.spacing['4'],
    },
    sectionTitle: {
      marginBottom: theme.spacing['3'],
    },
    locationContent: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing['3'],
    },
    coordinates: {
      marginLeft: theme.spacing['2'],
    },
    mapButton: {
      alignSelf: 'flex-start',
    },
    relatedTripsList: {
      paddingVertical: theme.spacing['1'],
    },
    relatedTripContainer: {
      width: 220, // Fixed width for horizontal cards
      marginRight: theme.spacing['3'],
    },
  });
