import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a test user with customizable properties
 *
 * @param overrides - Optional properties to override default values
 * @returns A test user object
 
 */

export const generateTestUser = (overrides = {}) => {
  return {
    id: uuidv4(),
    name: 'Test User',
    email: 'test@example.com',
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: new Date().toISOString(),
    ...overrides,
  };
};

/**
 * Generate a test trip with customizable properties
 *
 * @param overrides - Optional properties to override default values
 * @returns A test trip object
 
 */

export const generateTestTrip = (overrides = {}) => {
  return {
    id: uuidv4(),
    title: 'Test Trip',
    destination: 'Test Destination',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Test description',
    image_url: 'https://example.com/trip.jpg',
    created_by_id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: false,
    privacy_setting: 'private',
    ...overrides,
  };
};

/**
 * Generate an array of test trips
 *
 * @param count - Number of trips to generate
 * @param baseOverrides - Base overrides to apply to all trips
 * @returns Array of test trip objects
 
 */

export const generateTestTrips = (count = 3, baseOverrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    generateTestTrip({
      id: uuidv4(),
      title: `Test Trip ${index + 1}`,
      ...baseOverrides,
    })
  );
};

/**
 * Generate a test itinerary item with customizable properties
 *
 * @param overrides - Optional properties to override default values
 * @returns A test itinerary item object
 
 */

export const generateTestItineraryItem = (overrides = {}) => {
  return {
    id: uuidv4(),
    trip_id: uuidv4(),
    day: 1,
    title: 'Test Activity',
    description: 'Test activity description',
    location: 'Test Location',
    start_time: '09:00',
    end_time: '11:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    creator_id: uuidv4(),
    ...overrides,
  };
};

/**
 * Generate an array of test itinerary items
 *
 * @param tripId - Trip ID to associate with items
 * @param count - Number of items to generate
 * @returns Array of test itinerary item objects
 
 */

export const generateTestItineraryItems = (tripId: string, count = 5) => {
  return Array.from({ length: count }, (_, index) =>
    generateTestItineraryItem({
      id: uuidv4(),
      trip_id: tripId,
      day: Math.floor(index / 3) + 1, // Group activities by day (3 per day)
      title: `Test Activity ${index + 1}`,
      start_time: `${9 + (index % 3) * 3}:00`, // Distribute throughout the day
      end_time: `${9 + (index % 3) * 3 + 2}:00`,
    })
  );
};

/**
 * Generate test focus session data
 *
 * @param overrides - Optional properties to override default values
 * @returns A test focus session object
 
 */

export const generateTestFocusSession = (overrides = {}) => {
  return {
    id: uuidv4(),
    trip_id: uuidv4(),
    section_path: 'itinerary',
    created_by_id: uuidv4(),
    is_active: true,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    participants: [
      { id: uuidv4(), name: 'Test User 1', avatar_url: null },
      { id: uuidv4(), name: 'Test User 2', avatar_url: 'https://example.com/avatar2.jpg' },
    ],
    ...overrides,
  };
};

/**
 * Generate test comment data
 *
 * @param overrides - Optional properties to override default values
 * @returns A test comment object
 
 */

export const generateTestComment = (overrides = {}) => {
  return {
    id: uuidv4(),
    trip_id: uuidv4(),
    item_id: uuidv4(),
    user_id: uuidv4(),
    text: 'This is a test comment',
    created_at: new Date().toISOString(),
    user_name: 'Test Commenter',
    user_avatar: null,
    ...overrides,
  };
};
