'use client';
import { useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export function TripTabsWrapper({ tabs, defaultValue, className = "", tabsContentClassName = "" }) {
    var _a;
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    // Get current tab from URL or use default
    const currentTab = searchParams.get('tab') || defaultValue || ((_a = tabs[0]) === null || _a === void 0 ? void 0 : _a.value);
    // Refs for touch handling
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    // Handle tab change and update URL
    const handleTabChange = (value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', value);
        router.push(`${pathname}?${params.toString()}`);
    };
    // Touch event handlers for swipe navigation
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
        touchEndX.current = e.changedTouches[0].clientX;
        handleSwipe();
    };
    const handleSwipe = () => {
        const swipeThreshold = 75; // Minimum swipe distance to trigger tab change
        const swipeDistance = touchEndX.current - touchStartX.current;
        if (Math.abs(swipeDistance) < swipeThreshold)
            return;
        const tabIndex = tabs.findIndex(tab => tab.value === currentTab);
        if (tabIndex === -1)
            return;
        // Swipe right (positive distance) -> previous tab, Swipe left (negative) -> next tab
        const newTabIndex = swipeDistance > 0
            ? Math.max(0, tabIndex - 1)
            : Math.min(tabs.length - 1, tabIndex + 1);
        handleTabChange(tabs[newTabIndex].value);
    };
    return (<Tabs value={currentTab} onValueChange={handleTabChange} className={`w-full ${className}`}>
      {/* Scrollable tabs list with visual overflow indicator on mobile */}
      <div className="relative w-full mb-6 md:mb-8 overflow-hidden">
        <TabsList className="flex w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory no-scrollbar">
          {tabs.map((tab) => (<TabsTrigger key={tab.value} value={tab.value} className="flex-1 min-w-[25%] snap-start text-sm whitespace-nowrap">
              {tab.label}
            </TabsTrigger>))}
        </TabsList>
        
        {/* Subtle fade effect to indicate scrollability */}
        <div className="absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden"></div>
      </div>
      
      {/* Tab content with touch event handlers */}
      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className={`w-full ${tabsContentClassName}`}>
        {tabs.map((tab) => (<TabsContent key={tab.value} value={tab.value} className="mt-6 md:mt-8 transition-all duration-300 ease-in-out">
            {tab.content}
          </TabsContent>))}
      </div>
    </Tabs>);
}
