import React from 'react';
import type { Preview } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '../app/globals.css';
import { ThemeProvider } from '@components/ThemeProvider.tsx';
import { fn } from '@storybook/test';
import { withThemeByClassName } from '@storybook/addon-themes';
import { themes } from '@storybook/theming';

// Import CSS files in the correct order
import './storybook.css'; // Storybook-specific styles last

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
