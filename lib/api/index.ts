export * as itinerary from './itinerary';
export * as itineraries from './itineraries';
export * as tripMembers from './tripMembers';
export * as tags from './tags';
export * as permissions from './permissions';
export * as expenses from './expenses';
export * as groups from './groups';
export * as destinations from './destinations';
export * as activities from './activities';
export * as comments from './comments';
export * as trips from './trips';
export * as places from './places';

// Export logistics API functions
export {
  addFormToTrip,
  addAccommodationToTrip,
  addTransportationToTrip,
  listLogisticsItems,
  deleteLogisticsItem
} from './logistics';

// Add more as needed 