import React, { useState, useEffect } from 'react';
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

// Dev flag for debugging (set to false in production)
const DEBUG_MODE = __DEV__;

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, isAuthenticated, isLoading: authLoading, googleSignIn } = useAuth();
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastLoginError, setLastLoginError] = useState<string | null>(null);
  const theme = useTheme();
  const styles = createStyles(theme); // Create styles using theme

  // Debug function
  const debugLog = (message: string, data?: any) => {
    if (DEBUG_MODE) {
      if (data) {
        console.log(`[LoginScreen] ${message}`, data);
      } else {
        console.log(`[LoginScreen] ${message}`);
      }
    }
  };

  // Track auth state changes
  useEffect(() => {
    debugLog('Auth state updated', { isAuthenticated, authLoading });
  }, [isAuthenticated, authLoading]);

  // Component mounted
  useEffect(() => {
    debugLog('LoginScreen mounted');
    return () => {
      debugLog('LoginScreen unmounted');
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    debugLog(`Attempting to sign in with email: ${email}`);
    setLoginAttempts((prev) => prev + 1);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        debugLog('Sign in error', error);
        setLastLoginError(error.message);
        Alert.alert('Login Error', error.message);
      } else {
        debugLog('Sign in successful');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      debugLog('Unexpected error during auth', error);
      setLastLoginError(errorMessage);
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
            'Auth Debug Info',
            `Auth Loading: ${authLoading}\nIsAuthenticated: ${isAuthenticated}\nLogin Attempts: ${loginAttempts}\nLast Error: ${lastLoginError || 'none'}`
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      {renderDebugInfo()}

      <View style={styles.logoContainer}>
        <RNText style={styles.logo}>✈️</RNText> {/* Use RNText for emoji */}
        <Text
          variant="h2"
          color="custom"
          customColor={theme.colors.foreground} // Use foreground for main text
          weight="bold"
        >
          WithMe Travel
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Text
          variant="h3"
          color="custom"
          customColor={theme.colors.foreground}
          style={styles.headerText}
        >
          Welcome Back
        </Text>

        {/* Google Sign In Button - Needs custom styling or variant */}
        <Button
          label="Continue with Google"
          variant="primary" // Use primary for now, could create a 'social' variant
          style={{ backgroundColor: '#4285F4', borderColor: '#4285F4' }} // Override color for Google
          textStyle={{ color: theme.colors.white }} // Ensure text is white
          onPress={async () => {
            debugLog('Starting Google sign in');
            const { error } = await googleSignIn();
            if (error) {
              Alert.alert('Google Sign-In Error', error.message);
            }
          }}
        />

        <Text variant="body2" color="secondary" style={styles.orText}>
          or
        </Text>

        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          variant="filled" // Use filled variant
          size="md"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          variant="filled" // Use filled variant
          size="md"
          secureTextEntry
        />

        <Button
          label="Sign In"
          variant="primary" // Use travelPurple by default
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
          onPress={handleLogin}
          style={styles.signInButton}
        />

        <Button
          label="Need an account? Sign Up"
          variant="ghost" // Use ghost for less emphasis
          size="md"
          onPress={() => navigation.navigate('Signup')}
          disabled={isLoading}
          style={styles.switchButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

// Create styles function to access theme
const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background, // Use theme color
    },
    logoContainer: {
      alignItems: 'center',
      marginTop: theme.spacing['10'], // Adjust spacing
      marginBottom: theme.spacing['8'], // Adjust spacing
    },
    logo: {
      fontSize: 72, // Keep large emoji size
      marginBottom: theme.spacing['3'],
    },
    formContainer: {
      paddingHorizontal: theme.spacing['5'], // Adjust padding
    },
    headerText: {
      textAlign: 'center',
      marginBottom: theme.spacing['6'], // Adjust spacing
    },
    orText: {
      textAlign: 'center',
      marginVertical: theme.spacing['3'], // Adjust spacing
    },
    signInButton: {
      marginTop: theme.spacing['4'], // Adjust spacing
    },
    switchButton: {
      marginTop: theme.spacing['4'], // Adjust spacing
    },
    debugBox: {
      position: 'absolute',
      top: 40, // Keep positioning relative to screen edges
      right: 10,
      zIndex: 999,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingVertical: theme.spacing['1'],
      paddingHorizontal: theme.spacing['2'],
      borderRadius: theme.borderRadius.md,
    },
    debugBoxDark: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
  });

// Import RNText specifically for the emoji if needed
import { Text as RNText } from 'react-native';
