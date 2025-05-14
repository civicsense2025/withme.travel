import type { Meta, StoryObj } from '@storybook/react';
import TripsLandingPage from './landing-page';

const meta: Meta<typeof TripsLandingPage> = {
  title: 'Trip Features/TripsLandingPage',
  component: TripsLandingPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TripsLandingPage>;

export const Default: Story = {};
