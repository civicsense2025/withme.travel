import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacity,
  Platform,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text'; // Import our Text component

export type InputVariant = 'default' | 'filled' | 'outlined';
export type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: InputVariant;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  style?: TextStyle;
  required?: boolean;
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      marginBottom: theme.spacing['4'], // Use spacing token
    },
    label: {
      marginBottom: theme.spacing['1.5'], // Use spacing token
    },
    // Container styles are now generated dynamically
    leftIconContainer: {
      paddingLeft: theme.spacing['3'], // Use spacing token
      marginRight: theme.spacing['2'], // Add spacing between icon and text
    },
    rightIconContainer: {
      paddingRight: theme.spacing['3'], // Use spacing token
      marginLeft: theme.spacing['2'], // Add spacing between text and icon
    },
    errorText: {
      marginTop: theme.spacing['1'], // Use spacing token
    },
  });

export function Input({
  label,
  error,
  hint,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  required = false,
  value,
  onChangeText,
  placeholder,
  ...props
}: InputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  // Generate input styles based on variant, size, and state
  const getInputStyles = () => {
    const baseInputStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: focused
        ? theme.colors.ring
        : error
          ? theme.colors.destructive
          : theme.colors.border,
      backgroundColor: theme.colors.input,
    };

    // Size-specific styles
    const sizeStyles: Record<InputSize, ViewStyle & { fontSize: number }> = {
      sm: {
        paddingVertical: theme.spacing['1'],
        paddingHorizontal: theme.spacing['2'],
        fontSize: theme.typography.fontSizes.sm,
      },
      md: {
        paddingVertical: theme.spacing['2'],
        paddingHorizontal: theme.spacing['3'],
        fontSize: theme.typography.fontSizes.base,
      },
      lg: {
        paddingVertical: theme.spacing['3'],
        paddingHorizontal: theme.spacing['4'],
        fontSize: theme.typography.fontSizes.lg,
      },
    };

    // Variant-specific styles
    let variantStyle: ViewStyle = {};
    switch (variant) {
      case 'filled':
        variantStyle = {
          backgroundColor: theme.colors.muted,
          borderWidth: 0,
        };
        if (focused) {
          variantStyle.borderWidth = 1;
          variantStyle.borderColor = theme.colors.ring;
        }
        break;
      case 'outlined':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
        };
        break;
      default:
        // Use default styles
        break;
    }

    return {
      container: { ...baseInputStyle, ...variantStyle },
      input: {
        flex: 1,
        color: theme.colors.inputForeground,
        fontSize: sizeStyles[size].fontSize,
        paddingVertical: sizeStyles[size].paddingVertical,
        paddingHorizontal: leftIcon ? theme.spacing['1'] : sizeStyles[size].paddingHorizontal,
      },
      iconContainer: {
        paddingHorizontal: theme.spacing['2'],
      },
    };
  };

  const styles = getInputStyles();

  return (
    <View style={[containerStyle]}>
      {label && (
        <View style={{ flexDirection: 'row', marginBottom: theme.spacing['1.5'] }}>
          <Text variant="body2" weight="medium" color="foreground">
            {label}
          </Text>
          {required && (
            <Text
              variant="body2"
              weight="bold"
              color="custom"
              customColor={theme.colors.destructive}
            >
              {' *'}
            </Text>
          )}
        </View>
      )}

      <View style={styles.container}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, style]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.mutedForeground}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            disabled={!onRightIconPress}
            onPress={onRightIconPress}
            style={styles.iconContainer}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {(error || hint) && (
        <Text
          variant="caption"
          color="custom"
          customColor={error ? theme.colors.destructive : theme.colors.mutedForeground}
          style={{ marginTop: theme.spacing['1'] }}
        >
          {error || hint}
        </Text>
      )}
    </View>
  );
}

export default Input;
