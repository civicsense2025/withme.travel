import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Section } from './section';
import { Button } from './button';

const meta: Meta<typeof Section> = {
  title: 'Features/Layout/Section',
  component: Section,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'hero', 'compact', 'featurette', 'accent', 'divider'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'wide', 'full'],
    },
    layout: {
      control: 'select',
      options: ['standard', 'split', 'grid', 'overlap', 'centered'],
    },
    background: {
      control: 'select',
      options: ['none', 'light', 'dark', 'primary', 'secondary', 'accent', 'gradient', 'image'],
    },
    columns: {
      control: 'select',
      options: [1, 2, 3, 4],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Section>;

// Mock content components for examples
const PlaceholderCard = ({
  title = 'Card Title',
  text = 'This is a placeholder card with some sample text to demonstrate the layout.',
}: {
  title?: string;
  text?: string;
}) => (
  <div className="bg-card rounded-lg p-6 shadow-sm">
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-muted-foreground">{text}</p>
  </div>
);

const FeatureItem = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">{icon}</div>
    <div>
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.
      </p>
    </div>
  </div>
);

const Icon = ({ name }: { name: string }) => (
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
    {name === 'map' ? (
      <>
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
        <line x1="8" y1="2" x2="8" y2="18"></line>
        <line x1="16" y1="6" x2="16" y2="22"></line>
      </>
    ) : name === 'compass' ? (
      <>
        <circle cx="12" cy="12" r="10"></circle>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
      </>
    ) : (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </>
    )}
  </svg>
);

// Basic example
export const Default: Story = {
  args: {
    heading: 'Section Heading',
    description:
      'This is a standard section with default styling. It has a heading and a description, followed by the content.',
    children: (
      <div className="prose">
        <p>
          This is a basic section with standard layout. Use this for most content sections on your
          pages. The default variant provides comfortable padding and a clean, minimal look.
        </p>
        <p>
          Sections can contain any type of content, from text and images to complex interactive
          components. They help organize your page and provide a consistent layout structure.
        </p>
      </div>
    ),
  },
};

// Hero section example
export const HeroSection: Story = {
  args: {
    variant: 'hero',
    layout: 'centered',
    background: 'gradient',
    heading: 'Plan Your Next Adventure',
    description:
      'Discover amazing destinations and create unforgettable travel experiences with friends and family.',
    actions: (
      <>
        <Button size="lg">Get Started</Button>
        <Button size="lg" variant="outline">
          Learn More
        </Button>
      </>
    ),
    children: (
      <div className="mt-8 bg-background/80 backdrop-blur-sm rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
        <img
          src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
          alt="Travel destinations"
          className="w-full h-auto rounded-lg"
        />
      </div>
    ),
  },
};

// Feature grid example
export const FeatureGrid: Story = {
  args: {
    variant: 'featurette',
    layout: 'grid',
    background: 'light',
    heading: 'Why Travel With Us',
    description: 'Our platform offers everything you need to plan the perfect trip with friends.',
    columns: 3,
    size: 'lg',
    children: (
      <>
        {[
          { title: 'Collaborative Planning', icon: <Icon name="map" /> },
          { title: 'Real-time Updates', icon: <Icon name="compass" /> },
          { title: 'Destination Guides', icon: <Icon name="home" /> },
          { title: 'Budget Tracking', icon: <Icon name="map" /> },
          { title: 'Itinerary Builder', icon: <Icon name="compass" /> },
          { title: 'Trip Sharing', icon: <Icon name="home" /> },
        ].map((feature, index) => (
          <FeatureItem key={index} title={feature.title} icon={feature.icon} />
        ))}
      </>
    ),
  },
};

// Split content example
export const SplitContent: Story = {
  args: {
    variant: 'default',
    layout: 'split',
    background: 'primary',
    glass: true,
    heading: 'Seamless Group Travel',
    description:
      'Coordinate trips with friends and family without the hassle. Our platform makes it easy to plan together.',
    actions: <Button>Learn More</Button>,
    children: (
      <div className="relative rounded-lg overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522199873717-bc67b1a5e32b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGdyb3VwJTIwdHJhdmVsfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60"
          alt="Group Travel"
          className="w-full h-auto rounded-lg shadow-lg"
        />
      </div>
    ),
  },
};

// Card grid example
export const CardGrid: Story = {
  args: {
    variant: 'default',
    layout: 'grid',
    size: 'lg',
    heading: 'Popular Destinations',
    description: 'Explore our most popular travel destinations from around the world.',
    columns: 3,
    children: (
      <>
        {[
          {
            title: 'Paris, France',
            text: 'The City of Light offers world-class cuisine, stunning architecture, and romantic vibes.',
          },
          {
            title: 'Tokyo, Japan',
            text: 'A city where ultramodern meets traditional, with amazing food and vibrant culture.',
          },
          {
            title: 'New York City, USA',
            text: 'The Big Apple never sleeps, with iconic landmarks and diverse neighborhoods.',
          },
          {
            title: 'Barcelona, Spain',
            text: 'Beautiful beaches, stunning architecture, and a vibrant atmosphere.',
          },
          {
            title: 'Sydney, Australia',
            text: 'Beautiful harbors, beaches, and a relaxed outdoor lifestyle.',
          },
          {
            title: 'Marrakech, Morocco',
            text: 'Ancient medinas, colorful markets, and rich cultural heritage.',
          },
        ].map((card, index) => (
          <PlaceholderCard key={index} title={card.title} text={card.text} />
        ))}
      </>
    ),
  },
};

// Image background example
export const WithBackgroundImage: Story = {
  args: {
    variant: 'hero',
    layout: 'centered',
    background: 'image',
    backgroundImage:
      'https://images.unsplash.com/photo-1682686580391-615b1f28e5ee?q=80&w=2070&auto=format&fit=crop',
    heading: 'Discover The World',
    description: 'Embark on unforgettable journeys and create memories that last a lifetime.',
    actions: (
      <>
        <Button>Start Planning</Button>
        <Button variant="outline" className="text-white border-white hover:text-white">
          View Destinations
        </Button>
      </>
    ),
    children: (
      <div className="mt-8">
        <p className="text-white/80 max-w-lg mx-auto">
          From breathtaking mountains to pristine beaches, our curated selection of destinations
          offers something for every type of traveler.
        </p>
      </div>
    ),
  },
};

// Compact feature list example
export const CompactFeatureList: Story = {
  args: {
    variant: 'compact',
    background: 'light',
    heading: 'Travel Smart',
    size: 'md',
    children: (
      <div className="space-y-4">
        {[
          'Collaborative trip planning with friends',
          'Real-time updates and notifications',
          'Comprehensive destination guides',
          'Budget tracking and expense sharing',
          'Customizable itineraries',
        ].map((feature, index) => (
          <div key={index} className="flex items-center">
            <div className="mr-2 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <p>{feature}</p>
          </div>
        ))}
      </div>
    ),
  },
};

// Testimonials section example
export const TestimonialsSection: Story = {
  args: {
    variant: 'accent',
    layout: 'grid',
    background: 'gradient',
    glass: true,
    columns: 3,
    heading: 'What Our Users Say',
    description: 'Thousands of travelers have used our platform to create unforgettable journeys.',
    children: (
      <>
        {[
          {
            name: 'Sarah J.',
            text: 'Planning our family reunion trip was so easy with this platform. Everyone could contribute ideas and we all stayed on the same page.',
          },
          {
            name: 'Michael T.',
            text: 'The collaborative features made planning our backpacking adventure seamless. Highly recommend for group travel!',
          },
          {
            name: 'Lisa R.',
            text: 'I love how easy it is to share expenses and keep track of our budget during our girls trip. No more awkward money conversations!',
          },
        ].map((testimonial, index) => (
          <div key={index} className="bg-background/90 backdrop-blur-sm p-6 rounded-lg shadow-sm">
            <p className="italic mb-4">"{testimonial.text}"</p>
            <p className="font-medium">— {testimonial.name}</p>
          </div>
        ))}
      </>
    ),
  },
};

// CTA section example
export const CallToAction: Story = {
  args: {
    variant: 'default',
    layout: 'centered',
    background: 'accent',
    size: 'md',
    heading: 'Ready to Start Your Journey?',
    description: 'Join thousands of travelers creating amazing experiences together.',
    actions: <Button size="lg">Sign Up Now</Button>,
    children: (
      <p className="mt-4 text-sm opacity-75">No credit card required. Start planning for free.</p>
    ),
  },
};

// Full page example with multiple sections
export const PageExample: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Section
        variant="hero"
        layout="centered"
        background="gradient"
        size="full"
        heading="Travel Together"
        description="Plan, organize, and enjoy group travel experiences without the hassle."
        actions={
          <>
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </>
        }
      >
        <div className="mt-8 max-w-4xl mx-auto">
          <img
            src="https://images.unsplash.com/photo-1522199873717-bc67b1a5e32b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGdyb3VwJTIwdHJhdmVsfGVufDB8fDB8fHww&auto=format&fit=crop&w=1000&q=60"
            alt="Group Travel"
            className="w-full h-auto rounded-lg shadow-xl"
          />
        </div>
      </Section>

      {/* Features Section */}
      <Section
        variant="featurette"
        layout="grid"
        background="light"
        size="lg"
        heading="Why Choose Us"
        description="Our platform offers everything you need for seamless group travel planning."
        columns={3}
      >
        <>
          {[
            { title: 'Collaborative Planning', icon: <Icon name="map" /> },
            { title: 'Real-time Updates', icon: <Icon name="compass" /> },
            { title: 'Destination Guides', icon: <Icon name="home" /> },
            { title: 'Budget Tracking', icon: <Icon name="map" /> },
            { title: 'Itinerary Builder', icon: <Icon name="compass" /> },
            { title: 'Trip Sharing', icon: <Icon name="home" /> },
          ].map((feature, index) => (
            <FeatureItem key={index} title={feature.title} icon={feature.icon} />
          ))}
        </>
      </Section>

      {/* Split Content Section */}
      <Section variant="default" layout="split" background="none" size="lg">
        <div className="relative rounded-lg overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1522199873717-bc67b1a5e32b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGdyb3VwJTIwdHJhdmVsfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60"
            alt="Group Travel"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
        <div>
          <h2 className="text-3xl font-medium mb-4">Seamless Group Coordination</h2>
          <p className="text-muted-foreground mb-4">
            Our platform makes it easy to coordinate with friends and family, ensuring everyone is
            on the same page.
          </p>
          <ul className="space-y-2">
            {[
              'Invite friends with a simple link',
              'Vote on destinations and activities',
              'Share expenses and split costs',
              'Collaborate on itineraries in real-time',
            ].map((item, i) => (
              <li key={i} className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <Button className="mt-6">Learn More</Button>
        </div>
      </Section>

      {/* CTA Section */}
      <Section
        variant="default"
        layout="centered"
        background="primary"
        size="md"
        glass={true}
        heading="Ready to Start Your Journey?"
        description="Join thousands of travelers creating amazing experiences together."
        actions={<Button size="lg">Sign Up Now</Button>}
      >
        <p className="mt-4 text-sm opacity-75">No credit card required. Start planning for free.</p>
      </Section>
    </div>
  ),
};

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
