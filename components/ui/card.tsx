'use client';

import React from 'react';
import { COLORS, RADII, SHADOWS, ThemeMode, getColorToken } from '@/utils/constants/ui/design-system';
import { useTheme } from 'next-themes';

/**
 * Export the CardVariant type for external use
 */
export type CardVariant = 'default' | 'elevated' | 'frosted' | 'bordered';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: ThemeMode;
  variant?: CardVariant;
  children: React.ReactNode;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

function getPadding(padding: CardProps['padding']) {
  switch (padding) {
    case 'none':
      return '0';
    case 'small':
      return '1.5rem';
    case 'large':
      return '3rem';
    default:
      return '2rem'; // medium
  }
}

// HOC to inject theme awareness to card components
function withTheme<P extends { mode?: ThemeMode; style?: React.CSSProperties }>(
  Component: React.ComponentType<P>,
  defaultStyles: (mode: ThemeMode) => React.CSSProperties
) {
  const WithThemeComponent = (props: P) => {
    const theme = useTheme();
    const resolvedMode: ThemeMode = props.mode || (theme?.resolvedTheme as ThemeMode) || 'light';

    return (
      <Component
        {...props}
        style={{
          ...defaultStyles(resolvedMode),
          ...props.style,
        }}
      />
    );
  };
  
  WithThemeComponent.displayName = `withTheme(${Component.displayName || Component.name || 'Component'})`;
  return WithThemeComponent;
}

// Main Card component
export function Card({
  mode,
  variant = 'default',
  children,
  style,
  padding = 'medium',
  ...props
}: CardProps) {
  const theme = useTheme();
  const resolvedMode: ThemeMode = mode || (theme?.resolvedTheme as ThemeMode) || 'light';
  const pastelBg = getColorToken('SURFACE', resolvedMode);
  const pastelBorder = getColorToken('BORDER', resolvedMode);
  const pastelShadow = SHADOWS.lg;
  const pastelRadius = RADII.xl;
  const pastelGradient = COLORS[resolvedMode].GRADIENT;

  let cardStyle: React.CSSProperties = {
    background: pastelBg,
    color: getColorToken('TEXT', resolvedMode),
    border: `1.5px solid ${pastelBorder}`,
    borderRadius: pastelRadius,
    boxShadow: pastelShadow,
    padding: getPadding(padding),
    marginBottom: '2.5rem',
    transition: 'all 0.25s cubic-bezier(.4,1,.4,1)',
    maxWidth: '100%',
    overflow: 'hidden',
    ...style,
  };

  if (variant === 'elevated') {
    cardStyle.background = pastelGradient;
    cardStyle.boxShadow = SHADOWS.xl;
    cardStyle.border = 'none';
  } else if (variant === 'frosted') {
    cardStyle.background = `linear-gradient(120deg, ${pastelBg}cc 60%, #fff8 100%)`;
    cardStyle.backdropFilter = 'blur(12px)';
    cardStyle.WebkitBackdropFilter = 'blur(12px)';
    cardStyle.boxShadow = SHADOWS.md;
    cardStyle.border = `1.5px solid ${pastelBorder}`;
  } else if (variant === 'bordered') {
    cardStyle.background = pastelBg;
    cardStyle.boxShadow = SHADOWS.sm;
    cardStyle.border = `2px solid ${pastelBorder}`;
  }

  return (
    <div style={cardStyle} {...props}>
      {children}
    </div>
  );
}

// Card Header
const CardHeaderComponent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    style={{
      marginBottom: '1.5rem',
      paddingBottom: '0.5rem',
      borderBottom: `1px solid ${COLORS.light.BORDER}`,
    }}
  >
    {children}
  </div>
);

CardHeaderComponent.displayName = 'CardHeader';

export const CardHeader = CardHeaderComponent;

// Card Title
const CardTitleComponent = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    {...props}
    style={{
      margin: 0,
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      marginBottom: '0.5rem',
    }}
  >
    {children}
  </h3>
);

CardTitleComponent.displayName = 'CardTitle';

export const CardTitle = CardTitleComponent;

// Card Description
const CardDescriptionComponent = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    {...props}
    style={{ margin: 0, fontSize: '1.1rem', color: COLORS.light.MUTED, marginBottom: '0.5rem' }}
  >
    {children}
  </p>
);

CardDescriptionComponent.displayName = 'CardDescription';

export const CardDescription = CardDescriptionComponent;

// Card Content
const CardContentComponent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} style={{ marginBottom: '1.5rem' }}>
    {children}
  </div>
);

CardContentComponent.displayName = 'CardContent';

export const CardContent = CardContentComponent;

// Card Footer
const CardFooterComponent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    style={{
      display: 'flex',
      gap: '1.5rem',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingTop: '1rem',
      borderTop: `1px solid ${COLORS.light.BORDER}`,
    }}
  >
    {children}
  </div>
);

CardFooterComponent.displayName = 'CardFooter';

export const CardFooter = CardFooterComponent;
