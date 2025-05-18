import type { Meta, StoryObj } from '@storybook/react';
import { ContentTabsSection } from './content-tabs-section';

const meta: Meta<typeof ContentTabsSection> = {
  title: 'Dashboard/ContentTabsSection',
  component: ContentTabsSection,
  argTypes: {
    trips: { control: 'object' },
    activeTrips: { control: 'object' },
    savedContent: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof ContentTabsSection>;

export const Playground: Story = {
  args: {
    trips: [
      { id: '1', name: 'Paris Adventure', start_date: '2024-07-01', end_date: '2024-07-10' },
      { id: '2', name: 'Tokyo Spring', start_date: '2024-04-15', end_date: '2024-04-22' },
    ],
    activeTrips: [
      { id: '1', name: 'Paris Adventure', start_date: '2024-07-01', end_date: '2024-07-10' },
    ],
    savedContent: {
      destinations: [
        {
          id: 'd1',
          city: 'Rome',
          country: 'Italy',
          name: 'Rome',
          image_url: '',
          cuisine_rating: 4,
          nightlife_rating: 3,
          cultural_attractions: 5,
          outdoor_activities: 4,
          beach_quality: 2,
        },
      ],
      itineraries: [],
    },
  },
};
