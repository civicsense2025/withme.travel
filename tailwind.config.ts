import type { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin"

const config = {
  darkMode: "class",
  content: ({
    files: [
      "./pages/**/*.{ts,tsx}",
      "./components/**/*.{ts,tsx}",
      "./app/**/*.{ts,tsx,css}",
      "./src/**/*.{ts,tsx}",
      "*.{js,ts,jsx,tsx,mdx}",
    ],
    safelist: ["border-border", "bg-background", "text-foreground"],
  } as any),
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "Times", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Travel theme colors
        travel: {
          blue: "hsl(var(--travel-blue))",
          pink: "hsl(var(--travel-pink))",
          yellow: "hsl(var(--travel-yellow))",
          purple: "hsl(var(--travel-purple))",
          mint: "hsl(var(--travel-mint))",
          peach: "hsl(var(--travel-peach))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "pulse-soft-scale": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
        shimmer: {
          '0%': { backgroundPosition: '-100% 0' },
          '100%': { backgroundPosition: '100% 0' },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "bounce-horizontal": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(10px)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "bubble-pop": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "70%": { transform: "scale(1.1)", opacity: "0.7" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "sparkle": {
          "0%": { transform: "scale(0) rotate(0deg)", opacity: "0" },
          "50%": { transform: "scale(1) rotate(180deg)", opacity: "1" },
          "100%": { transform: "scale(0) rotate(360deg)", opacity: "0" },
        },
        "heart-beat": {
          "0%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.2)" },
          "50%": { transform: "scale(1)" },
          "75%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "bounce-slow": "bounce-slow 4s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "pulse-soft-scale": "pulse-soft-scale 2.5s ease-in-out infinite",
        shimmer: "shimmer 3s infinite linear",
        "spin-slow": "spin-slow 8s linear infinite",
        "bounce-horizontal": "bounce-horizontal 1s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "bubble-pop": "bubble-pop 0.4s ease-out forwards",
        "sparkle": "sparkle 1.5s ease-in-out infinite",
        "heart-beat": "heart-beat 1s ease-in-out",
      },
      backgroundImage: {
        "gradient-1": "linear-gradient(to right, #e6f7ec, #d1f2dd)",
        "gradient-2": "linear-gradient(to right, #d1f2dd, #e6f7ec)",
        "gradient-3": "linear-gradient(to right, #e6f7ec, #c0edce)",
        "gradient-4": "linear-gradient(to right, #d1f2dd, #e6f7ec)",
        // Dark mode gradients (black/gray)
        "dark-gradient-1": "linear-gradient(to right, #000000, #121212)",
        "dark-gradient-2": "linear-gradient(to bottom, #000000, #121212)",
        "dark-gradient-3": "linear-gradient(135deg, #000000, #0a0a0a, #181818)",
        "dark-gradient-4": "linear-gradient(to right, rgba(0,0,0,0.9), rgba(18,18,18,0.9))",
        // Tiptap-inspired gradients
        "tiptap-purple": "linear-gradient(to right, #7c3aed, #8b5cf6)",
        "tiptap-blue": "linear-gradient(to right, #3b82f6, #60a5fa)",
        "tiptap-dark": "linear-gradient(to right, #000000, #181818)",
        "tiptap-gradient": "linear-gradient(to right, #7c3aed, #3b82f6)",
        // Gradient for shimmer effect - subtle white/transparent overlay
        "shimmer-gradient": "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
      },
      backgroundSize: {
        '200%': '200% 100%',
      },
    },
  },
  plugins: [
    plugin(function({ addUtilities, theme }) {
      // Create border utilities
      addUtilities({
        ".border-border": { borderColor: theme("colors.border") },
      });
      
      // Add dark mode gradient utilities - they'll be accessible with dark: prefix
      addUtilities({
        ".bg-dark-gradient-1": { backgroundImage: theme("backgroundImage.dark-gradient-1") },
        ".bg-dark-gradient-2": { backgroundImage: theme("backgroundImage.dark-gradient-2") },
        ".bg-dark-gradient-3": { backgroundImage: theme("backgroundImage.dark-gradient-3") },
        ".bg-dark-gradient-4": { backgroundImage: theme("backgroundImage.dark-gradient-4") },
      });
    }),
    require("tailwindcss-animate")
  ],
} satisfies Config

export default config
