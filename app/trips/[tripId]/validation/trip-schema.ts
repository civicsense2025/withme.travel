import { z } from 'zod';
import { ZOD_SCHEMAS } from '@/utils/constants/validation';

/**
 * Schema for validating trip data from API responses
 */
export const TripDataSchema = z.object({
  tripId: z.string(),
  tripName: z.string(),
  tripDescription: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  tripDurationDays: z.number().nullable(),
  coverImageUrl: z.string().url().nullable(),
  destinationId: z.string().uuid().nullable(),
  initialMembers: z.array(
    z.object({
      id: z.string(),
      trip_id: z.string(),
      user_id: z.string(),
      role: z.string(),
      joined_at: z.string(),
      profiles: z
        .object({
          id: z.string(),
          name: z.string().nullable(),
          avatar_url: z.string().nullable(),
          username: z.string().nullable(),
        })
        .nullable(),
    })
  ),
  initialSections: z.array(
    z.object({
      id: z.string(),
      trip_id: z.string(),
      day_number: z.number(),
      date: z.string().nullable(),
      title: z.string().nullable(),
      position: z.number(),
      created_at: z.string(),
      updated_at: z.string(),
      items: z.array(
        z.object({
          id: z.string(),
          trip_id: z.string(),
          title: z.string().nullable(),
          created_at: z.string(),
          section_id: z.string().nullable(),
          type: z.string().nullable(),
          item_type: z.string().nullable(),
          date: z.string().nullable(),
          start_time: z.string().nullable(),
          end_time: z.string().nullable(),
          location: z.string().nullable(),
          address: z.string().nullable(),
          place_id: z.string().nullable(),
          latitude: z.number().nullable(),
          longitude: z.number().nullable(),
          estimated_cost: z.number().nullable(),
          currency: z.string().nullable(),
          notes: z.string().nullable(),
          description: z.string().nullable(),
          updated_at: z.string().nullable(),
          created_by: z.string().nullable(),
          is_custom: z.boolean().nullable(),
          day_number: z.number().nullable(),
          category: z.string().nullable(),
          status: ZOD_SCHEMAS.NULLABLE_ITEM_STATUS,
          position: z.number().nullable(),
          duration_minutes: z.number().nullable(),
          cover_image_url: z.string().nullable(),
          votes: z.object({
            up: z.number(),
            down: z.number(),
            upVoters: z.array(z.any()),
            downVoters: z.array(z.any()),
            userVote: z.enum(['up', 'down']).nullable(),
          }),
          creatorProfile: z
            .object({
              id: z.string(),
              name: z.string().nullable(),
              avatar_url: z.string().nullable(),
              username: z.string().nullable(),
            })
            .nullable(),
        })
      ),
    })
  ),
  initialUnscheduledItems: z.array(
    z.object({
      id: z.string(),
      trip_id: z.string(),
      title: z.string().nullable(),
      created_at: z.string(),
      section_id: z.string().nullable(),
      type: z.string().nullable(),
      item_type: z.string().nullable(),
      date: z.string().nullable(),
      start_time: z.string().nullable(),
      end_time: z.string().nullable(),
      location: z.string().nullable(),
      address: z.string().nullable(),
      place_id: z.string().nullable(),
      latitude: z.number().nullable(),
      longitude: z.number().nullable(),
      estimated_cost: z.number().nullable(),
      currency: z.string().nullable(),
      notes: z.string().nullable(),
      description: z.string().nullable(),
      updated_at: z.string().nullable(),
      created_by: z.string().nullable(),
      is_custom: z.boolean().nullable(),
      day_number: z.number().nullable(),
      category: z.string().nullable(),
      status: ZOD_SCHEMAS.NULLABLE_ITEM_STATUS,
      position: z.number().nullable(),
      duration_minutes: z.number().nullable(),
      cover_image_url: z.string().nullable(),
      votes: z.object({
        up: z.number(),
        down: z.number(),
        upVoters: z.array(z.any()),
        downVoters: z.array(z.any()),
        userVote: z.enum(['up', 'down']).nullable(),
      }),
      creatorProfile: z
        .object({
          id: z.string(),
          name: z.string().nullable(),
          avatar_url: z.string().nullable(),
          username: z.string().nullable(),
        })
        .nullable(),
    })
  ),
  initialManualExpenses: z.array(z.any()),
  userRole: z.string().nullable(),
  canEdit: z.boolean(),
  isTripOver: z.boolean(),
  destinationLat: z.number().nullable().optional(),
  destinationLng: z.number().nullable().optional(),
  initialTripBudget: z.number().nullable(),
  initialTags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
  slug: z.string().nullable(),
  privacySetting: z.enum(['private', 'shared_with_link', 'public']).nullable(),
  playlistUrl: z.string().nullable().optional(),
});

/**
 * Type derived from the TripDataSchema
 */
export type TripData = z.infer<typeof TripDataSchema>;
