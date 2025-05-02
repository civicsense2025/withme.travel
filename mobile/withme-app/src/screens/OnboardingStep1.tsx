import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';

// Debug flag for development
const DEBUG_MODE = __DEV__;

export default function OnboardingStep1({ route, navigation }: any) {
  const { initialName } = route.params || {};
  const [preferredName, setPreferredName] = useState(initialName || '');
  const [homeCity, setHomeCity] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Debug function
  const debugLog = (message: string, data?: any) => {
    if (DEBUG_MODE) {
      if (data) {
        console.log(`[OnboardingStep1] ${message}`, data);
      } else {
        console.log(`[OnboardingStep1] ${message}`);
      }
    }
  };

  const handleNext = () => {
    if (!preferredName || !homeCity) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    debugLog('Proceeding to step 2', { preferredName, homeCity });

    // Navigate to step 2 with the data from step 1
    navigation.dispatch(
      CommonActions.navigate({
        name: 'OnboardingStep2',
        params: { preferredName, homeCity },
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
            'Onboarding Step 1',
            `Preferred Name: ${preferredName}\nHome City: ${homeCity}`
          );
        }}
      >
        <Text style={styles.debugText}>🔍 Debug</Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      {renderDebugInfo()}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.stepIndicator}>
          <View style={styles.stepActive} />
          <View style={[styles.stepDot, isDark && styles.stepDotDark]} />
          <View style={[styles.stepDot, isDark && styles.stepDotDark]} />
        </View>

        <Text style={[styles.title, isDark && styles.textDark]}>Tell us about yourself</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Let's personalize your travel experience
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, isDark && styles.textDark]}>What should we call you?</Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder="Preferred name"
            placeholderTextColor={isDark ? '#aaa' : '#999'}
            value={preferredName}
            onChangeText={setPreferredName}
          />

          <Text style={[styles.label, isDark && styles.textDark]}>Where are you from?</Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder="Home city"
            placeholderTextColor={isDark ? '#aaa' : '#999'}
            value={homeCity}
            onChangeText={setHomeCity}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => {
            debugLog('Skipping onboarding');
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'HomeTabs' }],
              })
            );
          }}
        >
          <Text style={[styles.skipButtonText, isDark && styles.skipButtonTextDark]}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    flexGrow: 1,
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
    marginBottom: 40,
    textAlign: 'center',
  },
  subtitleDark: {
    color: '#aaa',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 24,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDark: {
    borderColor: '#444',
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    color: '#999',
    fontSize: 16,
  },
  skipButtonTextDark: {
    color: '#aaa',
  },
  nextButton: {
    backgroundColor: '#0066ff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
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
