import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { createSupabaseClient } from '../utils/supabase';
import { Trip, ItineraryItem } from '../types/supabase';
import Emoji from 'react-native-emoji';
import { getCategoryEmoji } from '../constants/itinerary';
import { TABLES, COLUMNS } from '../constants/database';

export default function ItineraryScreen({ route, navigation }: any) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTripAndItinerary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supabase = createSupabaseClient();
      
      // Load trip details
      const { data: tripData, error: tripError } = await supabase
        .from(TABLES.TRIPS)
        .select('*')
        .eq(COLUMNS.ID, tripId)
        .single();
      
      if (tripError) {
        console.error('Error loading trip:', tripError);
        setError('Failed to load trip details');
        return;
      }
      
      // Use unknown as an intermediate step for type safety
      setTrip(tripData as unknown as Trip);
      
      // Load itinerary items
      const { data: itemsData, error: itemsError } = await supabase
        .from(TABLES.ITINERARY_ITEMS)
        .select('*')
        .eq(COLUMNS.TRIP_ID, tripId)
        .order(COLUMNS.DAY_NUMBER, { ascending: true })
        .order(COLUMNS.START_TIME, { ascending: true });
      
      if (itemsError) {
        console.error('Error loading itinerary items:', itemsError);
        setError('Failed to load itinerary items');
        return;
      }
      
      setItineraryItems(itemsData as unknown as ItineraryItem[]);
    } catch (err) {
      console.error('Error in loadTripAndItinerary:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTripAndItinerary();
  }, [tripId]);

  // Add navigation options
  useEffect(() => {
    navigation.setOptions({
      title: trip?.name ? `${trip.name} Itinerary` : 'Itinerary',
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => {
            navigation.navigate('EditItineraryItem', { tripId });
          }}
        >
          <Text style={styles.headerButtonText}>Add</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, trip]);

  // Group items by day
  const itemsByDay = itineraryItems.reduce((acc, item) => {
    const day = item.day_number || 0;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(item);
    return acc;
  }, {} as Record<number, ItineraryItem[]>);

  // Create an array of day numbers for the section list
  const dayNumbers = Object.keys(itemsByDay)
    .map(Number)
    .sort((a, b) => a - b);

  const renderDaySection = (dayNumber: number) => {
    const dayItems = itemsByDay[dayNumber] || [];
    
    // Format the day label
    let dayLabel = `Day ${dayNumber}`;
    let dayEmoji = '📅';
    
    if (dayNumber === 0) {
      dayLabel = 'Unscheduled';
      dayEmoji = '📋';
    }
    
    // If we have start date and this is day 1, show the date
    if (dayNumber > 0 && trip?.start_date) {
      const startDate = new Date(trip.start_date);
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + (dayNumber - 1));
      dayLabel += ` · ${currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    }
    
    return (
      <View key={dayNumber} style={styles.daySection}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayEmoji}>{dayEmoji}</Text>
          <Text style={styles.dayTitle}>{dayLabel}</Text>
        </View>
        {dayItems.length > 0 ? (
          dayItems.map((item) => renderItineraryItem(item))
        ) : (
          <Text style={styles.emptyDayText}>No activities planned for this day yet.</Text>
        )}
      </View>
    );
  };

  const renderItineraryItem = (item: ItineraryItem) => {
    // Format time if we have it
    let timeText = '';
    if (item.start_time) {
      const startTime = new Date(`2000-01-01T${item.start_time}`);
      timeText = startTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
      
      if (item.end_time) {
        const endTime = new Date(`2000-01-01T${item.end_time}`);
        timeText += ` - ${endTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
      }
    }
    
    const categoryEmoji = getCategoryEmoji(item.category);
    
    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.itineraryItem}
        onPress={() => {
          navigation.navigate('EditItineraryItem', { 
            tripId, 
            itemId: item.id 
          });
        }}
      >
        <View style={styles.itemIconContainer}>
          <Text style={styles.itemIcon}>{categoryEmoji}</Text>
        </View>
        
        <View style={styles.itemContent}>
          {timeText ? (
            <Text style={styles.itemTime}>{timeText}</Text>
          ) : null}
          
          <Text style={styles.itemTitle}>{item.title}</Text>
          
          {item.location_name ? (
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.itemLocation}>{item.location_name}</Text>
            </View>
          ) : null}
          
          {item.description ? (
            <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
          ) : null}
          
          <Text style={[styles.itemStatus, styles[`status_${item.status || 'suggested'}`]]}>
            {item.status ? `${item.status.charAt(0).toUpperCase()}${item.status.slice(1)}` : 'Suggested'}
          </Text>
        </View>
      </TouchableOpacity>
    );
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
          onPress={loadTripAndItinerary}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {dayNumbers.length > 0 ? (
        <FlatList
          data={dayNumbers}
          keyExtractor={(item) => `day-${item}`}
          renderItem={({ item }) => renderDaySection(item)}
          contentContainerStyle={styles.contentContainer}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.tripEmojiContainer}>
                <Text style={styles.tripEmoji}>{trip.trip_emoji || '✈️'}</Text>
              </View>
              <Text style={styles.tripName}>{trip.name}</Text>
              {trip.start_date && trip.end_date && (
                <Text style={styles.tripDates}>
                  {new Date(trip.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(trip.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No itinerary items yet. Tap the Add button to create your first activity.</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>🗓️</Text>
          <Text style={styles.emptyStateText}>No itinerary items yet. Tap the Add button to create your first activity.</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              navigation.navigate('EditItineraryItem', { tripId });
            }}
          >
            <Text style={styles.addButtonText}>Add First Activity</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 20,
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
    shadowRadius: 4,
    elevation: 2,
  },
  tripEmojiContainer: {
    backgroundColor: '#f0f8ff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  tripEmoji: {
    fontSize: 30,
  },
  tripName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tripDates: {
    fontSize: 16,
    color: '#666',
  },
  daySection: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    flex: 1,
  },
  itineraryItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  itemIconContainer: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
  },
  itemIcon: {
    fontSize: 24,
  },
  itemContent: {
    flex: 1,
    padding: 16,
  },
  itemTime: {
    fontSize: 14,
    color: '#0066ff',
    marginBottom: 4,
    fontWeight: '600',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  itemLocation: {
    fontSize: 14,
    color: '#666',
  },
  itemDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  itemStatus: {
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    borderRadius: 4,
    overflow: 'hidden',
    fontWeight: '600',
  },
  status_suggested: {
    backgroundColor: '#E5F2FF',
    color: '#0066ff',
  },
  status_confirmed: {
    backgroundColor: '#E3FCEF',
    color: '#00875A',
  },
  status_rejected: {
    backgroundColor: '#FFEBE6',
    color: '#DE350B',
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
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#0066ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#0066ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyDayText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    paddingVertical: 16,
    paddingHorizontal: 16,
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#0066ff',
    fontWeight: 'bold',
  },
}); 