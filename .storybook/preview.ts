import type { Preview } from '@storybook/react';
import '../styles/globals.css';

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
      default: 'none',
      values: [
        {
          name: 'none',
          value: 'transparent',
        },
      ],
    },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
