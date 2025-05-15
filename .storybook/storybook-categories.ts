export const storybookCategories = {
  'Design System': {
    overview: 'Overview',
    tokens: 'Tokens',
    theme: 'Theme',
    typography: 'Typography',
    color: 'Color',
    icons: 'Icons',
  },
  'Atoms': {
    inputs: 'Inputs & Controls',
    typography: 'Typography',
    feedback: 'Feedback',
    data: 'Data Display',
    layout: 'Layout',
    media: 'Media',
    navigation: 'Navigation',
  },
  'Molecules': {
    cards: 'Cards',
    forms: 'Forms',
    dialogs: 'Dialogs & Modals',
    navigation: 'Navigation',
    feedback: 'Feedback',
    lists: 'Lists',
  },
  'Organisms': {
    sections: 'Sections',
    layouts: 'Layouts',
    features: 'Features',
    collaborative: 'Collaborative',
    authentication: 'Authentication',
    groups: 'Groups',
    trips: 'Trips',
    itinerary: 'Itinerary',
  },
  'Screens': {
    home: 'Home',
    trips: 'Trips',
    groups: 'Groups',
    itinerary: 'Itinerary',
    destinations: 'Destinations',
    authentication: 'Authentication',
    user: 'User',
    admin: 'Admin',
  },
  'Templates': {
    marketing: 'Marketing',
    app: 'App Layout',
    landing: 'Landing Pages',
    dashboards: 'Dashboards',
  },
};

// Create types for categories and subcategories
export type MainCategory = keyof typeof storybookCategories;
export type SubCategory<T extends MainCategory> = keyof (typeof storybookCategories)[T];

// Type for full category path
export type StorybookCategory = string;

// For compatibility with generate-stories.js
export const COMPONENT_CATEGORIES = {
  FOUNDATION: 'Foundation',
  LAYOUT: 'Layout',
  NAVIGATION: 'Navigation',
  INPUTS: 'Inputs & Forms',
  DISPLAY: 'Display',
  FEEDBACK: 'Feedback',
  OVERLAYS: 'Overlays & Modals',
  DATA: 'Data Display',
  TRAVEL: 'Travel Components',
  GROUPS: 'Group Features',
  TRIPS: 'Trip Features',
  USER: 'User Components',
};
