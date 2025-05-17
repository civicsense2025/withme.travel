'use client';

/**
 * Text
 *
 * A typography component for text content with variants, weights, and responsive sizing.
 *
 * @module ui/features/core/atoms/Text
 */

import React from 'react';
import {
  TYPOGRAPHY,
  getColorToken,
  ThemeMode,
  COLORS,
  getResponsiveSize,
} from '@/utils/constants/ui/design-system';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export type TextVariant = 'body' | 'caption' | 'large' | 'small' | 'label';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextScreenSize = 'base' | 'sm' | 'md';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** The text style variant */
  variant?: TextVariant;
  /** The font weight */
  weight?: TextWeight;
  /** The text color from the theme */
  color?: keyof (typeof COLORS)['light'];
  /** Override the theme mode */
  mode?: ThemeMode;
  /** The text content */
  children: React.ReactNode;
  /** Whether to adjust size based on screen width */
  responsive?: boolean;
  /** Bottom margin spacing */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Typography component for rendering text content with consistent styling.
 * Supports various sizes, weights, and responsive behavior.
 */
export function Text({
  variant = 'body',
  weight = 'regular',
  color = 'TEXT',
  mode,
  style,
  responsive = true,
  spacing = 'md',
  ...props
}: TextProps) {
  const theme = useTheme();
  const resolvedMode: ThemeMode = mode || (theme?.resolvedTheme as ThemeMode) || 'light';
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
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [responsive]);

  const getSpacing = () => {
    switch (spacing) {
      case 'none':
        return '0';
      case 'sm':
        return '0.5rem';
      case 'lg':
        return '2rem';
      default:
        return '1rem'; // md
    }
  };

  const getTextStyles = () => {
    let variantStyles;
    let fontWeight;
    switch (variant) {
      case 'large':
        variantStyles = {
          fontSize: responsive
            ? getResponsiveSize({ base: '1.5rem', sm: '1.7rem', md: '1.9rem' }, screenSize)
            : '1.5rem',
          lineHeight: 1.7,
          letterSpacing: '-0.01em',
          color: getColorToken('PRIMARY', resolvedMode),
        };
        break;
      case 'small':
        variantStyles = {
          fontSize: responsive
            ? getResponsiveSize({ base: '1.05rem', sm: '1.1rem', md: '1.15rem' }, screenSize)
            : '1.05rem',
          lineHeight: 1.6,
          letterSpacing: '-0.005em',
          color: getColorToken('MUTED', resolvedMode),
        };
        break;
      case 'caption':
        variantStyles = {
          fontSize: responsive
            ? getResponsiveSize(TYPOGRAPHY.caption.fontSize, screenSize)
            : TYPOGRAPHY.caption.fontSize.base,
          lineHeight: TYPOGRAPHY.caption.lineHeight,
          letterSpacing: TYPOGRAPHY.caption.letterSpacing,
          color: getColorToken('MUTED', resolvedMode),
        };
        break;
      case 'label':
        variantStyles = {
          fontSize: responsive
            ? getResponsiveSize({ base: '1.1rem', sm: '1.15rem', md: '1.2rem' }, screenSize)
            : '1.1rem',
          lineHeight: 1.4,
          letterSpacing: '0',
          color: getColorToken('SECONDARY', resolvedMode),
          fontWeight: 500,
        };
        break;
      default: // body
        variantStyles = {
          fontSize: responsive
            ? getResponsiveSize(TYPOGRAPHY.body.fontSize, screenSize)
            : TYPOGRAPHY.body.fontSize.base,
          lineHeight: TYPOGRAPHY.body.lineHeight,
          letterSpacing: TYPOGRAPHY.body.letterSpacing,
          color: getColorToken(color, resolvedMode),
        };
    }
    switch (weight) {
      case 'bold':
        fontWeight = 700;
        break;
      case 'semibold':
        fontWeight = 600;
        break;
      case 'medium':
        fontWeight = 500;
        break;
      default:
        fontWeight = 400;
    }
    return {
      ...variantStyles,
      fontWeight: variantStyles.fontWeight || fontWeight,
      fontFamily: TYPOGRAPHY.fontFamily,
      margin: 0,
      marginBottom: getSpacing(),
      maxWidth: '100%',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    };
  };

  return (
    <p
      style={{
        ...getTextStyles(),
        ...style,
      }}
      {...props}
    />
  );
} 