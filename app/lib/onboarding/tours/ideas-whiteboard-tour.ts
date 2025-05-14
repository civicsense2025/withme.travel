// Since we can't directly import from onborda, define the types here
interface TourStep {
  id: string;
  title: string;
  content: string;
  selector?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon?: null;
}

interface TourConfig {
  id: string;
  steps: TourStep[];
}

export const ideasWhiteboardTour: TourConfig = {
  id: 'ideas-whiteboard-tour',
  steps: [
    {
      id: 'welcome-to-whiteboard',
      title: 'Welcome to the Ideas Whiteboard!',
      content: 'This is where your group can brainstorm ideas for your trip together in real-time.',
      placement: 'center',
      icon: null,
      // No selector needed for the intro step
    },
    {
      id: 'destination-column',
      title: 'Destinations',
      content: 'Add places you want to visit. Where would your group like to go?',
      selector: '.column-destination',
      placement: 'right',
      icon: null,
    },
    {
      id: 'activity-column',
      title: 'Activities',
      content: 'Share activities your group might enjoy. What would you like to do there?',
      selector: '.column-activity',
      placement: 'top',
      icon: null,
    },
    {
      id: 'budget-column',
      title: 'Budget',
      content: 'Discuss budget expectations for the trip to make sure everyone is aligned.',
      selector: '.column-budget',
      placement: 'left',
      icon: null,
    },
    {
      id: 'date-column',
      title: 'Dates',
      content: 'Suggest timeframes that work for your trip. When can everyone make it?',
      selector: '.column-date',
      placement: 'bottom',
      icon: null,
    },
    {
      id: 'add-idea-button',
      title: 'Add New Ideas',
      content: 'Click the + button to add your own ideas to any column.',
      selector: '.add-idea-button',
      placement: 'bottom',
      icon: null,
    },
    {
      id: 'drag-drop',
      title: 'Organize Your Ideas',
      content: 'Drag and drop cards to reorder them or move them between columns.',
      selector: '.idea-card',
      placement: 'right',
      icon: null,
    },
    {
      id: 'collaborators',
      title: 'Real-time Collaboration',
      content:
        "See what others are doing in real-time! Their cursors show exactly what they're working on.",
      selector: '.collaborator-cursor',
      placement: 'left',
      icon: null,
    },
    {
      id: 'voting-button',
      title: 'Ready to Vote?',
      content:
        "Once you've added enough ideas, click here to start the voting process and finalize your plans.",
      selector: '.voting-button',
      placement: 'bottom',
      icon: null,
    },
    {
      id: 'help-menu',
      title: 'Need Help?',
      content: 'Press "/" anytime to open the help menu with keyboard shortcuts and more tips.',
      selector: '.help-trigger',
      placement: 'bottom',
      icon: null,
    },
  ],
};
