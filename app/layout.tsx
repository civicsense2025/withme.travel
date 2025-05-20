import '@/app/globals.css'; // Keep this for dev mode

import { cn } from '@/lib/utils';
import { Providers } from '@/app/providers';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { VercelAnalytics } from './vercel-analytics';
import Script from 'next/script';
import { ClientSideProviders } from '@/components/features/layout/organisms/ClientSideProviders';
import Navbar from '@/components/layout/Navbar';
import { Footer } from '@/components/features/layout/organisms/footer';
import { LayoutModeProvider } from './context/layout-mode-context';
import { ClientSideLayoutRenderer } from '@/components/features/layout/organisms/ClientSideLayoutRenderer';
import { ToastProvider } from '@/components/ui/toast';
import { helveticaNeue } from './fonts';
import { PageContainer } from '@/components/features/layout/molecules/PageContainer';
import { SearchProvider } from '@/contexts/search-context';
import { ThemeProvider } from '@/components/ui/theme-provider';
import React from 'react';
import { createServerComponentClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
// Metadata is imported from app/metadata.ts
export const metadata = {
  title: 'WithMe Travel - Plan Group Travel Together',
  description:
    'The easiest way to plan group trips. Organize travel with friends, family, or coworkers. Vote on activities, manage itineraries, and share expenses.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerComponentClient();
  
  let user = null;
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    console.error('Error fetching user:', error);
  }

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

        {/* <link rel="apple-touch-startup-image" href="/splash/apple-splashU2048U2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" /> */}
        {/* <link rel="apple-touch-startup-image" href="/splash/apple-splashU1668U2388.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" /> */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1536x2048.png"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1125x2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1242x2688.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-828x1792.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-750x1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-640x1136.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
      </head>
      <body
        className={cn('min-h-screen bg-background font-sans', helveticaNeue.variable)}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          <TooltipProvider>
         
              <LayoutModeProvider>
                <ClientSideProviders>
                  <ClientSideLayoutRenderer>
                    <Navbar />
                    {children}
                    
                  </ClientSideLayoutRenderer>
                </ClientSideProviders>
              </LayoutModeProvider>
           
          </TooltipProvider>
          <ToastProvider>
            <Analytics />
            <SpeedInsights />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
