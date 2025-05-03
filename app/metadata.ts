import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'WithMe | Plan Group Travel Together',
  description:
    'The modern group travel planner that makes planning trips with friends and family a breeze.',
  icons: {
    icon: '/favicon.ico',
    // apple: "/icons/apple-touch-icon.png", // Temporarily commented out
  },
  // manifest: "/manifest.json", // Temporarily commented out
  appleWebApp: {
    title: 'WithMe Travel',
    statusBarStyle: 'default',
    capable: true,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
};
