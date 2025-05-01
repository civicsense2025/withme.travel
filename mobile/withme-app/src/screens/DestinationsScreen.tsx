import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Alert
} from 'react-native';
import { createSupabaseClient } from '../utils/supabase';
import { Destination } from '../types/supabase';
import Emoji from 'react-native-emoji';

// Map continents to emojis
const CONTINENT_EMOJIS: Record<string, string> = {
  'africa': '🌍',
  'antarctica': '🧊',
  'asia': '🌏',
  'australia': '🦘',
  'europe': '🏰',
  'north america': '🗽',
  'south america': '🌴',
  'oceania': '🏝️'
};

export default function DestinationsScreen({ navigation }: any) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDestinations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supabase = createSupabaseClient();
      
      // Load all destinations
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('city', { ascending: true });
      
      if (error) {
        console.error('Error loading destinations:', error);
        setError('Failed to load destinations');
        return;
      }
      
      const typedData = data as unknown as Destination[];
      setDestinations(typedData);
      setFilteredDestinations(typedData);
    } catch (err) {
      console.error('Error in loadDestinations:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDestinations();
  }, []);

  useEffect(() => {
    // Filter destinations when search query changes
    if (!searchQuery.trim()) {
      setFilteredDestinations(destinations);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = destinations.filter(
      dest => 
        dest.city.toLowerCase().includes(query) || 
        dest.country.toLowerCase().includes(query) ||
        (dest.continent && dest.continent.toLowerCase().includes(query))
    );
    
    setFilteredDestinations(filtered);
  }, [searchQuery, destinations]);

  const getContinentEmoji = (continent: string | null) => {
    if (!continent) return '🌎';
    
    const normalized = continent.toLowerCase();
    return CONTINENT_EMOJIS[normalized] || '🌎';
  };

  const handleDestinationPress = (destination: Destination) => {
    // For now, just show an alert. Later you could navigate to a destination detail screen
    Alert.alert(
      `${destination.city}, ${destination.country}`,
      destination.description || 'No description available',
      [
        { text: 'Close', style: 'cancel' },
        { 
          text: 'Explore Trips', 
          onPress: () => {
            Alert.alert('Coming Soon', 'Trip discovery by destination will be available soon');
          }
        }
      ]
    );
  };

  const renderDestinationItem = ({ item }: { item: Destination }) => {
    const continentEmoji = getContinentEmoji(item.continent);
    
    return (
      <TouchableOpacity 
        style={styles.destinationCard}
        onPress={() => handleDestinationPress(item)}
      >
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image 
              source={{ uri: item.image_url }} 
              style={styles.destinationImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderEmoji}>{continentEmoji}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.destinationInfo}>
          <Text style={styles.destinationCity}>{item.city}</Text>
          <View style={styles.countryRow}>
            <Text style={styles.countryFlag}>{getCountryFlag(item.country)}</Text>
            <Text style={styles.destinationCountry}>{item.country}</Text>
          </View>
          
          {item.description ? (
            <Text style={styles.destinationDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          {item.latitude && item.longitude ? (
            <View style={styles.coordinatesTag}>
              <Text style={styles.coordinatesText}>📍 Map Available</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  // Simple function to get a flag emoji for a country
  const getCountryFlag = (country: string): string => {
    // This is a very simplified version - in a real app, you would use a more comprehensive mapping
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

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search destinations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066ff" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={loadDestinations}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredDestinations}
          keyExtractor={(item) => item.id}
          renderItem={renderDestinationItem}
          contentContainerStyle={styles.destinationsList}
          numColumns={1}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.headerTitle}>Explore Destinations</Text>
              <Text style={styles.headerSubtitle}>Find your next adventure</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🌍</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery 
                  ? `No destinations found matching "${searchQuery}"`
                  : 'No destinations available yet'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    height: 44,
    backgroundColor: '#f0f0f0',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
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
  listHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  destinationsList: {
    padding: 8,
  },
  destinationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 100,
    height: 100,
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e1f5fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 36,
  },
  destinationInfo: {
    flex: 1,
    padding: 12,
  },
  destinationCity: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  countryFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  destinationCountry: {
    fontSize: 14,
    color: '#666',
  },
  destinationDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  coordinatesTag: {
    backgroundColor: '#f0f8ff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#0066ff',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 