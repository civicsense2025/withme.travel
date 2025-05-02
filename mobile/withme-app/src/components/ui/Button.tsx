import React from 'react';
import {
  TouchableOpacity,
  Text as RNText,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

export type ButtonVariant =
  | 'primary' // Travel Purple
  | 'secondary' // Travel Blue
  | 'accent' // Travel Yellow
  | 'outline'
  | 'ghost'
  | 'destructive';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  fullWidth = false,
}: ButtonProps) {
  const theme = useTheme();

  // Get styles based on variant, size, and theme
  const buttonStyles = getButtonStyles(variant, size, theme, disabled, fullWidth);

  // Render button content
  const content = (
    <>
      {isLoading ? (
        <ActivityIndicator
          color={buttonStyles.textColor}
          size={size === 'sm' ? 'small' : 'small'}
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            variant={size === 'sm' ? 'body2' : 'body1'}
            weight="medium"
            color="custom"
            customColor={buttonStyles.textColor}
            style={textStyle}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[styles.button, buttonStyles.container, style]}
    >
      {content}
    </TouchableOpacity>
  );
}

// Helper functions for button styling
function getButtonStyles(
  variant: ButtonVariant,
  size: ButtonSize,
  theme: ReturnType<typeof useTheme>,
  disabled: boolean,
  fullWidth: boolean
) {
  // Default styles
  const container: ViewStyle = {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
  };

  let textColor: string = theme.colors.primaryForeground;

  // Apply variant-specific styles
  switch (variant) {
    case 'primary':
      container.backgroundColor = theme.colors.travelPurple;
      textColor = theme.colors.travelPurpleForeground;
      break;
    case 'secondary':
      container.backgroundColor = theme.colors.travelBlue;
      textColor = theme.colors.travelBlueForeground;
      break;
    case 'accent':
      container.backgroundColor = theme.colors.travelYellow;
      textColor = theme.colors.travelYellowForeground;
      break;
    case 'outline':
      container.backgroundColor = 'transparent';
      container.borderWidth = 1;
      container.borderColor = theme.colors.primary;
      textColor = theme.colors.primary;
      break;
    case 'ghost':
      container.backgroundColor = 'transparent';
      textColor = theme.colors.foreground;
      break;
    case 'destructive':
      container.backgroundColor = theme.colors.destructive;
      textColor = theme.colors.destructiveForeground;
      break;
  }

  // Apply size-specific styles
  switch (size) {
    case 'sm':
      container.paddingVertical = theme.spacing['1.5'];
      container.paddingHorizontal = theme.spacing['3'];
      break;
    case 'md':
      container.paddingVertical = theme.spacing['2'];
      container.paddingHorizontal = theme.spacing['4'];
      break;
    case 'lg':
      container.paddingVertical = theme.spacing['2.5'];
      container.paddingHorizontal = theme.spacing['5'];
      break;
  }

  return { container, textColor };
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;
