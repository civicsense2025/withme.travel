'use client';

/**
 * ScrollArea (Molecule)
 *
 * A custom scrollable area with support for custom scrollbars,
 * scroll shadows, and other features.
 *
 * @module ui/molecules
 */
import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils';

export type ScrollAreaViewportRef = React.ElementRef<typeof ScrollAreaPrimitive.Viewport>;

export type ScrollAreaProps = React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
  /** Maximum viewport height */
  maxHeight?: number | string;
  /** Hide scrollbar when inactive */
  hideScrollbar?: boolean;
  /** Show scroll shadows */
  showShadows?: boolean;
  /** Show divider above scrollbar */
  scrollbarDivider?: boolean;
  /** Scrollbar thickness */
  scrollbarThickness?: number;
  /** Scrollbar styles */
  scrollbarClassName?: string;
  /** Scrollbar thumb styles */
  thumbClassName?: string;
  /** Viewport styles */
  viewportClassName?: string;
  /** Scrollbar orientation */
  orientation?: 'vertical' | 'horizontal' | 'both';
};

const ScrollArea = React.forwardRef<ScrollAreaViewportRef, ScrollAreaProps>(
  ({
    className,
    children,
    maxHeight,
    hideScrollbar = false,
    showShadows = false,
    scrollbarDivider = false,
    scrollbarThickness = 10,
    scrollbarClassName,
    thumbClassName,
    viewportClassName,
    orientation = 'vertical',
    ...props
  }, forwardedRef) => {
    // Refs for scroll and viewport elements
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [scrollPosition, setScrollPosition] = React.useState({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
    
    // Calculate scroll shadows
    const showTopShadow = showShadows && scrollPosition.top > 0;
    const showBottomShadow = showShadows && scrollPosition.bottom > 0;
    const showLeftShadow = showShadows && scrollPosition.left > 0;
    const showRightShadow = showShadows && scrollPosition.right > 0;
    
    // Track scroll position
    const handleScroll = React.useCallback(() => {
      if (!contentRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = contentRef.current;
      
      setScrollPosition({
        top: scrollTop,
        bottom: scrollHeight - clientHeight - scrollTop,
        left: scrollLeft,
        right: scrollWidth - clientWidth - scrollLeft,
      });
    }, []);
    
    // Set up scroll tracking
    React.useEffect(() => {
      const element = contentRef.current;
      if (!element || !showShadows) return;
      
      element.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
      
      return () => {
        element.removeEventListener('scroll', handleScroll);
      };
    }, [handleScroll, showShadows]);
    
    return (
      <div className={cn('relative', className)}>
        {/* Top shadow */}
        {showTopShadow && (
          <div
            className="absolute top-0 left-0 right-0 h-4 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%)',
              opacity: Math.min(1, scrollPosition.top / 20),
            }}
          />
        )}
        
        {/* Left shadow */}
        {showLeftShadow && (
          <div
            className="absolute top-0 left-0 bottom-0 w-4 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%)',
              opacity: Math.min(1, scrollPosition.left / 20),
            }}
          />
        )}
        
        <ScrollAreaPrimitive.Root
          className={cn('relative overflow-hidden', className)}
          {...props}
        >
          <ScrollAreaPrimitive.Viewport
            ref={(node) => {
              // Handle ref assignment
              if (typeof forwardedRef === 'function') {
                forwardedRef(node);
              } else if (forwardedRef) {
                forwardedRef.current = node;
              }
              
              // Also assign to our local ref
              contentRef.current = node;
            }}
            className={cn(
              'h-full w-full rounded-[inherit]',
              maxHeight && 'max-h-[--max-height]',
              viewportClassName
            )}
            style={
              maxHeight
                ? { '--max-height': typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight } as React.CSSProperties
                : undefined
            }
          >
            {children}
          </ScrollAreaPrimitive.Viewport>
          
          {/* Divider above vertical scrollbar */}
          {scrollbarDivider && (orientation === 'vertical' || orientation === 'both') && (
            <div
              className="absolute right-0 top-0 bottom-0 w-px bg-border"
              style={{ right: scrollbarThickness + 1 }}
            />
          )}
          
          {/* Vertical scrollbar */}
          {(orientation === 'vertical' || orientation === 'both') && (
            <ScrollBar
              orientation="vertical"
              thickness={scrollbarThickness}
              forceShow={!hideScrollbar}
              className={scrollbarClassName}
              thumbClassName={thumbClassName}
            />
          )}
          
          {/* Divider above horizontal scrollbar */}
          {scrollbarDivider && (orientation === 'horizontal' || orientation === 'both') && (
            <div
              className="absolute bottom-0 left-0 right-0 h-px bg-border"
              style={{ bottom: scrollbarThickness + 1 }}
            />
          )}
          
          {/* Horizontal scrollbar */}
          {(orientation === 'horizontal' || orientation === 'both') && (
            <ScrollBar
              orientation="horizontal"
              thickness={scrollbarThickness}
              forceShow={!hideScrollbar}
              className={scrollbarClassName}
              thumbClassName={thumbClassName}
            />
          )}
          
          <ScrollAreaPrimitive.Corner />
        </ScrollAreaPrimitive.Root>
        
        {/* Bottom shadow */}
        {showBottomShadow && (
          <div
            className="absolute bottom-0 left-0 right-0 h-4 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%)',
              opacity: Math.min(1, scrollPosition.bottom / 20),
            }}
          />
        )}
        
        {/* Right shadow */}
        {showRightShadow && (
          <div
            className="absolute top-0 right-0 bottom-0 w-4 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to left, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%)',
              opacity: Math.min(1, scrollPosition.right / 20),
            }}
          />
        )}
      </div>
    );
  }
);
ScrollArea.displayName = 'ScrollArea';

// ============================================================================
// SCROLLBAR COMPONENT
// ============================================================================

export interface ScrollBarProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> {
  /** Thickness of the scrollbar */
  thickness?: number;
  /** Whether to always show the scrollbar */
  forceShow?: boolean;
  /** Scrollbar thumb className */
  thumbClassName?: string;
}

const ScrollBar = React.forwardRef
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarProps
>(({
  className,
  thumbClassName,
  orientation = 'vertical',
  thickness = 10,
  forceShow = false,
  ...props
}, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' && `h-full w-[${thickness}px] border-l border-l-transparent p-[1px]`,
      orientation === 'horizontal' && `h-[${thickness}px] flex-col border-t border-t-transparent p-[1px]`,
      forceShow ? 'block' : 'opacity-0 transition duration-300 group-hover:opacity-100',
      className
    )}
    style={{
      width: orientation === 'vertical' ? thickness : undefined,
      height: orientation === 'horizontal' ? thickness : undefined,
    }}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb 
      className={cn(
        'relative flex-1 rounded-full bg-border hover:bg-border/80',
        thumbClassName
      )} 
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

// ============================================================================
// AUTO HEIGHT SCROLL AREA COMPONENT
// ============================================================================

export interface AutoHeightScrollAreaProps extends Omit<ScrollAreaProps, 'maxHeight'> {
  /** Maximum height in pixels or CSS value */
  maxAutoHeight?: number | string;
  /** Minimum height in pixels or CSS value */
  minHeight?: number | string;
}

const AutoHeightScrollArea = React.forwardRef
  ScrollAreaViewportRef,
  AutoHeightScrollAreaProps
>(({
  className,
  children,
  maxAutoHeight = 300,
  minHeight = 0,
  ...props
}, ref) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = React.useState(0);
  
  // Measure content height
  React.useEffect(() => {
    if (!contentRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      const { height } = entries[0].contentRect;
      setContentHeight(height);
    });
    
    resizeObserver.observe(contentRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // Calculate if scrolling is needed
  const needsScrolling = contentHeight > (
    typeof maxAutoHeight === 'number' ? maxAutoHeight : parseInt(maxAutoHeight, 10)
  );
  
  return (
    <div 
      className={cn(
        'w-full',
        className
      )}
      style={{
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
      }}
    >
      {needsScrolling ? (
        <ScrollArea 
          ref={ref} 
          maxHeight={maxAutoHeight} 
          {...props}
        >
          {children}
        </ScrollArea>
      ) : (
        <div ref={contentRef}>
          {children}
        </div>
      )}
    </div>
  );
});
AutoHeightScrollArea.displayName = 'AutoHeightScrollArea';

export { ScrollArea, ScrollBar, AutoHeightScrollArea };