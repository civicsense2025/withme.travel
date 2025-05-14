'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Tab {
  value: string;
  label: string;
  content: ReactNode;
}

interface TripTabsWrapperProps {
  tabs: Tab[];
  defaultValue: string;
}

export function TripTabsWrapper({ tabs, defaultValue }: TripTabsWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get current tab from URL or use default
  const currentTab = searchParams?.get('tab') || defaultValue;
  
  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('tab', value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  // Effect to sync URL to tab when URL changes externally
  useEffect(() => {
    // If the tab doesn't exist in our tabs array, set to default
    if (!tabs.some(tab => tab.value === currentTab)) {
      handleTabChange(defaultValue);
    }
  }, [currentTab, defaultValue, tabs]);
  
  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="flex justify-center mb-6">
        {tabs.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value} className="animate-in fade-in-50">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
