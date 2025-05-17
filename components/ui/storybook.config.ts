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

/**
 * Component categories for documentation and organization
 * 
 * Note: When setting story titles, always use string literals instead of
 * concatenating strings or using variables. This is required by Storybook 7+.
 * 
 * Example:
 * ```
 * // ✅ Correct
 * title: 'Atoms/Button'
 * 
 * // ❌ Incorrect
 * title: CATEGORIES.ATOMS + '/Button'
 * ```
 */
export const CATEGORIES = {
  // Core UI components (not feature-specific)
  CORE: {
    ATOMS: 'Core UI/Atoms',
    MOLECULES: 'Core UI/Molecules', 
    ORGANISMS: 'Core UI/Organisms',
    TEMPLATES: 'Core UI/Templates',
    PAGES: 'Core UI/Pages',
  },
  
  // Feature domains
  FEATURES: {
    // Trips feature
    TRIPS: {
      ATOMS: 'Features/Trips/Atoms',
      MOLECULES: 'Features/Trips/Molecules',
      ORGANISMS: 'Features/Trips/Organisms',
      TEMPLATES: 'Features/Trips/Templates',
      PAGES: 'Features/Trips/Pages',
    },
    // Groups feature
    GROUPS: {
      ATOMS: 'Features/Groups/Atoms',
      MOLECULES: 'Features/Groups/Molecules',
      ORGANISMS: 'Features/Groups/Organisms',
      TEMPLATES: 'Features/Groups/Templates',
      PAGES: 'Features/Groups/Pages',
    },
    // Destinations feature
    DESTINATIONS: {
      ATOMS: 'Features/Destinations/Atoms',
      MOLECULES: 'Features/Destinations/Molecules',
      ORGANISMS: 'Features/Destinations/Organisms',
      TEMPLATES: 'Features/Destinations/Templates',
      PAGES: 'Features/Destinations/Pages',
    },
    // Itinerary feature
    ITINERARY: {
      ATOMS: 'Features/Itinerary/Atoms',
      MOLECULES: 'Features/Itinerary/Molecules',
      ORGANISMS: 'Features/Itinerary/Organisms',
      TEMPLATES: 'Features/Itinerary/Templates',
      PAGES: 'Features/Itinerary/Pages',
    },
    // Places feature
    PLACES: {
      ATOMS: 'Features/Places/Atoms',
      MOLECULES: 'Features/Places/Molecules',
      ORGANISMS: 'Features/Places/Organisms',
      TEMPLATES: 'Features/Places/Templates',
      PAGES: 'Features/Places/Pages',
    },
    // User feature
    USER: {
      ATOMS: 'Features/User/Atoms',
      MOLECULES: 'Features/User/Molecules',
      ORGANISMS: 'Features/User/Organisms',
      TEMPLATES: 'Features/User/Templates',
      PAGES: 'Features/User/Pages',
    },
    // Auth feature
    AUTH: {
      ATOMS: 'Features/Auth/Atoms',
      MOLECULES: 'Features/Auth/Molecules',
      ORGANISMS: 'Features/Auth/Organisms',
      TEMPLATES: 'Features/Auth/Templates',
      PAGES: 'Features/Auth/Pages',
    },
    // Collaboration feature
    COLLABORATION: {
      ATOMS: 'Features/Collaboration/Atoms',
      MOLECULES: 'Features/Collaboration/Molecules',
      ORGANISMS: 'Features/Collaboration/Organisms',
      TEMPLATES: 'Features/Collaboration/Templates',
      PAGES: 'Features/Collaboration/Pages',
    },
    // Debug feature
    DEBUG: {
      ATOMS: 'Features/Debug/Atoms',
      MOLECULES: 'Features/Debug/Molecules',
      ORGANISMS: 'Features/Debug/Organisms',
      TEMPLATES: 'Features/Debug/Templates',
      PAGES: 'Features/Debug/Pages',
    },
    // Analytics feature
    ANALYTICS: {
      ATOMS: 'Features/Analytics/Atoms',
      MOLECULES: 'Features/Analytics/Molecules',
      ORGANISMS: 'Features/Analytics/Organisms',
      TEMPLATES: 'Features/Analytics/Templates',
      PAGES: 'Features/Analytics/Pages',
    },
    // Admin feature
    ADMIN: {
      ATOMS: 'Features/Admin/Atoms',
      MOLECULES: 'Features/Admin/Molecules',
      ORGANISMS: 'Features/Admin/Organisms',
      TEMPLATES: 'Features/Admin/Templates',
      PAGES: 'Features/Admin/Pages',
    },
  },
  
  // Legacy categories for backward compatibility
  // These should be gradually replaced with the feature-based structure
  ATOMS: 'Atoms',
  MOLECULES: 'Molecules', 
  ORGANISMS: 'Organisms',
  TEMPLATES: 'Templates',
  PAGES: 'Pages',
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

/**
 * Creates a feature-based Storybook title 
 */
export function createFeatureStoryTitle(
  feature: keyof typeof CATEGORIES.FEATURES, 
  atomicLevel: 'ATOMS' | 'MOLECULES' | 'ORGANISMS' | 'TEMPLATES' | 'PAGES',
  componentName: string
): string {
  return `${CATEGORIES.FEATURES[feature][atomicLevel]}/${componentName}`;
} 