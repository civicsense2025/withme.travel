import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { createSupabaseClient } from '../utils/supabase';
import { Trip } from '../types/supabase';
import { useTheme } from '../hooks/useTheme';
import { Text, Button, Card } from '../components/ui'; // Import themed components
import { Feather, Ionicons } from '@expo/vector-icons';
import * as dbUtils from '../utils/database';
import { TABLES, COLUMNS, ENUM_VALUES } from '../constants/database';

// Common travel emojis for picker
const TRAVEL_EMOJIS = [
  '✈️',
  '🚗',
  '🏨',
  '🏖️',
  '🏔️',
  '🏞️',
  '🚅',
  '🚢',
  '🚆',
  '🗺️',
  '🧳',
  '🏕️',
  '🚶',
  '🚴',
  '⛷️',
  '🚣',
  '🏝️',
  '🌋',
  '🌄',
  '🌆',
  '🏙️',
  '🌉',
  '🏰',
  '🏯',
  '🏛️',
  '🕌',
  '⛩️',
  '🕍',
  '⛪',
  '🏪',
  '🍕',
  '🍷',
  '🍹',
  '🍦',
  '🎡',
  '🎭',
  '🎬',
  '🏟️',
  '🏛️',
  '🐪',
];

// Add a more comprehensive type to include joined data
interface ExtendedTrip extends Trip {
  destination?: {
    id: string;
    name: string;
    city?: string;
    country?: string;
    emoji?: string;
    image_url?: string;
  };
  members?: Array<{
    id: string;
    user_id: string;
    role: string;
    profile?: {
      id: string;
      name?: string;
      avatar_url?: string;
    };
  }>;
}

export default function TripDetailScreen({ route, navigation }: any) {
  const { tripId } = route.params;
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user, profile } = useAuth();
  const [trip, setTrip] = useState<ExtendedTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [tripMembers, setTripMembers] = useState<Array<any>>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  const loadTripDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createSupabaseClient();

      // Enhanced query using foreign table joins
      const { data, error } = await supabase
        .from(TABLES.TRIPS)
        .select(`
          id,
          name,
          description,
          trip_emoji,
          start_date,
          end_date,
          duration_days,
          destination_id,
          destination_name,
          cover_image_url,
          status,
          created_by,
          created_at,
          updated_at,
          privacy_setting,
          is_public,
          member_count,
          travelers_count,
          destination:destination_id (
            id,
            name,
            city,
            country,
            emoji,
            image_url
          )
        `)
        .eq(COLUMNS.ID, tripId)
        .single();

      if (error) {
        console.error('Error loading trip:', error);
        setError('Failed to load trip details');
        return;
      }

      // Fetch trip members in a separate query
      const { data: membersData, error: membersError } = await supabase
        .from(TABLES.TRIP_MEMBERS)
        .select(`
          id,
          user_id,
          role,
          joined_at,
          profile: user_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq(COLUMNS.TRIP_ID, tripId);

      if (membersError) {
        console.error('Error loading trip members:', membersError);
        // Non-critical error, so continue without members data
      } else {
        setTripMembers(membersData || []);
        
        // Determine current user's role in this trip
        if (user?.id) {
          const currentUserMember = membersData?.find(m => m.user_id === user.id);
          if (currentUserMember) {
            setUserRole(currentUserMember.role);
          }
        }
      }

      // Combine trip data with members for the extended trip object
      const extendedTripData: ExtendedTrip = {
        ...(data as unknown as Trip),
        members: membersData || []
      };

      setTrip(extendedTripData);
    } catch (err) {
      console.error('Error in loadTripDetails:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [tripId, user?.id]);

  useEffect(() => {
    loadTripDetails();
  }, [loadTripDetails]);

  // Update navigation options when trip data loads
  useEffect(() => {
    if (trip) {
      // Only show Edit button if user is admin or editor
      const canEdit = userRole === ENUM_VALUES.TRIP_MEMBER_ROLE.ADMIN || 
                      userRole === ENUM_VALUES.TRIP_MEMBER_ROLE.EDITOR ||
                      trip.created_by === user?.id;
                      
      navigation.setOptions({
        title: trip.name,
        headerRight: () => (
          canEdit ? (
            <Button
              label="Edit"
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('EditTrip', { trip })}
            />
          ) : null
        ),
      });
    }
  }, [navigation, trip, userRole, user?.id]);

  const handleShare = async () => {
    if (!trip) return;
    try {
      await Share.share({
        message: `Check out my trip: ${trip.name}`,
        // TODO: Add deep link URL
      });
    } catch (error: any) {
      console.error('Error sharing trip:', error);
      Alert.alert('Share Error', error.message || 'Could not share trip');
    }
  };

  const navigateToItinerary = useCallback(() => {
    if (trip) {
      navigation.navigate('Itinerary', { tripId: trip.id });
    } else {
      Alert.alert('Error', 'Cannot navigate to itinerary. Trip data is missing.');
    }
  }, [navigation, trip]);

  const handleEmojiSelect = async (emoji: string) => {
    if (!trip) return;

    setShowEmojiPicker(false);
    const originalEmoji = trip.trip_emoji;

    // Optimistically update UI
    setTrip({ ...trip, trip_emoji: emoji });

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase
        .from('trips')
        .update({ trip_emoji: emoji })
        .eq('id', trip.id);

      if (error) {
        console.error('Error updating emoji:', error);
        Alert.alert('Error', 'Failed to update trip emoji');
        // Revert UI on failure
        setTrip({ ...trip, trip_emoji: originalEmoji });
      }
    } catch (err) {
      console.error('Error in handleEmojiSelect:', err);
      Alert.alert('Error', 'An unexpected error occurred');
      setTrip({ ...trip, trip_emoji: originalEmoji });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !trip) {
    return (
      <View style={styles.centeredContainer}>
        <Text 
          variant="body1" 
          color="custom" 
          customColor={theme.colors.destructive}
          style={styles.errorText}
        >
          {error || 'Trip not found'}
        </Text>
        <Button label="Retry" onPress={loadTripDetails} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={() => setShowEmojiPicker(true)} style={styles.emojiContainer}>
          <Text style={styles.emoji}>{trip.trip_emoji || '✈️'}</Text>
          <View style={styles.editEmojiLabel}>
            <Text variant="caption" color="muted">
              Change
            </Text>
          </View>
        </TouchableOpacity>
        <Text variant="h1" weight="bold" style={styles.title}>
          {trip.name}
        </Text>

        <View style={styles.metaRow}>
          {/* Status Badge */}
          <View style={[styles.statusBadge, getStatusBadgeStyle(trip.status, theme)]}>
            <Text
              variant="caption"
              weight="medium"
              color="custom"
              customColor={getStatusBadgeTextStyle(trip.status, theme)}
            >
              {trip.status || 'Unknown'}
            </Text>
          </View>

          {/* Dates */}
          {trip.start_date && (
            <Text variant="body2" color="muted" style={styles.metaText}>
              🗓️{' '}
              {new Date(trip.start_date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
              {trip.end_date &&
                ` - ${new Date(trip.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
            </Text>
          )}

          {/* Duration */}
          {trip.duration_days && (
            <Text variant="body2" color="muted" style={styles.metaText}>
              ⏱️ {trip.duration_days} {trip.duration_days === 1 ? 'day' : 'days'}
            </Text>
          )}
        </View>
      </View>

      {/* Description Section */}
      {trip.description && (
        <Card style={styles.sectionCard}>
          <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
            Description
          </Text>
          <Text variant="body1" color="secondary">
            {trip.description}
          </Text>
        </Card>
      )}

      {/* Actions Section */}
      <View style={styles.actionsRow}>
        <Button
          label="View Itinerary"
          variant="primary"
          icon={<Feather name="list" size={18} color={theme.colors.travelPurpleForeground} />}
          iconPosition="left"
          onPress={navigateToItinerary}
          style={styles.actionButton}
        />

        <Button
          label="Share"
          variant="secondary"
          icon={<Feather name="share-2" size={18} color={theme.colors.travelBlueForeground} />}
          iconPosition="left"
          onPress={handleShare}
          style={styles.actionButton}
        />
      </View>

      {/* Quick Actions Section */}
      <Card style={styles.sectionCard}>
        <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
          Quick Actions
        </Text>
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => navigation.navigate('EditItineraryItem', { tripId })}
        >
          <Feather
            name="plus"
            size={20}
            color={theme.colors.primary}
            style={styles.quickActionIcon}
          />
          <Text variant="body1">Add Itinerary Item</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem}>
          <Feather
            name="users"
            size={20}
            color={theme.colors.primary}
            style={styles.quickActionIcon}
          />
          <Text variant="body1">Invite Travel Companions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem}>
          <Feather
            name="map-pin"
            size={20}
            color={theme.colors.primary}
            style={styles.quickActionIcon}
          />
          <Text variant="body1">Explore Destination</Text>
        </TouchableOpacity>
      </Card>

      {/* Placeholder for other sections like members, budget, etc. */}
      <View style={{ height: 50 }} />

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
              <Text variant="h3" weight="semibold">
                Choose Trip Emoji
              </Text>
              <TouchableOpacity
                onPress={() => setShowEmojiPicker(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={theme.colors.foreground} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={TRAVEL_EMOJIS}
              keyExtractor={(item, index) => `${item}-${index}`}
              numColumns={6}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.emojiGridItem}
                  onPress={() => handleEmojiSelect(item)}
                >
                  <Text style={styles.modalEmoji}>{item}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.emojiGrid}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Helper functions for dynamic styles
const getStatusBadgeStyle = (status: string | undefined, theme: ReturnType<typeof useTheme>) => {
  const defaultStyle = { backgroundColor: theme.colors.muted, borderColor: theme.colors.border };
  switch (status?.toLowerCase()) {
    case 'planning':
      return {
        backgroundColor: theme.colors.travelBlue,
        borderColor: theme.colors.travelBlueForeground,
      };
    case 'upcoming':
      return {
        backgroundColor: theme.colors.travelMint,
        borderColor: theme.colors.travelMintForeground,
      };
    case 'completed':
      return {
        backgroundColor: theme.colors.secondary,
        borderColor: theme.colors.secondaryForeground,
      };
    default:
      return defaultStyle;
  }
};

const getStatusBadgeTextStyle = (
  status: string | undefined,
  theme: ReturnType<typeof useTheme>
) => {
  const defaultColor = theme.colors.mutedForeground;
  switch (status?.toLowerCase()) {
    case 'planning':
      return theme.colors.travelBlueForeground;
    case 'upcoming':
      return theme.colors.travelMintForeground;
    case 'completed':
      return theme.colors.secondaryForeground;
    default:
      return defaultColor;
  }
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing['4'],
      paddingBottom: theme.spacing['8'],
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
    headerSection: {
      alignItems: 'center',
      marginBottom: theme.spacing['6'],
    },
    emojiContainer: {
      marginBottom: theme.spacing['3'],
      alignItems: 'center',
    },
    emoji: {
      fontSize: 72,
    },
    editEmojiLabel: {
      position: 'absolute',
      bottom: 0,
      right: -theme.spacing['3'],
      backgroundColor: theme.colors.card,
      paddingHorizontal: theme.spacing['1.5'],
      paddingVertical: theme.spacing['0.5'],
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    title: {
      textAlign: 'center',
      marginBottom: theme.spacing['2'],
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginTop: theme.spacing['2'],
    },
    statusBadge: {
      paddingHorizontal: theme.spacing['2'],
      paddingVertical: theme.spacing['1'],
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      marginRight: theme.spacing['2'],
      marginBottom: theme.spacing['1'], // Allow wrapping
    },
    metaText: {
      marginRight: theme.spacing['3'],
      marginBottom: theme.spacing['1'], // Allow wrapping
    },
    sectionCard: {
      marginBottom: theme.spacing['4'],
      padding: theme.spacing['4'],
    },
    sectionTitle: {
      marginBottom: theme.spacing['3'],
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing['4'],
    },
    actionButton: {
      flex: 1, // Make buttons share space
      marginHorizontal: theme.spacing['1'],
    },
    quickActionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing['3'],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    quickActionIcon: {
      marginRight: theme.spacing['3'],
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      padding: theme.spacing['4'],
      maxHeight: '60%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing['4'],
    },
    closeButton: {
      padding: theme.spacing['2'],
    },
    emojiGrid: {
      alignItems: 'center',
    },
    emojiGridItem: {
      padding: theme.spacing['2'],
      margin: theme.spacing['1'],
    },
    modalEmoji: {
      fontSize: 32,
    },
  });
