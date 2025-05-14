import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect } from 'react';
import { COLORS, TYPOGRAPHY, ThemeMode, getResponsiveSize } from '@/utils/constants/design-system';
import { Button } from './button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Text, Heading } from './index';

interface ColorOption {
  name: string;
  value: string;
}

const lightModeColors: ColorOption[] = Object.entries(COLORS.light).map(([name, value]) => ({
  name,
  value,
}));

const darkModeColors: ColorOption[] = Object.entries(COLORS.dark).map(([name, value]) => ({
  name,
  value,
}));

const DesignSystemPlayground = () => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [primaryColor, setPrimaryColor] = useState<string>(COLORS[mode].PRIMARY);
  const [backgroundColor, setBackgroundColor] = useState<string>(COLORS[mode].BACKGROUND);
  const [textColor, setTextColor] = useState<string>(COLORS[mode].TEXT);
  const [fontSize, setFontSize] = useState<string>('1rem');
  const [buttonVariant, setButtonVariant] = useState<'primary' | 'secondary' | 'outline' | 'ghost'>(
    'primary'
  );
  const [cardVariant, setCardVariant] = useState<'default' | 'elevated'>('default');
  const [screenSize, setScreenSize] = useState<'base' | 'sm' | 'md'>('base');

  // Update colors when mode changes
  useEffect(() => {
    setPrimaryColor(COLORS[mode].PRIMARY);
    setBackgroundColor(COLORS[mode].BACKGROUND);
    setTextColor(COLORS[mode].TEXT);
  }, [mode]);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setScreenSize('md');
      } else if (width >= 640) {
        setScreenSize('sm');
      } else {
        setScreenSize('base');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const colorOptions = mode === 'light' ? lightModeColors : darkModeColors;

  // Helper to get typography size for the current screen size
  const getTypoSize = (sizes: { base: string; sm: string; md: string }) => {
    return sizes[screenSize];
  };

  // Helper function for Apple-style select elements
  const AppleSelect = ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ name: string; value: string } | { value: string; label: string }>;
  }) => (
    <div style={{ marginTop: '1.5rem' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: 500,
          fontSize: '0.9375rem',
          color: mode === 'dark' ? COLORS.dark.TEXT : COLORS.light.TEXT,
          letterSpacing: '-0.01em',
        }}
      >
        {label}
      </label>
      <div
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.625rem 0.75rem',
            paddingRight: '2rem',
            borderRadius: '0.75rem',
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
            backgroundColor: mode === 'dark' ? '#1c1c1e' : '#ffffff',
            color: mode === 'dark' ? COLORS.dark.TEXT : COLORS.light.TEXT,
            appearance: 'none',
            fontSize: '0.9375rem',
            fontFamily: TYPOGRAPHY.fontFamily,
            boxShadow: mode === 'dark' ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {options.map((option) => (
            <option key={'name' in option ? option.name : option.label} value={option.value}>
              {'name' in option ? option.name : option.label}
            </option>
          ))}
        </select>
        <div
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          }}
        >
          ▼
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: TYPOGRAPHY.fontFamily,
      }}
    >
      <h1
        style={{
          marginBottom: '2rem',
          borderBottom:
            mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          paddingBottom: '0.75rem',
          fontSize: '2rem',
          fontWeight: 600,
          color: mode === 'dark' ? COLORS.dark.TEXT : COLORS.light.TEXT,
          letterSpacing: '-0.02em',
        }}
      >
        Apple-Style Design System
      </h1>

      <div
        style={{
          display: 'flex',
          gap: '2rem',
          marginBottom: '2rem',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        }}
      >
        {/* Controls Panel */}
        <div
          style={{
            width: window.innerWidth < 768 ? '100%' : '30%',
            padding: '1.5rem',
            backgroundColor: mode === 'dark' ? '#1c1c1e' : '#f5f5f7',
            borderRadius: '1rem',
            boxShadow: mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: mode === 'dark' ? COLORS.dark.TEXT : COLORS.light.TEXT,
              marginBottom: '1.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Controls
          </h2>

          <AppleSelect
            label="Theme Mode"
            value={mode}
            onChange={(value) => setMode(value as ThemeMode)}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />

          <AppleSelect
            label="Primary Color"
            value={primaryColor}
            onChange={setPrimaryColor}
            options={colorOptions}
          />

          <AppleSelect
            label="Background Color"
            value={backgroundColor}
            onChange={setBackgroundColor}
            options={colorOptions}
          />

          <AppleSelect
            label="Text Color"
            value={textColor}
            onChange={setTextColor}
            options={colorOptions}
          />

          <AppleSelect
            label="Font Size"
            value={fontSize}
            onChange={setFontSize}
            options={[
              { value: '0.75rem', label: 'Small (0.75rem)' },
              { value: '1rem', label: 'Medium (1rem)' },
              { value: '1.25rem', label: 'Large (1.25rem)' },
              { value: '1.5rem', label: 'X-Large (1.5rem)' },
            ]}
          />

          <AppleSelect
            label="Button Variant"
            value={buttonVariant}
            onChange={(value) => setButtonVariant(value as any)}
            options={[
              { value: 'primary', label: 'Primary' },
              { value: 'secondary', label: 'Secondary' },
              { value: 'outline', label: 'Outline' },
              { value: 'ghost', label: 'Ghost' },
            ]}
          />

          <AppleSelect
            label="Card Variant"
            value={cardVariant}
            onChange={(value) => setCardVariant(value as any)}
            options={[
              { value: 'default', label: 'Default' },
              { value: 'elevated', label: 'Elevated' },
            ]}
          />
        </div>

        {/* Preview Panel */}
        <div style={{ width: window.innerWidth < 768 ? '100%' : '70%', position: 'relative' }}>
          <div
            style={{
              padding: '2rem',
              backgroundColor: backgroundColor,
              borderRadius: '1rem',
              boxShadow:
                mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
              height: '600px',
              overflow: 'auto',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                fontSize: '0.75rem',
                backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                color: mode === 'light' ? '#000' : '#fff',
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              {mode.toUpperCase()} MODE
            </div>

            <Heading
              level={2}
              color={mode === 'light' ? 'TEXT' : 'TEXT'}
              style={{ marginBottom: '1.5rem' }}
            >
              Component Preview
            </Heading>

            <Card mode={mode} variant={cardVariant} style={{ marginBottom: '2rem' }}>
              <CardHeader>
                <CardTitle>Card Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Text
                  variant="body"
                  color={mode === 'light' ? 'TEXT' : 'TEXT'}
                  style={{
                    marginBottom: '1.5rem',
                    fontSize,
                  }}
                >
                  This is a preview of your customized design. You can see how different colors,
                  typography, and component variants work together in both light and dark modes. Try
                  adjusting the controls to see how the design changes.
                </Text>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Button
                    variant={buttonVariant}
                    style={{
                      backgroundColor: buttonVariant === 'primary' ? primaryColor : undefined,
                    }}
                  >
                    Primary Action
                  </Button>

                  <Button variant="outline">Secondary Action</Button>
                </div>
              </CardContent>
            </Card>

            <div style={{ marginBottom: '2rem' }}>
              <Heading
                level={3}
                color={mode === 'light' ? 'TEXT' : 'TEXT'}
                style={{ marginBottom: '1rem' }}
              >
                Typography Sample
              </Heading>

              <Heading
                level={1}
                color={mode === 'light' ? 'TEXT' : 'TEXT'}
                style={{ marginBottom: '0.75rem' }}
              >
                Heading 1
              </Heading>

              <Heading
                level={2}
                color={mode === 'light' ? 'TEXT' : 'TEXT'}
                style={{ marginBottom: '0.75rem' }}
              >
                Heading 2
              </Heading>

              <Heading
                level={3}
                color={mode === 'light' ? 'TEXT' : 'TEXT'}
                style={{ marginBottom: '0.75rem' }}
              >
                Heading 3
              </Heading>

              <Text
                variant="body"
                color={mode === 'light' ? 'TEXT' : 'TEXT'}
                style={{
                  marginBottom: '0.75rem',
                  fontSize,
                }}
              >
                This is a paragraph of text that demonstrates how your selected font size and color
                look in a block of content. The quick brown fox jumps over the lazy dog. Lorem ipsum
                dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua.
              </Text>
            </div>

            <div>
              <Heading
                level={3}
                color={mode === 'light' ? 'TEXT' : 'TEXT'}
                style={{ marginBottom: '1rem' }}
              >
                Button Variations
              </Heading>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Button variant="primary" style={{ backgroundColor: primaryColor }}>
                  Primary
                </Button>

                <Button variant="secondary">Secondary</Button>

                <Button variant="outline">Outline</Button>

                <Button variant="ghost">Ghost</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof DesignSystemPlayground> = {
  title: 'Design System/Playground',
  component: DesignSystemPlayground,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DesignSystemPlayground>;

export const Playground: Story = {};

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
