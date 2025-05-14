import { Meta } from '@storybook/react';

const meta: Meta = {
  title: 'Core UI/Feedback/Skeleton',
  // ... existing code ...
};

export default meta;

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
