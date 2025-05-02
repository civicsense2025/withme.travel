export const lightColors = {
  background: 'hsl(0 0% 100%)', // --background
  foreground: 'hsl(222.2 84% 4.9%)', // --foreground
  card: 'hsl(0 0% 100%)', // --card
  cardForeground: 'hsl(222.2 84% 4.9%)', // --card-foreground
  popover: 'hsl(0 0% 100%)', // --popover
  popoverForeground: 'hsl(222.2 84% 4.9%)', // --popover-foreground

  primary: 'hsl(260 100% 82%)', // --primary (Travel Purple based)
  primaryForeground: 'hsl(260 100% 20%)', // --primary-foreground

  secondary: 'hsl(210 40% 96.1%)', // --secondary
  secondaryForeground: 'hsl(222.2 47.4% 11.2%)', // --secondary-foreground

  accent: 'hsl(213 100% 75%)', // --accent (Travel Blue based)
  accentForeground: 'hsl(213 100% 20%)', // --accent-foreground

  muted: 'hsl(210 40% 96.1%)', // --muted
  mutedForeground: 'hsl(215.4 16.3% 46.9%)', // --muted-foreground

  destructive: 'hsl(0 84.2% 60.2%)', // --destructive
  destructiveForeground: 'hsl(210 40% 98%)', // --destructive-foreground

  border: 'hsl(214.3 31.8% 91.4%)', // --border
  input: 'hsl(214.3 31.8% 91.4%)', // --input (Background for input)
  inputForeground: 'hsl(222.2 84% 4.9%)', // Text color for input
  ring: 'hsl(260 100% 82%)', // --ring (Focus indicator color)

  // Custom colors (example, add more as needed)
  white: '#FFFFFF',
  black: '#000000',

  // Travel Theme Colors
  travelBlue: 'hsl(213 100% 75%)',
  travelBlueForeground: 'hsl(213 100% 15%)',
  travelPink: 'hsl(348 100% 86%)',
  travelPinkForeground: 'hsl(348 100% 20%)',
  travelYellow: 'hsl(48 100% 75%)',
  travelYellowForeground: 'hsl(48 100% 18%)',
  travelPurple: 'hsl(260 100% 82%)',
  travelPurpleForeground: 'hsl(260 100% 20%)',
  travelMint: 'hsl(160 100% 82%)',
  travelMintForeground: 'hsl(160 100% 18%)',
  travelPeach: 'hsl(30 100% 82%)',
  travelPeachForeground: 'hsl(30 100% 20%)',
};

export const darkColors = {
  background: 'hsl(0 0% 0%)', // --background
  foreground: 'hsl(0 0% 98%)', // --foreground
  card: 'hsl(0 0% 10%)', // --card
  cardForeground: 'hsl(0 0% 98%)', // --card-foreground
  popover: 'hsl(0 0% 5%)', // --popover
  popoverForeground: 'hsl(0 0% 98%)', // --popover-foreground

  primary: 'hsl(260 70% 70%)', // --primary
  primaryForeground: 'hsl(260 100% 20%)', // --primary-foreground (Kept dark for contrast on vibrant bg)

  secondary: 'hsl(0 0% 15%)', // --secondary
  secondaryForeground: 'hsl(0 0% 98%)', // --secondary-foreground

  accent: 'hsl(213 70% 65%)', // --accent
  accentForeground: 'hsl(213 100% 20%)', // --accent-foreground (Kept dark)

  muted: 'hsl(0 0% 15%)', // --muted
  mutedForeground: 'hsl(0 0% 65%)', // --muted-foreground

  destructive: 'hsl(0 62.8% 50%)', // --destructive
  destructiveForeground: 'hsl(0 0% 98%)', // --destructive-foreground

  border: 'hsl(0 0% 20%)', // --border
  input: 'hsl(0 0% 20%)', // --input (Background for input)
  inputForeground: 'hsl(0 0% 98%)', // Text color for input
  ring: 'hsl(260 70% 70%)', // --ring

  // Custom colors (example, add more as needed)
  white: '#FFFFFF',
  black: '#000000',

  // Travel Theme Colors (Foregrounds adjusted for dark mode)
  travelBlue: 'hsl(213 100% 75%)', // Base color remains same
  travelBlueForeground: 'hsl(213 100% 85%)', // Adjusted foreground
  travelPink: 'hsl(348 100% 86%)',
  travelPinkForeground: 'hsl(348 100% 90%)',
  travelYellow: 'hsl(48 100% 75%)',
  travelYellowForeground: 'hsl(48 100% 85%)',
  travelPurple: 'hsl(260 100% 82%)',
  travelPurpleForeground: 'hsl(260 100% 90%)',
  travelMint: 'hsl(160 100% 82%)',
  travelMintForeground: 'hsl(160 100% 90%)',
  travelPeach: 'hsl(30 100% 82%)',
  travelPeachForeground: 'hsl(30 100% 90%)',
};

export type ColorTheme = typeof lightColors;
