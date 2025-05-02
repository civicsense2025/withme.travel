import React, { useEffect } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { ParamListBase } from '@react-navigation/native';
import { Trip } from '../types/supabase';
import { Ionicons } from '@expo/vector-icons';
import HeaderAvatar from '../components/HeaderAvatar';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import ItineraryScreen from '../screens/ItineraryScreen';
import DestinationsScreen from '../screens/DestinationsScreen';
import DestinationDetailScreen from '../screens/DestinationDetailScreen';
import EditItineraryItemScreen from '../screens/EditItineraryItemScreen';
import DebugScreen from '../screens/DebugScreen';
import CreateTripStep1Screen from '../screens/CreateTripStep1Screen';
import CreateTripStep2Screen from '../screens/CreateTripStep2Screen';
import CreateTripStep3Screen from '../screens/CreateTripStep3Screen';
import ItinerariesScreen from '../screens/ItinerariesScreen';
import EditTripScreen from '../screens/EditTripScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AppearanceScreen from '../screens/AppearanceScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import { UIShowcaseScreen } from '../screens/UIShowcaseScreen';

// Import theme
import { lightTheme, darkTheme } from '../constants/theme'; // Correct import for themes

// Debug flag
const DEBUG_MODE = __DEV__;

// Define navigation types
type RootStackParamList = {
  Auth: undefined;
  Main: undefined; // Main stack is nested
};

// Define screen specific param lists for Main stack
// Export this type for use in screens
export type MainStackParamList = {
  HomeTabs: undefined;
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  CreateTripStep1: undefined;
  CreateTripStep2: { tripData: Partial<Trip> };
  CreateTripStep3: { tripData: Partial<Trip> };
  TripDetail: { tripId: string };
  EditTrip: { trip: Trip };
  Itinerary: { tripId: string };
  EditItineraryItem: { tripId: string; itemId?: string };
  Destinations: undefined;
  DestinationDetail: { destinationId: string };
  Debug: undefined;
  Diagnostic: undefined;
  Settings: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  Appearance: undefined;
  Privacy: undefined;
  UIShowcase: undefined;
};

// Define Auth stack params
type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

// Define Bottom Tab Param List
type BottomTabParamList = {
  Home: undefined;
  Destinations: undefined;
  Create: undefined;
  Itineraries: undefined;
};

// Define navigation prop types for hooks
type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;

// Create navigators
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

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
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

// Custom Tab Bar Button for the center "Create" button
const CustomTabBarButton = ({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.centerButtonContainer} onPress={onPress}>
    <View style={styles.centerButton}>{children}</View>
  </TouchableOpacity>
);

// Tab navigator
function BottomTabNavigator() {
  debugLog('Rendering BottomTabNavigator');
  const navigation = useNavigation<MainStackNavigationProp>();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Destinations') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Itineraries') {
            iconName = focused ? 'list' : 'list-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: ({ focused, color }) => {
          if (route.name === 'Create') return null;
          return <Text style={[styles.tabLabel, { color }]}>{route.name}</Text>;
        },
        headerShown: true,
        headerTitle: '',
        headerLeft: () => <HeaderAvatar />,
        tabBarActiveTintColor: '#0066ff',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: styles.tabBarStyle,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Destinations" component={DestinationsScreen} />
      <Tab.Screen
        name="Create"
        component={PlaceholderScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="add" size={30} color="#fff" />,
          tabBarLabel: () => null,
          tabBarButton: (props) => (
            <CustomTabBarButton
              {...props}
              onPress={() => {
                debugLog('Create tab pressed, navigating to CreateTripStep1');
                navigation.navigate('CreateTripStep1');
              }}
            >
              <Ionicons name="add" size={30} color="#fff" />
            </CustomTabBarButton>
          ),
        }}
      />
      <Tab.Screen name="Itineraries" component={ItinerariesScreen} />
    </Tab.Navigator>
  );
}

// Dummy component for the placeholder screen
function PlaceholderScreen() {
  return <View />;
}

// Main app navigator (post-login)
function MainNavigator() {
  debugLog('Rendering MainNavigator');
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="HomeTabs"
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
        name="EditTrip"
        component={EditTripScreen}
        options={{
          title: 'Edit Trip',
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
      <MainStack.Screen
        name="CreateTripStep1"
        component={CreateTripStep1Screen}
        options={{ title: 'Create Trip (1/3)', headerBackTitle: 'Back' }}
      />
      <MainStack.Screen
        name="CreateTripStep2"
        component={CreateTripStep2Screen}
        options={{ title: 'Create Trip (2/3)', headerBackTitle: 'Back' }}
      />
      <MainStack.Screen
        name="CreateTripStep3"
        component={CreateTripStep3Screen}
        options={{ title: 'Create Trip (3/3)', headerBackTitle: 'Back' }}
      />
      <MainStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerBackTitle: 'Back',
        }}
      />
      <MainStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <MainStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: false,
        }}
      />
      <MainStack.Screen
        name="Appearance"
        component={AppearanceScreen}
        options={{
          headerShown: false,
        }}
      />
      <MainStack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{
          headerShown: false,
        }}
      />
      <MainStack.Screen
        name="Debug"
        component={DebugScreen}
        options={{
          title: 'Debug Info',
          headerBackTitle: 'Back',
          presentation: 'modal',
        }}
      />
      <MainStack.Screen
        name="UIShowcase"
        component={UIShowcaseScreen}
        options={{
          title: 'UI Components',
          headerShown: true,
        }}
      />
    </MainStack.Navigator>
  );
}

// Loading component with debugging
function LoadingScreen({ isLoading, authError }: { isLoading: boolean; authError: string | null }) {
  const [loadingTime, setLoadingTime] = React.useState(0);

  // Timer to track loading time
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingTime((prev) => prev + 1);
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
        <Text style={styles.loadingSubtext}>Still loading after {loadingTime}s...</Text>
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
  // Theme selection
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme; // Use imported themes
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
    <NavigationContainer
      theme={{
        dark: scheme === 'dark',
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.foreground,
          border: theme.colors.border,
          notification: theme.colors.primary,
        },
      }}
    >
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
  tabBarStyle: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    height: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.5,
    elevation: 5,
    borderTopWidth: 0,
  },
  tabLabel: {
    fontSize: 11,
    marginBottom: 5,
  },
  centerButtonContainer: {
    top: -25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0066ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
