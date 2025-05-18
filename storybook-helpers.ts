// Helpful utilities for creating Storybook stories

import type { Meta, StoryObj } from '@storybook/react';

// Since the module 'storybook-categories' cannot be found, we need to ensure it is correctly imported or defined.
// For now, let's assume it's a local module that should be imported correctly. If it doesn't exist, it should be created.
import { storybookCategories } from './storybook-categories';

/**
 * Helper function to create a story title with proper category structure
 *
 * @param category The main category
 * @param subCategory The sub-category
 * @param component The component name
 * @returns A properly formatted Storybook title
 */
export function createStoryTitle<
  C extends keyof typeof storybookCategories,
  S extends keyof (typeof storybookCategories)[C],
>(category: C, subCategory: S, component: string): string {
  return `${String(category)}/${String(subCategory)}/${component}`;
}

/**
 * Helper type for story creation with proper typing
 */
export type Story<T> = StoryObj<T>;

/**
 * Helper to create meta configuration for stories
 */
export function createMeta<T>(config: Meta<T>): Meta<T> {
  return {
    parameters: {
      layout: 'padded',
    },
    ...config,
  };
}
