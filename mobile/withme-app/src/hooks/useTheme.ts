import { useColorScheme } from 'react-native';
import { 
  lightTheme, 
  darkTheme
} from '../constants/theme';

// Define the Theme interface
// Ensure this matches the structure of lightTheme/darkTheme
export interface AppTheme {
  isDark: boolean;
  colors: typeof lightTheme.colors; // Use the structure from the imported theme
  typography: typeof lightTheme.typography;
  spacing: typeof lightTheme.spacing;
  borderRadius: typeof lightTheme.borderRadius;
  shadows: typeof lightTheme.shadows;
  getResponsiveSize: (size: number) => number; // Removed unused factor
}

/**
 * Hook to access the current theme based on device color scheme
 * @returns {AppTheme} The current theme
 */
export function useTheme(): AppTheme {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Select theme based on the current color scheme
  const currentTheme = isDark ? darkTheme : lightTheme;

  // Define responsiveSize function here since it's not exported directly
  const getResponsiveSize = (size: number): number => { // Removed unused factor
    return size + (0.5 * size) / 100; // Use default factor 0.5
  };

  return {
    ...currentTheme, // Spread the selected theme
    getResponsiveSize,
  };
}
