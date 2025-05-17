import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { COLORS, TYPOGRAPHY } from '@/utils/constants/ui/design-system';

interface ColorBlockProps {
  color: string;
  name: string;
  textColor?: string;
}

const ColorBlock = ({ color, name, textColor = '#fff' }: ColorBlockProps) => (
  <div
    style={{
      backgroundColor: color,
      color: textColor,
      padding: '1rem',
      borderRadius: '0.25rem',
      width: '150px',
      height: '80px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    }}
  >
    <div style={{ fontWeight: 'bold' }}>{name}</div>
    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{color}</div>
  </div>
);

interface TypographyDemoProps {
  name: string;
  style: {
    fontSize: string;
    fontWeight: number;
    lineHeight: number;
  };
}

const TypographyDemo = ({ name, style }: TypographyDemoProps) => (
  <div style={{ marginBottom: '1rem' }}>
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <div style={{ width: '100px', fontSize: '0.75rem', color: '#666' }}>{name}</div>
      <div
        style={{
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          color: '#666',
          marginTop: '0.25rem',
          marginLeft: '100px',
        }}
      >
        The quick brown fox jumps over the lazy dog
      </div>
    </div>
    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem', marginLeft: '100px' }}>
      {style.fontSize} / {style.fontWeight} / {style.lineHeight}
    </div>
  </div>
);

const spacingSizes = [
  '0.25rem',
  '0.5rem',
  '0.75rem',
  '1rem',
  '1.5rem',
  '2rem',
  '3rem',
  '4rem',
  '6rem',
  '8rem',
];

const shadowLevels = [
  '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
  '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)',
];

const DesignTokens = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
        Design Tokens
      </h1>

      {/* Colors */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Colors</h2>

        <h3 style={{ marginBottom: '1rem' }}>Light Mode</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          {Object.entries(COLORS.light).map(([name, color]) => (
            <ColorBlock
              key={name}
              name={name}
              color={color}
              textColor={['BACKGROUND', 'SURFACE'].includes(name) ? '#000' : '#fff'}
            />
          ))}
        </div>

        <h3 style={{ marginBottom: '1rem' }}>Dark Mode</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {Object.entries(COLORS.dark).map(([name, color]) => (
            <ColorBlock
              key={name}
              name={name}
              color={color}
              textColor={['PRIMARY', 'SECONDARY'].includes(name) ? '#000' : '#fff'}
            />
          ))}
        </div>
      </section>

      {/* Typography */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Typography</h2>
        <div
          style={{
            fontFamily: TYPOGRAPHY.fontFamily,
            padding: '1rem',
            backgroundColor: '#f9f9f9',
            borderRadius: '0.25rem',
          }}
        >
          <TypographyDemo
            name="Heading 1"
            style={{
              fontSize: TYPOGRAPHY.h1.fontSize.base,
              fontWeight: TYPOGRAPHY.h1.fontWeight,
              lineHeight: TYPOGRAPHY.h1.lineHeight,
            }}
          />
          <TypographyDemo
            name="Heading 2"
            style={{
              fontSize: TYPOGRAPHY.h2.fontSize.base,
              fontWeight: TYPOGRAPHY.h2.fontWeight,
              lineHeight: TYPOGRAPHY.h2.lineHeight,
            }}
          />
          <TypographyDemo
            name="Heading 3"
            style={{
              fontSize: TYPOGRAPHY.h3.fontSize.base,
              fontWeight: TYPOGRAPHY.h3.fontWeight,
              lineHeight: TYPOGRAPHY.h3.lineHeight,
            }}
          />
          <TypographyDemo
            name="Body"
            style={{
              fontSize: TYPOGRAPHY.body.fontSize.base,
              fontWeight: TYPOGRAPHY.body.fontWeight,
              lineHeight: TYPOGRAPHY.body.lineHeight,
            }}
          />
          <TypographyDemo
            name="Caption"
            style={{
              fontSize: TYPOGRAPHY.caption.fontSize.base,
              fontWeight: TYPOGRAPHY.caption.fontWeight,
              lineHeight: TYPOGRAPHY.caption.lineHeight,
            }}
          />
        </div>
      </section>

      {/* Spacing */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Spacing</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {spacingSizes.map((size) => (
            <div key={size} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100px', fontSize: '0.75rem' }}>{size}</div>
              <div
                style={{
                  width: size,
                  height: '24px',
                  backgroundColor: '#4f46e5',
                  borderRadius: '2px',
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Shadows */}
      <section>
        <h2 style={{ marginBottom: '1rem' }}>Shadows</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          {shadowLevels.map((shadow, index) => (
            <div
              key={index}
              style={{
                width: '200px',
                height: '100px',
                backgroundColor: 'white',
                boxShadow: shadow,
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Shadow {index + 1}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const meta: Meta<typeof DesignTokens> = {
  title: 'Design System/Tokens',
  component: DesignTokens,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DesignTokens>;

export const Tokens: Story = {};

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
