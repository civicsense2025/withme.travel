import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

// Dev flag for debugging (set to false in production)
const DEBUG_MODE = __DEV__;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastLoginError, setLastLoginError] = useState<string | null>(null);

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

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    debugLog(`Attempting to ${isRegistering ? 'register' : 'sign in'} with email: ${email}`);
    setLoginAttempts(prev => prev + 1);

    try {
      if (isRegistering) {
        debugLog('Starting registration');
        const { error } = await signUp(email, password);
        if (error) {
          debugLog('Registration error', error);
          setLastLoginError(error.message);
          Alert.alert('Registration Error', error.message);
        } else {
          debugLog('Registration successful');
          Alert.alert(
            'Verification Email Sent', 
            'Please check your email to verify your account before logging in.',
            [{ text: 'OK', onPress: () => setIsRegistering(false) }]
          );
        }
      } else {
        debugLog('Starting sign in');
        const { error } = await signIn(email, password);
        if (error) {
          debugLog('Sign in error', error);
          setLastLoginError(error.message);
          Alert.alert('Login Error', error.message);
        } else {
          debugLog('Sign in successful');
        }
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
        style={styles.debugBox}
        onPress={() => {
          Alert.alert(
            'Auth Debug Info',
            `Auth Loading: ${authLoading}\nIsAuthenticated: ${isAuthenticated}\nLogin Attempts: ${loginAttempts}\nLast Error: ${lastLoginError || 'none'}`
          );
        }}
      >
        <Text style={styles.debugText}>🔍 Debug</Text>
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
        <Text style={styles.logo}>✈️</Text>
        <Text style={styles.appName}>WithMe Travel</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.headerText}>
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleAuth}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>
              {isRegistering ? 'Sign Up' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsRegistering(!isRegistering)}
          disabled={isLoading}
        >
          <Text style={styles.switchButtonText}>
            {isRegistering 
              ? 'Already have an account? Sign In' 
              : 'Need an account? Sign Up'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 40,
  },
  logo: {
    fontSize: 72,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0066ff',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#0066ff',
    fontSize: 16,
  },
  debugBox: {
    position: 'absolute',
    top: 40,
    right: 10,
    zIndex: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
  },
});
