import type { Meta } from '@storybook/react';

const meta: Meta = {
  title: 'UI/Autocomplete',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
