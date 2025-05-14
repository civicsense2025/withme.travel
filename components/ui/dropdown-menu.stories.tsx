import type { Meta } from '@storybook/react';

const meta: Meta = {
  title: 'Core UI/Navigation/DropdownMenu',
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
