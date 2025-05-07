'use client';
import React from 'react';
import { useLayoutMode } from '@/app/context/layout-mode-context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

interface ClientSideLayoutRendererProps {
  children: React.ReactNode;
}

export function ClientSideLayoutRenderer({ children }: ClientSideLayoutRendererProps) {
  const { fullscreen } = useLayoutMode();

  if (fullscreen) {
    return (
      <div
        id="main-content"
        className="w-screen h-screen min-h-screen bg-background overflow-hidden font-sans text-lg"
        tabIndex={-1}
        style={{ margin: 0, padding: 0 }}
      >
        {children}
      </div>
    );
  }

  // Regular layout: Navbar, container, Footer
  return (
    <>
      <div className="w-full font-sans text-lg">
        <Navbar />
        <div id="main-content" className="min-h-[calc(100vh-4rem-4rem)] w-full px-4 md:px-8 font-sans text-lg" tabIndex={-1}>
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
}