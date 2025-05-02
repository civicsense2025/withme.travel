import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Platform,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';

// Debug flag for development
const DEBUG_MODE = __DEV__;

// Sample travel interests
const TRAVEL_INTERESTS = [
  { id: '1', name: 'Adventure', emoji: '🏔️' },
  { id: '2', name: 'Relaxation', emoji: '🏖️' },
  { id: '3', name: 'Culture', emoji: '🏛️' },
  { id: '4', name: 'Nightlife', emoji: '🍸' },
  { id: '5', name: 'Foodie', emoji: '🍜' },
  { id: '6', name: 'Nature', emoji: '🌲' },
  { id: '7', name: 'Shopping', emoji: '🛍️' },
  { id: '8', name: 'History', emoji: '🏰' },
  { id: '9', name: 'Photography', emoji: '📸' },
  { id: '10', name: 'Urban Exploration', emoji: '🏙️' },
];

export default function OnboardingStep2({ route, navigation }: any) {
  const { preferredName, homeCity } = route.params || {};
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Debug function
  const debugLog = (message: string, data?: any) => {
    if (DEBUG_MODE) {
      if (data) {
        console.log(`[OnboardingStep2] ${message}`, data);
      } else {
        console.log(`[OnboardingStep2] ${message}`);
      }
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((item) => item !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleNext = () => {
    if (selectedInterests.length === 0) {
      Alert.alert('Select Interests', 'Please select at least one travel interest');
      return;
    }

    debugLog('Proceeding to step 3', {
      preferredName,
      homeCity,
      interests: selectedInterests,
    });

    // Navigate to step 3 with all the data
    navigation.dispatch(
      CommonActions.navigate({
        name: 'OnboardingStep3',
        params: {
          preferredName,
          homeCity,
          interests: selectedInterests,
        },
      })
    );
  };

  // Show debug overlay in development mode
  const renderDebugInfo = () => {
    if (!DEBUG_MODE) return null;

    return (
      <TouchableOpacity
        style={[styles.debugBox, isDark && styles.debugBoxDark]}
        onPress={() => {
          Alert.alert(
            'Onboarding Step 2',
            `Selected Interests: ${selectedInterests.length}\nData: ${JSON.stringify(
              {
                preferredName,
                homeCity,
                interests: selectedInterests,
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
          <View style={styles.stepActive} />
          <View style={[styles.stepDot, isDark && styles.stepDotDark]} />
        </View>

        <Text style={[styles.title, isDark && styles.textDark]}>Your Travel Style</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Select all the travel interests that apply to you
        </Text>

        <FlatList
          data={TRAVEL_INTERESTS}
          numColumns={2}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const isSelected = selectedInterests.includes(item.id);
            return (
              <TouchableOpacity
                style={[
                  styles.interestItem,
                  isDark && styles.interestItemDark,
                  isSelected && styles.interestItemSelected,
                  isSelected && isDark && styles.interestItemSelectedDark,
                ]}
                onPress={() => toggleInterest(item.id)}
              >
                <Text style={styles.emojiText}>{item.emoji}</Text>
                <Text
                  style={[
                    styles.interestText,
                    isDark && styles.textDark,
                    isSelected && styles.interestTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.backButtonText, isDark && styles.backButtonTextDark]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, selectedInterests.length === 0 && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={selectedInterests.length === 0}
        >
          <Text style={styles.nextButtonText}>Next</Text>
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
  interestItem: {
    flex: 1,
    marginHorizontal: 6,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  interestItemDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  interestItemSelected: {
    backgroundColor: '#e6f0ff',
    borderColor: '#0066ff',
  },
  interestItemSelectedDark: {
    backgroundColor: '#1a365d',
    borderColor: '#4d9aff',
  },
  emojiText: {
    fontSize: 32,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  interestTextSelected: {
    color: '#0066ff',
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
  nextButton: {
    backgroundColor: '#0066ff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  nextButtonDisabled: {
    backgroundColor: '#a6c8ff',
  },
  nextButtonText: {
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
