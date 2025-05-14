import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { ContentBlock } from './content-block';
import { Button } from './button';
import { Section } from './section';

const meta: Meta<typeof ContentBlock> = {
  title: 'Features/Content/ContentBlock',
  component: ContentBlock,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'card', 'bordered', 'highlight', 'glass'],
    },
    align: {
      control: 'radio',
      options: ['left', 'center', 'right'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'auto'],
    },
    imagePlacement: {
      control: 'radio',
      options: ['top', 'side', 'background'],
    },
    aspectRatio: {
      control: 'select',
      options: ['1:1', '16:9', '4:3', '3:2', 'auto'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContentBlock>;

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

// Basic example
export const Default: Story = {
  args: {
    heading: 'Content Block Heading',
    children: (
      <p>
        This is a simple content block with text content. Use this component to create consistent
        content blocks throughout your application.
      </p>
    ),
  },
};

// With icon and actions
export const WithIconAndActions: Story = {
  args: {
    heading: 'Featured Content',
    icon: <ExampleIcon />,
    children: (
      <p>
        This content block includes an icon and action buttons to demonstrate how to create
        interactive content blocks.
      </p>
    ),
    actions: (
      <div className="flex space-x-2">
        <Button size="sm">Learn More</Button>
        <Button size="sm" variant="outline">
          Dismiss
        </Button>
      </div>
    ),
  },
};

// Card variant
export const Card: Story = {
  args: {
    variant: 'card',
    heading: 'Card Layout',
    subheading: 'Premium Feature',
    children: (
      <p>
        This content block uses the card variant to create a distinct card-like appearance with
        shadow and rounded corners.
      </p>
    ),
    actions: <Button>View Details</Button>,
  },
};

// With image
export const WithImage: Story = {
  args: {
    variant: 'bordered',
    heading: 'Paris, France',
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop',
    imageAlt: 'Eiffel Tower in Paris',
    aspectRatio: '16:9',
    children: (
      <p>
        Explore the City of Light with its world-class cuisine, stunning architecture, and romantic
        atmosphere.
      </p>
    ),
    actions: <Button>View Destination</Button>,
  },
};

// Side image
export const SideImage: Story = {
  args: {
    variant: 'card',
    heading: 'Tokyo, Japan',
    image:
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1974&auto=format&fit=crop',
    imageAlt: 'Tokyo skyline',
    imagePlacement: 'side',
    children: (
      <p>
        Experience the unique blend of ultramodern and traditional in Japan's capital, with amazing
        food and vibrant culture.
      </p>
    ),
    actions: <Button>Explore Tokyo</Button>,
  },
};

// Background image
export const BackgroundImage: Story = {
  args: {
    variant: 'glass',
    align: 'center',
    heading: 'New York City',
    image:
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070&auto=format&fit=crop',
    imageAlt: 'New York City skyline',
    imagePlacement: 'background',
    size: 'lg',
    children: (
      <p className="text-white font-medium">
        The city that never sleeps, with iconic landmarks and diverse neighborhoods waiting to be
        explored.
      </p>
    ),
    actions: (
      <Button variant="outline" className="border-white text-white hover:text-white">
        See Adventures
      </Button>
    ),
  },
};

// As a link
export const ClickableBlock: Story = {
  args: {
    variant: 'card',
    heading: 'Barcelona, Spain',
    image:
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=2070&auto=format&fit=crop',
    imageAlt: 'Barcelona architecture',
    aspectRatio: '3:2',
    href: '#',
    hover: true,
    children: (
      <p>
        Beautiful beaches, stunning architecture, and a vibrant atmosphere make Barcelona a
        must-visit destination.
      </p>
    ),
  },
};

// Highlighted style
export const Highlight: Story = {
  args: {
    variant: 'highlight',
    heading: 'Special Offer',
    subheading: 'Limited Time',
    icon: <ExampleIcon />,
    children: (
      <p>
        Book your trip before the end of the month and receive a 20% discount on all accommodations.
      </p>
    ),
    actions: <Button>Book Now</Button>,
  },
};

// Different alignments
export const Alignments: Story = {
  render: () => (
    <div className="space-y-6">
      <ContentBlock
        variant="bordered"
        align="left"
        heading="Left Aligned"
      >
        <p>This content block is aligned to the left, which is the default alignment.</p>
      </ContentBlock>

      <ContentBlock
        variant="bordered"
        align="center"
        heading="Center Aligned"
      >
        <p>This content block is center-aligned, ideal for featured content or callouts.</p>
      </ContentBlock>

      <ContentBlock
        variant="bordered"
        align="right"
        heading="Right Aligned"
      >
        <p>This content block is right-aligned, which can be useful for specific layout needs.</p>
      </ContentBlock>
    </div>
  ),
};

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <ContentBlock
        variant="card"
        size="sm"
        heading="Small Size"
      >
        <p>A compact content block with less padding, suitable for dense UIs.</p>
      </ContentBlock>

      <ContentBlock
        variant="card"
        size="md"
        heading="Medium Size"
      >
        <p>The standard size for content blocks with comfortable padding.</p>
      </ContentBlock>

      <ContentBlock
        variant="card"
        size="lg"
        heading="Large Size"
      >
        <p>A more spacious content block with generous padding for important content.</p>
      </ContentBlock>
    </div>
  ),
};

// Inside a grid section
export const GridOfBlocks: Story = {
  render: () => (
    <Section
      variant="default"
      layout="grid"
      background="light"
      heading="Popular Destinations"
      description="Explore our most popular travel destinations from around the world."
      columns={3}
    >
      {[
        {
          image:
            'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop',
          heading: 'Paris, France',
          text: 'The City of Light offers world-class cuisine, stunning architecture, and romantic vibes.',
        },
        {
          image:
            'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1974&auto=format&fit=crop',
          heading: 'Tokyo, Japan',
          text: 'A city where ultramodern meets traditional, with amazing food and vibrant culture.',
        },
        {
          image:
            'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070&auto=format&fit=crop',
          heading: 'New York City, USA',
          text: 'The Big Apple never sleeps, with iconic landmarks and diverse neighborhoods.',
        },
        {
          image:
            'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=2070&auto=format&fit=crop',
          heading: 'Barcelona, Spain',
          text: 'Beautiful beaches, stunning architecture, and a vibrant atmosphere.',
        },
        {
          image:
            'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070&auto=format&fit=crop',
          heading: 'Sydney, Australia',
          text: 'Beautiful harbors, beaches, and a relaxed outdoor lifestyle.',
        },
        {
          image:
            'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?q=80&w=2070&auto=format&fit=crop',
          heading: 'Marrakech, Morocco',
          text: 'Ancient medinas, colorful markets, and rich cultural heritage.',
        },
      ].map((item, index) => (
        <ContentBlock
          key={index}
          variant="card"
          hover={true}
          heading={item.heading}
          image={item.image}
          imageAlt={`${item.heading} cityscape`}
          aspectRatio="3:2"
          actions={<Button size="sm">Explore</Button>}
        >
          <p>{item.text}</p>
        </ContentBlock>
      ))}
    </Section>
  ),
};

// Feature blocks in a split section
export const FeatureBlocks: Story = {
  render: () => (
    <Section
      variant="featurette"
      background="gradient"
      glass={true}
      heading="Why Travel With Us"
      description="Our platform offers everything you need for the perfect travel experience."
      size="lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <ContentBlock
          variant="glass"
          icon={<ExampleIcon />}
          heading="Collaborative Planning"
        >
          <p>
            Plan your trips together with friends and family in real-time, with everyone
            contributing ideas.
          </p>
        </ContentBlock>

        <ContentBlock
          variant="glass"
          icon={<ExampleIcon />}
          heading="Destination Guides"
        >
          <p>
            Access detailed guides for hundreds of destinations worldwide, with local insights and
            tips.
          </p>
        </ContentBlock>

        <ContentBlock
          variant="glass"
          icon={<ExampleIcon />}
          heading="Budget Tracking"
        >
          <p>
            Keep track of your travel expenses and split costs easily among travel companions.
          </p>
        </ContentBlock>

        <ContentBlock
          variant="glass"
          icon={<ExampleIcon />}
          heading="Custom Itineraries"
        >
          <p>
            Build flexible itineraries tailored to your interests, with smart recommendations.
          </p>
        </ContentBlock>
      </div>
    </Section>
  ),
};

// Testimonial blocks
export const TestimonialBlocks: Story = {
  render: () => (
    <Section variant="accent" heading="What Our Travelers Say" layout="grid" columns={3}>
      {[
        {
          name: 'Sarah Johnson',
          location: 'New York, USA',
          text: 'Planning our family reunion trip was so easy with this platform. Everyone could contribute ideas and we all stayed on the same page.',
        },
        {
          name: 'Michael Torres',
          location: 'London, UK',
          text: 'The collaborative features made planning our backpacking adventure seamless. Highly recommend for group travel!',
        },
        {
          name: 'Lisa Rodriguez',
          location: 'Sydney, Australia',
          text: 'I love how easy it is to share expenses and keep track of our budget during our girls trip. No more awkward money conversations!',
        },
      ].map((testimonial, index) => (
        <ContentBlock
          key={index}
          variant="bordered"
          align="center"
          heading={testimonial.name}
          subheading={testimonial.location}
        >
          <p className="italic">"{testimonial.text}"</p>
        </ContentBlock>
      ))}
    </Section>
  ),
};

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
