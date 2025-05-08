import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/tables';

const USER_TESTING_SURVEY = {
  survey_id: 'user-testing-onboarding',
  title: 'Help us understand your travel preferences',
  description: 'We want to build the best group travel planning platform, and your insights are crucial. This short survey will help us shape our product to better meet your needs.',
  questions: [
    {
      id: 'travel_frequency',
      type: 'single_choice',
      label: 'How frequently do you travel with a group of friends/family?',
      required: true,
      options: [
        { label: 'Multiple times per year', value: 'frequent' },
        { label: 'About once a year', value: 'yearly' },
        { label: 'Every few years', value: 'occasional' },
        { label: 'Rarely or never', value: 'rare' }
      ]
    },
    {
      id: 'planning_challenges',
      type: 'multiple_choice',
      label: 'What are your biggest challenges when planning group trips?',
      required: true,
      options: [
        { label: 'Coordinating everyone\'s schedules', value: 'schedules' },
        { label: 'Finding accommodations that work for everyone', value: 'accommodations' },
        { label: 'Managing shared expenses', value: 'expenses' },
        { label: 'Getting consensus on activities/destinations', value: 'consensus' },
        { label: 'Keeping track of trip details in one place', value: 'organization' },
        { label: 'Communicating with everyone effectively', value: 'communication' }
      ]
    },
    {
      id: 'planning_tools',
      type: 'multiple_choice',
      label: 'What tools do you currently use to plan group trips?',
      required: true,
      options: [
        { label: 'Shared spreadsheets (Google Sheets, Excel)', value: 'spreadsheets' },
        { label: 'Messaging apps (WhatsApp, Telegram, etc.)', value: 'messaging' },
        { label: 'Email chains', value: 'email' },
        { label: 'Travel planning apps', value: 'travel_apps' },
        { label: 'Social media groups', value: 'social_media' },
        { label: 'Collaborative documents', value: 'docs' },
        { label: 'None of the above', value: 'none' }
      ]
    },
    {
      id: 'ideal_features',
      type: 'multiple_choice',
      label: 'Which features would you find most valuable in a group travel planning tool?',
      required: true,
      options: [
        { label: 'Shared itinerary builder', value: 'itinerary' },
        { label: 'Expense tracking and splitting', value: 'expenses' },
        { label: 'Collaborative decision making tools (polls, voting)', value: 'decisions' },
        { label: 'Task assignment and tracking', value: 'tasks' },
        { label: 'Real-time chat and updates', value: 'chat' },
        { label: 'Interactive maps of destinations', value: 'maps' },
        { label: 'Accommodation and flight booking', value: 'booking' },
        { label: 'Local recommendations and guides', value: 'recommendations' }
      ]
    },
    {
      id: 'feedback',
      type: 'text',
      label: "Any other thoughts or specific features you'd like to see in withme.travel?",
      required: false,
      placeholder: 'Share your ideas here...'
    }
  ]
};

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check if the survey already exists
    const { data: existingSurvey } = await supabase
      .from(TABLES.SURVEY_DEFINITIONS)
      .select('survey_id')
      .eq('survey_id', USER_TESTING_SURVEY.survey_id)
      .single();
    
    if (existingSurvey) {
      // Update existing survey
      const { error: updateError } = await supabase
        .from(TABLES.SURVEY_DEFINITIONS)
        .update(USER_TESTING_SURVEY)
        .eq('survey_id', USER_TESTING_SURVEY.survey_id);
      
      if (updateError) throw updateError;
      
      return NextResponse.json({ message: 'Survey updated successfully' });
    } else {
      // Insert new survey
      const { error: insertError } = await supabase
        .from(TABLES.SURVEY_DEFINITIONS)
        .insert([USER_TESTING_SURVEY]);
      
      if (insertError) throw insertError;
      
      return NextResponse.json({ message: 'Survey created successfully' });
    }
  } catch (error) {
    console.error('Error seeding survey:', error);
    return NextResponse.json(
      { error: 'Failed to seed survey' },
      { status: 500 }
    );
  }
} 