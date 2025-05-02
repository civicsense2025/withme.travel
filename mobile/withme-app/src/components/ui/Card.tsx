import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export type CardVariant = 'default' | 'elevated' | 'bordered' | 'subtle';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: keyof ReturnType<typeof useTheme>['spacing'] | 'none';
  style?: ViewStyle;
}

export function Card({ children, variant = 'default', padding = '4', style }: CardProps) {
  const theme = useTheme();

  const getCardStyles = () => {
    const baseStyles: ViewStyle = {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xl,
      padding: padding === 'none' ? 0 : theme.spacing[padding],
      overflow: 'hidden',
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyles,
          ...theme.shadows.md,
          borderWidth: 0,
        };
      case 'bordered':
        return {
          ...baseStyles,
          borderWidth: 1,
          borderColor: theme.colors.border,
          // Remove shadow for bordered variant
          shadowOpacity: 0,
          elevation: 0,
        };
      case 'subtle':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.muted,
          // Subtle shadow
          ...theme.shadows.sm,
          borderWidth: 0,
        };
      default:
        return {
          ...baseStyles,
          ...theme.shadows.sm,
          borderWidth: 0,
        };
    }
  };

  return <View style={[getCardStyles(), style]}>{children}</View>;
}

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});
