/**
 * Destination Components
 * 
 * Export all destination components from atoms, molecules, and organisms
 */

// Export atoms
export * from './atoms';

// Export molecules
export * from './molecules';

// Export organisms
export * from './organisms';

// Legacy exports - will be moved to atomic structure over time
export { default as PopularDestinations } from './popular-destinations';
export { default as PopularDestinationsCarousel } from './popular-destinations-carousel';
export { default as DestinationReviews } from './destination-reviews';
export { default as DestinationFeatureSection } from './destination-feature-section';
export { default as RelatedItinerariesWidget } from './related-itineraries-widget';
export { PopularDestinationCard } from './PopularDestinationCard'; 