import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { DestinationFeatureSection } from './destination-feature-section';

const meta: Meta<typeof DestinationFeatureSection> = {
  title: 'Destinations/DestinationFeatureSection',
  component: DestinationFeatureSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'cards', 'alternating', 'compact', 'grid'],
    },
    background: {
      control: 'select',
      options: ['none', 'light', 'dark', 'gradient', 'image'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DestinationFeatureSection>;

// Sample feature data for stories
const sampleFeatures = [
  {
    title: 'Historic Architecture',
    description:
      "Explore stunning historical buildings, monuments, and architectural wonders that showcase the city's rich cultural heritage and artistic legacy.",
    image:
      'https://images.unsplash.com/photo-1558102400-72da9fae7d2b?q=80&w=2070&auto=format&fit=crop',
    link: {
      text: 'See architecture tours',
      href: '#architecture',
    },
  },
  {
    title: 'Culinary Experiences',
    description:
      'Indulge in world-class cuisine, from local delicacies to innovative fine dining. Explore food markets, cooking classes, and restaurant districts.',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
    link: {
      text: 'Explore food tours',
      href: '#food',
    },
  },
  {
    title: 'Vibrant Nightlife',
    description:
      'Experience the city after dark with trendy bars, live music venues, and cultural performances that showcase the local entertainment scene.',
    image:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop',
    link: {
      text: 'View nightlife options',
      href: '#nightlife',
    },
  },
  {
    title: 'Outdoor Adventures',
    description:
      'Discover beautiful parks, hiking trails, and outdoor activities that let you experience the natural beauty surrounding the urban landscape.',
    image:
      'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop',
    link: {
      text: 'Find outdoor activities',
      href: '#outdoors',
    },
  },
];

// Example icon for stories
const ExampleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

// Add icons to the first two features
const featuresWithIcons = sampleFeatures.map((feature, index) =>
  index < 2 ? { ...feature, icon: <ExampleIcon /> } : feature
);

// Default layout
export const Default: Story = {
  args: {
    title: 'What to Do in Paris',
    description: 'Discover the best attractions and experiences the City of Light has to offer.',
    features: sampleFeatures,
    variant: 'default',
    background: 'none',
    cta: {
      text: 'View All Activities',
      href: '#all-activities',
    },
  },
};

// Grid layout
export const GridLayout: Story = {
  args: {
    title: 'Popular Activities',
    description: 'Explore top-rated things to do during your stay.',
    features: sampleFeatures,
    variant: 'grid',
    background: 'light',
  },
};

// Cards layout
export const CardsLayout: Story = {
  args: {
    title: "Experiences You'll Love",
    description: 'Handpicked activities for an unforgettable trip.',
    features: sampleFeatures,
    variant: 'cards',
    background: 'none',
  },
};

// Alternating layout
export const AlternatingLayout: Story = {
  args: {
    title: 'Highlights of Barcelona',
    description: "Don't miss these essential experiences during your visit.",
    features: sampleFeatures.slice(0, 3), // Just use three for alternating layout
    variant: 'alternating',
    background: 'gradient',
    glass: true,
  },
};

// Compact layout
export const CompactLayout: Story = {
  args: {
    title: 'Quick Travel Tips',
    description: 'Essential information for a smooth journey.',
    features: featuresWithIcons, // Use the features with icons
    variant: 'compact',
    background: 'light',
  },
};

// With background image
export const WithBackgroundImage: Story = {
  args: {
    title: 'Discover Tokyo',
    description: 'Explore the vibrant metropolis where tradition meets future.',
    features: sampleFeatures.slice(0, 3), // Just use three features
    variant: 'alternating',
    background: 'image',
    backgroundImage:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2071&auto=format&fit=crop',
    glass: true,
  },
};

// Features with icons only
export const IconFeatures: Story = {
  args: {
    title: 'Why Visit Prague',
    description: 'Reasons to add this beautiful city to your travel bucket list.',
    features: [
      {
        title: 'Rich History',
        description:
          'Explore over a thousand years of history through preserved architecture and cultural landmarks.',
        icon: <ExampleIcon />,
        link: {
          text: 'Historical sites',
          href: '#history',
        },
      },
      {
        title: 'Stunning Architecture',
        description:
          'From Gothic to Baroque to Art Nouveau, Prague is a living museum of architectural styles.',
        icon: <ExampleIcon />,
        link: {
          text: 'Architecture tours',
          href: '#architecture',
        },
      },
      {
        title: 'Vibrant Culture',
        description:
          "Experience world-class music, art, and theater in one of Europe's cultural capitals.",
        icon: <ExampleIcon />,
        link: {
          text: 'Cultural events',
          href: '#culture',
        },
      },
      {
        title: 'Excellent Cuisine',
        description:
          'Enjoy traditional Czech dishes alongside international cuisine and craft beer.',
        icon: <ExampleIcon />,
        link: {
          text: 'Food guides',
          href: '#cuisine',
        },
      },
    ],
    variant: 'cards',
    background: 'gradient',
    glass: true,
  },
};
