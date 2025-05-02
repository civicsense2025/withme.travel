import React, { useState, useEffect } from 'react';
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
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as dbUtils from '../utils/database';
import { createSupabaseClient } from '../utils/supabase';
import { TABLES } from '../constants/database';
import { Trip, Destination } from '../types/supabase';
import { MainStackParamList } from '../navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Type for the navigation prop
type CreateTripStep2NavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'CreateTripStep2'
>;

// Type for the route prop
type CreateTripStep2RouteProp = RouteProp<MainStackParamList, 'CreateTripStep2'>;

// Helper function to calculate duration in days
const calculateDuration = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper function to format date for display
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function CreateTripStep2Screen() {
  const navigation = useNavigation<CreateTripStep2NavigationProp>();
  const route = useRoute<CreateTripStep2RouteProp>();
  const { tripData } = route.params;

  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Destination[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle date changes (basic implementation - would use a date picker in real app)
  // For a real app, use a date picker library like react-native-date-picker
  const handleStartDateChange = (text: string) => {
    setStartDate(text);
    // Recalculate duration if both dates are set
    if (endDate) {
      const newDuration = calculateDuration(text, endDate);
      if (newDuration && newDuration < 0) {
        setErrors({ ...errors, endDate: 'End date must be after start date' });
      } else {
        const newErrors = { ...errors };
        delete newErrors.endDate;
        setErrors(newErrors);
      }
    }
  };

  const handleEndDateChange = (text: string) => {
    setEndDate(text);
    // Recalculate duration if both dates are set
    if (startDate) {
      const newDuration = calculateDuration(startDate, text);
      if (newDuration && newDuration < 0) {
        setErrors({ ...errors, endDate: 'End date must be after start date' });
      } else {
        const newErrors = { ...errors };
        delete newErrors.endDate;
        setErrors(newErrors);
      }
    }
  };

  // Search for destinations
  const searchDestinations = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Simple implementation - in a real app, use a more sophisticated search
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from(TABLES.DESTINATIONS)
        .select('*')
        .or(`city.ilike.%${query}%,country.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults((data as Destination[]) || []);
    } catch (error) {
      console.error('Error searching destinations:', error);
      Alert.alert('Error', 'Failed to search destinations');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchDestinations(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Select a destination
  const handleSelectDestination = (destination: Destination) => {
    setSelectedDestination(destination);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Dates are optional, but if provided must be valid
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime())) {
        newErrors.startDate = 'Invalid start date';
      }

      if (isNaN(end.getTime())) {
        newErrors.endDate = 'Invalid end date';
      }

      if (!newErrors.startDate && !newErrors.endDate && start > end) {
        newErrors.endDate = 'End date must be after start date';
      }
    } else if (startDate && !endDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        newErrors.startDate = 'Invalid start date';
      }
    } else if (!startDate && endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        newErrors.endDate = 'Invalid end date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validate()) {
      const updatedTripData = {
        ...tripData,
        start_date: startDate || null,
        end_date: endDate || null,
        duration_days: startDate && endDate ? calculateDuration(startDate, endDate) : null,
        destination_id: selectedDestination?.id || null,
      };

      navigation.navigate('CreateTripStep3', { tripData: updatedTripData });
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
          <Text style={styles.label}>Destination (Optional)</Text>
          <TextInput
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for a city or country"
            placeholderTextColor="#999"
          />

          {loading && <ActivityIndicator style={styles.loader} color="#0066ff" />}

          {searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleSelectDestination(item)}
                  >
                    <Text style={styles.searchResultText}>
                      {item.city}, {item.country}
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.searchResults}
                nestedScrollEnabled
              />
            </View>
          )}

          {selectedDestination && (
            <View style={styles.selectedDestinationContainer}>
              <Text style={styles.selectedDestinationText}>
                Selected: {selectedDestination.city}, {selectedDestination.country}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedDestination(null)}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
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
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next: Settings</Text>
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
  loader: {
    marginVertical: 10,
  },
  searchResultsContainer: {
    maxHeight: 200,
    marginBottom: 16,
  },
  searchResults: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultText: {
    fontSize: 14,
    color: '#333',
  },
  selectedDestinationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e6f7ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedDestinationText: {
    fontSize: 14,
    color: '#0066ff',
    fontWeight: '500',
    flex: 1,
  },
  clearButton: {
    padding: 6,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#ff3b30',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555',
  },
  durationContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 16,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 2,
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
