import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Platform,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

// Debug flag for development
const DEBUG_MODE = __DEV__;

// Notification types available
const NOTIFICATION_TYPES = [
  { id: 'trip_updates', label: 'Trip Updates', defaultOn: true },
  { id: 'travel_tips', label: 'Travel Tips & Suggestions', defaultOn: true },
  { id: 'friend_activity', label: 'Friend Activity', defaultOn: false },
  { id: 'deals', label: 'Special Deals & Offers', defaultOn: false },
];

// Define type for notification preferences
interface NotificationPreferences {
  [key: string]: boolean;
}

export default function OnboardingStep3({ route, navigation }: any) {
  const { preferredName, homeCity, interests } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPreferences>(
    NOTIFICATION_TYPES.reduce<NotificationPreferences>((acc, curr) => {
      return { ...acc, [curr.id]: curr.defaultOn };
    }, {})
  );
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth(); // Only use available methods from useAuth

  // Debug function
  const debugLog = (message: string, data?: any) => {
    if (DEBUG_MODE) {
      if (data) {
        console.log(`[OnboardingStep3] ${message}`, data);
      } else {
        console.log(`[OnboardingStep3] ${message}`);
      }
    }
  };

  const toggleNotification = (id: string) => {
    setNotifications((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleFinish = async () => {
    setIsLoading(true);
    debugLog('Completing onboarding with data', {
      preferredName,
      homeCity,
      interests,
      notifications,
    });

    try {
      // Save user preferences to profile
      const profileData = {
        preferred_name: preferredName,
        home_city: homeCity,
        travel_interests: interests,
        notification_preferences: notifications,
        onboarding_completed: true,
      };

      // In a real app, you would implement a proper profile update
      // For this demo, we'll just log it and move on
      debugLog('Would save profile data:', profileData);

      // Navigate to the main app
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'HomeTabs' }],
        })
      );
    } catch (error) {
      debugLog('Error in handleFinish', error);
      Alert.alert('Error', 'There was a problem completing onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show debug overlay in development mode
  const renderDebugInfo = () => {
    if (!DEBUG_MODE) return null;

    return (
      <TouchableOpacity
        style={[styles.debugBox, isDark && styles.debugBoxDark]}
        onPress={() => {
          Alert.alert(
            'Onboarding Step 3',
            `Complete Profile Data: ${JSON.stringify(
              {
                preferredName,
                homeCity,
                interests,
                notifications,
              },
              null,
              2
            )}`
          );
        }}
      >
        <Text style={styles.debugText}>🔍 Debug</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {renderDebugInfo()}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, isDark && styles.stepDotDark]} />
          <View style={[styles.stepDot, isDark && styles.stepDotDark]} />
          <View style={styles.stepActive} />
        </View>

        <Text style={[styles.title, isDark && styles.textDark]}>Almost Done!</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Choose your notification preferences
        </Text>

        <View style={styles.notificationContainer}>
          {NOTIFICATION_TYPES.map((type) => (
            <View key={type.id} style={styles.notificationItem}>
              <View>
                <Text style={[styles.notificationLabel, isDark && styles.textDark]}>
                  {type.label}
                </Text>
              </View>

              <Switch
                value={notifications[type.id]}
                onValueChange={() => toggleNotification(type.id)}
                trackColor={{ false: '#d9d9d9', true: '#0066ff' }}
                thumbColor={notifications[type.id] ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="#d9d9d9"
              />
            </View>
          ))}
        </View>

        <Text style={[styles.privacyText, isDark && styles.privacyTextDark]}>
          You can change these settings anytime from your profile. By proceeding, you agree to our
          Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={[styles.backButtonText, isDark && styles.backButtonTextDark]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.finishButton, isLoading && styles.finishButtonDisabled]}
          onPress={handleFinish}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.finishButtonText}>Finish</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  stepActive: {
    width: 30,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066ff',
    marginHorizontal: 4,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  stepDotDark: {
    backgroundColor: '#444',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  textDark: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  subtitleDark: {
    color: '#aaa',
  },
  notificationContainer: {
    marginBottom: 30,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notificationLabel: {
    fontSize: 16,
    color: '#333',
  },
  privacyText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  privacyTextDark: {
    color: '#aaa',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#0066ff',
    fontSize: 16,
    fontWeight: '500',
  },
  backButtonTextDark: {
    color: '#4d9aff',
  },
  finishButton: {
    backgroundColor: '#0066ff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  finishButtonDisabled: {
    backgroundColor: '#a6c8ff',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugBox: {
    position: 'absolute',
    top: 40,
    right: 10,
    zIndex: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  debugBoxDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
  },
});
