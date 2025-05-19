import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileStepperProps {
  sections: { id: string; title: string }[];
  currentSection?: string;
  currentIndex: number;
  showScrollToTop: boolean;
  goToPrevSection: () => void;
  goToNextSection: () => void;
  handleSectionClick: (sectionId: string) => void;
  handleScrollToTop: () => void;
}

export function MobileStepper({
  sections,
  currentSection,
  currentIndex,
  showScrollToTop,
  goToPrevSection,
  goToNextSection,
  handleSectionClick,
  handleScrollToTop,
}: MobileStepperProps) {
  // Always use props for current section/index
  const currentTitle = sections[currentIndex]?.title || '';

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 w-[95vw] max-w-md md:hidden pointer-events-none">
      <div className="pointer-events-auto flex flex-col bg-background border border-border shadow-xl rounded-2xl px-3 py-2">
        {/* Progress tracker */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={goToPrevSection}
            disabled={currentIndex <= 0}
            aria-label="Previous section"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 overflow-x-auto px-2 py-1 no-scrollbar">
            <div className="flex items-center justify-center space-x-2">
              {sections.map((section, index) => {
                const isActive = index === currentIndex;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className={cn(
                      'transition-all h-2 rounded-full min-w-[1rem]',
                      isActive ? 'bg-primary w-4' : 'bg-muted hover:bg-primary/30 w-2'
                    )}
                    aria-label={section.title}
                  />
                );
              })}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={goToNextSection}
            disabled={currentIndex >= sections.length - 1}
            aria-label="Next section"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Section title and scroll to top */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="text-xs font-medium truncate max-w-[70vw]">{currentTitle}</div>
          {showScrollToTop && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full"
              onClick={handleScrollToTop}
            >
              <ChevronUp className="h-4 w-4 mr-1" />
              <span className="text-xs">Top</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
