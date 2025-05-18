/**
 * Table Field Constants
 *
 * This file contains field definitions for database tables. Unlike TABLES constants which store
 * the actual table names used with Supabase's from() method, these constants store field names
 * for each table.
 *
 * Usage:
 * import { TABLE_FIELDS } from '@/utils/constants/table-fields';
 *
 * // For querying specific fields
 * const { data } = await supabase
 *   .from('trips')
 *   .select(`${TABLE_FIELDS.TRIPS.ID}, ${TABLE_FIELDS.TRIPS.NAME}`)
 *
 * // For update operations
 * const { data } = await supabase
 *   .from('trips')
 *   .update({ [TABLE_FIELDS.TRIPS.NAME]: 'New Trip Name' })
 *   .eq(TABLE_FIELDS.TRIPS.ID, tripId)
 */

// ============================================================================
// TABLE FIELDS
// ============================================================================

export const TABLE_FIELDS = {
  TRIPS: {
    ID: 'id',
    CREATED_BY: 'created_by',
    NAME: 'name',
    DESCRIPTION: 'description',
    START_DATE: 'start_date',
    END_DATE: 'end_date',
    DATE_FLEXIBILITY: 'date_flexibility',
    TRAVELERS_COUNT: 'travelers_count',
    VIBE: 'vibe',
    BUDGET: 'budget',
    IS_PUBLIC: 'is_public',
    SLUG: 'slug',
    COVER_IMAGE_URL: 'cover_image_url',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    MEMBER_COUNT: 'member_count',
    TRIP_EMOJI: 'trip_emoji',
    SPLITWISE_GROUP_ID: 'splitwise_group_id',
    DURATION_DAYS: 'duration_days',
    STATUS: 'status',
    LIKES_COUNT: 'likes_count',
    COMMENTS_COUNT: 'comments_count',
    VIEW_COUNT: 'view_count',
    USE_COUNT: 'use_count',
    SHARED_URL: 'shared_url',
    PUBLIC_SLUG: 'public_slug',
    TRIP_TYPE: 'trip_type',
    COVER_IMAGE_POSITION_Y: 'cover_image_position_y',
    PRIVACY_SETTING: 'privacy_setting',
    PLAYLIST_URL: 'playlist_url',
    IS_ARCHIVED: 'is_archived',
    LAST_ACCESSED_AT: 'last_accessed_at',
    COLOR_SCHEME: 'color_scheme',
    CITY_ID: 'city_id',
    PRIMARY_CITY_ID: 'primary_city_id',
    IS_GUEST: 'is_guest',
    GUEST_TOKEN_TEXT: 'guest_token_text',
    DESTINATION_ID: 'destination_id',
  },

  GROUPS: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    CREATED_BY: 'created_by',
    SLUG: 'slug',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },

  GROUP_PLAN_IDEAS: {
    ID: 'id',
    GROUP_ID: 'group_id',
    CREATED_BY: 'created_by',
    GUEST_TOKEN: 'guest_token',
    TYPE: 'type',
    TITLE: 'title',
    DESCRIPTION: 'description',
    POSITION: 'position',
    VOTES_UP: 'votes_up',
    VOTES_DOWN: 'votes_down',
    SELECTED: 'selected',
    META: 'meta',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },

  USERS: {
    ID: 'id',
    EMAIL: 'email',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    ROLE: 'role',
    STATUS: 'status',
  },

  PROFILES: {
    ID: 'id',
    USER_ID: 'user_id',
    FULL_NAME: 'full_name',
    USERNAME: 'username',
    AVATAR_URL: 'avatar_url',
    BIO: 'bio',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },

  ITINERARY_ITEMS: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    NAME: 'name',
    DESCRIPTION: 'description',
    START_TIME: 'start_time',
    END_TIME: 'end_time',
    DAY: 'day',
    LOCATION: 'location',
    ADDRESS: 'address',
    CATEGORY: 'category',
    STATUS: 'status',
    CREATED_BY: 'created_by',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    VOTES: 'votes',
    POSITION: 'position',
    PLACE_ID: 'place_id',
  },

  PLACES: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    ADDRESS: 'address',
    LATITUDE: 'latitude',
    LONGITUDE: 'longitude',
    CATEGORY: 'category',
    WEBSITE: 'website',
    PHONE: 'phone',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },

  DESTINATIONS: {
    ID: 'id',
    NAME: 'name',
    SLUG: 'slug',
    DESCRIPTION: 'description',
    COUNTRY: 'country',
    IMAGE_URL: 'image_url',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    CITY_ID: 'city_id',
    IS_CITY_DEPRECATED: 'is_city_deprecated',
  },

  CITIES: {
    ID: 'id',
    NAME: 'name',
    COUNTRY: 'country',
    ADMIN_NAME: 'admin_name',
    CONTINENT: 'continent',
    LATITUDE: 'latitude',
    LONGITUDE: 'longitude',
    MAPBOX_ID: 'mapbox_id',
    POPULATION: 'population',
    TIMEZONE: 'timezone',
    COUNTRY_CODE: 'country_code',
    METADATA: 'metadata',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },

  TRIP_CITIES: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    CITY_ID: 'city_id',
    POSITION: 'position',
    ARRIVAL_DATE: 'arrival_date',
    DEPARTURE_DATE: 'departure_date',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },

  ITINERARY_SECTIONS: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    TRIP_CITY_ID: 'trip_city_id',
    DAY_NUMBER: 'day_number',
    DATE: 'date',
    TITLE: 'title',
    POSITION: 'position',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },

  // Add other tables' fields as needed
} as const;

// Export type for field keys
export type TableFieldKey<T extends keyof typeof TABLE_FIELDS> = keyof (typeof TABLE_FIELDS)[T];
