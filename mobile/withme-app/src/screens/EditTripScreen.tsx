import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createSupabaseClient } from '../utils/supabase';
import { Trip } from '../types/supabase';
import { useAuth } from '../hooks/useAuth';
import { MainStackParamList } from '../navigation';
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
  '🏟️',
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

// Type for the navigation prop
type EditTripNavigationProp = NativeStackNavigationProp<MainStackParamList, 'EditTrip'>;

// Type for the route prop
type EditTripRouteProp = RouteProp<MainStackParamList, 'EditTrip'>;

export default function EditTripScreen() {
  const navigation = useNavigation<EditTripNavigationProp>();
  const route = useRoute<EditTripRouteProp>();
  const { trip } = route.params;
  const { profile } = useAuth();

  // Form state
  const [tripName, setTripName] = useState(trip.name);
  const [description, setDescription] = useState(trip.description || '');
  const [startDate, setStartDate] = useState(trip.start_date || '');
  const [endDate, setEndDate] = useState(trip.end_date || '');
  const [isPublic, setIsPublic] = useState(trip.is_public || false);
  const [selectedEmoji, setSelectedEmoji] = useState(trip.trip_emoji || '✈️');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle start date change and validate format
  const handleStartDateChange = (text: string) => {
    setStartDate(text);
    validateDateFormat(text, 'startDate');
  };

  // Handle end date change and validate format
  const handleEndDateChange = (text: string) => {
    setEndDate(text);
    validateDateFormat(text, 'endDate');
  };

  // Validate date format (YYYY-MM-DD)
  const validateDateFormat = (date: string, field: string) => {
    if (!date) return; // Empty is valid (optional field)

    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) {
      setErrors((prev) => ({ ...prev, [field]: 'Invalid date format (use YYYY-MM-DD)' }));
      return false;
    }

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      setErrors((prev) => ({ ...prev, [field]: 'Invalid date' }));
      return false;
    }

    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    return true;
  };

  // Calculate trip duration in days
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include the start day
  };

  // Validate the form
  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Trip name validation
    if (!tripName.trim()) {
      newErrors.tripName = 'Trip name is required';
    } else if (tripName.length > 100) {
      newErrors.tripName = 'Trip name must be less than 100 characters';
    }

    // Description length validation
    if (description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Date validation
    if (startDate && !validateDateFormat(startDate, 'startDate')) {
      newErrors.startDate = errors.startDate || 'Invalid start date';
    }

    if (endDate && !validateDateFormat(endDate, 'endDate')) {
      newErrors.endDate = errors.endDate || 'Invalid end date';
    }

    // Check if end date is after start date
    if (startDate && endDate && !newErrors.startDate && !newErrors.endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save the updated trip
  const saveTrip = async () => {
    if (!validate()) return;

    setIsSaving(true);

    try {
      const supabase = createSupabaseClient();

      // Calculate duration if both dates are provided
      const duration_days = startDate && endDate ? calculateDuration(startDate, endDate) : null;
      
      // Prepare update object with all fields
      const updateData = {
        [COLUMNS.NAME]: tripName.trim(),
        [COLUMNS.DESCRIPTION]: description.trim() || null,
        [COLUMNS.START_DATE]: startDate || null,
        [COLUMNS.END_DATE]: endDate || null,
        [COLUMNS.DURATION_DAYS]: duration_days,
        [COLUMNS.TRIP_EMOJI]: selectedEmoji,
        [COLUMNS.IS_PUBLIC]: isPublic,
        [COLUMNS.PRIVACY_SETTING]: isPublic
          ? ENUM_VALUES.PRIVACY_SETTING.PUBLIC
          : ENUM_VALUES.PRIVACY_SETTING.PRIVATE,
        [COLUMNS.UPDATED_AT]: new Date().toISOString(),
      };
      
      // Determine trip status based on dates
      if (startDate && endDate) {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (end < now) {
          // Trip is in the past
          updateData[COLUMNS.STATUS] = ENUM_VALUES.TRIP_STATUS.COMPLETED;
        } else if (start > now) {
          // Trip is in the future
          updateData[COLUMNS.STATUS] = ENUM_VALUES.TRIP_STATUS.UPCOMING;
        } else if (start <= now && end >= now) {
          // Trip is currently happening
          updateData[COLUMNS.STATUS] = ENUM_VALUES.TRIP_STATUS.IN_PROGRESS;
        } else {
          // Default to planning if dates are invalid
          updateData[COLUMNS.STATUS] = ENUM_VALUES.TRIP_STATUS.PLANNING;
        }
      } else {
        // No dates, so it's in planning
        updateData[COLUMNS.STATUS] = ENUM_VALUES.TRIP_STATUS.PLANNING;
      }

      // Update the trip record
      const { error } = await supabase
        .from(TABLES.TRIPS)
        .update(updateData)
        .eq(COLUMNS.ID, trip.id);

      if (error) {
        console.error('Error updating trip:', error);
        Alert.alert('Error', 'Failed to update trip. Please try again.');
        return;
      }
      
      // Update trip history record to log this update
      try {
        await supabase
          .from('trip_history')
          .insert({
            trip_id: trip.id,
            action_type: 'TRIP_UPDATED',
            user_id: profile?.id,
            details: { 
              updated_fields: Object.keys(updateData).filter(key => key !== COLUMNS.UPDATED_AT),
              edited_at: new Date().toISOString()
            }
          });
      } catch (historyError) {
        // Non-critical error, just log it
        console.warn('Error logging trip history:', historyError);
      }

      Alert.alert('Success', 'Trip updated successfully', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to trip detail screen
            navigation.goBack();
          },
        },
      ]);
    } catch (err) {
      console.error('Unexpected error updating trip:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Edit Trip</Text>
            <TouchableOpacity style={styles.emojiButton} onPress={() => setShowEmojiPicker(true)}>
              <Text style={styles.currentEmoji}>{selectedEmoji}</Text>
              <Text style={styles.changeEmojiText}>Change</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Trip Name *</Text>
          <TextInput
            style={[styles.input, errors.tripName ? styles.inputError : null]}
            value={tripName}
            onChangeText={setTripName}
            placeholder="Enter a name for your trip"
            placeholderTextColor="#999"
            maxLength={100}
          />
          {errors.tripName ? (
            <Text style={styles.errorText}>{errors.tripName}</Text>
          ) : (
            <Text style={styles.helperText}>Give your trip a memorable name (100 char max)</Text>
          )}

          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description ? styles.inputError : null]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your trip, add notes, or include any other details"
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          {errors.description ? (
            <Text style={styles.errorText}>{errors.description}</Text>
          ) : (
            <Text style={styles.helperText}>{description.length}/500 characters</Text>
          )}

          <Text style={styles.label}>Trip Dates (Optional)</Text>
          <Text style={styles.helperText}>Format: YYYY-MM-DD (e.g., 2025-06-15)</Text>

          <View style={styles.dateContainer}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <TextInput
                style={[styles.input, errors.startDate ? styles.inputError : null]}
                value={startDate}
                onChangeText={handleStartDateChange}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
              {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
            </View>

            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>End Date</Text>
              <TextInput
                style={[styles.input, errors.endDate ? styles.inputError : null]}
                value={endDate}
                onChangeText={handleEndDateChange}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
              {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
            </View>
          </View>

          {startDate && endDate && !errors.startDate && !errors.endDate && (
            <View style={styles.durationContainer}>
              <Text style={styles.durationText}>
                Duration: {calculateDuration(startDate, endDate)} days
              </Text>
            </View>
          )}

          <View style={styles.privacyContainer}>
            <Text style={styles.label}>Trip Privacy</Text>
            <View style={styles.privacyRow}>
              <View style={styles.privacyTextContainer}>
                <Text style={styles.privacyTitle}>{isPublic ? 'Public Trip' : 'Private Trip'}</Text>
                <Text style={styles.privacyDescription}>
                  {isPublic
                    ? 'Anyone can view this trip'
                    : 'Only you and invited members can view this trip'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.privacyToggle, isPublic ? styles.privacyToggleActive : {}]}
                onPress={() => setIsPublic(!isPublic)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.privacyToggleHandle,
                    isPublic ? styles.privacyToggleHandleActive : {},
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isSaving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={saveTrip} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
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
                  style={styles.emojiButtonItem}
                  onPress={() => handleEmojiSelect(emoji)}
                >
                  <Text style={styles.emojiButtonText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  formContainer: {
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  emojiButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  changeEmojiText: {
    fontSize: 12,
    color: '#0066ff',
    fontWeight: '500',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#ff3b30',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#555',
  },
  durationContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  durationText: {
    fontSize: 16,
    color: '#0066ff',
    fontWeight: '500',
    textAlign: 'center',
  },
  privacyContainer: {
    marginTop: 20,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#666',
  },
  privacyToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    padding: 2,
    justifyContent: 'center',
  },
  privacyToggleActive: {
    backgroundColor: '#0066ff',
  },
  privacyToggleHandle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  privacyToggleHandleActive: {
    alignSelf: 'flex-end',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#0066ff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#0066ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiButtonItem: {
    width: '20%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emojiButtonText: {
    fontSize: 24,
  },
});
