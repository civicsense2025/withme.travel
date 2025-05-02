import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import * as dbUtils from '../utils/database';
import { TABLES, ENUM_VALUES } from '../constants/database';
import { Trip } from '../types/supabase';
import { MainStackParamList } from '../navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Type for the navigation prop
type CreateTripStep3NavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'CreateTripStep3'
>;

// Type for the route prop
type CreateTripStep3RouteProp = RouteProp<MainStackParamList, 'CreateTripStep3'>;

export default function CreateTripStep3Screen() {
  const navigation = useNavigation<CreateTripStep3NavigationProp>();
  const route = useRoute<CreateTripStep3RouteProp>();
  const { user } = useAuth();
  const { tripData } = route.params;

  // Form state
  const [isPublic, setIsPublic] = useState(false);
  const [privacySetting, setPrivacySetting] = useState<Trip['privacy_setting']>(
    ENUM_VALUES.PRIVACY_SETTING.PRIVATE
  );

  // Loading state
  const [isCreating, setIsCreating] = useState(false);

  // Handle privacy toggle
  const handlePrivacyToggle = (value: boolean) => {
    setIsPublic(value);
    const newSetting = value
      ? ENUM_VALUES.PRIVACY_SETTING.SHARED_WITH_LINK
      : ENUM_VALUES.PRIVACY_SETTING.PRIVATE;
    // Explicit cast needed here because the type inference might be too broad
    setPrivacySetting(newSetting as Trip['privacy_setting']);
  };

  // Handle privacy setting selection
  const handlePrivacySettingSelect = (setting: Trip['privacy_setting']) => {
    setPrivacySetting(setting);
  };

  // Create trip in the database
  const createTrip = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to create a trip');
      return;
    }

    setIsCreating(true);

    try {
      // Prepare trip data
      const newTripData: Partial<Trip> = {
        ...tripData,
        is_public: isPublic,
        privacy_setting: privacySetting,
        created_by: user!.id,
        likes_count: 0,
        view_count: 0,
      };

      // Specify the return type for createRecord if possible in dbUtils
      // Assuming dbUtils.createRecord returns the created object or null
      const createdTrip = await dbUtils.createRecord(TABLES.TRIPS, newTripData);

      if (!createdTrip || !createdTrip.id) {
        throw new Error('Failed to create trip or get created trip ID');
      }

      // Success!
      Alert.alert('Trip Created!', 'Your trip has been created successfully.', [
        {
          text: 'OK',
          onPress: () => {
            // Reset navigation to HomeTabs
            navigation.reset({
              index: 0,
              routes: [{ name: 'HomeTabs' }],
            });

            // Navigate to the new TripDetail screen after a delay
            setTimeout(() => {
              navigation.navigate('TripDetail', { tripId: createdTrip.id });
            }, 100);
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert('Error', 'Failed to create trip. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Summary</Text>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Name:</Text>
            <Text style={styles.summaryValue}>{tripData.name}</Text>
          </View>

          {tripData.description && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Description:</Text>
              <Text style={styles.summaryValue}>{tripData.description}</Text>
            </View>
          )}

          {tripData.start_date && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Start Date:</Text>
              <Text style={styles.summaryValue}>
                {new Date(tripData.start_date).toLocaleDateString()}
              </Text>
            </View>
          )}

          {tripData.end_date && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>End Date:</Text>
              <Text style={styles.summaryValue}>
                {new Date(tripData.end_date).toLocaleDateString()}
              </Text>
            </View>
          )}

          {tripData.duration_days && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>{tripData.duration_days} days</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Share with others</Text>
            <Switch
              value={isPublic}
              onValueChange={handlePrivacyToggle}
              trackColor={{ false: '#eee', true: '#0066ff' }}
              thumbColor="#fff"
            />
          </View>

          {isPublic && (
            <View style={styles.privacyOptionsContainer}>
              <TouchableOpacity
                style={[
                  styles.privacyOption,
                  privacySetting === ENUM_VALUES.PRIVACY_SETTING.SHARED_WITH_LINK &&
                    styles.selectedPrivacyOption,
                ]}
                onPress={() =>
                  handlePrivacySettingSelect(ENUM_VALUES.PRIVACY_SETTING.SHARED_WITH_LINK)
                }
              >
                <Text style={styles.privacyOptionTitle}>By Link Only</Text>
                <Text style={styles.privacyOptionDescription}>
                  Only people with the link can view this trip
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.privacyOption,
                  privacySetting === ENUM_VALUES.PRIVACY_SETTING.PUBLIC &&
                    styles.selectedPrivacyOption,
                ]}
                onPress={() => handlePrivacySettingSelect(ENUM_VALUES.PRIVACY_SETTING.PUBLIC)}
              >
                <Text style={styles.privacyOptionTitle}>Public</Text>
                <Text style={styles.privacyOptionDescription}>
                  Anyone can discover and view this trip
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isCreating}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.createButton} onPress={createTrip} disabled={isCreating}>
          {isCreating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.createButtonText}>Create Trip</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
  privacyOptionsContainer: {
    marginTop: 8,
  },
  privacyOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedPrivacyOption: {
    borderColor: '#0066ff',
    backgroundColor: '#f0f7ff',
  },
  privacyOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  privacyOptionDescription: {
    fontSize: 14,
    color: '#666',
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
  createButton: {
    flex: 2,
    backgroundColor: '#0066ff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
