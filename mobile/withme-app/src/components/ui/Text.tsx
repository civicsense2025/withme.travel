import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption';

export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

export type TextColor = 'foreground' | 'primary' | 'secondary' | 'muted' | 'accent' | 'custom';

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
  customColor?: string;
  style?: TextStyle;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}

export function Text({
  children,
  variant = 'body1',
  weight = 'normal',
  color = 'foreground',
  customColor,
  style,
  ...props
}: TextProps) {
  const theme = useTheme();

  // Get base styles for the variant
  const variantStyle = getVariantStyle(variant, theme);

  // Get font weight
  const fontWeight = getFontWeight(weight);

  // Get text color
  const textColor = getTextColor(color, customColor, theme);

  return (
    <RNText style={[variantStyle, { fontWeight, color: textColor }, style]} {...props}>
      {children}
    </RNText>
  );
}

// Helper function to get variant style
function getVariantStyle(variant: TextVariant, theme: ReturnType<typeof useTheme>): TextStyle {
  switch (variant) {
    case 'h1':
      return {
        fontSize: theme.typography.fontSizes['4xl'],
        lineHeight: theme.typography.fontSizes['4xl'] * theme.typography.lineHeights.tight,
      };
    case 'h2':
      return {
        fontSize: theme.typography.fontSizes['3xl'],
        lineHeight: theme.typography.fontSizes['3xl'] * theme.typography.lineHeights.tight,
      };
    case 'h3':
      return {
        fontSize: theme.typography.fontSizes['2xl'],
        lineHeight: theme.typography.fontSizes['2xl'] * theme.typography.lineHeights.tight,
      };
    case 'h4':
      return {
        fontSize: theme.typography.fontSizes.xl,
        lineHeight: theme.typography.fontSizes.xl * theme.typography.lineHeights.tight,
      };
    case 'body1':
      return {
        fontSize: theme.typography.fontSizes.base,
        lineHeight: theme.typography.fontSizes.base * theme.typography.lineHeights.normal,
      };
    case 'body2':
      return {
        fontSize: theme.typography.fontSizes.sm,
        lineHeight: theme.typography.fontSizes.sm * theme.typography.lineHeights.normal,
      };
    case 'caption':
      return {
        fontSize: theme.typography.fontSizes.xs,
        lineHeight: theme.typography.fontSizes.xs * theme.typography.lineHeights.normal,
      };
    default:
      return {
        fontSize: theme.typography.fontSizes.base,
        lineHeight: theme.typography.fontSizes.base * theme.typography.lineHeights.normal,
      };
  }
}

// Helper function to get font weight
function getFontWeight(weight: TextWeight): TextStyle['fontWeight'] {
  switch (weight) {
    case 'normal':
      return '400';
    case 'medium':
      return '500';
    case 'semibold':
      return '600';
    case 'bold':
      return '700';
    default:
      return '400';
  }
}

// Helper function to get text color
function getTextColor(
  color: TextColor,
  customColor: string | undefined,
  theme: ReturnType<typeof useTheme>
): string {
  if (customColor) {
    return customColor;
  }

  switch (color) {
    case 'foreground':
      return theme.colors.foreground;
    case 'primary':
      return theme.colors.primary;
    case 'secondary':
      return theme.colors.mutedForeground;
    case 'muted':
      return theme.colors.mutedForeground;
    case 'accent':
      return theme.colors.accent;
    default:
      return theme.colors.foreground;
  }
}
