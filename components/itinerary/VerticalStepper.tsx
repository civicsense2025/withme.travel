'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StepperSection {
  id: string;
  title: string;
}

interface VerticalStepperProps {
  sections: StepperSection[];
  activeSection?: string;
  onSectionClick?: (sectionId: string) => void;
}

export function VerticalStepper({ 
  sections, 
  activeSection, 
  onSectionClick 
}: VerticalStepperProps) {
  const [currentSection, setCurrentSection] = useState<string | undefined>(activeSection);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Watch scroll position to update active section and show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      // Determine which section is currently in view
      const sectionElements = sections.map(section => {
        return {
          id: section.id,
          element: document.getElementById(section.id)
        };
      }).filter(item => item.element);

      if (sectionElements.length > 0) {
        const scrollPosition = window.scrollY + 100; // Add offset for header

        // Find the section that's currently visible
        let activeSection = sectionElements[0].id;
        for (const section of sectionElements) {
          if (section.element && section.element.offsetTop <= scrollPosition) {
            activeSection = section.id;
          } else {
            break;
          }
        }

        setCurrentSection(activeSection);
      }

      // Show scroll to top button when scrolled down
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sections]);

  // Handle clicking on a section to scroll to it
  const handleSectionClick = (sectionId: string) => {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      const yOffset = -80; // Offset for fixed header
      const y = sectionElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    
    if (onSectionClick) {
      onSectionClick(sectionId);
    }
  };

  // Handle scroll to top
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <TooltipProvider>
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10">
        <div className="flex flex-col items-center space-y-4 rounded-full p-2">
          {/* Scroll to top button */}
          {showScrollToTop && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-full bg-background/80 shadow-sm border border-border/30"
              onClick={handleScrollToTop}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
          
          {/* Section indicators with connecting line */}
          <div className="relative">
            {/* Vertical line connecting all steps */}
            {sections.length > 1 && (
              <div className="absolute top-4 bottom-4 left-1/2 w-0.5 bg-muted -translate-x-1/2 z-0" />
            )}
            
            {/* Section indicators */}
            <div className="flex flex-col items-center space-y-4">
              {sections.map((section, index) => {
                const isActive = currentSection === section.id;
                
                return (
                  <Tooltip key={section.id}>
                    <TooltipTrigger asChild>
                      <a
                        href={`#${section.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSectionClick(section.id);
                        }}
                        className={cn(
                          "w-8 h-8 flex items-center justify-center transition-all rounded-full",
                          "relative z-10 text-xs font-medium",
                          "border border-border/30 shadow-sm",
                          isActive ? 
                            "bg-primary text-primary-foreground" : 
                            "bg-background text-muted-foreground hover:bg-primary/10"
                        )}
                      >
                        {index + 1}
                        <span className="sr-only">{section.title}</span>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="left" align="center" className="bg-popover text-popover-foreground text-sm px-3 py-1.5">
                      {section.title}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
} 