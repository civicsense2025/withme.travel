import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a research participant link
 * 
 * This function creates a new participant record in the database and 
 * returns a URL with the participant ID and study ID as query parameters
 * 
 * @param studyId Study ID to associate with the participant
 * @param baseUrl Base URL for the research link (e.g. https://withme.travel)
 * @param email Optional email to associate with the participant
 * @returns URL string for the research link
 */
export async function generateResearchLink(
  studyId: string, 
  baseUrl: string,
  email?: string
): Promise<string> {
  const supabase = await createRouteHandlerClient();
  
  // Create a new participant record with a generated ID
  const participantId = uuidv4();
  
  // Insert the participant record
  const { error } = await supabase
    .from(TABLES.RESEARCH_PARTICIPANTS)
    .insert({
      id: participantId,
      study_id: studyId,
      status: 'invited',
      email: email || null
    });
  
  if (error) {
    console.error('Error creating research participant:', error);
    throw new Error(`Failed to create research participant: ${error.message}`);
  }
  
  // Generate URL with the participant ID and study ID
  const researchUrl = new URL(baseUrl);
  researchUrl.searchParams.append('research', 'true');
  researchUrl.searchParams.append('pid', participantId);
  researchUrl.searchParams.append('sid', studyId);
  
  return researchUrl.toString();
}

/**
 * List of event names that can be tracked
 * This helps maintain consistency when tracking events
 */
export const RESEARCH_EVENTS = {
  // Session events
  SESSION_START: 'research_session_start',
  SESSION_END: 'research_session_end',
  PAGE_NAVIGATION: 'page_navigation',
  
  // User action events
  CREATE_TRIP: 'create_trip',
  EDIT_TRIP: 'edit_trip',
  DELETE_TRIP: 'delete_trip',
  ADD_TRIP_MEMBER: 'add_trip_member',
  REMOVE_TRIP_MEMBER: 'remove_trip_member',
  VIEW_DESTINATION: 'view_destination',
  SEARCH_DESTINATION: 'search_destination',
  ADD_ITINERARY_ITEM: 'add_itinerary_item',
  EDIT_ITINERARY_ITEM: 'edit_itinerary_item',
  DELETE_ITINERARY_ITEM: 'delete_itinerary_item',
  VOTE_ITINERARY_ITEM: 'vote_itinerary_item',
  ADD_BUDGET_ITEM: 'add_budget_item',
  EDIT_BUDGET_ITEM: 'edit_budget_item',
  DELETE_BUDGET_ITEM: 'delete_budget_item',
  
  // Group events
  CREATE_GROUP: 'create_group',
  JOIN_GROUP: 'join_group',
  LEAVE_GROUP: 'leave_group',
  ADD_GROUP_MEMBER: 'add_group_member',
  REMOVE_GROUP_MEMBER: 'remove_group_member',
  
  // Group plan idea events
  CREATE_GROUP_PLAN_IDEA: 'create_group_plan_idea',
  EDIT_GROUP_PLAN_IDEA: 'edit_group_plan_idea',
  DELETE_GROUP_PLAN_IDEA: 'delete_group_plan_idea',
  VOTE_GROUP_PLAN_IDEA: 'vote_group_plan_idea',
  
  // Survey events
  SURVEY_SHOWN: 'survey_shown',
  SURVEY_COMPLETED: 'survey_completed',
  SURVEY_SKIPPED: 'survey_skipped',
  SURVEY_SUBMISSION_ERROR: 'survey_submission_error',
  
  // Error events
  API_ERROR: 'api_error',
  CLIENT_ERROR: 'client_error',
  
  // Custom events for specific features
  OPEN_MAP: 'open_map',
  USE_FILTER: 'use_filter',
  SHARE_LINK: 'share_link',
  EXPORT_CALENDAR: 'export_calendar',
  
  // OpenReplay specific integration events
  CUSTOM_EVENT: 'custom_event',
  IDENTIFY_USER: 'identify_user',
  METADATA_UPDATE: 'metadata_update',
  
  // Key milestones/inflection points (research focus)
  COMPLETE_ONBOARDING: 'complete_onboarding',
  ITINERARY_MILESTONE_3_ITEMS: 'itinerary_milestone_3_items',
  GROUP_FORMATION_COMPLETE: 'group_formation_complete',
  VOTE_PROCESS_USED: 'vote_process_used',
  TRIP_FROM_TEMPLATE_CREATED: 'trip_from_template_created'
} as const;

export type ResearchEventName = keyof typeof RESEARCH_EVENTS;

/**
 * Converts a file path like "/trips/create" to a page name like "trips_create"
 * Useful for normalizing page names in event tracking
 */
export function pathToPageName(path: string): string {
  return path
    .split('/')
    .filter(Boolean)
    .join('_') || 'home';
}

/**
 * Extracts the primary ID from a URL path
 * For example, "/trips/123/edit" would return "123"
 */
export function extractIdFromPath(path: string): string | null {
  const parts = path.split('/').filter(Boolean);
  
  // Check for common patterns like /trips/:id, /groups/:id, etc.
  if (parts.length >= 2) {
    const secondPart = parts[1];
    
    // If the second part looks like an ID (not a known route name)
    if (
      secondPart && 
      !['create', 'edit', 'new', 'settings', 'profile', 'members'].includes(secondPart)
    ) {
      return secondPart;
    }
  }
  
  return null;
}

/**
 * Checks if a milestone has been reached by analyzing event history
 * 
 * @param participantId ID of the research participant
 * @param milestoneType The type of milestone to check
 * @returns Promise<boolean> indicating if the milestone has been reached
 */
export async function checkMilestoneReached(
  participantId: string,
  milestoneType: 'onboarding' | 'itinerary_items' | 'group_formation' | 'voting' | 'template_usage'
): Promise<boolean> {
  const supabase = await createRouteHandlerClient();
  
  switch (milestoneType) {
    case 'onboarding':
      // Check if the onboarding completion event exists
      const { data: onboardingData } = await supabase
        .from(TABLES.RESEARCH_EVENTS)
        .select('id')
        .eq('participant_id', participantId)
        .eq('event_name', RESEARCH_EVENTS.COMPLETE_ONBOARDING)
        .limit(1);
      
      return onboardingData && onboardingData.length > 0;
      
    case 'itinerary_items':
      // Count itinerary add events to see if we've reached 3+
      const { count: itemCount, error: itemError } = await supabase
        .from(TABLES.RESEARCH_EVENTS)
        .select('id', { count: 'exact', head: false })
        .eq('participant_id', participantId)
        .eq('event_name', RESEARCH_EVENTS.ADD_ITINERARY_ITEM);
      
      return !itemError && itemCount !== null && itemCount >= 3;
      
    case 'group_formation':
      // Check if a group has been created
      const { data: groupData } = await supabase
        .from(TABLES.RESEARCH_EVENTS)
        .select('id')
        .eq('participant_id', participantId)
        .eq('event_name', RESEARCH_EVENTS.CREATE_GROUP)
        .limit(1);
      
      return groupData && groupData.length > 0;
      
    case 'voting':
      // Check if any voting events have occurred
      const { data: voteData } = await supabase
        .from(TABLES.RESEARCH_EVENTS)
        .select('id')
        .eq('participant_id', participantId)
        .in('event_name', [
          RESEARCH_EVENTS.VOTE_ITINERARY_ITEM,
          RESEARCH_EVENTS.VOTE_GROUP_PLAN_IDEA
        ])
        .limit(1);
      
      return voteData && voteData.length > 0;
      
    case 'template_usage':
      // Check if a trip has been created from a template
      const { data: templateData } = await supabase
        .from(TABLES.RESEARCH_EVENTS)
        .select('id')
        .eq('participant_id', participantId)
        .eq('event_name', RESEARCH_EVENTS.TRIP_FROM_TEMPLATE_CREATED)
        .limit(1);
      
      return templateData && templateData.length > 0;
      
    default:
      return false;
  }
} 