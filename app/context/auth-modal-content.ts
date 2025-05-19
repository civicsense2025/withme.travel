import { AuthModalContext, ABTestVariant } from './auth-modal-context';

export interface AuthModalContent {
  title: string;
  description: string;
  primaryButtonText: string;
  illustration?: string;
  features?: {
    icon: string;
    title: string;
    description: string;
  }[];
}

// Default content for the auth modal
const defaultContent: AuthModalContent = {
  title: 'sign in to withme.travel',
  description: 'unlock all features and continue your journey',
  primaryButtonText: 'sign in',
  features: [
    {
      icon: 'clipboard',
      title: 'no more spreadsheet chaos',
      description:
        'finally, a place to organize everything without endless excel tabs and google docs',
    },
    {
      icon: 'users',
      title: "everyone's actually involved",
      description: 'share ideas, vote on plans, and keep the whole crew in sync',
    },
  ],
};

// Context-specific content
const contextContent: Record<AuthModalContext, AuthModalContent> = {
  default: defaultContent,

  'join-group': {
    title: 'join this group',
    description: 'sign in to join the group and collaborate on trip plans',
    primaryButtonText: 'join group',
    features: [
      {
        icon: 'users',
        title: 'plan together',
        description: 'collaborate with friends in real-time on your upcoming adventure',
      },
      {
        icon: 'messageSquare',
        title: 'share your ideas',
        description: 'contribute suggestions and vote on group decisions',
      },
    ],
  },

  'create-group': {
    title: 'create your group',
    description: 'sign in to create a group and invite friends',
    primaryButtonText: 'create group',
    features: [
      {
        icon: 'userPlus',
        title: 'bring everyone together',
        description: 'invite friends and family to join your travel planning',
      },
      {
        icon: 'map',
        title: 'start mapping your adventure',
        description: 'begin plotting your journey with collaborative tools',
      },
    ],
  },

  'save-trip': {
    title: 'save this trip',
    description: 'sign in to save this trip to your collection',
    primaryButtonText: 'save trip',
    features: [
      {
        icon: 'bookmark',
        title: 'build your trip collection',
        description: 'save trips for inspiration and future planning',
      },
      {
        icon: 'edit',
        title: 'customize any time',
        description: 'edit and personalize saved trips to fit your style',
      },
    ],
  },

  'like-trip': {
    title: 'like this trip',
    description: 'sign in to like this trip and save it for later',
    primaryButtonText: 'like trip',
    features: [
      {
        icon: 'heart',
        title: 'show your appreciation',
        description: 'like trips that inspire you and support creators',
      },
      {
        icon: 'list',
        title: 'curate your favorites',
        description: 'build a collection of trips you love for future reference',
      },
    ],
  },

  comment: {
    title: 'join the conversation',
    description: 'sign in to leave a comment and collaborate',
    primaryButtonText: 'comment',
    features: [
      {
        icon: 'messageCircle',
        title: 'share your thoughts',
        description: 'add helpful insights and ask questions',
      },
      {
        icon: 'bell',
        title: 'stay in the loop',
        description: 'get notified when others respond to your comments',
      },
    ],
  },

  'edit-trip': {
    title: 'edit this trip',
    description: 'sign in to make changes to this trip',
    primaryButtonText: 'edit trip',
    features: [
      {
        icon: 'edit2',
        title: 'personalize your journey',
        description: 'customize itineraries to match your preferences',
      },
      {
        icon: 'share2',
        title: 'collaborate with others',
        description: 'invite friends to help fine-tune your plans',
      },
    ],
  },

  'invite-friends': {
    title: 'invite your friends',
    description: 'sign in to invite friends to join your trip',
    primaryButtonText: 'invite friends',
    features: [
      {
        icon: 'userPlus',
        title: 'bring the crew together',
        description: 'easily invite friends via email or sharing a link',
      },
      {
        icon: 'lock',
        title: 'control who has access',
        description: 'manage permissions for who can view or edit your trip',
      },
    ],
  },

  'premium-feature': {
    title: 'unlock premium features',
    description: 'sign in to access advanced planning tools',
    primaryButtonText: 'continue',
    features: [
      {
        icon: 'star',
        title: 'premium planning tools',
        description: 'access advanced features for better trip organization',
      },
      {
        icon: 'save',
        title: 'unlimited trip storage',
        description: 'save all your trip ideas without limitations',
      },
    ],
  },

  'vote-on-idea': {
    title: 'vote on this idea',
    description: 'sign in to cast your vote and help make decisions',
    primaryButtonText: 'vote now',
    features: [
      {
        icon: 'thumbs-p',
        title: 'have your say',
        description: 'influence group decisions with your vote',
      },
      {
        icon: 'pieChart',
        title: 'see what others think',
        description: 'view voting results and popular opinions',
      },
    ],
  },

  'create-itinerary': {
    title: 'create an itinerary',
    description: 'sign in to build a detailed travel plan',
    primaryButtonText: 'create itinerary',
    features: [
      {
        icon: 'calendar',
        title: 'organize your days',
        description: 'plan day-by-day activities for a seamless experience',
      },
      {
        icon: 'mapPin',
        title: 'map your destinations',
        description: 'visualize your route with interactive maps',
      },
    ],
  },

  'add-to-itinerary': {
    title: 'add to your itinerary',
    description: 'sign in to add this to your trip plan',
    primaryButtonText: 'add to plan',
    features: [
      {
        icon: 'plus',
        title: 'build your perfect day',
        description: 'add activities, restaurants, and attractions to your schedule',
      },
      {
        icon: 'clock',
        title: 'optimize your time',
        description: 'organize your days efficiently with drag-and-drop planning',
      },
    ],
  },
};

// A/B test variants
const abTestVariants: Record<
  ABTestVariant,
  Partial<Record<AuthModalContext, Partial<AuthModalContent>>>
> = {
  // Control variant uses the default content
  control: {},

  // Variant A: More informal, casual language
  'variant-a': {
    default: {
      title: 'hey there, traveler!',
      description: 'just a quick sign-in to keep your travel dreams alive',
      primaryButtonText: "let's go",
    },
    'join-group': {
      title: 'join the crew',
      description: 'sign in real quick to join this travel squad',
      primaryButtonText: 'count me in',
    },
    'save-trip': {
      title: 'keep this trip in your pocket',
      description: 'quick sign-in to bookmark this awesome itinerary',
      primaryButtonText: 'save it for later',
    },
  },

  // Variant B: More benefit-focused language
  'variant-b': {
    default: {
      title: 'unlock better travel planning',
      description: 'sign in to access tools that make group trips actually happen',
      primaryButtonText: 'start planning smarter',
    },
    'join-group': {
      title: 'collaborate on better trips',
      description: "sign in to join this group and influence where you'll go",
      primaryButtonText: 'join & contribute',
    },
    'save-trip': {
      title: 'never lose this inspiration',
      description: 'sign in to save and customize this trip for your future travels',
      primaryButtonText: 'save & customize',
    },
  },
};

/**
 * Get the appropriate content for an auth modal based on context and A/B test variant
 */
export function getAuthModalContent(
  context: AuthModalContext = 'default',
  abTestVariant: ABTestVariant = 'control'
): AuthModalContent {
  // Get the base content for this context
  const baseContent = contextContent[context] || defaultContent;

  // Apply A/B test variant overrides if they exist
  const variantOverrides = abTestVariants[abTestVariant]?.[context] || {};

  // Merge the base content with any variant overrides
  return {
    ...baseContent,
    ...variantOverrides,
  };
}
