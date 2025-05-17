import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Text, Heading } from './index';
import { Button } from './button';
import { Card } from './card';
import { COLORS, TYPOGRAPHY } from '@/utils/constants/ui/design-system';

const ThemeDemo = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
        Design System Overview
      </h1>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        {/* Light Mode Column */}
        <div style={{ width: '50%' }}>
          <Heading level={2}>Light Mode</Heading>
          <div
            style={{
              marginTop: '1rem',
              padding: '1.5rem',
              backgroundColor: COLORS.light.BACKGROUND,
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          >
            <Heading level={3}>Typography</Heading>
            <div style={{ marginTop: '1rem' }}>
              <Heading level={1}>Heading 1</Heading>
              <Heading level={2}>Heading 2</Heading>
              <Heading level={3}>Heading 3</Heading>
              <Text variant="body">Body Text - The quick brown fox jumps over the lazy dog.</Text>
              <Text variant="caption">
                Caption Text - The quick brown fox jumps over the lazy dog.
              </Text>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              backgroundColor: COLORS.light.BACKGROUND,
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          >
            <Heading level={3}>Components</Heading>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Heading level={3}>Buttons</Heading>
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}
                >
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}
                >
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <Heading level={3}>Cards</Heading>
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}
                >
                  <Card style={{ width: '200px', padding: '1rem' }}>
                    <Text>Default Card</Text>
                  </Card>
                  <Card variant="elevated" style={{ width: '200px', padding: '1rem' }}>
                    <Text>Elevated Card</Text>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              backgroundColor: COLORS.light.BACKGROUND,
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          >
            <Heading level={3}>Color Tokens</Heading>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
              {Object.entries(COLORS.light)
                .slice(0, 8)
                .map(([name, color]) => (
                  <div
                    key={name}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      backgroundColor: color,
                      color: ['BACKGROUND', 'SURFACE'].includes(name) ? '#000' : '#fff',
                      width: '100px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                    }}
                  >
                    {name}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Dark Mode Column */}
        <div style={{ width: '50%' }}>
          <Heading level={2} mode="dark">
            Dark Mode
          </Heading>
          <div
            style={{
              marginTop: '1rem',
              padding: '1.5rem',
              backgroundColor: COLORS.dark.BACKGROUND,
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          >
            <Heading level={3} mode="dark">
              Typography
            </Heading>
            <div style={{ marginTop: '1rem' }}>
              <Heading level={1} mode="dark">
                Heading 1
              </Heading>
              <Heading level={2} mode="dark">
                Heading 2
              </Heading>
              <Heading level={3} mode="dark">
                Heading 3
              </Heading>
              <Text variant="body" mode="dark">
                Body Text - The quick brown fox jumps over the lazy dog.
              </Text>
              <Text variant="caption" mode="dark">
                Caption Text - The quick brown fox jumps over the lazy dog.
              </Text>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              backgroundColor: COLORS.dark.BACKGROUND,
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          >
            <Heading level={3} mode="dark">
              Components
            </Heading>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Heading level={3} mode="dark">
                  Buttons
                </Heading>
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}
                >
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}
                >
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <Heading level={3} mode="dark">
                  Cards
                </Heading>
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}
                >
                  <Card mode="dark" style={{ width: '200px', padding: '1rem' }}>
                    <Text mode="dark">Default Card</Text>
                  </Card>
                  <Card mode="dark" variant="elevated" style={{ width: '200px', padding: '1rem' }}>
                    <Text mode="dark">Elevated Card</Text>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              backgroundColor: COLORS.dark.BACKGROUND,
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          >
            <Heading level={3} mode="dark">
              Color Tokens
            </Heading>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
              {Object.entries(COLORS.dark)
                .slice(0, 8)
                .map(([name, color]) => (
                  <div
                    key={name}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      backgroundColor: color,
                      color: ['PRIMARY', 'SECONDARY'].includes(name) ? '#000' : '#fff',
                      width: '100px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.24)',
                    }}
                  >
                    {name}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Design System/Theme/ThemeDemo',
  component: ThemeDemo,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ThemeDemo>;

export const Overview: Story = {};

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
