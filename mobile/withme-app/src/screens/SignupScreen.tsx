import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { Text, Button, Input } from '../components/ui';

// Dev flag for debugging
const DEBUG_MODE = __DEV__;

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, googleSignIn } = useAuth();
  const theme = useTheme();

  // Debug function
  const debugLog = (message: string, data?: any) => {
    if (DEBUG_MODE) {
      if (data) {
        console.log(`[SignupScreen] ${message}`, data);
      } else {
        console.log(`[SignupScreen] ${message}`);
      }
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    debugLog(`Attempting to register with email: ${email}`);

    try {
      // Store the name for later use in onboarding
      // This is temporary - in a real app you would use AsyncStorage or similar
      // For this demo, we'll pass it directly in navigation
      const { error, data } = await signUp(email, password);

      if (error) {
        debugLog('Registration error', error);
        Alert.alert('Registration Error', error.message);
      } else {
        debugLog('Registration successful, redirecting to onboarding', data);

        // Redirect to onboarding flow with the name
        navigation.dispatch(
          CommonActions.navigate({
            name: 'OnboardingStep1',
            params: { initialName: name },
          })
        );
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      debugLog('Unexpected error during auth', error);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show debug overlay in development mode
  const renderDebugInfo = () => {
    if (!DEBUG_MODE) return null;

    return (
      <TouchableOpacity
        style={[styles.debugBox, theme.isDark && styles.debugBoxDark]}
        onPress={() => {
          Alert.alert(
            'Signup Debug Info',
            `Email: ${email}\nName: ${name}\nDark Mode: ${theme.isDark}`
          );
        }}
      >
        <Text variant="caption" color="custom" customColor="#fff">
          🔍 Debug
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      {renderDebugInfo()}

      <View style={styles.logoContainer}>
        <Text style={styles.logo}>✈️</Text>
        <Text variant="h2" color="primary">
          WithMe Travel
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Text
          variant="h3"
          color="primary"
          style={{ textAlign: 'center', marginBottom: theme.spacing['4'] }}
        >
          Create Your Account
        </Text>

        <Button
          label="Continue with Google"
          variant="primary"
          style={{ backgroundColor: '#4285F4', marginBottom: theme.spacing['3'] }}
          onPress={async () => {
            debugLog('Starting Google sign in from signup');
            const { error } = await googleSignIn();
            if (error) {
              Alert.alert('Google Sign-In Error', error.message);
            }
          }}
        />

        <Text
          variant="body2"
          color="secondary"
          style={{ textAlign: 'center', marginVertical: theme.spacing['1.5'] }}
        >
          or
        </Text>

        <Input
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          variant="outlined"
          size="md"
        />

        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          variant="outlined"
          size="md"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          variant="outlined"
          size="md"
          secureTextEntry
        />

        <Button
          label="Create Account"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
          onPress={handleSignUp}
          style={{ marginTop: theme.spacing['3'] }}
        />

        <Button
          label="Already have an account? Sign In"
          variant="ghost"
          size="md"
          onPress={() => navigation.navigate('Login')}
          disabled={isLoading}
          style={{ marginTop: theme.spacing['3'] }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  logo: {
    fontSize: 72,
    marginBottom: 10,
  },
  formContainer: {
    padding: 20,
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
});
