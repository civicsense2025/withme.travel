import { ItineraryTemplateMetadata } from '@/types/itinerary';

/**
 * Sample metadata objects for testing and demonstration purposes
 */

/**
 * Complete sample metadata with all fields populated
 */
export const COMPLETE_SAMPLE_METADATA: ItineraryTemplateMetadata = {
  // Basic metadata fields
  pace: 'Moderate with strategic rest periods',
  budget: '$200-300 per day excluding flights',
  budget_level: 'Mid-range',
  travel_style: 'Cultural exploration with outdoor activities',
  audience: 'Active couples and small groups',
  seasonality: 'Best in spring and fall',
  highlights: [
    'Early morning hike to avoid crowds',
    'Sunset dinner at the famous cliff restaurant',
    'Private boat tour of the coastline',
  ],
  rating: 4.8,

  // New detailed metadata fields
  best_for: [
    'Photography enthusiasts',
    'Food lovers',
    'Cultural explorers',
    'History buffs',
    'Outdoor adventurers',
  ],
  languages: ['Italian (primary)', 'English (in tourist areas)', 'German (some restaurants)'],
  local_tips: [
    "The main square cafes charge double what you'll pay just one street over",
    'Visit the museum on Wednesday afternoons for reduced admission',
    'Always validate your train ticket before boarding to avoid fines',
    'The local bakery on Via Roma has the best pastries, but sells out by 10am',
    'Tap water is safe to drink throughout the region',
  ],
  best_seasons: ['Spring (April-May)', 'Fall (September-October)'],
  avoid_seasons: [
    'Mid-summer (July-August) due to crowds and heat',
    'December-February when many local businesses close',
  ],
  morning_start: '8:30 AM typical departure',
  accessibility_level: 'Moderate - some cobblestone streets and hills require good mobility',
  sustainability_aspects: [
    'Prioritizes locally-owned businesses',
    'Includes carbon-offset transportation options',
    'Recommends refillable water bottle stations',
    'Features hotels with certified eco-friendly practices',
    'Avoids locations known for over-tourism',
  ],
  estimated_budget_usd_per_day: 175,
};

/**
 * Minimal sample metadata with just a few important fields
 */
export const MINIMAL_SAMPLE_METADATA: ItineraryTemplateMetadata = {
  pace: 'Relaxed',
  estimated_budget_usd_per_day: 120,
  accessibility_level: 'Easy',
  local_tips: [
    'Most attractions open later than posted hours',
    'Bring your own water bottle to save money',
  ],
};

/**
 * Luxury trip sample metadata
 */
export const LUXURY_SAMPLE_METADATA: ItineraryTemplateMetadata = {
  pace: 'Leisurely with premium experiences',
  budget_level: 'Luxury',
  estimated_budget_usd_per_day: 750,
  travel_style: 'High-end relaxation and curated experiences',
  audience: 'Couples and small groups seeking luxury',
  local_tips: [
    'The private tours can be arranged with 24 hours notice',
    'The hotel concierge can secure reservations at all Michelin-starred restaurants',
    'Request the vintage wine pairing for an exceptional dining experience',
  ],
  accessibility_level: 'Easy - full assistance available',
  morning_start: 'Flexible, typically 9:30-10:00 AM',
  highlights: [
    'Private yacht excursion with chef-prepared lunch',
    'After-hours museum access',
    'Helicopter transfer to avoid traffic',
  ],
};

/**
 * Adventure trip sample metadata
 */
export const ADVENTURE_SAMPLE_METADATA: ItineraryTemplateMetadata = {
  pace: 'Active and challenging',
  budget_level: 'Mid-range',
  estimated_budget_usd_per_day: 200,
  travel_style: 'Outdoor adventure with adrenaline activities',
  audience: 'Active travelers seeking adventure',
  local_tips: [
    'The morning hikes have the best wildlife viewing opportunities',
    'Book rafting experiences 2 days in advance',
    'The north trail is less crowded but more challenging',
  ],
  accessibility_level: 'Difficult - requires good physical fitness',
  morning_start: 'Early - 6:00 AM for most activities',
  best_for: ['Thrill seekers', 'Nature enthusiasts', 'Active travelers'],
  best_seasons: ['Summer (June-August)'],
  avoid_seasons: ['Winter (December-February) due to trail closures'],
};
