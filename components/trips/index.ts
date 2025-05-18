/**
 * Trip Components
 * 
 * Export all trip components from atoms, molecules, and organisms
 */

// Export atoms
// export * from './atoms';

// Export molecules
// export * from './molecules';

// Export organisms
// export * from './organisms';

// Atoms
export * from './atoms/TripCoverImage';
export * from './atoms/TripDates';
export * from './atoms/TripDestinationBadge';
export * from './atoms/PresenceAvatar';
export * from './atoms/TripStatusBadge';
export * from './atoms/ActivityIcon';

// Molecules
export * from './molecules/TripCardHeader';
export * from './molecules/TripCardFooter';
export * from './molecules/TripMemberItem';
export * from './molecules/ActivityItem';
// export * from './molecules/TripShareButton';
// export * from './molecules/ConnectionStatusIndicator';
// export * from './molecules/PresenceIndicator';

// Organisms
export * from './organisms/TripCard';
// export * from './organisms/TripCreationForm';
// export * from './organisms/TripHeader';
export * from './organisms/ActivityTimeline';
export * from './organisms/TripMembersList';
// export * from './organisms/MultipleCitySelector';
// export * from './organisms/TripSidebar';

// Templates
// export * from './templates/TripsOverviewTemplate';
// export * from './templates/TripDetailTemplate';
// export * from './templates/TripCreationTemplate';

export { TripPageError } from './trip-page-error';
export { default as SimplifiedTripHeader } from './SimplifiedTripHeader'; 