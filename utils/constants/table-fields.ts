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
  },
  // Add other tables' fields as needed
} as const;
