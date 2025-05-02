import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import { ActivityIndicator, View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { ParamListBase } from '@react-navigation/native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import ItineraryScreen from '../screens/ItineraryScreen';
import DestinationsScreen from '../screens/DestinationsScreen';
import DestinationDetailScreen from '../screens/DestinationDetailScreen';
import EditItineraryItemScreen from '../screens/EditItineraryItemScreen';

// Debug flag
const DEBUG_MODE = __DEV__;

// Define navigation types
type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Define screen specific param lists
type MainStackParamList = {
  Main: undefined;
  TripDetail: { tripId: string };
  Itinerary: { tripId: string };
  DestinationDetail: { destinationId: string };
  EditItineraryItem: { 
    tripId: string;
    itemId?: string; 
    dayNumber?: number;
  };
};

// Create navigators
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator();

// Debug utility function
const debugLog = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    if (data) {
      console.log(`[Navigation] ${message}`, data);
    } else {
      console.log(`[Navigation] ${message}`);
    }
  }
};

// Auth navigator
function AuthNavigator() {
  debugLog('Rendering AuthNavigator');
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

// Tab navigator
function BottomTabNavigator() {
  debugLog('Rendering BottomTabNavigator');
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          
          if (route.name === 'Home') {
            iconName = '🏠';
          } else if (route.name === 'Destinations') {
            iconName = '🌎';
          }
          
          return (
            <View style={[styles.tabIconContainer, focused && styles.tabIconFocused]}>
              <Text style={styles.tabIcon}>{iconName}</Text>
            </View>
          );
        },
        tabBarLabel: ({ focused, color }) => {
          return (
            <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
              {route.name}
            </Text>
          );
        },
        headerShown: false,
        tabBarActiveTintColor: '#0066ff',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Destinations" component={DestinationsScreen} />
    </Tab.Navigator>
  );
}

// Main app navigator (post-login)
function MainNavigator() {
  debugLog('Rendering MainNavigator');
  return (
    <MainStack.Navigator>
      <MainStack.Screen 
        name="Main" 
        component={BottomTabNavigator} 
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="TripDetail" 
        component={TripDetailScreen}
        options={{ 
          title: 'Trip Details',
          headerBackTitle: 'Back',
        }}
      />
      <MainStack.Screen 
        name="Itinerary" 
        component={ItineraryScreen}
        options={{ 
          title: 'Itinerary',
          headerBackTitle: 'Back',
        }}
      />
      <MainStack.Screen 
        name="DestinationDetail" 
        component={DestinationDetailScreen}
        options={{ 
          title: 'Destination',
          headerBackTitle: 'Back',
        }}
      />
      <MainStack.Screen 
        name="EditItineraryItem" 
        component={EditItineraryItemScreen}
        options={{ 
          title: 'Edit Activity',
          headerBackTitle: 'Back',
        }}
      />
    </MainStack.Navigator>
  );
}

// Loading component with debugging
function LoadingScreen({ isLoading, authError }: { isLoading: boolean, authError: string | null }) {
  const [loadingTime, setLoadingTime] = React.useState(0);

  // Timer to track loading time
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setLoadingTime(0);
    }
  }, [isLoading]);
  
  // Show debug info only in dev mode
  const renderDebugInfo = () => {
    if (!DEBUG_MODE) return null;
    
    return (
      <TouchableOpacity
        style={styles.debugButton}
        onPress={() => {
          Alert.alert(
            'Auth Loading Debug',
            `Loading time: ${loadingTime}s\nAuth error: ${authError || 'None'}`
          );
        }}
      >
        <Text style={styles.debugButtonText}>Debug Info</Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0066ff" />
      <Text style={styles.loadingText}>Loading...</Text>
      {loadingTime > 5 && (
        <Text style={styles.loadingSubtext}>
          Still loading after {loadingTime}s...
        </Text>
      )}
      {renderDebugInfo()}
      {authError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{authError}</Text>
        </View>
      )}
    </View>
  );
}

// Root navigator that handles authentication state
export default function Navigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authError, setAuthError] = React.useState<string | null>(null);
  
  // Add debug logging for auth state
  useEffect(() => {
    debugLog('Auth state changed', { isAuthenticated, isLoading });
    
    // If loading takes too long, record an error
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setAuthError('Auth loading timeout - took more than 15 seconds');
        debugLog('Auth loading timeout detected');
      }, 15000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isAuthenticated, isLoading]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return <LoadingScreen isLoading={isLoading} authError={authError} />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  loadingSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  tabIconFocused: {
    transform: [{ scale: 1.2 }],
  },
  tabLabel: {
    fontSize: 11,
    color: '#999',
  },
  tabLabelFocused: {
    color: '#0066ff',
    fontWeight: '600',
  },
  debugButton: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  errorContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 4,
  },
  errorText: {
    color: '#ff3b30',
    fontWeight: '500',
  },
});
