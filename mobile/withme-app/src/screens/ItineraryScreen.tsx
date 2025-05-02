import React, { useEffect, useState, useCallback, memo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated as RNAnimated, // Use RNAnimated for non-reanimated animations if needed
} from 'react-native';
import { createSupabaseClient } from '../utils/supabase';
import { Trip, ItineraryItem } from '../types/supabase';
import Emoji from 'react-native-emoji';
import { getCategoryEmoji } from '../constants/itinerary';
import { TABLES, COLUMNS } from '../constants/database';
import * as dbUtils from '../utils/database';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  withSpring,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  scrollTo,
} from 'react-native-reanimated'; // Re-add Animated import
import { Ionicons } from '@expo/vector-icons';
import {
  PanGestureHandler,
  ScrollView,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Animated as NativeAnimated } from 'react-native'; // Import Animated from react-native for type hints in Swipeable render prop

// Extended types for itinerary items with place join
interface ExtendedItineraryItem extends ItineraryItem {
  places?: {
    id: string;
    name: string;
    description?: string;
    address?: string;
    category?: string;
    latitude?: number;
    longitude?: number;
    images?: string[];
    rating?: number;
    price_level?: number;
  };
}

export default function ItineraryScreen({ route, navigation }: any) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);

  const loadTripAndItinerary = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createSupabaseClient();

      // Load trip details and itinerary items in parallel with enhanced queries
      const [tripResult, itemsResult] = await Promise.all([
        // Get trip with destination info
        supabase
          .from(TABLES.TRIPS)
          .select(`
            id, 
            name, 
            description, 
            start_date, 
            end_date, 
            destination_id, 
            destination_name, 
            cover_image_url, 
            trip_emoji,
            status,
            travelers_count,
            member_count
          `)
          .eq(COLUMNS.ID, tripId)
          .single(),
          
        // Get itinerary items with place details using join
        supabase
          .from(TABLES.ITINERARY_ITEMS)
          .select(`
            id, 
            title, 
            description,
            notes,
            day_number, 
            start_time, 
            end_time, 
            location, 
            address,
            place_id,
            category,
            order_in_day,
            date,
            latitude,
            longitude,
            cost,
            currency,
            cover_image_url,
            places:place_id (
              id,
              name,
              description,
              address,
              category,
              latitude,
              longitude,
              images,
              rating,
              price_level
            )
          `)
          .eq(COLUMNS.TRIP_ID, tripId)
          .order(COLUMNS.DAY_NUMBER, { ascending: true })
          .order(COLUMNS.ORDER_IN_DAY, { ascending: true })
      ]);

      const { data: tripData, error: tripError } = tripResult;
      const { data: itemsData, error: itemsError } = itemsResult;

      if (tripError || !tripData) {
        console.error('Error loading trip:', tripError);
        setError('Failed to load trip details');
        return;
      }

      // Use unknown as an intermediate step for type safety
      setTrip(tripData as unknown as Trip);

      if (itemsError) {
        console.error('Error loading itinerary items:', itemsError);
        setError('Failed to load itinerary items');
        return;
      }

      // Process itinerary items - add order_in_day, add missing day_numbers, 
      // and incorporate place data if available
      const processedItems = ((itemsData as unknown as ExtendedItineraryItem[]) || []).map(
        (item, index) => {
          // Get place data if it exists
          const placeData = item.places;
          
          // Create a processed item with defaults for missing values
          const processedItem = {
            ...item,
            order_in_day: item.order_in_day !== null ? item.order_in_day : index,
            day_number: item.day_number !== null ? item.day_number : 0,
            // If we have place data but no coordinates, use those from the place
            latitude: item.latitude || (placeData?.latitude || null),
            longitude: item.longitude || (placeData?.longitude || null),
            // If location is not set but we have place name, use that
            location: item.location || (placeData?.name || null),
            // If address is not set but we have place address, use that
            address: item.address || (placeData?.address || null),
          };
          
          // Create a clean copy without the places property
          const cleanItem = { ...processedItem };
          delete (cleanItem as any).places;
          
          return cleanItem as ItineraryItem;
        }
      );

      setItineraryItems(processedItems);
      
      // After loading, check if items have dates - if not, set them based on trip start date
      if (processedItems.length > 0 && tripData.start_date) {
        const needsDateUpdate = processedItems.some(item => !item.date);
        
        if (needsDateUpdate) {
          await updateItemDatesFromTripStart(tripData.start_date, processedItems);
        }
      }
    } catch (err) {
      console.error('Error in loadTripAndItinerary:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to update dates for items that don't have them
  const updateItemDatesFromTripStart = async (tripStartDate: string, items: ItineraryItem[]) => {
    try {
      const supabase = createSupabaseClient();
      const startDate = new Date(tripStartDate);
      
      // Create update promises for items that need dates
      const updatePromises = items
        .filter(item => !item.date && item.day_number !== undefined && item.day_number !== null)
        .map(item => {
          // Calculate date based on trip start date + day_number
          const itemDate = new Date(startDate);
          itemDate.setDate(startDate.getDate() + (item.day_number || 0));
          const formattedDate = itemDate.toISOString().split('T')[0];
          
          // Update the item's date in the database
          return supabase
            .from(TABLES.ITINERARY_ITEMS)
            .update({ date: formattedDate })
            .eq(COLUMNS.ID, item.id);
        });
      
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        // Reload data to get updated dates
        loadTripAndItinerary();
      }
    } catch (error) {
      console.error('Error updating item dates:', error);
      // Don't show an error to the user, just log it
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
        <View style={{ flexDirection: 'row' }}>
          {isUpdating && (
            <ActivityIndicator size="small" color="#0066ff" style={{ marginRight: 10 }} />
          )}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              navigation.navigate('EditItineraryItem', { tripId });
            }}
          >
            <Text style={styles.headerButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, trip, isUpdating]);

  // Group items by day
  const itemsByDay = itineraryItems.reduce(
    (acc, item) => {
      const day = item.day_number || 0;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(item);
      return acc;
    },
    {} as Record<number, ItineraryItem[]>
  );

  // Create an array of day numbers for the section list
  const dayNumbers = Object.keys(itemsByDay)
    .map(Number)
    .sort((a, b) => a - b);

  // Use useCallback for the navigation handler
  const handleNavigateToEdit = useCallback(
    (itemId?: string) => {
      navigation.navigate('EditItineraryItem', { tripId, itemId });
    },
    [navigation, tripId]
  );

  // Function to save the updated order to the database
  const saveItemsOrder = async (updatedItems: ItineraryItem[]) => {
    try {
      setIsUpdating(true);
      const supabase = createSupabaseClient();

      // Update each item's order_in_day and possibly day_number
      const updatePromises = updatedItems.map((item) =>
        supabase
          .from(TABLES.ITINERARY_ITEMS)
          .update({
            order_in_day: item.order_in_day,
            day_number: item.day_number,
          })
          .eq(COLUMNS.ID, item.id)
      );

      await Promise.all(updatePromises);
      console.log('Successfully updated item order');
    } catch (err) {
      console.error('Error updating item order:', err);
      Alert.alert('Error', 'Failed to save the new order. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // When an item is moved to a new position
  const handleItemReorder = useCallback(
    (itemId: string, newDayNumber: number, newPosition: number) => {
      // Update the local state
      setItineraryItems((prevItems) => {
        // Find the item to move
        const itemToMove = prevItems.find((item) => item.id === itemId);
        if (!itemToMove) return prevItems;

        const oldDayNumber = itemToMove.day_number || 0;

        // Create a copy of the items array
        const newItems = [...prevItems];

        // If moving within the same day, just reorder
        if (oldDayNumber === newDayNumber) {
          // Update positions for all items in this day
          return newItems.map((item) => {
            if (item.id === itemId) {
              // This is the item we're moving
              return { ...item, order_in_day: newPosition };
            } else if (item.day_number === newDayNumber) {
              // Shift other items in the same day
              const currentPosition = item.order_in_day || 0;
              const oldPosition = itemToMove.order_in_day || 0;

              if (newPosition <= currentPosition && currentPosition < oldPosition) {
                // Items between new and old position (moving up)
                return { ...item, order_in_day: currentPosition + 1 };
              } else if (oldPosition < currentPosition && currentPosition <= newPosition) {
                // Items between old and new position (moving down)
                return { ...item, order_in_day: currentPosition - 1 };
              }
            }
            return item;
          });
        } else {
          // Moving to a different day
          return newItems.map((item) => {
            if (item.id === itemId) {
              // This is the item we're moving
              return {
                ...item,
                day_number: newDayNumber,
                order_in_day: newPosition,
              };
            } else if (item.day_number === oldDayNumber) {
              // Adjust order in the original day
              const currentPosition = item.order_in_day || 0;
              const oldPosition = itemToMove.order_in_day || 0;

              if (currentPosition > oldPosition) {
                // Items after the moved item in original day
                return { ...item, order_in_day: currentPosition - 1 };
              }
            } else if (item.day_number === newDayNumber) {
              // Adjust order in the target day
              const currentPosition = item.order_in_day || 0;

              if (currentPosition >= newPosition) {
                // Items at or after the insertion point
                return { ...item, order_in_day: currentPosition + 1 };
              }
            }
            return item;
          });
        }
      });
    },
    []
  );

  // Save changes after reordering finishes
  const handleReorderComplete = useCallback(() => {
    saveItemsOrder(itineraryItems);
  }, [itineraryItems]);

  // Use useCallback for the delete handler
  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      // Optimistically remove from UI
      const originalItems = [...itineraryItems];
      setItineraryItems((prevItems) => prevItems.filter((item) => item.id !== itemId));

      try {
        const success = await dbUtils.deleteRecord(TABLES.ITINERARY_ITEMS, itemId);
        if (!success) {
          throw new Error('Failed to delete item from database');
        }
        console.log('Successfully deleted item', itemId);
        // Optionally show a success toast/message
      } catch (deleteError) {
        console.error('Error deleting itinerary item:', deleteError);
        Alert.alert('Error', 'Could not delete the item. Please try again.');
        // Revert UI state if delete failed
        setItineraryItems(originalItems);
      }
    },
    [itineraryItems]
  );

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
        <TouchableOpacity style={styles.retryButton} onPress={loadTripAndItinerary}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          scrollEventThrottle={16}
          onScroll={(event) => {
            scrollY.value = event.nativeEvent.contentOffset.y;
          }}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.header}>
            <View style={styles.tripEmojiContainer}>
              <Text style={styles.tripEmoji}>{trip.trip_emoji || '✈️'}</Text>
            </View>
            <Text style={styles.tripName}>{trip.name}</Text>
            {trip.start_date && trip.end_date && (
              <Text style={styles.tripDates}>
                {new Date(trip.start_date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                -{' '}
                {new Date(trip.end_date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            )}
          </View>

          {dayNumbers.length > 0 ? (
            dayNumbers.map((dayNumber) => (
              <DraggableDaySection
                key={`day-${dayNumber}`}
                dayNumber={dayNumber}
                items={itemsByDay[dayNumber]}
                onDeleteItem={handleDeleteItem}
                onItemPress={handleNavigateToEdit}
                onItemReorder={handleItemReorder}
                onReorderComplete={handleReorderComplete}
                scrollY={scrollY}
                scrollRef={scrollRef}
                setIsDragging={setIsDragging}
                trip={trip}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🗓️</Text>
              <Text style={styles.emptyStateText}>
                No itinerary items yet. Tap the Add button to create your first activity.
              </Text>
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
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

// Draggable Day Section Component
const DraggableDaySection = memo(
  ({
    dayNumber,
    items,
    onDeleteItem,
    onItemPress,
    onItemReorder,
    onReorderComplete,
    scrollY,
    scrollRef,
    setIsDragging,
    trip,
  }: {
    dayNumber: number;
    items: ItineraryItem[];
    onDeleteItem: (itemId: string) => void;
    onItemPress: (itemId?: string) => void;
    onItemReorder: (itemId: string, newDayNumber: number, newPosition: number) => void;
    onReorderComplete: () => void;
    scrollY: Animated.SharedValue<number>;
    scrollRef: React.RefObject<ScrollView>;
    setIsDragging: (isDragging: boolean) => void;
    trip: Trip;
  }) => {
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
      <View style={styles.daySection}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayEmoji}>{dayEmoji}</Text>
          <Text style={styles.dayTitle}>{dayLabel}</Text>
        </View>
        {items.length > 0 ? (
          <View style={styles.itemsContainer}>
            {items.map((item, index) => (
              <DraggableItem
                key={item.id}
                item={item}
                index={index}
                onDelete={onDeleteItem}
                onPress={onItemPress}
                dayNumber={dayNumber}
                itemsCount={items.length}
                onItemReorder={onItemReorder}
                onReorderComplete={onReorderComplete}
                scrollY={scrollY}
                scrollRef={scrollRef}
                setIsDragging={setIsDragging}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyDayText}>No activities planned for this day yet.</Text>
        )}
      </View>
    );
  }
);

// Swipeable Action Component
const renderRightActions = (
  progress: RNAnimated.AnimatedInterpolation<number>,
  dragX: RNAnimated.AnimatedInterpolation<number>,
  onPress: () => void
) => {
  const trans = dragX.interpolate({
    inputRange: [-80, 0],
    outputRange: [0, 80],
    extrapolate: 'clamp',
  });

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
    extrapolate: 'clamp',
  });

  return (
    <TouchableOpacity onPress={onPress} style={styles.deleteButtonContainer}>
      <RNAnimated.View style={[styles.deleteButton, { transform: [{ translateX: trans }] }]}>
        <RNAnimated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-bin" size={24} color="#fff" />
        </RNAnimated.View>
      </RNAnimated.View>
    </TouchableOpacity>
  );
};

// Draggable Item Component
const DraggableItem = memo(
  ({
    item,
    index,
    onDelete,
    onPress,
    dayNumber,
    itemsCount,
    onItemReorder,
    onReorderComplete,
    scrollY,
    scrollRef,
    setIsDragging,
  }: {
    item: ItineraryItem;
    index: number;
    onDelete: (itemId: string) => void;
    onPress: (itemId?: string) => void;
    dayNumber: number;
    itemsCount: number;
    onItemReorder: (itemId: string, newDayNumber: number, newPosition: number) => void;
    onReorderComplete: () => void;
    scrollY: Animated.SharedValue<number>;
    scrollRef: React.RefObject<ScrollView>;
    setIsDragging: (isDragging: boolean) => void;
  }) => {
    // Item's position values
    const itemHeight = useSharedValue(0);
    const itemY = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const translateY = useSharedValue(0);
    const isActive = useSharedValue(false);
    const isDraggingItem = useSharedValue(false);

    // Get item dimensions on layout
    const onLayout = (event: any) => {
      const { height, y } = event.nativeEvent.layout;
      itemHeight.value = height;
      itemY.value = y;
    };

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

    const handlePress = useCallback(() => {
      onPress(item.id);
    }, [item.id, onPress]);

    const handleDelete = useCallback(() => {
      Alert.alert('Delete Item', `Are you sure you want to delete "${item.title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
      ]);
    }, [item.id, item.title, onDelete]);

    // Animated style for the item when being dragged
    const animatedStyle = useAnimatedStyle(() => {
      return {
        zIndex: isDraggingItem.value ? 999 : 1,
        shadowOpacity: isDraggingItem.value ? 0.2 : 0,
        shadowOffset: { width: 0, height: isDraggingItem.value ? 10 : 0 },
        shadowRadius: isDraggingItem.value ? 10 : 0,
        elevation: isDraggingItem.value ? 5 : 0,
        transform: [{ translateY: translateY.value }],
        backgroundColor: isDraggingItem.value
          ? 'rgba(255, 255, 255, 0.9)'
          : isActive.value
            ? 'rgba(0, 102, 255, 0.05)'
            : 'white',
      };
    });

    // Gesture handler for drag
    const panGesture = useAnimatedGestureHandler({
      onStart: (_, ctx: any) => {
        ctx.startY = translateY.value;
        offsetY.value = scrollY.value;
        isDraggingItem.value = true;
        runOnJS(setIsDragging)(true);
      },
      onActive: (event, ctx) => {
        translateY.value = ctx.startY + event.translationY;

        // Auto-scroll when near edges
        const scrollThreshold = 100;
        const scrollAmount = 5;

        if (scrollRef.current) {
          const currentOffsetY = scrollY.value;

          if (event.absoluteY < scrollThreshold) {
            // Scroll up
            scrollTo(scrollRef, 0, Math.max(0, currentOffsetY - scrollAmount), false);
          } else if (event.absoluteY > (ctx.windowHeight || 600) - scrollThreshold) {
            // Scroll down
            scrollTo(scrollRef, 0, currentOffsetY + scrollAmount, false);
          }
        }
      },
      onEnd: (_, ctx) => {
        const newPosition = Math.round((translateY.value + itemY.value) / itemHeight.value);
        const clampedPosition = Math.max(0, Math.min(itemsCount - 1, newPosition));

        // Reset translation
        translateY.value = withSpring(0, { damping: 15 });
        isDraggingItem.value = false;
        runOnJS(setIsDragging)(false);

        // If position changed, update order
        if (clampedPosition !== index) {
          runOnJS(onItemReorder)(item.id, dayNumber, clampedPosition);
          runOnJS(onReorderComplete)();
        }
      },
    });

    return (
      <Swipeable
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, handleDelete)}
        enabled={!isDraggingItem.value}
        overshootRight={false}
      >
        <PanGestureHandler onGestureEvent={panGesture}>
          <Animated.View style={[styles.itineraryItemBase, animatedStyle]} onLayout={onLayout}>
            <TouchableOpacity
              onPress={handlePress}
              style={{ flexDirection: 'row', flex: 1 }}
              disabled={isDraggingItem.value}
            >
              <View style={styles.dragHandle}>
                <Ionicons name="reorder-three" size={24} color="#999" />
              </View>

              <View style={styles.itemIconContainer}>
                <Text style={styles.itemIcon}>{categoryEmoji}</Text>
              </View>

              <View style={styles.itemContent}>
                {timeText ? <Text style={styles.itemTime}>{timeText}</Text> : null}

                <Text style={styles.itemTitle}>{item.title}</Text>

                {item.location_name ? (
                  <View style={styles.locationRow}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.itemLocation}>{item.location_name}</Text>
                  </View>
                ) : null}

                {item.description ? (
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}

                <Text
                  style={[
                    styles.itemStatus,
                    item.status
                      ? styles[`status_${item.status}` as keyof typeof styles]
                      : styles.status_suggested,
                  ]}
                >
                  {item.status
                    ? `${item.status.charAt(0).toUpperCase()}${item.status.slice(1)}`
                    : 'Suggested'}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      </Swipeable>
    );
  }
);

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
  itemsContainer: {
    position: 'relative',
  },
  itineraryItemBase: {
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
    minHeight: 100,
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
  // Styles for Swipeable Delete Button
  deleteButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '85%',
    borderRadius: 12,
    marginRight: 16,
  },
  // Drag handle
  dragHandle: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});
