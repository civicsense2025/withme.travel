const plugin = require('tailwindcss/plugin');
const tailwindcssAnimate = require('tailwindcss-animate');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'], // Support both class and data-theme for Storybook
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx,css}',
    './styles/**/*.{ts,tsx,css}',
    './src/**/*.{ts,tsx,js,jsx,mdx}',
    './.storybook/**/*.{js,ts,jsx,tsx,mdx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: '',
  // Explicitly enable core plugins to ensure they're not being disabled
  corePlugins: {
    gridTemplateColumns: true,
    gridTemplateRows: true,
    gridColumn: true,
    gridRow: true,
    gridAutoFlow: true,
    gridAutoColumns: true,
    gridAutoRows: true,
    gap: true,
    display: true,
    flexDirection: true,
  },
  // Safelist critical utilities to prevent purging
  safelist: [
    'grid',
    'grid-cols-1',
    'grid-cols-2',
    'grid-cols-3',
    'md:grid-cols-3',
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        // No max-width constraint for full-width layout
      },
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '2rem', // 32px
      '4xl': '2.5rem', // 40px
      '5xl': '3rem', // 48px
      '6xl': '3.75rem', // 60px
      '7xl': '4.5rem', // 72px
      '8xl': '6rem', // 96px
      '9xl': '8rem', // 128px
    },
    extend: {
      // Enhanced Grid Settings
      gridTemplateColumns: {
        // Simple 12 column grid
        '12': 'repeat(12, minmax(0, 1fr))',
        // Fixed width column grids for strict designs
        'auto-fill-sm': 'repeat(auto-fill, minmax(12rem, 1fr))',
        'auto-fill-md': 'repeat(auto-fill, minmax(18rem, 1fr))',
        'auto-fill-lg': 'repeat(auto-fill, minmax(24rem, 1fr))',
      },
      gridTemplateRows: {
        'auto-min': 'auto min-content',
        'min-auto': 'min-content auto',
      },
      gap: {
        '11': '2.75rem',
        '13': '3.25rem',
        '15': '3.75rem',
      },
      // Layout specific utilities
      layout: {
        'section': {
          'padding-top': '4rem',
          'padding-bottom': '4rem',
        },
        'section-lg': {
          'padding-top': '6rem',
          'padding-bottom': '6rem',
        },
        'section-xl': {
          'padding-top': '8rem',
          'padding-bottom': '8rem',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-helvetica-neue)',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      fontWeight: {
        thin: 'var(--font-weight-thin)',
        ultralight: 'var(--font-weight-ultralight)',
        light: 'var(--font-weight-light)',
        normal: 'var(--font-weight-regular)',
        medium: 'var(--font-weight-medium)',
        bold: 'var(--font-weight-bold)',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Brand colors
        'travel-purple': {
          DEFAULT: 'hsl(var(--travel-purple))',
          dark: 'hsl(var(--travel-purple-dark))',
        },
        'travel-blue': {
          DEFAULT: 'hsl(var(--travel-blue))',
          dark: 'hsl(var(--travel-blue-dark))',
        },
        'travel-pink': {
          DEFAULT: 'hsl(var(--travel-pink))',
          dark: 'hsl(var(--travel-pink-dark))',
        },
        'travel-yellow': {
          DEFAULT: 'hsl(var(--travel-yellow))',
          dark: 'hsl(var(--travel-yellow-dark))',
        },
        'travel-mint': {
          DEFAULT: 'hsl(var(--travel-mint))',
          dark: 'hsl(var(--travel-mint-dark))',
        },
        'travel-peach': {
          DEFAULT: 'hsl(var(--travel-peach))',
          dark: 'hsl(var(--travel-peach-dark))',
        },
        // Category colors - remaining color configuration...
        accommodation: {
          DEFAULT: '#9f66e6',
          dark: '#8c52e0',
        },
        food: {
          DEFAULT: '#5ec489',
          dark: '#4eb377',
        },
        transportation: {
          DEFAULT: '#f2a742',
          dark: '#e69933',
        },
        activities: {
          DEFAULT: '#42bce6',
          dark: '#33aee0',
        },
        shopping: {
          DEFAULT: '#e66699',
          dark: '#e05285',
        },
        other: {
          DEFAULT: '#8899aa',
          dark: '#778899',
        },
        // Neutral colors
        surface: {
          DEFAULT: '#fafafa',
          dark: '#262626',
        },
        'text-primary': {
          DEFAULT: '#0f172a',
          dark: '#fafafa',
        },
        'text-secondary': {
          DEFAULT: '#475569',
          dark: '#a3a3a3',
        },
        'border-base': {
          DEFAULT: '#e2e8f0',
          dark: '#404040',
        },
        focus: {
          DEFAULT: '#e0ccff',
          dark: '#442299',
        },
        subtle: {
          DEFAULT: '#f5f7fa',
          dark: '#333333',
        },
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 2px 8px rgba(0, 0, 0, 0.1)',
        lg: '0 4px 12px rgba(0, 0, 0, 0.15)',
        xl: '0 8px 16px rgba(0, 0, 0, 0.2)',
      },
      keyframes: {
        // Existing keyframes...
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '75%, 100%': { transform: 'scale(2)', opacity: 0 },
        },
        'gradient-shift': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
      animation: {
        // Existing animations...
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        float: 'float 3s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'ping-slow': 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    plugin(({ addUtilities, addComponents }) => {
      // Add custom utilities
      addUtilities({
        '.text-outline': {
          'text-shadow': '0 0 1px rgba(0, 0, 0, 0.5)',
        },
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.transition-default': {
          'transition-property': 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
          'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
          'transition-duration': '150ms',
        },
        // Force critical layout properties that might be missing
        '.grid': {
          'display': 'grid !important',
        },
        '.flex': {
          'display': 'flex !important',
        },
        '.flex-col': {
          'flex-direction': 'column !important',
        },
        '.items-center': {
          'align-items': 'center !important',
        },
        '.justify-center': {
          'justify-content': 'center !important',
        },
      });
      
      // Add section components
      addComponents({
        '.section': {
          'padding-top': '4rem',
          'padding-bottom': '4rem',
          'width': '100%',
        },
        '.section-lg': {
          'padding-top': '6rem',
          'padding-bottom': '6rem',
          'width': '100%',
        },
        '.section-xl': {
          'padding-top': '8rem',
          'padding-bottom': '8rem',
          'width': '100%',
        },
        '.section-inner': {
          'width': '100%',
          'margin-left': 'auto',
          'margin-right': 'auto',
          'padding-left': '1rem',
          'padding-right': '1rem',
        },
      });
    }),
  ],
};