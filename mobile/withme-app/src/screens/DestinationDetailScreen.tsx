import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Dimensions,
  Alert
} from 'react-native';
import { createSupabaseClient } from '../utils/supabase';
import { Destination, Trip } from '../types/supabase';
import { TABLES, COLUMNS } from '../constants/database';
import * as dbUtils from '../utils/database';

// Debug flag for development
const DEBUG_MODE = __DEV__;

// Screen width for responsive layout
const { width } = Dimensions.get('window');

export default function DestinationDetailScreen({ route, navigation }: any) {
  const { destinationId } = route.params;
  const [destination, setDestination] = useState<Destination | null>(null);
  const [relatedTrips, setRelatedTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  const loadDestinationData = async () => {
    try {
      debugLog('Loading destination data started', { destinationId });
      setIsLoading(true);
      setError(null);
      
      const supabase = createSupabaseClient();
      
      // Load destination details
      const { data, error } = await supabase
        .from(TABLES.DESTINATIONS)
        .select('*')
        .eq(COLUMNS.ID, destinationId)
        .single();
      
      if (error) {
        debugLog('Error loading destination:', error);
        setError('Failed to load destination details');
        return;
      }
      
      // Set destination data
      setDestination(data as unknown as Destination);
      debugLog('Destination loaded', data);
      
      // Load related trips
      const { data: tripsData, error: tripsError } = await supabase
        .from(TABLES.TRIPS)
        .select('*')
        .eq(COLUMNS.DESTINATION_ID, destinationId)
        .order(COLUMNS.CREATED_AT, { ascending: false })
        .limit(5);
      
      if (tripsError) {
        debugLog('Error loading related trips:', tripsError);
        // Don't set error here, just log it - we still have the destination data
      } else {
        setRelatedTrips(tripsData as unknown as Trip[]);
        debugLog('Related trips loaded', { count: tripsData.length });
      }
    } catch (err) {
      debugLog('Error in loadDestinationData:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set screen title
    navigation.setOptions({
      title: destination?.city || 'Destination',
    });
  }, [destination, navigation]);

  useEffect(() => {
    loadDestinationData();
  }, [destinationId]);

  const handleOpenMap = () => {
    if (!destination?.latitude || !destination?.longitude) {
      Alert.alert('Map Unavailable', 'Location coordinates are not available for this destination.');
      return;
    }
    
    const url = `https://maps.google.com/?q=${destination.latitude},${destination.longitude}`;
    Linking.openURL(url).catch(err => {
      debugLog('Error opening map:', err);
      Alert.alert('Cannot Open Map', 'Unable to open map application.');
    });
  };

  const handleViewTrip = (tripId: string) => {
    navigation.navigate('TripDetail', { tripId });
  };

  // Get a flag emoji for a country
  const getCountryFlag = (country: string): string => {
    // This is a simplified version - in a real app, you would use a more comprehensive mapping
    const countryToFlag: Record<string, string> = {
      'United States': '🇺🇸',
      'Japan': '🇯🇵',
      'France': '🇫🇷',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'United Kingdom': '🇬🇧',
      'Germany': '🇩🇪',
      'Australia': '🇦🇺',
      'Canada': '🇨🇦',
      'China': '🇨🇳',
      'India': '🇮🇳',
      'Brazil': '🇧🇷',
      'Mexico': '🇲🇽',
      'South Korea': '🇰🇷',
      'Thailand': '🇹🇭',
      'Greece': '🇬🇷',
      'Egypt': '🇪🇬',
      'Singapore': '🇸🇬',
      'Indonesia': '🇮🇩',
      'New Zealand': '🇳🇿',
      'Portugal': '🇵🇹',
      'Netherlands': '🇳🇱',
      'Switzerland': '🇨🇭',
      'Sweden': '🇸🇪',
      'Norway': '🇳🇴',
      'Denmark': '🇩🇰',
      'Finland': '🇫🇮',
      'Ireland': '🇮🇪',
      'Austria': '🇦🇹',
      'Turkey': '🇹🇷',
      'Russia': '🇷🇺',
      'South Africa': '🇿🇦',
      'Argentina': '🇦🇷',
      'Chile': '🇨🇱',
      'Peru': '🇵🇪',
      'Colombia': '🇨🇴',
      'Morocco': '🇲🇦',
      'Kenya': '🇰🇪',
      'Israel': '🇮🇱',
      'UAE': '🇦🇪',
      'Vietnam': '🇻🇳',
      'Malaysia': '🇲🇾',
      'Philippines': '🇵🇭',
      'Croatia': '🇭🇷',
      'Czech Republic': '🇨🇿',
    };
    
    return countryToFlag[country] || '🏳️';
  };

  // Get emoji for continent
  const getContinentEmoji = (continent: string | null) => {
    if (!continent) return '🌎';
    
    const continentEmojis: Record<string, string> = {
      'africa': '🌍',
      'antarctica': '🧊',
      'asia': '🌏',
      'australia': '🦘',
      'europe': '🏰',
      'north america': '🗽',
      'south america': '🌴',
      'oceania': '🏝️'
    };
    
    const normalized = continent.toLowerCase();
    return continentEmojis[normalized] || '🌎';
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066ff" />
        <Text style={styles.loadingText}>Loading destination details...</Text>
      </View>
    );
  }

  if (error || !destination) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Destination not found'}</Text>
        <TouchableOpacity style={styles.button} onPress={loadDestinationData}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.linkButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Hero Image */}
      <View style={styles.imageContainer}>
        {destination.image_url ? (
          <Image 
            source={{ uri: destination.image_url }} 
            style={styles.heroImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>{getContinentEmoji(destination.continent)}</Text>
          </View>
        )}
        
        {/* Header overlay */}
        <View style={styles.headerOverlay}>
          <View style={styles.headerContent}>
            <Text style={styles.cityName}>{destination.city}</Text>
            <View style={styles.countryContainer}>
              <Text style={styles.countryFlag}>{getCountryFlag(destination.country)}</Text>
              <Text style={styles.countryName}>{destination.country}</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Content Sections */}
      <View style={styles.content}>
        {/* City Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {destination.description ? (
            <Text style={styles.description}>{destination.description}</Text>
          ) : (
            <Text style={styles.emptyText}>No description available for this destination.</Text>
          )}
        </View>
        
        {/* Location */}
        {destination.latitude && destination.longitude && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapPreview}>
              <Text style={styles.coordinates}>
                📍 {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
              </Text>
              <TouchableOpacity style={styles.mapButton} onPress={handleOpenMap}>
                <Text style={styles.buttonText}>Open in Maps</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Related Trips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trips to {destination.city}</Text>
          {relatedTrips.length > 0 ? (
            <View style={styles.tripsContainer}>
              {relatedTrips.map(trip => (
                <TouchableOpacity
                  key={trip.id}
                  style={styles.tripCard}
                  onPress={() => handleViewTrip(trip.id)}
                >
                  <Text style={styles.tripEmoji}>{trip.trip_emoji || '✈️'}</Text>
                  <View style={styles.tripDetails}>
                    <Text style={styles.tripName}>{trip.name}</Text>
                    {trip.start_date && (
                      <Text style={styles.tripDate}>
                        {new Date(trip.start_date).toLocaleDateString()}
                        {trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString()}`}
                      </Text>
                    )}
                    <Text style={styles.tripStatus}>{trip.status}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity 
                style={styles.viewMoreButton}
                onPress={() => {
                  Alert.alert('Coming Soon', 'View all trips for this destination will be available soon');
                }}
              >
                <Text style={styles.viewMoreText}>View All Trips</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyTripsContainer}>
              <Text style={styles.emptyText}>No trips found for this destination.</Text>
              <TouchableOpacity 
                style={[styles.button, styles.createTripButton]}
                onPress={() => {
                  // Navigate to create trip when implemented
                  Alert.alert('Coming Soon', 'Create trip feature will be available soon');
                }}
              >
                <Text style={styles.buttonText}>Plan a Trip Here</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* More information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Info</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Continent:</Text>
              <Text style={styles.infoValue}>
                {getContinentEmoji(destination.continent)} {destination.continent || 'Unknown'}
              </Text>
            </View>
            
            {/* Placeholder for additional info that would come from expanded API */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Best time to visit:</Text>
              <Text style={styles.infoValue}>Coming soon</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Popular for:</Text>
              <Text style={styles.infoValue}>Coming soon</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Travel rating:</Text>
              <Text style={styles.infoValue}>Coming soon</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 72,
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  headerContent: {
    width: '100%',
  },
  cityName: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  countryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: {
    fontSize: 18,
    marginRight: 6,
  },
  countryName: {
    color: '#ffffff',
    fontSize: 18,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  mapPreview: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  coordinates: {
    fontSize: 16,
    marginBottom: 12,
    color: '#555',
  },
  mapButton: {
    backgroundColor: '#0066ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#0066ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  linkButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  linkButtonText: {
    color: '#0066ff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tripsContainer: {
    marginTop: 8,
  },
  tripCard: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  tripEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  tripDetails: {
    flex: 1,
  },
  tripName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
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
  viewMoreButton: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewMoreText: {
    color: '#0066ff',
    fontWeight: 'bold',
  },
  emptyTripsContainer: {
    alignItems: 'center',
    padding: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  createTripButton: {
    marginTop: 8,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  infoContainer: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
}); 