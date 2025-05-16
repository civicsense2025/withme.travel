/**
 * Storybook Configuration
 * 
 * Shared configuration for component stories to ensure consistency
 */

// ============================================================================
// STORY DEFAULTS
// ============================================================================

export const storybookConfig = {
  title: 'withme.travel',
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: 'var(--background)' },
        { name: 'dark', value: 'var(--background-dark)' },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '812px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
    },
  },
};

// ============================================================================
// COMPONENT CATEGORIES
// ============================================================================

export const CATEGORIES = {
  ATOMS: 'Atoms',
  MOLECULES: 'Molecules', 
  ORGANISMS: 'Organisms',
  TEMPLATES: 'Templates',
  PAGES: 'Pages',
  FEATURES: {
    TRIPS: 'Features/Trips',
    GROUPS: 'Features/Groups',
    DESTINATIONS: 'Features/Destinations',
    ITINERARY: 'Features/Itinerary',
    ADMIN: 'Features/Admin',
    USER: 'Features/User',
  },
};

// ============================================================================
// STORY UTILITIES
// ============================================================================

/**
 * Creates a Storybook title with proper category prefix
 */
export function createStoryTitle(category: string, componentName: string): string {
  return `${category}/${componentName}`;
} 