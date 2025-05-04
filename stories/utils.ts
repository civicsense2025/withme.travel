/**
 * @file Storybook utilities
 * 
 * This file contains utilities to help create consistent documentation for components.
 */

// Common categories for component organization
export const COMPONENT_CATEGORIES = {
  LAYOUT: 'Layout',
  TRIP: 'Trip',
  DESTINATION: 'Destination',
  USER: 'User',
  FEEDBACK: 'Feedback',
  ERROR: 'Error',
  UI: 'UI',
  FORM: 'Form',
  NAVIGATION: 'Navigation',
  DATA_DISPLAY: 'Data Display',
  OVERLAY: 'Overlay',
};

// Common viewport sizes for testing responsive components
export const VIEWPORTS = {
  MOBILE: {
    name: 'Mobile',
    styles: {
      width: '375px',
      height: '667px',
    },
  },
  TABLET: {
    name: 'Tablet',
    styles: {
      width: '768px',
      height: '1024px',
    },
  },
  DESKTOP: {
    name: 'Desktop',
    styles: {
      width: '1440px',
      height: '900px',
    },
  },
  WIDE: {
    name: 'Wide',
    styles: {
      width: '1920px',
      height: '1080px',
    },
  },
};

// Demo data for commonly used entities
export const DEMO_DATA = {
  TRIP: {
    id: 'trip-1',
    name: 'Summer Vacation in Barcelona',
    destination_name: 'Barcelona, Spain',
    location: 'Barcelona, Spain',
    start_date: '2023-07-01',
    end_date: '2023-07-14',
    members: 3,
    cover_image: '/destinations/barcelona.jpg',
    description: 'Exploring the beautiful city of Barcelona with friends.',
    created_by: 'user-123',
    is_public: true,
    created_at: '2023-06-15T10:00:00Z',
    role: 'admin',
  },
  
  DESTINATION: {
    id: 'dest-1',
    city: 'Paris',
    country: 'France',
    continent: 'Europe',
    description: 'The city of lights and romance.',
    image_url: '/destinations/paris.jpg',
    cuisine_rating: 5,
    nightlife_rating: 4,
    cultural_attractions: 5,
    outdoor_activities: 3,
    beach_quality: 1,
  },
  
  USER: {
    id: 'user-1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar_url: 'https://ui-avatars.com/api/?name=Jane+Smith',
  },
}; 