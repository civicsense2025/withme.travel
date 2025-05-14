'use client';

import { useState } from 'react';
import { FeedbackForm, FormStatus, FeedbackType, Question, QuestionType } from '../types';
import { FeedbackFormRenderer } from '../FeedbackForm';
import { Button } from '@/components/ui/button';

/**
 * Trip Preferences Form Template
 *
 * This template provides a customizable form for collecting preferences from trip
 * participants before or during trip planning.
 */

interface TripPreferenceFormProps {
  tripId: string;
  tripName?: string;
  destinationName?: string;
  onComplete?: (sessionId: string) => void;
  onSubmit: (responses: {
    formId: string;
    responses: { questionId: string; value: any }[];
  }) => Promise<void>;
}

export function TripPreferenceForm({
  tripId,
  tripName = 'your upcoming trip',
  destinationName = 'your destination',
  onComplete,
  onSubmit,
}: TripPreferenceFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Create a unique ID for this form instance
  const formId = `trip-pref-${tripId}`;

  // Generate form with questions
  const form: FeedbackForm = {
    id: formId,
    title: `${tripName} Planning Preferences`,
    description: `Help us plan the perfect trip by sharing your preferences`,
    feedbackType: FeedbackType.TRIP_PLANNING,
    status: FormStatus.ACTIVE,
    tripId,
    showProgressBar: true,
    completionMessage:
      "Thanks for sharing your preferences! We'll use these to make this trip amazing.",
    themeColor: 'hsl(260 100% 82%)', // Travel Purple
    isTemplate: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Create questions with unique IDs
  const questions: Question[] = [
    // Welcome screen
    {
      id: `${formId}-welcome`,
      formId,
      title: `Let's plan ${tripName} together!`,
      description:
        'Answer a few quick questions to help us create a trip everyone will love. This should take less than 3 minutes.',
      type: QuestionType.WELCOME,
      position: 0,
      buttonText: "Let's go!",
      isRequired: false,
    },

    // Date range question
    {
      id: `${formId}-dates`,
      formId,
      title: `When can you join for ${tripName}?`,
      description: "Select all dates you're available. We'll find the days that work for everyone.",
      type: QuestionType.DATE_PICKER,
      position: 1,
      isRequired: true,
      allowRange: true,
      minDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // One week from now
    },

    // Budget range slider
    {
      id: `${formId}-budget`,
      formId,
      title: "What's your budget comfort zone?",
      description:
        'Drag the slider to indicate your overall budget for this trip (not including flights).',
      type: QuestionType.SLIDER_SCALE,
      position: 2,
      isRequired: true,
      minValue: 100,
      maxValue: 5000,
      stepSize: 100,
      minLabel: 'Budget',
      maxLabel: 'Luxury',
      showValue: true,
    },

    // Activity interest levels
    {
      id: `${formId}-activities`,
      formId,
      title: `What are you interested in doing at ${destinationName}?`,
      description:
        'Rate your interest in each activity type (1 = not interested, 5 = very interested)',
      type: QuestionType.ACTIVITY_INTEREST,
      position: 3,
      isRequired: true,
      activities: [
        { id: '1', label: 'Local Food & Dining', category: 'Food' },
        { id: '2', label: 'Street Food & Markets', category: 'Food' },
        { id: '3', label: 'Outdoor Adventure', category: 'Active' },
        { id: '4', label: 'Hiking & Nature', category: 'Active' },
        { id: '5', label: 'Museums & Art', category: 'Culture' },
        { id: '6', label: 'Historical Sites', category: 'Culture' },
        { id: '7', label: 'Nightlife & Entertainment', category: 'Lifestyle' },
        { id: '8', label: 'Shopping', category: 'Lifestyle' },
        { id: '9', label: 'Relaxation & Wellness', category: 'Wellness' },
        { id: '10', label: 'Beach Time', category: 'Wellness' },
      ],
      groupByCategory: true,
    },

    // Accommodation style
    {
      id: `${formId}-accommodation`,
      formId,
      title: "What's your ideal accommodation style?",
      description: 'Choose the option that best matches your preference',
      type: QuestionType.ACCOMMODATION_STYLE,
      position: 4,
      isRequired: true,
      options: [
        {
          id: '1',
          label: 'Budget Hostel',
          value: 'hostel',
          imageUrl: '/images/accommodations/hostel.jpg',
        },
        {
          id: '2',
          label: 'Mid-range Hotel',
          value: 'hotel-mid',
          imageUrl: '/images/accommodations/mid-hotel.jpg',
        },
        {
          id: '3',
          label: 'Luxury Hotel',
          value: 'hotel-luxury',
          imageUrl: '/images/accommodations/luxury-hotel.jpg',
        },
        {
          id: '4',
          label: 'Vacation Rental',
          value: 'rental',
          imageUrl: '/images/accommodations/vacation-rental.jpg',
        },
        {
          id: '5',
          label: 'Boutique Property',
          value: 'boutique',
          imageUrl: '/images/accommodations/boutique.jpg',
        },
      ],
      allowMultiple: false,
    },

    // Daily rhythm preference
    {
      id: `${formId}-schedule`,
      formId,
      title: "What's your daily rhythm preference?",
      description: 'Where do you fall on these spectrums?',
      type: QuestionType.MATRIX_RATING,
      position: 5,
      isRequired: true,
      rows: [
        { id: '1', label: 'Early Bird vs. Night Owl' },
        { id: '2', label: 'Planned vs. Spontaneous' },
        { id: '3', label: 'Packed Schedule vs. Relaxed Pace' },
        { id: '4', label: 'Tourist Spots vs. Local Hangouts' },
      ],
      columns: [
        { id: '1', label: '1' },
        { id: '2', label: '2' },
        { id: '3', label: '3' },
        { id: '4', label: '4' },
        { id: '5', label: '5' },
      ],
    },

    // Dietary preferences
    {
      id: `${formId}-dietary`,
      formId,
      title: 'Do you have any dietary requirements?',
      description: 'Select all that apply to you',
      type: QuestionType.MULTIPLE_CHOICE,
      position: 6,
      isRequired: false,
      options: [
        { id: '1', label: 'Vegetarian', value: 'vegetarian' },
        { id: '2', label: 'Vegan', value: 'vegan' },
        { id: '3', label: 'Gluten-free', value: 'gluten-free' },
        { id: '4', label: 'Dairy-free', value: 'dairy-free' },
        { id: '5', label: 'Kosher', value: 'kosher' },
        { id: '6', label: 'Halal', value: 'halal' },
        { id: '7', label: 'Nut Allergy', value: 'nut-allergy' },
        { id: '8', label: 'Shellfish Allergy', value: 'shellfish-allergy' },
        { id: '9', label: 'Other (please specify)', value: 'other' },
      ],
    },

    // Other dietary requirements (conditional)
    {
      id: `${formId}-dietary-other`,
      formId,
      title: 'Please specify your dietary requirements',
      type: QuestionType.LONG_TEXT,
      position: 7,
      isRequired: false,
      conditionalDisplay: {
        dependsOn: `${formId}-dietary`,
        showIf: (value: string[]) => value && value.includes('other'),
      },
      maxCharacterCount: 500,
    },

    // Must-do activities
    {
      id: `${formId}-must-do`,
      formId,
      title: `What's one thing you absolutely must do in ${destinationName}?`,
      description: "Share that one activity or experience you don't want to miss",
      type: QuestionType.SHORT_TEXT,
      position: 8,
      isRequired: false,
      maxCharacterCount: 200,
    },

    // Budget allocator
    {
      id: `${formId}-budget-allocator`,
      formId,
      title: 'How would you allocate your budget?',
      description: "Drag to distribute 100 points based on what's most important to you",
      type: QuestionType.BUDGET_ALLOCATOR,
      position: 9,
      isRequired: true,
      categories: [
        { id: '1', label: 'Accommodation', value: 'accommodation' },
        { id: '2', label: 'Food & Dining', value: 'food' },
        { id: '3', label: 'Activities & Experiences', value: 'activities' },
        { id: '4', label: 'Local Transportation', value: 'transportation' },
        { id: '5', label: 'Shopping & Souvenirs', value: 'shopping' },
      ],
      totalBudget: 100,
      allowExceedTotal: false,
    },

    // Trip priorities ranking
    {
      id: `${formId}-priorities`,
      formId,
      title: 'Rank what matters most to you for this trip',
      description:
        'Drag items to rearrange them from most important (top) to least important (bottom)',
      type: QuestionType.DRAG_RANK,
      position: 10,
      isRequired: true,
      options: [
        { id: '1', label: 'Unique Experiences', value: 'experiences' },
        { id: '2', label: 'Comfort & Convenience', value: 'comfort' },
        { id: '3', label: 'Value for Money', value: 'value' },
        { id: '4', label: 'Local Authenticity', value: 'authenticity' },
        { id: '5', label: 'Group Bonding', value: 'bonding' },
        { id: '6', label: 'Rest & Relaxation', value: 'relaxation' },
      ],
    },

    // Special requirements
    {
      id: `${formId}-special-reqs`,
      formId,
      title: 'Any special needs or accessibility requirements?',
      description: 'Let us know about anything we should consider when planning',
      type: QuestionType.LONG_TEXT,
      position: 11,
      isRequired: false,
      maxCharacterCount: 500,
    },

    // Mood board color picker
    {
      id: `${formId}-mood`,
      formId,
      title: `What colors remind you of ${destinationName}?`,
      description: "Pick up to 3 colors that capture the vibe you're looking for on this trip",
      type: QuestionType.COLOR_PICKER,
      position: 12,
      isRequired: false,
      predefinedColors: [
        '#264653', // Dark blue
        '#2a9d8f', // Teal
        '#e9c46a', // Yellow
        '#f4a261', // Orange
        '#e76f51', // Coral
        '#edf2f4', // Light gray
        '#d90429', // Red
        '#ffd166', // Light yellow
        '#06d6a0', // Mint
        '#118ab2', // Blue
        '#073b4c', // Navy
        '#8ecae6', // Light blue
      ],
      allowCustomColor: true,
    },

    // Trip emoji reaction
    {
      id: `${formId}-emoji`,
      formId,
      title: 'Pick an emoji that captures your ideal trip mood',
      type: QuestionType.EMOJI_REACTION,
      position: 13,
      isRequired: false,
      options: [
        { id: '1', label: 'Adventure', emoji: '🧗' },
        { id: '2', label: 'Relaxation', emoji: '🏖️' },
        { id: '3', label: 'Culture', emoji: '🏛️' },
        { id: '4', label: 'Food', emoji: '🍽️' },
        { id: '5', label: 'Party', emoji: '🎉' },
        { id: '6', label: 'Nature', emoji: '🌲' },
        { id: '7', label: 'Romance', emoji: '❤️' },
        { id: '8', label: 'Photography', emoji: '📸' },
      ],
    },

    // Thank you screen
    {
      id: `${formId}-thanks`,
      formId,
      title: 'Thanks for sharing your preferences!',
      description:
        "We'll use these insights to help plan a trip that everyone will love. You can always update your preferences later.",
      type: QuestionType.THANK_YOU,
      position: 14,
      isRequired: false,
      buttonText: 'Done',
    },
  ];

  // Handle the completion of the form
  const handleFormSubmission = async (data: any) => {
    await onSubmit(data);
    if (onComplete) {
      onComplete(data.sessionId || formId);
    }
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-[hsl(260,100%,82%)] hover:bg-[hsl(260,100%,75%)] text-[hsl(260,100%,20%)]"
      >
        Share Your Trip Preferences
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-auto bg-white rounded-lg">
            <button
              className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-800"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
            <div className="p-1 sm:p-6">
              <FeedbackFormRenderer
                form={form}
                questions={questions}
                onSubmit={handleFormSubmission}
                onClose={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
