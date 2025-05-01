// Itinerary categories constants

// Define all possible itinerary item categories
export const ITINERARY_CATEGORIES = [
  'Iconic Landmarks',
  'Local Secrets',
  'Cultural Experiences',
  'Outdoor Adventures', 
  'Food & Drink',
  'Nightlife',
  'Relaxation',
  'Shopping',
  'Group Activities',
  'Day Excursions',
  'Accommodations',
  'Flexible Options'
];

// Map categories to emoji icons
export const CATEGORY_ICONS: Record<string, string> = {
  'Iconic Landmarks': '🏛️',
  'Local Secrets': '🔍',
  'Cultural Experiences': '🎭',
  'Outdoor Adventures': '🏞️',
  'Food & Drink': '🍽️',
  'Nightlife': '🌃',
  'Relaxation': '💆',
  'Shopping': '🛍️',
  'Group Activities': '👥',
  'Day Excursions': '🚗',
  'Accommodations': '🏨',
  'Flexible Options': '🔄',
  // Keep legacy categories for backward compatibility
  'accommodation': '🏨',
  'activity': '🎯',
  'attraction': '🎢',
  'beach': '🏖️',
  'dining': '🍽️',
  'event': '🎭',
  'flight': '✈️',
  'hiking': '🥾',
  'museum': '🏛️',
  'nightlife': '🌃',
  'shopping': '🛍️',
  'sightseeing': '📸',
  'spa': '💆',
  'sport': '🏄',
  'tour': '🧭',
  'transport': '🚆',
  'other': '📌'
};

// Get an emoji for a category
export const getCategoryEmoji = (category: string | null): string => {
  if (!category) return '📌';
  
  return CATEGORY_ICONS[category] || '📌';
};

// Map between legacy and new categories (optional, for data migration)
export const LEGACY_TO_NEW_CATEGORY: Record<string, string> = {
  'accommodation': 'Accommodations',
  'activity': 'Group Activities',
  'attraction': 'Iconic Landmarks',
  'beach': 'Outdoor Adventures',
  'dining': 'Food & Drink',
  'event': 'Cultural Experiences',
  'hiking': 'Outdoor Adventures',
  'museum': 'Cultural Experiences',
  'nightlife': 'Nightlife',
  'shopping': 'Shopping',
  'sightseeing': 'Iconic Landmarks',
  'spa': 'Relaxation',
  'sport': 'Outdoor Adventures',
  'tour': 'Day Excursions',
  'transport': 'Flexible Options',
  'other': 'Flexible Options'
}; 