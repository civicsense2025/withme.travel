import React from 'react';

// Box component with theming support
export type BoxProps = {
  children: React.ReactNode;
  margin?: string;
};

export const Box: React.FC<BoxProps> = ({ children, margin }) => (
  <div style={{ margin: margin || '0' }}>
    {children}
  </div>
);

// Card component with basic styling and theming
export type CardProps = {
  children: React.ReactNode;
  padding?: string;
  marginBottom?: string;
};

export const Card: React.FC<CardProps> = ({ children, padding, marginBottom }) => (
  <div
    style={{
      padding: padding || '1rem',
      marginBottom: marginBottom || '1rem',
      border: '1px solid var(--border-color, #ccc)',
      borderRadius: '4px',
      backgroundColor: 'var(--card-bg, #fff)'
    }}
  >
    {children}
  </div>
);

// Checkbox component with simple styling
export type CheckboxProps = {
  children: React.ReactNode;
  checked: boolean;
};

export const Checkbox: React.FC<CheckboxProps> = ({ children, checked }) => (
  <label style={{ display: 'flex', alignItems: 'center' }}>
    <input type="checkbox" checked={checked} readOnly style={{ marginRight: '0.5rem' }} />
    {children}
  </label>
);

// Text component with variants and theming support
export type TextProps = {
  children: React.ReactNode;
  variant?: 'headline' | 'body';
  marginBottom?: string;
};

export const Text: React.FC<TextProps> = ({ children, variant = 'body', marginBottom }) => {
  const style = variant === 'headline' ? {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'var(--text-primary, #000)',
    marginBottom: marginBottom || '0'
  } : {
    fontSize: '1rem',
    color: 'var(--text-secondary, #333)',
    marginBottom: marginBottom || '0'
  };
  return <div style={style}>{children}</div>;
}; 