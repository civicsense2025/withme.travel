import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { COLORS, ThemeMode, getColorToken } from '@/utils/constants/design-system';

import { Button } from './button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
  CardVariant,
} from './card';
import { Text } from './Text';
import { Heading } from './Heading';
import { Input } from './input';
import { Label } from './label';
import { Checkbox } from './checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';
import { Badge } from './badge';

// Type-safe color keys
type ColorKey = Exclude<
  keyof typeof COLORS.light,
  'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO' | 'PENDING'
>;
type ColorValue = string;

// Define a simple wrapper component
const AppleDesignShowcase: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>('light');

  // Helper function to safely get color entries
  const getThemeColors = (): [ColorKey, ColorValue][] => {
    const colorObj = theme === 'light' ? COLORS.light : COLORS.dark;
    // Only include keys that are strings and not in the excluded list
    return (Object.keys(colorObj) as Array<keyof typeof colorObj>)
      .filter(
        (key): key is ColorKey =>
          !['SUCCESS', 'ERROR', 'WARNING', 'INFO', 'PENDING'].includes(key) &&
          typeof colorObj[key] === 'string'
      )
      .map((key) => [key, colorObj[key] as string]);
  };

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
        backgroundColor: getColorToken('BACKGROUND', theme),
        color: getColorToken('TEXT', theme),
        borderRadius: '1rem',
        transition: 'all 300ms ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <Heading level={1}>Apple-Inspired Design System</Heading>
        <Button variant="outline" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
        </Button>
      </div>

      {/* Colors */}
      <Heading level={2} style={{ marginBottom: '1rem', marginTop: '2rem' }}>
        Colors
      </Heading>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        {getThemeColors().map(([key, value]) => (
          <div
            key={key}
            style={{
              width: '100px',
              height: '100px',
              backgroundColor: value,
              borderRadius: '0.5rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '0.5rem',
              border: theme === 'dark' && key === 'BACKGROUND' ? '1px solid #333' : 'none',
            }}
          >
            <Text
              variant="caption"
              color={key === 'BACKGROUND' || key === 'SURFACE' ? 'TEXT' : 'BACKGROUND'}
              weight="medium"
              mode={theme}
            >
              {key}
            </Text>
          </div>
        ))}
      </div>

      {/* Typography */}
      <Heading level={2} style={{ marginBottom: '1rem', marginTop: '3rem' }}>
        Typography
      </Heading>
      <Card mode={theme} style={{ marginBottom: '2rem' }}>
        <CardContent>
          <Heading level={1} mode={theme}>
            Heading 1
          </Heading>
          <Text variant="caption" mode={theme} color="MUTED" style={{ marginBottom: '1.5rem' }}>
            SF Pro Display, 2.5-3rem, 700 weight
          </Text>

          <Heading level={2} mode={theme}>
            Heading 2
          </Heading>
          <Text variant="caption" mode={theme} color="MUTED" style={{ marginBottom: '1.5rem' }}>
            SF Pro Display, 1.75-2.25rem, 600 weight
          </Text>

          <Heading level={3} mode={theme}>
            Heading 3
          </Heading>
          <Text variant="caption" mode={theme} color="MUTED" style={{ marginBottom: '1.5rem' }}>
            SF Pro Display, 1.35-1.65rem, 600 weight
          </Text>

          <Heading level={4} mode={theme}>
            Heading 4
          </Heading>
          <Text variant="caption" mode={theme} color="MUTED" style={{ marginBottom: '1.5rem' }}>
            SF Pro Display, 1.2-1.4rem, 600 weight
          </Text>

          <Text variant="large" mode={theme} style={{ marginBottom: '0.5rem' }}>
            Large Text
          </Text>
          <Text variant="body" mode={theme} style={{ marginBottom: '0.5rem' }}>
            Body Text - The SF Pro family is the system font for iOS, macOS, and tvOS. This neutral,
            flexible, sans-serif typeface is the default for Apple platform UIs.
          </Text>
          <Text variant="small" mode={theme} style={{ marginBottom: '0.5rem' }}>
            Small Text - Optimized for legibility
          </Text>
          <Text variant="caption" mode={theme} style={{ marginBottom: '0.5rem' }}>
            Caption Text - Used for supplementary information
          </Text>
          <Text variant="label" mode={theme} style={{ marginBottom: '0.5rem' }}>
            Label text
          </Text>
        </CardContent>
      </Card>

      {/* Buttons */}
      <Heading level={2} style={{ marginBottom: '1rem', marginTop: '3rem' }}>
        Buttons
      </Heading>
      <Card mode={theme} style={{ marginBottom: '2rem' }}>
        <CardContent>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <Button variant="primary">{'Primary Button'}</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>

          <Heading level={3} mode={theme} style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            Button Sizes
          </Heading>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1rem',
              alignItems: 'center',
            }}
          >
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </div>

          <Heading level={3} mode={theme} style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            Full Width Buttons
          </Heading>
          <div style={{ marginBottom: '0.5rem' }}>
            <Button variant="primary" width="full">
              Full Width Button
            </Button>
          </div>
          <div>
            <Button variant="outline" width="full">
              Full Width Outline
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards */}
      <Heading level={2} style={{ marginBottom: '1rem', marginTop: '3rem' }}>
        Cards
      </Heading>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <Card mode={theme} variant="default">
          <CardHeader>
            <CardTitle>Default Card</CardTitle>
            <CardDescription>A simple card with a border</CardDescription>
          </CardHeader>
          <CardContent>
            <Text mode={theme}>
              This is the standard card style with a subtle border and minimal shadow. Good for most
              content areas.
            </Text>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm">
              {'Cancel'}
            </Button>
            <Button variant="primary" size="sm">
              {'Save'}
            </Button>
          </CardFooter>
        </Card>

        <Card mode={theme} variant="elevated">
          <CardHeader>
            <CardTitle>Elevated Card</CardTitle>
            <CardDescription>A card with more prominent elevation</CardDescription>
          </CardHeader>
          <CardContent>
            <Text mode={theme}>
              This elevated card has a stronger shadow to create visual hierarchy. Use it for
              important content or interactive elements.
            </Text>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm">
              {'Cancel'}
            </Button>
            <Button variant="primary" size="sm">
              {'Save'}
            </Button>
          </CardFooter>
        </Card>

        <Card mode={theme} variant="frosted">
          <CardHeader>
            <CardTitle>Frosted Card</CardTitle>
            <CardDescription>A card with a frosted glass effect</CardDescription>
          </CardHeader>
          <CardContent>
            <Text mode={theme}>
              This card uses backdrop-filter to create an Apple-style frosted glass effect. Great
              for overlays or floating elements on image backgrounds.
            </Text>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm">
              {'Cancel'}
            </Button>
            <Button variant="primary" size="sm">
              {'Save'}
            </Button>
          </CardFooter>
        </Card>

        <Card mode={theme} variant="bordered">
          <CardHeader>
            <CardTitle>Bordered Card</CardTitle>
            <CardDescription>A simple card with just a border</CardDescription>
          </CardHeader>
          <CardContent>
            <Text mode={theme}>
              This card has a border but no shadow, creating a more subtle container. Good for
              sidebars or secondary content that should be visually separated.
            </Text>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm">
              {'Cancel'}
            </Button>
            <Button variant="primary" size="sm">
              {'Save'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Inputs and Form Elements */}
      <Heading level={2} style={{ marginBottom: '1rem', marginTop: '3rem' }}>
        Inputs &amp; Form Elements
      </Heading>
      <Card mode={theme} style={{ marginBottom: '2rem' }}>
        <CardContent
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}
        >
          <div>
            <Label htmlFor="text-input">Text Input</Label>
            <Input
              id="text-input"
              placeholder="Enter your name"
              className="mt-1"
              variant={theme === 'dark' ? 'travel-blue' : 'default'}
              type="text"
              autoComplete="off"
              aria-label="Name"
            />
          </div>

          <div>
            <Label htmlFor="email-input">Email Input</Label>
            <Input
              id="email-input"
              type="email"
              placeholder="Enter your email"
              className="mt-1"
              variant={theme === 'dark' ? 'travel-blue' : 'default'}
              autoComplete="email"
              aria-label="Email"
              inputMode="email"
            />
          </div>

          <div>
            <Label htmlFor="select-input">Select Input</Label>
            <Select name="select-input">
              <SelectTrigger id="select-input" className="mt-1" aria-label="Select an option">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start mt-2">
            <div className="flex items-center h-5 pt-1">
              <Checkbox id="checkbox-example" aria-checked={false} />
            </div>
            <div className="ml-3">
              <Label htmlFor="checkbox-example" className="text-sm">
                I agree to receive email notifications
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Heading level={2} style={{ marginBottom: '1rem', marginTop: '3rem' }}>
        Badges
      </Heading>
      <Card mode={theme} style={{ marginBottom: '2rem' }}>
        <CardContent>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="travel-purple">Purple</Badge>
            <Badge variant="travel-blue">Blue</Badge>
            <Badge variant="travel-pink">Pink</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <Text variant="small" weight="medium" mode={theme} style={{ marginBottom: '0.5rem' }}>
              Examples in context:
            </Text>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginTop: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Badge variant="success">Available</Badge>
                <Text variant="small" mode={theme}>
                  Paris trip booking
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Badge variant="travel-blue">Beach</Badge>
                <Badge variant="travel-purple">Family-friendly</Badge>
                <Text variant="small" mode={theme}>
                  Bali vacation package
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Badge variant="warning">Limited spots</Badge>
                <Text variant="small" mode={theme}>
                  Tokyo guided tour
                </Text>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsive Demo */}
      <Heading level={2} style={{ marginBottom: '1rem', marginTop: '3rem' }}>
        Responsive Typography
      </Heading>
      <Card mode={theme} style={{ marginBottom: '2rem' }}>
        <CardContent>
          <Text mode={theme} style={{ marginBottom: '1rem' }}>
            Resize your browser to see how the typography adapts to different screen sizes. The text
            will subtly adjust its size to maintain readability across devices.
          </Text>
          <div
            style={{
              backgroundColor: getColorToken('SUBTLE', theme) as string,
              padding: '1.5rem',
              borderRadius: '0.75rem',
            }}
          >
            <Heading level={2} mode={theme} style={{ marginBottom: '1rem' }}>
              Responsive text demo
            </Heading>
            <Text variant="body" mode={theme} style={{ marginBottom: '1rem' }}>
              This text will adjust its size based on the viewport width, getting slightly larger on
              bigger screens and smaller on mobile devices, following Apple&apos;s approach to
              responsive typography.
            </Text>
            <Text variant="small" mode={theme}>
              Even this small text is optimized for readability at every screen size.
            </Text>
          </div>
        </CardContent>
      </Card>

      {/* Travel Booking Demo */}
      <Heading level={2} style={{ marginBottom: '1rem', marginTop: '3rem' }}>
        Travel Booking Example
      </Heading>
      <Card mode={theme} style={{ marginBottom: '3rem' }}>
        <CardHeader>
          <CardTitle>Book Your Next Adventure</CardTitle>
          <CardDescription>
            Explore new destinations with our exclusive travel packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Select name="destination">
                <SelectTrigger id="destination" className="mt-1" aria-label="Select destination">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paris">Paris, France</SelectItem>
                  <SelectItem value="tokyo">Tokyo, Japan</SelectItem>
                  <SelectItem value="ny">New York, USA</SelectItem>
                  <SelectItem value="bali">Bali, Indonesia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="travel-dates">Travel Dates</Label>
              <Input
                id="travel-dates"
                type="date"
                className="mt-1"
                variant={theme === 'dark' ? 'travel-blue' : 'default'}
                aria-label="Travel Dates"
                autoComplete="off"
              />
            </div>

            <div>
              <Label htmlFor="travelers">Travelers</Label>
              <Select name="travelers">
                <SelectTrigger id="travelers" className="mt-1" aria-label="Number of travelers">
                  <SelectValue placeholder="Number of travelers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Person</SelectItem>
                  <SelectItem value="2">2 People</SelectItem>
                  <SelectItem value="3">3 People</SelectItem>
                  <SelectItem value="4">4+ People</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <div className="flex items-start mt-2">
              <div className="flex items-center h-5 pt-1">
                <Checkbox id="flexible-dates" aria-checked={false} />
              </div>
              <div className="ml-3">
                <Label htmlFor="flexible-dates" className="text-sm">
                  My dates are flexible
                </Label>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '1.5rem',
            }}
          >
            <Badge variant="travel-blue">Popular</Badge>
            <Badge variant="travel-purple">Winter Getaway</Badge>
            <Badge variant="travel-pink">Exclusive Deal</Badge>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm">
            Reset
          </Button>
          <Button variant="primary" size="sm">
            Search Trips
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const meta: Meta<typeof AppleDesignShowcase> = {
  title: 'Design System/Showcase',
  component: AppleDesignShowcase,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive showcase of our Apple-inspired design system, demonstrating how components work together in harmony with both light and dark modes.',
      },
    },
  },
};

export default meta;

export const Default: StoryObj<typeof AppleDesignShowcase> = {
  parameters: {
    docs: {
      description: {
        story:
          'This showcase demonstrates our Apple-inspired design system with all major components in both light and dark modes. The design language emphasizes clarity, simplicity, and a focus on typography and subtle animations.',
      },
    },
  },
};

export const LightAndDarkModes: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 400 }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Light Mode</strong>
        </div>
        <AppleDesignShowcase />
      </div>
      <div style={{ flex: 1, minWidth: 400, background: '#222', borderRadius: 12, padding: 16 }}>
        <div style={{ marginBottom: '1rem', color: 'white' }}>
          <strong>Dark Mode</strong>
        </div>
        <AppleDesignShowcase />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates AppleDesignShowcase in both light and dark mode side by side.',
      },
    },
  },
};
