export const storybookCategories = {
  'Design System': {
    overview: 'Overview',
    tokens: 'Tokens',
    theme: 'Theme',
    typography: 'Typography',
    icons: 'Icons',
    showcase: 'Showcase',
  },
  'Core UI': {
    inputs: 'Inputs',
    layout: 'Layout',
    feedback: 'Feedback',
    navigation: 'Navigation',
    overlay: 'Overlay',
    dataDisplay: 'Data Display',
  },
  Features: {
    itinerary: 'Itinerary',
    trip: 'Trip',
    content: 'Content',
    calendar: 'Calendar',
    review: 'Review',
    weather: 'Weather',
    facts: 'Facts',
  },
  'Product Marketing': {
    hero: 'Hero',
    features: 'Features',
    testimonials: 'Testimonials',
    pricing: 'Pricing',
    cta: 'CTAs',
    about: 'About',
  },
  'App Layout': {
    navigation: 'Navigation',
    pageContainers: 'Page Containers',
    userInterface: 'User Interface',
    appShell: 'App Shell',
    responsivePatterns: 'Responsive Patterns',
  },
};

// Create types for categories and subcategories
export type MainCategory = keyof typeof storybookCategories;
export type SubCategory<T extends MainCategory> = keyof (typeof storybookCategories)[T];

// Type for full category path
export type StorybookCategory = string;
