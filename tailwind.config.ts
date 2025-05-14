import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx,css}',
    './src/**/*.{ts,tsx}',
    './.storybook/**/*.{js,ts,jsx,tsx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: ['border-border', 'bg-background', 'text-foreground'],
  prefix: '',
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
      fontFamily: {
        sans: [
          'var(--font-helvetica-neue)',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
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
        // Category colors
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
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'pulse-soft-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-100% 0' },
          '100%': { backgroundPosition: '100% 0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'spin-safari-fix': {
          '0%': {
            transform: 'rotate(0deg) translateZ(0)',
            backfaceVisibility: 'hidden',
            perspective: '1000px',
            willChange: 'transform',
          },
          '100%': {
            transform: 'rotate(360deg) translateZ(0)',
            backfaceVisibility: 'hidden',
            perspective: '1000px',
            willChange: 'transform',
          },
        },
        'bounce-horizontal': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(10px)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bubble-pop': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '70%': { transform: 'scale(1.1)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        sparkle: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1) rotate(180deg)', opacity: '1' },
          '100%': { transform: 'scale(0) rotate(360deg)', opacity: '0' },
        },
        'heart-beat': {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.2)' },
          '50%': { transform: 'scale(1)' },
          '75%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        float: 'float 3s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 4s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'pulse-soft-scale': 'pulse-soft-scale 2.5s ease-in-out infinite',
        shimmer: 'shimmer 3s infinite linear',
        'spin-slow': 'spin-slow 8s linear infinite',
        'spin-safari-fix': 'spin-safari-fix 1s linear infinite',
        'bounce-horizontal': 'bounce-horizontal 1s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'bubble-pop': 'bubble-pop 0.4s ease-out forwards',
        sparkle: 'sparkle 1.5s ease-in-out infinite',
        'heart-beat': 'heart-beat 1s ease-in-out',
      },
      backgroundImage: {
        'gradient-1': 'linear-gradient(to right, #e6f7ec, #d1f2dd)',
        'gradient-2': 'linear-gradient(to right, #d1f2dd, #e6f7ec)',
        'gradient-3': 'linear-gradient(to right, #e6f7ec, #c0edce)',
        'gradient-4': 'linear-gradient(to right, #d1f2dd, #e6f7ec)',
        // Dark mode gradients (black/gray)
        'dark-gradient-1': 'linear-gradient(to right, #000000, #121212)',
        'dark-gradient-2': 'linear-gradient(to bottom, #000000, #121212)',
        'dark-gradient-3': 'linear-gradient(135deg, #000000, #0a0a0a, #181818)',
        'dark-gradient-4': 'linear-gradient(to right, rgba(0,0,0,0.9), rgba(18,18,18,0.9))',
        // Tiptap-inspired gradients
        'tiptap-purple': 'linear-gradient(to right, #7c3aed, #8b5cf6)',
        'tiptap-blue': 'linear-gradient(to right, #3b82f6, #60a5fa)',
        'tiptap-dark': 'linear-gradient(to right, #000000, #181818)',
        'tiptap-gradient': 'linear-gradient(to right, #7c3aed, #3b82f6)',
        // Gradient for shimmer effect - subtle white/transparent overlay
        'shimmer-gradient':
          'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
      },
      backgroundSize: {
        '200%': '200% 100%',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities, theme }) {
      // Create border utilities
      addUtilities({
        '.border-border': { borderColor: theme('colors.border') },
      });

      // Add dark mode gradient utilities - they'll be accessible with dark: prefix
      addUtilities({
        '.bg-dark-gradient-1': { backgroundImage: theme('backgroundImage.dark-gradient-1') },
        '.bg-dark-gradient-2': { backgroundImage: theme('backgroundImage.dark-gradient-2') },
        '.bg-dark-gradient-3': { backgroundImage: theme('backgroundImage.dark-gradient-3') },
        '.bg-dark-gradient-4': { backgroundImage: theme('backgroundImage.dark-gradient-4') },
      });

      // Add Safari animation fixes
      addUtilities({
        '.safari-animation-fix': {
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          willChange: 'transform',
        },
      });

      // Add component classes for the design system
      addUtilities({
        '.btn-primary': {
          backgroundColor: theme('colors.travel-purple.DEFAULT'),
          color: 'white',
          fontWeight: '500',
          padding: '0.5rem 1rem',
          borderRadius: theme('borderRadius.md'),
          '&:hover': {
            backgroundColor: 'color-mix(in srgb, hsl(var(--travel-purple)) 90%, black)',
          },
          '&:focus': {
            outline: 'none',
            ringWidth: '2px',
            ringColor: theme('colors.focus.DEFAULT'),
          },
        },
        '.btn-secondary': {
          backgroundColor: 'transparent',
          color: theme('colors.travel-blue.DEFAULT'),
          fontWeight: '500',
          padding: '0.5rem 1rem',
          borderRadius: theme('borderRadius.md'),
          borderWidth: '1px',
          borderColor: theme('colors.travel-blue.DEFAULT'),
          '&:hover': {
            backgroundColor: 'color-mix(in srgb, hsl(var(--travel-blue)) 10%, transparent)',
          },
          '&:focus': {
            outline: 'none',
            ringWidth: '2px',
            ringColor: theme('colors.focus.DEFAULT'),
          },
        },
        '.btn-accent': {
          backgroundColor: theme('colors.travel-pink.DEFAULT'),
          color: theme('colors.text-primary.DEFAULT'),
          fontWeight: '500',
          padding: '0.5rem 1rem',
          borderRadius: theme('borderRadius.md'),
          '&:hover': {
            backgroundColor: 'color-mix(in srgb, hsl(var(--travel-pink)) 90%, black)',
          },
          '&:focus': {
            outline: 'none',
            ringWidth: '2px',
            ringColor: theme('colors.focus.DEFAULT'),
          },
        },
        '.card': {
          backgroundColor: theme('colors.surface.DEFAULT'),
          borderWidth: '1px',
          borderColor: theme('colors.border-base.DEFAULT'),
          borderRadius: theme('borderRadius.lg'),
          padding: '1rem',
          boxShadow: theme('boxShadow.md'),
        },
        '.input': {
          width: '100%',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
          borderWidth: '1px',
          borderColor: theme('colors.border-base.DEFAULT'),
          borderRadius: theme('borderRadius.md'),
          '&:focus': {
            outline: 'none',
            ringWidth: '2px',
            ringColor: theme('colors.focus.DEFAULT'),
          },
        },
        '.tag': {
          display: 'inline-block',
          backgroundColor: 'color-mix(in srgb, hsl(var(--travel-purple)) 20%, transparent)',
          color: theme('colors.travel-purple.DEFAULT'),
          paddingLeft: '0.5rem',
          paddingRight: '0.5rem',
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem',
          borderRadius: theme('borderRadius.full'),
          fontSize: theme('fontSize.sm'),
        },
      });
    }),
    require('tailwindcss-animate'),
  ],
} satisfies Config;

export default config;
