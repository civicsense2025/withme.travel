import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardVariant,
} from './card';
import { Button } from './button';
import { Text } from './Text';
import { Heading } from './Heading';

const meta: Meta<typeof Card> = {
  title: 'Core UI/Layout/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Card component with various styles and layout options. Can be used with subcomponents for structured content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'frosted', 'bordered'],
      description: 'Card visual style variant',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    padding: {
      control: 'select',
      options: ['none', 'small', 'medium', 'large'],
      description: 'Amount of padding inside the card',
      table: {
        defaultValue: { summary: 'medium' },
      },
    },
    mode: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'Theme mode (overrides system theme)',
    },
    children: {
      control: false,
      description: 'Card content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: <Text>This is a default card with standard styling.</Text>,
  },
  parameters: {
    docs: {
      description: {
        story: 'The default card style with standard border and subtle shadow.',
      },
    },
  },
};

export const CardVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '500px' }}>
      <Card>
        <CardHeader>
          <CardTitle>Default Card</CardTitle>
          <CardDescription>Standard styling with subtle border</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>
            The default card style with a subtle border and minimal shadow. Good for most content
            areas and general purpose containers.
          </Text>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
          <CardDescription>With enhanced shadow effect</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>
            An elevated card with stronger shadow effect for more visual prominence. Use for
            important content or to create visual hierarchy.
          </Text>
        </CardContent>
        <CardFooter>
          <Button size="sm">Action</Button>
        </CardFooter>
      </Card>

      <Card variant="frosted">
        <CardHeader>
          <CardTitle>Frosted Card</CardTitle>
          <CardDescription>With backdrop filter effect</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>
            A card with a frosted glass effect using backdrop filter. Perfect for overlays or
            floating elements on image backgrounds.
          </Text>
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="outline">
            Cancel
          </Button>
          <Button size="sm">Continue</Button>
        </CardFooter>
      </Card>

      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Bordered Card</CardTitle>
          <CardDescription>With border but no shadow</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>
            A card with just a border and no shadow, creating a more subtle container. Good for
            sidebars or secondary content.
          </Text>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Cards come in four visual variants: default, elevated, frosted, and bordered.',
      },
    },
  },
};

export const PaddingOptions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '500px' }}>
      <Card padding="none">
        <img
          src="https://images.unsplash.com/photo-1500835556837-99ac94a94552"
          alt="Travel image"
          style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'inherit' }}
        />
        <div style={{ padding: '1.5rem' }}>
          <Heading level={3}>No Padding</Heading>
          <Text>
            Card with no padding allows content to extend to edges. Good for images and custom
            layouts.
          </Text>
        </div>
      </Card>

      <Card padding="small">
        <CardHeader>
          <CardTitle>Small Padding</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>Card with small padding (1.5rem) is good for compact layouts.</Text>
        </CardContent>
      </Card>

      <Card padding="medium">
        <CardHeader>
          <CardTitle>Medium Padding</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>Card with medium padding (2rem) - the default size.</Text>
        </CardContent>
      </Card>

      <Card padding="large">
        <CardHeader>
          <CardTitle>Large Padding</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>Card with large padding (3rem) for spacious layouts.</Text>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Cards support various padding options to control spacing: none, small, medium (default), and large.',
      },
    },
  },
};

export const WithSubComponents: Story = {
  render: () => (
    <Card style={{ width: '400px' }}>
      <CardHeader>
        <CardTitle>Complete Card</CardTitle>
        <CardDescription>This example uses all subcomponents</CardDescription>
      </CardHeader>
      <CardContent>
        <Text>Cards can be composed with various subcomponents for structured content:</Text>
        <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
          <li>CardHeader - Container for the card title and description</li>
          <li>CardTitle - The main heading of the card</li>
          <li>CardDescription - A short description or subtitle</li>
          <li>CardContent - The main content area</li>
          <li>CardFooter - Container for actions, usually buttons</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Submit</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Cards can be built using convenient subcomponents for consistent structure and styling.',
      },
    },
  },
};

export const ThemeVariants: Story = {
  render: () => (
    <div
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '800px' }}
    >
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Light Mode</h3>
        <Card>
          <CardHeader>
            <CardTitle>Light Mode Card</CardTitle>
            <CardDescription>Default light theme</CardDescription>
          </CardHeader>
          <CardContent>
            <Text>Standard card with light mode styling.</Text>
          </CardContent>
          <CardFooter>
            <Button size="sm">Action</Button>
          </CardFooter>
        </Card>
      </div>

      <div
        style={{
          background: '#1a1a1a',
          padding: '2rem',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '1rem', color: 'white' }}>Dark Mode</h3>
        <Card>
          <CardHeader>
            <CardTitle>Dark Mode Card</CardTitle>
            <CardDescription>Using dark theme</CardDescription>
          </CardHeader>
          <CardContent>
            <Text>Card with dark mode styling for nighttime use.</Text>
          </CardContent>
          <CardFooter>
            <Button size="sm">Action</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Cards support both light and dark mode to match your application theme.',
      },
    },
  },
};

export const ResponsiveCard: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: '800px' }}>
      <Card>
        <CardHeader>
          <CardTitle>Responsive Card Example</CardTitle>
          <CardDescription>This card will adapt to the container width</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>
            This card is designed to adapt to different screen sizes and container widths. It
            maintains appropriate spacing and typography regardless of viewport. Try resizing your
            browser window to see how it responds.
          </Text>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '1.5rem',
            }}
          >
            <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <Text>Responsive grid item 1</Text>
            </div>
            <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <Text>Responsive grid item 2</Text>
            </div>
            <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <Text>Responsive grid item 3</Text>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="sm">Learn More</Button>
        </CardFooter>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Cards can adapt to different screen sizes and container widths to ensure proper display on all devices.',
      },
    },
  },
};

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
