import { STATUS_COLORS, BUDGET_CATEGORY_COLORS } from './colors';

export const COLORS = {
  light: {
    ...BUDGET_CATEGORY_COLORS,
    ...STATUS_COLORS,
    PRIMARY: '#7c83fd', // pastel indigo
    SECONDARY: '#6ad7e5', // pastel cyan
    ACCENT: '#fcb1a6', // pastel coral
    BACKGROUND: '#f8fafc', // very light pastel blue-gray
    SURFACE: '#f4f6fb', // even lighter pastel
    TEXT: '#232946', // deep muted blue
    MUTED: '#8a8fa3', // muted blue-gray
    BORDER: '#e3e8f0', // soft border
    FOCUS: 'rgba(124, 131, 253, 0.18)', // pastel indigo focus
    SUBTLE: '#e9eaf6', // subtle pastel
    GRADIENT: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  },
  dark: {
    ...BUDGET_CATEGORY_COLORS,
    ...STATUS_COLORS,
    PRIMARY: '#a5b4fc', // lighter pastel indigo
    SECONDARY: '#67e8f9', // lighter pastel cyan
    ACCENT: '#fca5a5', // pastel red
    BACKGROUND: '#000000', // deep blue-black
    SURFACE: '#000000', // deep muted blue
    TEXT: '#f4f6fb', // near-white
    MUTED: '#a1a7bb', // muted blue-gray
    BORDER: '#2e3140', // soft dark border
    FOCUS: 'rgba(165, 180, 252, 0.18)', // pastel indigo focus
    SUBTLE: '#232946', // subtle dark pastel
    GRADIENT: 'linear-gradient(135deg, #232946 0%, #7c83fd 100%)',
  },
} as const;

export type ThemeMode = 'light' | 'dark';

export function getColorToken(
  color: keyof (typeof COLORS)['light'],
  mode: ThemeMode = 'light'
): string {
  return COLORS[mode][color] ?? COLORS.light[color];
}

export const RADII = {
  sm: '12px',
  md: '18px',
  lg: '28px',
  xl: '36px',
  '2xl': '48px',
  full: '9999px',
} as const;

export const SPACING = {
  '0': '0',
  '1': '0.5rem',
  '2': '1rem',
  '3': '1.5rem',
  '4': '2rem',
  '5': '2.5rem',
  '6': '3rem',
  '8': '4rem',
  '10': '5rem',
  '12': '6rem',
  '16': '8rem',
  '20': '10rem',
  '24': '12rem',
} as const;

export const SHADOWS = {
  sm: '0 2px 8px 0 rgba(124, 131, 253, 0.06)',
  md: '0 6px 24px 0 rgba(124, 131, 253, 0.09), 0 1.5px 6px 0 rgba(124, 131, 253, 0.04)',
  lg: '0 12px 32px 0 rgba(124, 131, 253, 0.13), 0 3px 12px 0 rgba(124, 131, 253, 0.07)',
  xl: '0 24px 48px 0 rgba(124, 131, 253, 0.16), 0 6px 24px 0 rgba(124, 131, 253, 0.09)',
  inner: 'inset 0 0 12px rgba(124, 131, 253, 0.08)',
} as const;

export const TYPOGRAPHY = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
  h1: {
    fontSize: { base: '3rem', sm: '3.5rem', md: '4rem' },
    fontWeight: 700,
    lineHeight: 1.08,
    letterSpacing: '-0.03em',
  },
  h2: {
    fontSize: { base: '2.25rem', sm: '2.5rem', md: '3rem' },
    fontWeight: 600,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontSize: { base: '1.75rem', sm: '2rem', md: '2.25rem' },
    fontWeight: 600,
    lineHeight: 1.22,
    letterSpacing: '-0.015em',
  },
  body: {
    fontSize: { base: '1.25rem', sm: '1.35rem', md: '1.45rem' },
    fontWeight: 400,
    lineHeight: 1.7,
    letterSpacing: '-0.01em',
  },
  caption: {
    fontSize: { base: '1rem', sm: '1.05rem', md: '1.1rem' },
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '-0.005em',
  },
} as const;

// Helper function to get responsive typography size
export function getResponsiveSize(
  sizes: { base: string; sm: string; md: string },
  screenSize: 'base' | 'sm' | 'md' = 'base'
): string {
  return sizes[screenSize];
}
