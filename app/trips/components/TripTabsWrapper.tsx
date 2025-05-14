'use client';

import { ReactNode, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

interface TripTabsWrapperProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
  tabsContentClassName?: string;
}

export function TripTabsWrapper({
  tabs,
  defaultValue,
  className = '',
  tabsContentClassName = '',
}: TripTabsWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current tab from URL or use default
  const currentTab = searchParams?.get('tab') || defaultValue || tabs[0]?.value;

  // Refs for touch handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    // Create a new URLSearchParams, safely handling null searchParams
    const params = searchParams
      ? new URLSearchParams(searchParams.toString())
      : new URLSearchParams();
    params.set('tab', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Touch event handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 75; // Minimum swipe distance to trigger tab change
    const swipeDistance = touchEndX.current - touchStartX.current;

    if (Math.abs(swipeDistance) < swipeThreshold) return;

    const tabIndex = tabs.findIndex((tab) => tab.value === currentTab);
    if (tabIndex === -1) return;

    // Swipe right (positive distance) -> previous tab, Swipe left (negative) -> next tab
    const newTabIndex =
      swipeDistance > 0 ? Math.max(0, tabIndex - 1) : Math.min(tabs.length - 1, tabIndex + 1);

    handleTabChange(tabs[newTabIndex].value);
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className={`w-full ${className}`}>
      {/* Centered tabs list with visual overflow indicator on mobile */}
      <div className="relative w-full mb-4 md:mb-6 overflow-hidden flex justify-center">
        <div className="max-w-md w-auto overflow-x-auto whitespace-nowrap scrollbar-hide no-scrollbar px-1 md:px-2">
          <TabsList className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory no-scrollbar">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="whitespace-nowrap px-6">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Subtle fade effect to indicate scrollability */}
        <div className="absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden"></div>
      </div>

      {/* Tab content with touch event handlers */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`w-full ${tabsContentClassName}`}
      >
        {tabs.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="transition-all duration-300 ease-in-out"
          >
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
