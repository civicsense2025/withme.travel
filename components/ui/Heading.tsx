'use client';

import React, { useState, useEffect } from 'react';
import {
  TYPOGRAPHY,
  getColorToken,
  ThemeMode,
  COLORS,
  getResponsiveSize,
} from '@/utils/constants/design-system';
import { useTheme } from 'next-themes';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type HeadingSize = 'default' | 'small' | 'large';
export type TextScreenSize = 'base' | 'sm' | 'md';
export type HeadingAlignment = 'left' | 'center' | 'right';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  size?: HeadingSize;
  weight?: HeadingWeight;
  color?: keyof (typeof COLORS)['light'];
  mode?: ThemeMode;
  align?: HeadingAlignment;
  children: React.ReactNode;
  responsive?: boolean;
}

const headingTags = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const;

// Define font size type to avoid type errors
interface FontSize {
  base: string;
  sm: string;
  md: string;
}

export function Heading({
  level = 1,
  size = 'default',
  weight,
  color = 'TEXT',
  mode,
  align = 'left',
  style,
  children,
  responsive = true,
  ...props
}: HeadingProps) {
  const theme = useTheme();
  const resolvedMode: ThemeMode = mode || (theme?.resolvedTheme as ThemeMode) || 'light';
  const Tag = headingTags[level];
  const [screenSize, setScreenSize] = useState<TextScreenSize>('base');

  useEffect(() => {
    if (!responsive) return;

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

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [responsive]);

  const getHeadingStyles = () => {
    // Default heading properties based on level
    const typographyKey = `h${Math.min(level, 4)}` as keyof typeof TYPOGRAPHY;

    // Get base typography for the heading level
    const baseTypography = TYPOGRAPHY[typographyKey] || TYPOGRAPHY.h1;

    // Apple-like font weights
    const defaultWeights = {
      1: 700, // Bold for h1
      2: 600, // Semibold for h2
      3: 600, // Semibold for h3
      4: 500, // Medium for h4
      5: 500, // Medium for h5
      6: 500, // Medium for h6
    };

    // Type guards for fontSize, lineHeight, letterSpacing
    let fontSize: FontSize = { base: '2rem', sm: '2rem', md: '2rem' };
    if (typeof baseTypography === 'object' && baseTypography.fontSize) {
      fontSize = { ...baseTypography.fontSize };
    }

    // Adjust sizes for h5 and h6 (which aren't in the TYPOGRAPHY constant)
    if (level === 5) {
      fontSize = {
        base: '1.05rem',
        sm: '1.1rem',
        md: '1.15rem',
      };
    } else if (level === 6) {
      fontSize = {
        base: '0.95rem',
        sm: '1rem',
        md: '1.05rem',
      };
    }

    let fontWeight = weight
      ? weight === 'bold'
        ? 700
        : weight === 'semibold'
          ? 600
          : weight === 'medium'
            ? 500
            : 400
      : defaultWeights[level];

    // Adjust font size based on the size prop
    if (size === 'small') {
      fontSize = {
        base: `calc(${fontSize.base} * 0.9)`,
        sm: `calc(${fontSize.sm} * 0.9)`,
        md: `calc(${fontSize.md} * 0.9)`,
      };
    } else if (size === 'large') {
      fontSize = {
        base: `calc(${fontSize.base} * 1.1)`,
        sm: `calc(${fontSize.sm} * 1.1)`,
        md: `calc(${fontSize.md} * 1.1)`,
      };
    }

    // Apple-like spacing adjustments for headings
    const letterSpacingByLevel = {
      1: '-0.025em',
      2: '-0.02em',
      3: '-0.015em',
      4: '-0.01em',
      5: '-0.01em',
      6: '-0.005em',
    };

    // Get line height from typography or default
    let lineHeight = 1.2;
    if (typeof baseTypography === 'object' && 'lineHeight' in baseTypography) {
      lineHeight = baseTypography.lineHeight;
    }

    // Get letter spacing from level map or default from typography
    let letterSpacing = letterSpacingByLevel[level];
    if (!letterSpacing && typeof baseTypography === 'object' && 'letterSpacing' in baseTypography) {
      letterSpacing = baseTypography.letterSpacing;
    }
    if (!letterSpacing) {
      letterSpacing = '-0.01em';
    }

    return {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontSize: responsive ? getResponsiveSize(fontSize, screenSize) : fontSize.base,
      fontWeight,
      lineHeight,
      letterSpacing,
      color: getColorToken(color, resolvedMode),
      margin: '0 0 0.5rem 0', // Add small bottom margin for better spacing
      maxWidth: '100%', // Ensure responsiveness
      textAlign: align,
      WebkitFontSmoothing: 'antialiased', // Better text rendering
      MozOsxFontSmoothing: 'grayscale',
    };
  };

  const headingStyles = getHeadingStyles();

  return React.createElement(
    Tag,
    {
      style: { ...headingStyles, ...style },
      ...props,
    },
    children
  );
}
