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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { ENUM_VALUES } from '../constants/database';

// Emoji picker data - common travel related emojis
const emojiOptions = [
  '✈️',
  '🏖️',
  '🗺️',
  '🏝️',
  '🏕️',
  '🚗',
  '🚂',
  '🚢',
  '🧳',
  '🏔️',
  '🏙️',
  '🗽',
  '🏰',
  '🏯',
  '🏞️',
  '⛰️',
  '🌋',
  '🌆',
  '🌃',
  '🌅',
];

export default function CreateTripStep1Screen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Form state
  const [tripName, setTripName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✈️');
  const [description, setDescription] = useState('');

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
  };

  // Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!tripName.trim()) {
      newErrors.tripName = 'Trip name is required';
    } else if (tripName.length > 100) {
      newErrors.tripName = 'Trip name must be less than 100 characters';
    }

    if (description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validate()) {
      const tripData = {
        name: tripName.trim(),
        trip_emoji: selectedEmoji,
        description: description.trim() || null,
        status: ENUM_VALUES.TRIP_STATUS.PLANNING,
        created_by: user?.id,
        is_public: false,
        privacy_setting: ENUM_VALUES.PRIVACY_SETTING.PRIVATE,
      };

      navigation.navigate('CreateTripStep2' as never, { tripData } as never);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
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

          <Text style={styles.label}>Trip Emoji</Text>
          <View style={styles.emojiContainer}>
            {emojiOptions.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[styles.emojiOption, selectedEmoji === emoji && styles.selectedEmoji]}
                onPress={() => handleEmojiSelect(emoji)}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

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
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next: Destination & Dates</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  formContainer: {
    marginBottom: 20,
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
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#ff3b30',
    marginBottom: 16,
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  emojiOption: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  selectedEmoji: {
    backgroundColor: '#0066ff',
  },
  emoji: {
    fontSize: 24,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  nextButton: {
    backgroundColor: '#0066ff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
