import { Dimensions } from 'react-native';
import * as colors from '../constants/colors';
import { typography } from '../constants/typography';
import { spacing } from '../constants/spacing';
import { borders } from '../constants/borders';
import { shadows } from '../constants/shadows';

// Get screen dimensions
// const { width } = Dimensions.get('window'); // Removed unused import

// Export color type for TypeScript usage
export type ColorThemeSchema = typeof colors.lightColors; // Corrected to use imported colors

export const lightTheme = {
  isDark: false,
  colors: colors.lightColors,
  typography,
  spacing,
  borders,
  shadows,
  borderRadius: borders.radius, // Convenience alias
};

export const darkTheme = {
  isDark: true,
  colors: colors.darkColors,
  typography,
  spacing,
  borders,
  shadows,
  borderRadius: borders.radius, // Convenience alias
};
