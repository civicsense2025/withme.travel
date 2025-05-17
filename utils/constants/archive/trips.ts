// Trip-related constants for withme.travel
export const TRIP_TABLES = {
  TRIPS: 'trips',
  TRIP_MEMBERS: 'trip_members',
  TRIP_CITIES: 'trip_cities',
  TRIP_LOGISTICS: 'trip_logistics',
  TRIP_TAGS: 'trip_tags',
  TRIP_NOTES: 'trip_notes',
  TRIP_HISTORY: 'trip_history',
  TRIP_IMAGES: 'trip_images',
  TRIP_TEMPLATE_USES: 'trip_template_uses',
  TRIP_VOTE_OPTIONS: 'trip_vote_options',
  TRIP_VOTE_POLLS: 'trip_vote_polls',
  TRIP_VOTES: 'trip_votes',
  TRIP_ACTIVITY_LOG: 'trip_activity_log',
  TRIP_COLLABORATIONS: 'trip_collaborations',
};

export const TRIP_ENUMS = {
  TRIP_TYPE: {
    LEISURE: 'leisure',
    BUSINESS: 'business',
    FAMILY: 'family',
    SOLO: 'solo',
    GROUP: 'group',
    OTHER: 'other',
  },
  TRIP_STATUS: {
    PLANNING: 'planning',
    UPCOMING: 'upcoming',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  TRIP_PRIVACY_SETTING: {
    PRIVATE: 'private',
    SHARED_WITH_LINK: 'shared_with_link',
    PUBLIC: 'public',
  },
  TRIP_ROLE: {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer',
    CONTRIBUTOR: 'contributor',
  },
};

export const TRIP_FIELDS = {
  ID: 'id',
  NAME: 'name',
  DESCRIPTION: 'description',
  START_DATE: 'start_date',
  END_DATE: 'end_date',
  CREATED_BY: 'created_by',
  DESTINATION_ID: 'destination_id',
};
