'use client';
import React from 'react';
import { useLayoutMode } from '@/app/context/layout-mode-context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { cn } from '@/lib/utils';

interface ClientSideLayoutRendererProps {
  children: React.ReactNode;
}

export function ClientSideLayoutRenderer({ children }: ClientSideLayoutRendererProps) {
  const { fullscreen } = useLayoutMode();

  if (fullscreen) {
    return (
      <div
        id="main-content"
        className={cn(
          'flex flex-col w-full h-screen min-h-screen bg-background overflow-hidden font-sans text-lg max-w-none',
          'fullscreen-layout'
        )}
        tabIndex={-1}
      >
        {children}
      </div>
    );
  }

  // Regular layout: Navbar, container, Footer
  return (
    <>
      <div className="w-full font-sans text-lg flex flex-col min-h-screen">
        <Navbar />
        <main
          id="main-content"
          className="flex-grow w-full px-0 pt-0 pb-6 font-sans text-lg"
          tabIndex={-1}
        >
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
