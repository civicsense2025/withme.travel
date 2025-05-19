// ============================================================================
// STORYBOOK GLOBAL PREVIEW CONFIGURATION
// ============================================================================

/**
 * Storybook global preview configuration for withme.travel
 *
 * - Sets up global styles and theming for Storybook stories.
 * - Ensures correct theme provider and CSS order for consistent appearance.
 * - Imports all required Storybook and project dependencies.
 *
 * @file This file configures Storybook's preview environment, including
 *       theme support, global decorators, and CSS imports.
 */

// -----------------------------------------------------------------------------
// External Dependencies
// -----------------------------------------------------------------------------

import * as React from 'react';
import type { Preview } from '@storybook/react';
import { themes } from '@storybook/theming';

// Storybook Addons
import { withThemeByDataAttribute, withThemeByClassName } from '@storybook/addon-themes';
import { fn } from '@storybook/test';

// -----------------------------------------------------------------------------
// Global Styles
// -----------------------------------------------------------------------------

import '../app/globals.css';      // Project global styles
import './storybook.css';         // Storybook-specific styles (should be last)

// -----------------------------------------------------------------------------
// Internal Modules
// -----------------------------------------------------------------------------

import { ThemeProvider } from '@/components/ui/theme-provider';

// Create the wrapper with storybook-specific class
const StorybookWrapper = ({
  theme,
  children,
}: {
  theme: 'light' | 'dark';
  children: React.ReactNode;
}) => <div className={`withme-storybook-wrapper storybook-container ${theme}`}>{children}</div>;

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: 'var(--background)' },
        { name: 'dark', value: 'var(--background-dark)' },
      ],
    },
    darkMode: {
      current: 'light',
      dark: { ...themes.dark },
      light: { ...themes.light },
    },
    // Ensure docs are properly rendered
    docs: {
      story: {
        inline: true,
      },
    },
    // Prevent infinite loading with proper rendering
    renderer: {
      strict: true,
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <div className="p-4 flex justify-center items-center min-h-[100px]">
          <Story />
        </div>
      </ThemeProvider>
    ),
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
  // Use explicit args mocking for actions
  argTypes: {
    onClick: { action: 'clicked' },
    onSubmit: { action: 'submitted' },
    onSelect: { action: 'selected' },
    onToggle: { action: 'toggled' },
  },
  // Set up default args for all stories to use the stable fn function
  args: {
    onClick: fn(),
    onSubmit: fn(),
    onSelect: fn(),
    onToggle: fn(),
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        showName: true,
      },
    },
  },
};

export default preview;
