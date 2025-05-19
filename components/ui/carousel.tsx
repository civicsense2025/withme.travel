import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

type CarouselProps = {
  children: React.ReactNode;
  className?: string;
  autoScroll?: boolean;
  scrollInterval?: number;
};

export function Carousel({ children, className, autoScroll = false, scrollInterval = 3000 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const childrenArray = React.Children.toArray(children);
  const totalItems = childrenArray.length;

  const scrollToIndex = useCallback((index: number) => {
    if (!carouselRef.current) return;
    const itemWidth = carouselRef.current.clientWidth;
    carouselRef.current.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth',
    });
    setCurrentIndex(index);
  }, []);

  const handleNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % totalItems;
    scrollToIndex(nextIndex);
  }, [currentIndex, scrollToIndex, totalItems]);

  const handlePrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + totalItems) % totalItems;
    scrollToIndex(prevIndex);
  }, [currentIndex, scrollToIndex, totalItems]);

  useEffect(() => {
    if (!autoScroll) return;
    const interval = setInterval(handleNext, scrollInterval);
    return () => clearInterval(interval);
  }, [autoScroll, handleNext, scrollInterval]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {childrenArray.map((child, index) => (
          <div key={index} className="flex-shrink-0 w-full snap-start">
            {child}
          </div>
        ))}
      </div>
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full shadow-md"
        aria-label="Previous item"
      >
        &lt;
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full shadow-md"
        aria-label="Next item"
      >
        &gt;
      </button>
    </div>
  );
}

type CarouselContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function CarouselContent({ children, className }: CarouselContentProps) {
  return <div className={`flex ${className}`}>{children}</div>;
}

type CarouselItemProps = {
  children: React.ReactNode;
  className?: string;
};

export function CarouselItem({ children, className }: CarouselItemProps) {
  return <div className={`flex-shrink-0 ${className}`}>{children}</div>;
}

type CarouselNextProps = {
  onClick?: () => void;
  className?: string;
};

export function CarouselNext({ onClick, className }: CarouselNextProps) {
  return (
    <button
      onClick={onClick}
      className={`absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full shadow-md ${className}`}
      aria-label="Next item"
    >
      &gt;
    </button>
  );
}

type CarouselPreviousProps = {
  onClick?: () => void;
  className?: string;
};

export function CarouselPrevious({ onClick, className }: CarouselPreviousProps) {
  return (
    <button
      onClick={onClick}
      className={`absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full shadow-md ${className}`}
      aria-label="Previous item"
    >
      &lt;
    </button>
  );
} 