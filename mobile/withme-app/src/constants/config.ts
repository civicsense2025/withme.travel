import Constants from 'expo-constants';

// Access environment variables from app.config.js
const extra = Constants.expoConfig?.extra || {};
console.log('Expo Config Extra:', JSON.stringify(extra, null, 2));

// Supabase configuration
export const SUPABASE_URL = extra.supabaseUrl as string;
export const SUPABASE_ANON_KEY = extra.supabaseAnonKey as string;

// Log the values being used
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY length:', SUPABASE_ANON_KEY?.length || 0);
console.log(
  'SUPABASE_ANON_KEY first 10 chars:',
  SUPABASE_ANON_KEY?.substring(0, 10) || 'undefined'
);

// API configuration
export const API_URL = (extra.apiUrl as string) || 'https://api.withme.travel';
console.log('API_URL:', API_URL);

// App configuration
export const APP_NAME = 'WithMe Travel';

// Feature flags for the mobile app
export const FEATURES = {
  OFFLINE_MODE: true,
  TRIP_SHARING: true,
  NOTIFICATIONS: true,
  LOCATION_TRACKING: false,
};

// Default navigation routes
export const ROUTES = {
  HOME: 'Home',
  LOGIN: 'Login',
  TRIP_DETAILS: 'TripDetails',
  ITINERARY: 'Itinerary',
  EDIT_ITINERARY_ITEM: 'EditItineraryItem',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  DESTINATION_DETAIL: 'DestinationDetail',
};
