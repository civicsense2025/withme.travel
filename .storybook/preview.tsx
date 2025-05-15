import React from 'react';
import { ThemeProvider } from '../components/theme-provider';
import '../app/globals.css';
import { helveticaNeue } from '../app/fonts';
import type { Preview } from '@storybook/react';

// Viewport presets for responsive testing
const VIEWPORTS = {
  mobile: {
    name: 'Mobile',
    styles: {
      width: '375px',
      height: '667px',
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
      width: '1280px',
      height: '800px',
    },
  },
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    viewport: { viewports: VIEWPORTS },
    layout: 'padded',
    docs: {
      container: ({ children }) => (
        <div className="sb-unstyled">{children}</div>
      ),
    },
    nextjs: {
      appDirectory: true,
    },
    options: {
      storySort: {
        order: [
          'Design System',
          ['Overview', 'Core UI', 'Features', 'App Layout', 'Accessibility', 'Migration Guide'],
          'Components',
          'Features',
          '*',
        ],
      },
    },
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
  decorators: [
    (Story, context) => {
      const { theme } = context.globals;
      
      return (
        <ThemeProvider
          attribute="class"
          defaultTheme={theme}
          enableSystem
          disableTransitionOnChange
          storageKey="withme-theme"
        >
          <div className={`${helveticaNeue.variable} font-sans min-h-screen p-4`}>
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
