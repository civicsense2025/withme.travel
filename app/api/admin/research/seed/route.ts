import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { RESEARCH_EVENTS } from '@/utils/research';
import { v4 as uuidv4 } from 'uuid';
import { TABLES } from '@/utils/constants/database';
import { cookies } from 'next/headers';

/**
 * Idempotent seed script that creates:
 * 1. A research study (if it doesn't exist)
 * 2. Survey definitions for 5 key inflection points (if they don't exist)
 * 3. Research triggers linking events to surveys (if they don't exist)
 */
export async function POST() {
  try {
    // Use cookies for authentication and specify service_role for admin access
    const supabase = await createRouteHandlerClient();
    
    // Default study ID - we'll use this as a consistent ID to ensure idempotency
    const studyId = '00000000-0000-4000-a000-000000000001'; // Using a fixed UUID for idempotency
    
    // Get user from session since we're in a server component
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: You must be logged in' }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from(TABLES.PROFILES)
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }
    
    // 1. Check if research study already exists
    const { data: existingStudy, error: studyCheckError } = await supabase
      .from(TABLES.RESEARCH_STUDIES)
      .select('*')
      .eq('id', studyId)
      .single();
    
    if (studyCheckError && studyCheckError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking for existing study:', studyCheckError);
      return NextResponse.json(
        { error: 'Failed to check for existing research study' },
        { status: 500 }
      );
    }
    
    // If study doesn't exist, create it
    if (!existingStudy) {
      const { error: studyError } = await supabase
        .from(TABLES.RESEARCH_STUDIES)
        .insert({
          id: studyId,
          name: 'Core User Journey Research',
          description: 'Research to understand user satisfaction at key inflection points',
          active: true
        });
        
      if (studyError) {
        console.error('Error creating research study:', studyError);
        return NextResponse.json(
          { error: 'Failed to create research study', details: studyError },
          { status: 500 }
        );
      }
      console.log('Created new research study:', studyId);
    } else {
      console.log('Research study already exists, skipping creation');
    }
    
    // 2. Define survey definitions
    const surveyDefinitions = [
      {
        survey_id: 'onboarding_survey',
        title: 'Quick check-in on your setup experience',
        description: 'Help us improve the onboarding process with your feedback',
        is_active: true,
        questions: [
          {
            id: 'onboarding_q1',
            text: 'That was the setup! How did it feel?',
            type: 'likert',
            options: [
              { label: '😫 Difficult', value: '1' },
              { label: '😕 Somewhat challenging', value: '2' },
              { label: '😐 Okay', value: '3' },
              { label: '🙂 Pretty smooth', value: '4' },
              { label: '😊 Easy', value: '5' }
            ],
            required: true
          },
          {
            id: 'onboarding_q2',
            text: 'What\'s the first trip you\'re thinking about planning with us?',
            type: 'text',
            required: false
          },
          {
            id: 'onboarding_q3',
            text: 'One thing that wasn\'t totally clear during setup was...',
            type: 'text',
            required: false
          },
          {
            id: 'onboarding_q4',
            text: 'Which part of WithMe are you most curious to try?',
            type: 'single_choice',
            options: [
              { label: 'Building an itinerary', value: 'itinerary' },
              { label: 'Inviting friends to collaborate', value: 'collaboration' },
              { label: 'Exploring destination guides', value: 'destinations' },
              { label: 'Using trip templates', value: 'templates' },
              { label: 'Something else', value: 'other' }
            ],
            required: true
          }
        ]
      },
      {
        survey_id: 'itinerary_items_survey',
        title: 'How\'s your trip planning going?',
        description: 'Share your thoughts on adding items to your trip',
        is_active: true,
        questions: [
          {
            id: 'itinerary_q1',
            text: 'Adding places to your trip has been...',
            type: 'likert',
            options: [
              { label: 'A struggle', value: '1' },
              { label: 'Somewhat difficult', value: '2' },
              { label: 'Okay', value: '3' },
              { label: 'Pretty easy', value: '4' },
              { label: 'Super smooth', value: '5' }
            ],
            required: true
          },
          {
            id: 'itinerary_q2',
            text: 'Compared to how you normally plan trips, our itinerary builder is:',
            type: 'single_choice',
            options: [
              { label: 'Much more complicated', value: 'much_harder' },
              { label: 'A bit more work', value: 'harder' },
              { label: 'About the same', value: 'same' },
              { label: 'Somewhat easier', value: 'easier' },
              { label: 'Much simpler', value: 'much_easier' }
            ],
            required: true
          },
          {
            id: 'itinerary_q3',
            text: 'Which feature would help you organize your itinerary better?',
            type: 'single_choice',
            options: [
              { label: 'Map view of daily routes', value: 'map_view' },
              { label: 'Drag-and-drop to arrange days', value: 'drag_drop' },
              { label: 'Time estimates between places', value: 'time_estimates' },
              { label: 'Adding personal notes', value: 'notes' },
              { label: 'Activity suggestions', value: 'suggestions' },
              { label: 'Something else', value: 'other' }
            ],
            required: true
          },
          {
            id: 'itinerary_q4',
            text: 'What\'s still missing from your itinerary that we could help with?',
            type: 'text',
            required: false
          }
        ]
      },
      {
        survey_id: 'group_formation_survey',
        title: 'Planning together just got real!',
        description: 'Help us understand how groups collaborate on trip planning',
        is_active: true,
        questions: [
          {
            id: 'group_q1',
            text: 'How did inviting people to your trip feel?',
            type: 'likert',
            options: [
              { label: 'Awkward', value: '1' },
              { label: 'A bit clunky', value: '2' },
              { label: 'Okay', value: '3' },
              { label: 'Pretty good', value: '4' },
              { label: 'Smooth sailing', value: '5' }
            ],
            required: true
          },
          {
            id: 'group_q2',
            text: 'What\'s your group\'s biggest travel planning challenge?',
            type: 'single_choice',
            options: [
              { label: 'Getting everyone to respond', value: 'responsiveness' },
              { label: 'Finding dates that work', value: 'scheduling' },
              { label: 'Agreeing on accommodations', value: 'accommodations' },
              { label: 'Balancing everyone\'s interests', value: 'interests' },
              { label: 'Managing the budget', value: 'budget' },
              { label: 'Other', value: 'other' }
            ],
            required: true
          },
          {
            id: 'group_q3',
            text: 'Which collaborative feature do you think your group will use most?',
            type: 'single_choice',
            options: [
              { label: 'Commenting on ideas', value: 'commenting' },
              { label: 'Voting on preferences', value: 'voting' },
              { label: 'Seeing who\'s online and active', value: 'presence' },
              { label: 'Shared trip notes', value: 'notes' },
              { label: 'Something else', value: 'other' }
            ],
            required: true
          },
          {
            id: 'group_q4',
            text: 'Compared to how you normally plan group trips, this process is...',
            type: 'likert',
            options: [
              { label: 'More complicated', value: '1' },
              { label: 'Slightly harder', value: '2' },
              { label: 'About the same', value: '3' },
              { label: 'Somewhat easier', value: '4' },
              { label: 'Much easier', value: '5' }
            ],
            required: true
          }
        ]
      },
      {
        survey_id: 'voting_process_survey',
        title: 'Democracy in action! Quick thoughts?',
        description: 'Share your thoughts on the voting system',
        is_active: true,
        questions: [
          {
            id: 'voting_q1',
            text: 'How did the voting process feel for your group?',
            type: 'single_choice',
            options: [
              { label: 'Fun way to decide together', value: 'fun' },
              { label: 'Efficient but a bit mechanical', value: 'efficient' },
              { label: 'Helped avoid awkward conversations', value: 'helpful' },
              { label: 'Still prefer discussions', value: 'prefer_discussions' },
              { label: 'Other', value: 'other' }
            ],
            required: true
          },
          {
            id: 'voting_q2',
            text: 'After using our voting feature, how confident are you about reaching group consensus?',
            type: 'rating',
            options: [
              { label: 'Not confident at all', value: '1' },
              { label: 'Slightly confident', value: '2' },
              { label: 'Moderately confident', value: '3' },
              { label: 'Very confident', value: '4' },
              { label: 'Extremely confident', value: '5' }
            ],
            required: true
          },
          {
            id: 'voting_q3',
            text: 'What\'s one thing that would make group decisions even smoother?',
            type: 'text',
            required: false
          },
          {
            id: 'voting_q4',
            text: 'After voting, did you feel...',
            type: 'multiple_choice',
            options: [
              { label: 'More confident in your plans', value: 'confident' },
              { label: 'Like everyone\'s voice was heard', value: 'heard' },
              { label: 'Curious about why people voted certain ways', value: 'curious' },
              { label: 'Ready to move forward with planning', value: 'ready' },
              { label: 'In need of more discussion', value: 'need_discussion' },
              { label: 'Other', value: 'other' }
            ],
            required: true
          }
        ]
      },
      {
        survey_id: 'template_usage_survey',
        title: 'Template as your starting point - how\'d it go?',
        description: 'Help us improve our trip templates',
        is_active: true,
        questions: [
          {
            id: 'template_q1',
            text: 'How well did this template match what you were looking for?',
            type: 'likert',
            options: [
              { label: 'Not at all', value: '1' },
              { label: 'Slightly matched', value: '2' },
              { label: 'Somewhat matched', value: '3' },
              { label: 'Very close', value: '4' },
              { label: 'Perfect fit', value: '5' }
            ],
            required: true
          },
          {
            id: 'template_q2',
            text: 'What was your main reason for using a template?',
            type: 'single_choice',
            options: [
              { label: 'Save planning time', value: 'save_time' },
              { label: 'Get inspiration for my trip', value: 'inspiration' },
              { label: 'Unsure where to start', value: 'uncertainty' },
              { label: 'Recommended destinations', value: 'recommendations' },
              { label: 'Other', value: 'other' }
            ],
            required: true
          },
          {
            id: 'template_q3',
            text: 'The best thing about starting with a template was...',
            type: 'text',
            required: false
          },
          {
            id: 'template_q4',
            text: 'What would make this template more useful for your trip?',
            type: 'multiple_choice',
            options: [
              { label: 'More local alternatives to popular spots', value: 'local_alternatives' },
              { label: 'Better time estimates between places', value: 'time_estimates' },
              { label: 'More budget options', value: 'budget_options' },
              { label: 'Local transport suggestions', value: 'transport' },
              { label: 'Seasonal activity recommendations', value: 'seasonal' },
              { label: 'Other', value: 'other' }
            ],
            required: true
          }
        ]
      }
    ];
    
    // Insert survey definitions if they don't exist
    let createdSurveys = 0;
    let skippedSurveys = 0;
    
    for (const survey of surveyDefinitions) {
      // Check if survey already exists
      const { data: existingSurvey, error: surveyCheckError } = await supabase
        .from(TABLES.SURVEY_DEFINITIONS)
        .select('survey_id')
        .eq('survey_id', survey.survey_id)
        .single();
      
      if (surveyCheckError && surveyCheckError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error(`Error checking for existing survey ${survey.survey_id}:`, surveyCheckError);
        return NextResponse.json(
          { error: `Failed to check for existing survey ${survey.survey_id}` },
          { status: 500 }
        );
      }
      
      // Skip if survey already exists
      if (existingSurvey) {
        console.log(`Survey ${survey.survey_id} already exists, skipping creation`);
        skippedSurveys++;
        continue;
      }
      
      // Create the survey
      const { error: surveyError } = await supabase
        .from(TABLES.SURVEY_DEFINITIONS)
        .insert(survey);
        
      if (surveyError) {
        console.error(`Error creating survey ${survey.survey_id}:`, surveyError);
        return NextResponse.json(
          { error: `Failed to create survey ${survey.survey_id}` },
          { status: 500 }
        );
      }
      
      console.log(`Created survey: ${survey.survey_id}`);
      createdSurveys++;
    }
    
    // 3. Define research triggers to connect events to surveys
    const triggers = [
      {
        id: '10000000-0000-4000-a000-000000000001',
        study_id: studyId,
        trigger_event: RESEARCH_EVENTS.COMPLETE_ONBOARDING,
        survey_id: 'onboarding_survey',
        min_delay_ms: 2000, // 2 seconds
        max_triggers: 1,
        active: true
      },
      {
        id: '10000000-0000-4000-a000-000000000002',
        study_id: studyId,
        trigger_event: RESEARCH_EVENTS.ITINERARY_MILESTONE_3_ITEMS,
        survey_id: 'itinerary_items_survey',
        min_delay_ms: 3000, // 3 seconds
        max_triggers: 1,
        active: true
      },
      {
        id: '10000000-0000-4000-a000-000000000003',
        study_id: studyId,
        trigger_event: RESEARCH_EVENTS.GROUP_FORMATION_COMPLETE,
        survey_id: 'group_formation_survey',
        min_delay_ms: 3000, // 3 seconds
        max_triggers: 1,
        active: true
      },
      {
        id: '10000000-0000-4000-a000-000000000004',
        study_id: studyId,
        trigger_event: RESEARCH_EVENTS.VOTE_PROCESS_USED,
        survey_id: 'voting_process_survey',
        min_delay_ms: 2000, // 2 seconds
        max_triggers: 1,
        active: true
      },
      {
        id: '10000000-0000-4000-a000-000000000005',
        study_id: studyId,
        trigger_event: RESEARCH_EVENTS.TRIP_FROM_TEMPLATE_CREATED,
        survey_id: 'template_usage_survey',
        min_delay_ms: 3000, // 3 seconds
        max_triggers: 1,
        active: true
      }
    ];
    
    // Create each trigger if it doesn't exist
    let createdTriggers = 0;
    let skippedTriggers = 0;
    
    for (const trigger of triggers) {
      // Check if trigger already exists
      const { data: existingTrigger, error: triggerCheckError } = await supabase
        .from(TABLES.RESEARCH_TRIGGERS)
        .select('id')
        .eq('id', trigger.id)
        .single();
      
      if (triggerCheckError && triggerCheckError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error(`Error checking for existing trigger ${trigger.id}:`, triggerCheckError);
        return NextResponse.json(
          { error: `Failed to check for existing trigger ${trigger.id}` },
          { status: 500 }
        );
      }
      
      // Skip if trigger already exists
      if (existingTrigger) {
        console.log(`Trigger ${trigger.id} already exists, skipping creation`);
        skippedTriggers++;
        continue;
      }
      
      // Create the trigger
      const { error: triggerError } = await supabase
        .from(TABLES.RESEARCH_TRIGGERS)
        .insert(trigger);
        
      if (triggerError) {
        console.error(`Error creating trigger ${trigger.id}:`, triggerError);
        return NextResponse.json(
          { error: `Failed to create trigger ${trigger.id}` },
          { status: 500 }
        );
      }
      
      console.log(`Created trigger: ${trigger.id}`);
      createdTriggers++;
    }
    
    // Return success with stats on what was created and what was skipped
    return NextResponse.json({
      success: true,
      message: 'Research data seeding completed successfully',
      studyId,
      stats: {
        study: existingStudy ? 'skipped (already exists)' : 'created',
        surveys: {
          created: createdSurveys,
          skipped: skippedSurveys,
          total: surveyDefinitions.length
        },
        triggers: {
          created: createdTriggers,
          skipped: skippedTriggers,
          total: triggers.length
        }
      }
    });
    
  } catch (error) {
    console.error('Error in research seed script:', error);
    return NextResponse.json(
      { error: 'Failed to seed research data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 