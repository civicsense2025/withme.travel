// TODO: Replace 'any' with the correct type from 'onborda' if available
// import type { TourConfig } from 'onborda';

// Adjust the `target` selectors to match your actual classNames in your trip page!
export const tripPlanningTour: any = {
  id: 'trip-planning',
  steps: [
    {
      id: 'trip-header',
      title: 'Trip Overview',
      content:
        'This is your trip dashboard. Here you can see all your trip details and collaborate with others.',
      target: '.trip-header',
      placement: 'bottom',
    },
    {
      id: 'itinerary-section',
      title: 'Plan Your Itinerary',
      content: 'Add day-by-day activities, accommodations, and transportation to your trip.',
      target: '.itinerary-section',
      placement: 'right',
    },
    {
      id: 'add-item-button',
      title: 'Add Items',
      content: 'Click here to add new activities, accommodations, or transportation.',
      target: '.add-itinerary-item-button',
      placement: 'top',
    },
    {
      id: 'members-tab',
      title: 'Invite Friends',
      content: 'Collaborate by inviting friends to join your trip planning.',
      target: '.members-tab',
      placement: 'left',
    },
    {
      id: 'finish',
      title: 'Ready to Plan!',
      content: 'You now know the basics of trip planning. Add your first activity to get started!',
      placement: 'center',
      target: 'body',
    },
  ],
};

export default tripPlanningTour;
