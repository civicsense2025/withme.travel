/**
 * Constants for database enums
 * Auto-generated from types/database.d.ts
 * Last updated: 2025-05-17T18:40:52.407Z
 */
export const ENUMS = {
  BUDGET_CATEGORY: {
    ACCOMMODATION: "accommodation",
    ACTIVITIES: "activities",
    ENTERTAINMENT: "entertainment",
    FOOD: "food",
    GIFTS: "gifts",
    OTHER: "other",
    TRANSPORTATION: "transportation",
    TRAVEL: "travel",
  },
  CONTENT_TYPE: {
    COLLECTION: "collection",
    DESTINATION: "destination",
    GROUP_PLAN_IDEA: "group_plan_idea",
    ITINERARY_ITEM: "itinerary_item",
    TEMPLATE: "template",
    TRIP: "trip",
  },
  GROUP_IDEA_TYPE: {
    ACTIVITY: "activity",
    BUDGET: "budget",
    DATE: "date",
    DESTINATION: "destination",
    NOTE: "note",
    OTHER: "other",
    PLACE: "place",
    QUESTION: "question",
  },
  GROUP_MEMBER_ROLE: {
    ADMIN: "admin",
    MEMBER: "member",
  },
  GROUP_MEMBER_STATUS: {
    ACTIVE: "active",
    INVITED: "invited",
    LEFT: "left",
    REMOVED: "removed",
  },
  GROUP_VISIBILITY: {
    PRIVATE: "private",
    PUBLIC: "public",
    UNLISTED: "unlisted",
  },
  IMAGE_TYPE: {
    DESTINATION: "destination",
    TEMPLATE_COVER: "template_cover",
    TRIP_COVER: "trip_cover",
    USER_AVATAR: "user_avatar",
  },
  INVITATION_STATUS: {
    ACCEPTED: "accepted",
    DECLINED: "declined",
    EXPIRED: "expired",
    PENDING: "pending",
    REVOKED: "revoked",
  },
  INVITATION_TYPE: {
    GROUP: "group",
    REFERRAL: "referral",
    TRIP: "trip",
  },
  ITEM_STATUS: {
    CONFIRMED: "confirmed",
    PENDING: "pending",
    REJECTED: "rejected",
    SUGGESTED: "suggested",
  },
  ITINERARY_CATEGORY: {
    CAFES: "Cafes",
    CULTURAL: "Cultural",
    ENTERTAINMENT: "Entertainment",
    ICONICLANDMARKS: "IconicLandmarks",
    MUSEUMS: "Museums",
    NIGHTLIFE: "Nightlife",
    OTHER: "Other",
    OUTDOORACTIVITIES: "OutdoorActivities",
    PARKS: "Parks",
    RESTAURANTS: "Restaurants",
    SHOPPING: "Shopping",
    TOURS: "Tours",
  },
  PERMISSION_STATUS: {
    ACCEPTED: "accepted",
    PENDING: "pending",
    REJECTED: "rejected",
  },
  STATE_PROVINCE_TYPE_ENUM: {
    AUTONOMOUS_REGION: "autonomous_region",
    COUNTY: "county",
    DEPARTMENT: "department",
    DISTRICT: "district",
    MUNICIPALITY: "municipality",
    OBLAST: "oblast",
    OTHER: "other",
    PREFECTURE: "prefecture",
    PROVINCE: "province",
    REGION: "region",
    STATE: "state",
    TERRITORY: "territory",
  },
  TRAVEL_PACE: {
    FAST: "fast",
    MODERATE: "moderate",
    SLOW: "slow",
    VERY_FAST: "very_fast",
    VERY_SLOW: "very_slow",
  },
  TRIP_ACTION_TYPE: {
    ACCESS_REQUEST_SENT: "ACCESS_REQUEST_SENT",
    ACCESS_REQUEST_UPDATED: "ACCESS_REQUEST_UPDATED",
    COMMENT_ADDED: "COMMENT_ADDED",
    COMMENT_DELETED: "COMMENT_DELETED",
    COMMENT_UPDATED: "COMMENT_UPDATED",
    FOCUS_INITIATED: "FOCUS_INITIATED",
    IMAGE_UPLOADED: "IMAGE_UPLOADED",
    INVITATION_SENT: "INVITATION_SENT",
    ITINERARY_ITEM_ADDED: "ITINERARY_ITEM_ADDED",
    ITINERARY_ITEM_DELETED: "ITINERARY_ITEM_DELETED",
    ITINERARY_ITEM_UPDATED: "ITINERARY_ITEM_UPDATED",
    MEMBER_ADDED: "MEMBER_ADDED",
    MEMBER_REMOVED: "MEMBER_REMOVED",
    MEMBER_ROLE_UPDATED: "MEMBER_ROLE_UPDATED",
    NOTE_CREATED: "NOTE_CREATED",
    NOTE_DELETED: "NOTE_DELETED",
    NOTE_UPDATED: "NOTE_UPDATED",
    SPLITWISE_GROUP_CREATED_AND_LINKED: "SPLITWISE_GROUP_CREATED_AND_LINKED",
    SPLITWISE_GROUP_LINKED: "SPLITWISE_GROUP_LINKED",
    SPLITWISE_GROUP_UNLINKED: "SPLITWISE_GROUP_UNLINKED",
    TAG_ADDED: "TAG_ADDED",
    TAG_REMOVED: "TAG_REMOVED",
    TRIP_CREATED: "TRIP_CREATED",
    TRIP_UPDATED: "TRIP_UPDATED",
    VOTE_CAST: "VOTE_CAST",
  },
  TRIP_PRIVACY_SETTING: {
    PRIVATE: "private",
    PUBLIC: "public",
    SHARED: "shared",
    UNLISTED: "unlisted",
  },
  TRIP_ROLE: {
    ADMIN: "admin",
    CONTRIBUTOR: "contributor",
    EDITOR: "editor",
    VIEWER: "viewer",
  },
  TRIP_STATUS: {
    CANCELLED: "cancelled",
    COMPLETED: "completed",
    IN_PROGRESS: "in_progress",
    PLANNING: "planning",
    UPCOMING: "upcoming",
  },
  TRIP_TYPE: {
    BUSINESS: "business",
    FAMILY: "family",
    GROUP: "group",
    LEISURE: "leisure",
    OTHER: "other",
    SOLO: "solo",
  },
  USER_ROLE: {
    ADMIN: "admin",
    GUEST: "guest",
    MODERATOR: "moderator",
    SUPPORT: "support",
    USER: "user",
  },
  VOTE_TYPE: {
    DOWN: "down",
    UP: "up",
  },
  TASK_STATUS: {
    SUGGESTED: 'suggested',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected',
    ACTIVE: 'active',
    CANCELLED: 'cancelled',
  },
  TASK_PRIORITY: {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
  },
} as const;

/**
 * Type for enum names
 */
export type EnumName = keyof typeof ENUMS;

/**
 * Type helper for getting the values of an enum
 */
export type EnumValues<T extends EnumName> = typeof ENUMS[T][keyof typeof ENUMS[T]];

/**
 * Type helper for getting the keys of an enum
 */
export type EnumKeys<T extends EnumName> = keyof typeof ENUMS[T];

/**
 * Get all values of an enum as an array
 */
export function getEnumValues<T extends EnumName>(enumName: T): EnumValues<T>[] {
  return Object.values(ENUMS[enumName]) as EnumValues<T>[];
}

/**
 * Get all keys of an enum as an array
 */
export function getEnumKeys<T extends EnumName>(enumName: T): EnumKeys<T>[] {
  return Object.keys(ENUMS[enumName]) as EnumKeys<T>[];
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Define types for all enums
 */
export type BudgetCategory = EnumValues<'BUDGET_CATEGORY'>;
export type ContentType = EnumValues<'CONTENT_TYPE'>;
export type GroupIdeaType = EnumValues<'GROUP_IDEA_TYPE'>;
export type GroupMemberRole = EnumValues<'GROUP_MEMBER_ROLE'>;
export type GroupMemberStatus = EnumValues<'GROUP_MEMBER_STATUS'>;
export type GroupVisibility = EnumValues<'GROUP_VISIBILITY'>;
export type ImageType = EnumValues<'IMAGE_TYPE'>;
export type InvitationStatus = EnumValues<'INVITATION_STATUS'>;
export type InvitationType = EnumValues<'INVITATION_TYPE'>;
export type ItemStatus = EnumValues<'ITEM_STATUS'>;
export type ItineraryCategory = EnumValues<'ITINERARY_CATEGORY'>;
export type PermissionStatus = EnumValues<'PERMISSION_STATUS'>;
export type StateProvinceType = EnumValues<'STATE_PROVINCE_TYPE_ENUM'>;
export type TravelPace = EnumValues<'TRAVEL_PACE'>;
export type TripActionType = EnumValues<'TRIP_ACTION_TYPE'>;
export type TripPrivacySetting = EnumValues<'TRIP_PRIVACY_SETTING'>;
export type TripRole = EnumValues<'TRIP_ROLE'>;
export type TripStatus = EnumValues<'TRIP_STATUS'>;
export type TripType = EnumValues<'TRIP_TYPE'>;
export type UserRole = EnumValues<'USER_ROLE'>;
export type VoteType = EnumValues<'VOTE_TYPE'>;

// Commentable content type definition
export type CommentableContentType = ContentType;

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// The following exports are for backward compatibility with existing code
// ============================================================================

// Individual enum exports for backward compatibility
export const TRIP_ROLES = ENUMS.TRIP_ROLE;
export const GROUP_MEMBER_ROLES = ENUMS.GROUP_MEMBER_ROLE;
export const GROUP_VISIBILITY = ENUMS.GROUP_VISIBILITY;
export const ITINERARY_CATEGORIES = ENUMS.ITINERARY_CATEGORY;
export const PERMISSION_STATUSES = ENUMS.PERMISSION_STATUS;
export const ITEM_STATUSES = ENUMS.ITEM_STATUS;
export const TRIP_STATUSES = ENUMS.TRIP_STATUS;
export const TRIP_TYPES = ENUMS.TRIP_TYPE;
export const BUDGET_CATEGORIES = ENUMS.BUDGET_CATEGORY;
export const TRIP_PRIVACY_SETTINGS = ENUMS.TRIP_PRIVACY_SETTING;
export const TRAVEL_PACES = ENUMS.TRAVEL_PACE;
export const INVITATION_STATUSES = ENUMS.INVITATION_STATUS;
export const VOTE_TYPES = ENUMS.VOTE_TYPE;
export const GROUP_PLAN_IDEA_TYPE = ENUMS.GROUP_IDEA_TYPE;
export const GROUP_MEMBER_STATUSES = ENUMS.GROUP_MEMBER_STATUS;
export const IMAGE_TYPES = ENUMS.IMAGE_TYPE;
export const CONTENT_TYPES = ENUMS.CONTENT_TYPE;

// Placeholder constants (can be replaced with actual implementations if needed)
export const SPLIT_TYPES = { EQUAL: 'equal', PERCENTAGE: 'percentage', CUSTOM: 'custom' } as const;
export const TEMPLATE_CATEGORIES = { CITY: 'city', COUNTRY: 'country', THEME: 'theme', OTHER: 'other' } as const;
export const TEMPLATE_TYPES = { PUBLIC: 'public', PRIVATE: 'private', SHARED: 'shared' } as const;
export const PRIVACY_SETTINGS = { PUBLIC: 'public', PRIVATE: 'private', SHARED: 'shared' } as const;
export const PLACE_CATEGORIES = { RESTAURANT: 'restaurant', ATTRACTION: 'attraction', HOTEL: 'hotel', OTHER: 'other' } as const;
export const TRAVEL_PERSONALITY_TYPES = { PLANNER: 'planner', SPONTANEOUS: 'spontaneous', BALANCED: 'balanced' } as const;
export const TRAVEL_SQUAD_TYPES = { SOLO: 'solo', COUPLE: 'couple', FAMILY: 'family', FRIENDS: 'friends', GROUP: 'group' } as const;
export const TRAVEL_STYLES = { LUXURY: 'luxury', BUDGET: 'budget', ADVENTURE: 'adventure', RELAXING: 'relaxing', CULTURAL: 'cultural' } as const;
export const TAG_STATUSES = { ACTIVE: 'active', INACTIVE: 'inactive' } as const;
export const USER_STATUSES = { ACTIVE: 'active', INACTIVE: 'inactive', SUSPENDED: 'suspended' } as const;
export const INTERACTION_TYPES = { LIKE: 'like', COMMENT: 'comment', SHARE: 'share' } as const;
export const URL_FORMATS = { FULL: 'full', SHORT: 'short', SHARE: 'share' } as const;
export const PRESENCE_STATUSES = { ONLINE: 'online', AWAY: 'away', OFFLINE: 'offline' } as const;
