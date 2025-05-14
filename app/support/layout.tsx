import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support withme.travel',
  description: 'Help us build the future of group travel planning',
  appleWebApp: {
    title: 'WithMe Support',
    statusBarStyle: 'default',
    capable: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-touch-icon-precomposed.png' },
    ],
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
