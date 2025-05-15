/**
 * Trip Planning FAQ variant
 * Customized FAQ for trip planning pages, including collaboration-specific questions.
 */
import React from 'react';
import { FAQ } from '../organisms/FAQ';
import { FaqEntry, FaqLayout } from '@/types/faq';

// Sample data for trip planning FAQ
const tripPlanningFaqs: FaqEntry[] = [
  {
    id: 'trip-1',
    question: 'How do I create a new trip and invite friends?',
    answer: `
      <p>Creating a new trip and inviting friends is simple:</p>
      <ol>
        <li>Click the <strong>"Create Trip"</strong> button on your dashboard</li>
        <li>Enter basic trip details (destination, dates, name)</li>
        <li>On the trip page, click <strong>"Invite"</strong> to add collaborators</li>
        <li>Enter email addresses or share a unique invite link</li>
      </ol>
      <p>Your friends will receive an invitation and can join the trip planning even if they don't have an account yet.</p>
    `,
    tags: ['Getting Started', 'Collaboration']
  },
  {
    id: 'trip-2',
    question: 'Can multiple people edit the trip itinerary simultaneously?',
    answer: `
      <p>Yes! Our collaborative trip planning features include:</p>
      <ul>
        <li>Real-time editing where everyone sees changes as they happen</li>
        <li>Presence indicators showing who's currently viewing or editing</li>
        <li>Voting system for group decision-making on activities and accommodations</li>
        <li>Comments and discussions on specific itinerary items</li>
      </ul>
      <p>Changes sync automatically across all devices, so everyone stays on the same page.</p>
    `,
    tags: ['Collaboration', 'Features']
  },
  {
    id: 'trip-3',
    question: 'How can we track our trip budget as a group?',
    answer: `
      <p>Our collaborative budgeting tools help everyone stay on the same page financially:</p>
      <ul>
        <li>Add shared expenses and split them automatically</li>
        <li>Track individual contributions to group expenses</li>
        <li>Set a trip budget and monitor spending against it</li>
        <li>Categorize expenses (accommodation, food, activities, etc.)</li>
        <li>View spending breakdowns and summaries</li>
      </ul>
      <p>Everyone with edit permissions can add expenses, but you can also assign a dedicated "budget manager" role.</p>
    `,
    tags: ['Budget', 'Collaboration']
  },
  {
    id: 'trip-4',
    question: 'How do I organize activities into daily itineraries?',
    answer: `
      <p>To organize your trip into a day-by-day itinerary:</p>
      <ol>
        <li>Go to the "Itinerary" tab on your trip page</li>
        <li>Activities are organized by day automatically based on dates</li>
        <li>Drag and drop activities to rearrange them</li>
        <li>Use the "+" button to add new activities to specific days</li>
        <li>Set times for each activity to create a schedule</li>
      </ol>
      <p>You can also toggle between calendar, list, and map views to visualize your itinerary differently.</p>
    `,
    tags: ['Itinerary', 'Organization']
  },
  {
    id: 'trip-5',
    question: 'Can I export my trip details to use offline or share with non-users?',
    answer: `
      <p>Yes, you can export your trip in several formats:</p>
      <ul>
        <li><strong>PDF:</strong> Complete itinerary with maps, contacts, and reservations</li>
        <li><strong>Calendar:</strong> Sync with Google Calendar, Apple Calendar, or Outlook</li>
        <li><strong>Print version:</strong> Optimized layout for physical copies</li>
        <li><strong>Share link:</strong> View-only access for non-registered users</li>
      </ul>
      <p>Exports include all essential information for your trip, even when you don't have internet access.</p>
    `,
    tags: ['Sharing', 'Features']
  }
];

export interface TripPlanningFAQProps {
  /** Custom items to merge with default trip planning FAQs */
  customItems?: FaqEntry[];
  /** Whether to merge custom items or replace entirely */
  replaceDefault?: boolean;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
  /** Layout variant */
  layout?: FaqLayout;
  /** Additional CSS class */
  className?: string;
}

export function TripPlanningFAQ({
  customItems,
  replaceDefault = false,
  title = 'Trip Planning FAQ',
  description = 'Find answers to common questions about planning trips with friends and family.',
  layout = 'default',
  className
}: TripPlanningFAQProps) {
  // Combine default and custom items if provided
  const items = replaceDefault ? 
    (customItems || []) : 
    [...tripPlanningFaqs, ...(customItems || [])];
  
  return (
    <FAQ
      items={items}
      title={title}
      description={description}
      layout={layout}
      className={className}
      structuredData={true}
    />
  );
} 