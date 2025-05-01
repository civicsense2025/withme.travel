import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
  Modal
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { createSupabaseClient } from '../utils/supabase';
import { Trip } from '../types/supabase';
import { ROUTES } from '../constants/config';
import Emoji from 'react-native-emoji';

// Common travel emojis for picker
const TRAVEL_EMOJIS = [
  '✈️', '🚗', '🏨', '🏖️', '🏔️', '🏞️', '🚅', '🚢', '🚆', '🗺️', 
  '🧳', '🏕️', '🚶', '🚴', '⛷️', '🚣', '🏝️', '🌋', '🌄', '🌆', 
  '🏙️', '🌉', '🏰', '🏯', '🏛️', '🕌', '⛩️', '🕍', '⛪', '🏪',
  '🍕', '🍷', '🍹', '🍦', '🎡', '🎭', '🎬', '🏟️', '🏛️', '🐪'
];

export default function TripDetailScreen({ route, navigation }: any) {
  const { tripId } = route.params;
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const loadTripDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supabase = createSupabaseClient();
      
      // Load trip details
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();
      
      if (error) {
        console.error('Error loading trip:', error);
        setError('Failed to load trip details');
        return;
      }
      
      setTrip(data as unknown as Trip);
    } catch (err) {
      console.error('Error in loadTripDetails:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTripDetails();
  }, [tripId]);

  // Add navigation options
  useEffect(() => {
    navigation.setOptions({
      title: trip?.name || 'Trip Details',
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => {
            // In a real app, navigate to trip edit screen
            Alert.alert('Coming Soon', 'Trip editing will be available soon');
          }}
        >
          <Text style={styles.headerButtonText}>Edit</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, trip]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my trip: ${trip?.name}`,
        // In a real app, you would include a deep link here
      });
    } catch (error) {
      console.error('Error sharing trip:', error);
    }
  };

  const navigateToItinerary = () => {
    if (trip) {
      navigation.navigate('Itinerary', { tripId: trip.id });
    } else {
      Alert.alert('Error', 'Cannot navigate to itinerary. Trip data is missing.');
    }
  };

  const handleEmojiSelect = async (emoji: string) => {
    if (!trip) return;
    
    setShowEmojiPicker(false);
    
    try {
      const supabase = createSupabaseClient();
      
      const { error } = await supabase
        .from('trips')
        .update({ trip_emoji: emoji })
        .eq('id', trip.id);
      
      if (error) {
        console.error('Error updating emoji:', error);
        Alert.alert('Error', 'Failed to update trip emoji');
        return;
      }
      
      // Update local state
      setTrip({
        ...trip,
        trip_emoji: emoji
      });
      
    } catch (err) {
      console.error('Error in handleEmojiSelect:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066ff" />
      </View>
    );
  }

  if (error || !trip) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Trip not found'}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={loadTripDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => setShowEmojiPicker(true)}
          style={styles.emojiContainer}
        >
          <Text style={styles.emoji}>{trip.trip_emoji || '✈️'}</Text>
          <View style={styles.editEmojiLabel}>
            <Text style={styles.editEmojiText}>Change</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>{trip.name}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.status}>{trip.status}</Text>
        </View>
        
        {trip.start_date && (
          <Text style={styles.dates}>
            {new Date(trip.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} 
            {trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
          </Text>
        )}
        
        {trip.duration_days && (
          <Text style={styles.duration}>
            {trip.duration_days} {trip.duration_days === 1 ? 'day' : 'days'}
          </Text>
        )}
      </View>

      {trip.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{trip.description}</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={navigateToItinerary}
        >
          <Text style={styles.actionButtonText}>View Itinerary</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleShare}
        >
          <Text style={styles.secondaryButtonText}>Share Trip</Text>
        </TouchableOpacity>
      </View>

      {/* Additional sections for a full trip detail page */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity 
          style={styles.quickAction} 
          onPress={() => navigation.navigate('EditItineraryItem', { tripId })}
        >
          <Text style={styles.quickActionText}>🗓️ Add Itinerary Item</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionText}>👥 Invite Travel Companions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionText}>🗺️ Explore Destination</Text>
        </TouchableOpacity>
      </View>

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose a Trip Emoji</Text>
              <TouchableOpacity 
                onPress={() => setShowEmojiPicker(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.emojiGrid}>
              {TRAVEL_EMOJIS.map((emoji, index) => (
                <TouchableOpacity 
                  key={`emoji-${index}`}
                  style={styles.emojiButton}
                  onPress={() => handleEmojiSelect(emoji)}
                >
                  <Text style={styles.emojiButtonText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  emojiContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  editEmojiLabel: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#0066ff',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  editEmojiText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#E5F2FF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    color: '#0066ff',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  dates: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  duration: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#0066ff',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#0066ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  secondaryButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quickAction: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  quickActionText: {
    fontSize: 16,
    color: '#0066ff',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#0066ff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#999',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiButton: {
    width: '20%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emojiButtonText: {
    fontSize: 32,
  },
}); 