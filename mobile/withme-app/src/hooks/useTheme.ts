import { useColorScheme } from 'react-native';
import {
  lightColors,
  darkColors,
  Typography as typography,
  Spacing as spacing,
  BorderRadius as borderRadius,
  Shadows as shadows,
  Animation,
} from '../constants/theme';

// Define the Theme interface
export interface AppTheme {
  isDark: boolean;
  colors: typeof lightColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  getResponsiveSize: (size: number, factor?: number) => number;
}

/**
 * Hook to access the current theme based on device color scheme
 * @returns {AppTheme} The current theme
 */
export function useTheme(): AppTheme {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Select colors based on the current color scheme
  const colors = isDark ? darkColors : lightColors;

  // Define responsiveSize function here since it's not exported directly
  const getResponsiveSize = (size: number, factor = 0.5): number => {
    return size;
  };

  return {
    isDark,
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    getResponsiveSize,
  };
}
