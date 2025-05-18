import '@/app/globals.css'; // Keep this for dev mode

import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { VercelAnalytics } from './vercel-analytics';
import Script from 'next/script';
import { ClientSideProviders } from '@/components/client-side-providers';
import Navbar from '@/components/layout/Navbar';
import { Footer } from '@/components/footer';
import { LayoutModeProvider } from './context/layout-mode-context';
import { ClientSideLayoutRenderer } from '@/components/client-side-layout-renderer';
import { Toaster } from '@/components/ui/toaster';
import { helveticaNeue } from './fonts';
import { Container } from '@/components/container';
import { SearchProvider } from '@/contexts/search-context';
import { ThemeProvider } from '@/components/theme-provider';
import React from 'react';
import { ServerAuthProvider } from '@/components/server-auth-provider';

// Metadata is imported from app/metadata.ts
export const metadata = {
  title: 'WithMe Travel - Plan Group Travel Together',
  description:
    'The easiest way to plan group trips. Organize travel with friends, family, or coworkers. Vote on activities, manage itineraries, and share expenses.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn('font-sans antialiased', helveticaNeue.variable)}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />

        <meta name="application-name" content="WithMe Travel" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WithMe Travel" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png" />

        {/* <link rel="apple-touch-startup-image" href="/splash/apple-splash-2048-2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" /> */}
        {/* <link rel="apple-touch-startup-image" href="/splash/apple-splash-1668-2388.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" /> */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1536-2048.png"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1125-2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1242-2688.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-828-1792.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-750-1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-640-1136.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
      </head>
      <body
        className={cn('min-h-screen bg-background font-sans', helveticaNeue.variable)}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          <TooltipProvider>
            <ServerAuthProvider>
              <LayoutModeProvider>
                <ClientSideProviders>
                  <ClientSideLayoutRenderer>
                    <Navbar />
                    {children}
                  </ClientSideLayoutRenderer>
                </ClientSideProviders>
              </LayoutModeProvider>
            </ServerAuthProvider>
          </TooltipProvider>
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
