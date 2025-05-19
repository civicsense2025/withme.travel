/**
 * Pagination (Molecule)
 *
 * A flexible, accessible pagination component with various display modes
 * and keyboard navigation support.
 *
 * @module ui/molecules
 */
import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './button';

export type PaginationVariant = 'default' | 'simple' | 'compact' | 'outline';
export type PaginationSize = 'sm' | 'md' | 'lg';

export interface PaginationProps {
  /** Current page (1-based index) */
  page: number;
  /** Total number of pages */
  pageCount: number;
  /** Called when page changes */
  onPageChange: (page: number) => void;
  /** Additional class name */
  className?: string;
  /** How many pages to show around the current page */
  siblingCount?: number;
  /** Whether to show first/last page buttons */
  showFirstLast?: boolean;
  /** Visual variant */
  variant?: PaginationVariant;
  /** Size of pagination items */
  size?: PaginationSize;
  /** Whether pagination is disabled */
  disabled?: boolean;
  /** Whether to show page jumper input */
  showJumper?: boolean;
  /** Page items display mode */
  mode?: 'pages' | 'results';
  /** Number of items per page for results mode */
  itemsPerPage?: number;
  /** Total number of items for results mode */
  totalItems?: number;
  /** Whether to show interactive prev/next buttons */
  showControls?: boolean;
  /** Show "X of Y pages" text */
  showPageInfo?: boolean;
}

/**
 * Calculate page range to display
 */
function getPageRange(
  currentPage: number,
  pageCount: number,
  siblingCount: number = 1
): (number | string)[] {
  const totalPageNumbers = siblingCount * 2 + 3; // siblings + current + first + last
  
  // If we can show all pages without ellipsis
  if (totalPageNumbers >= pageCount) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  
  // Calculate left and right sibling indexes
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, pageCount);
  
  // Show ellipsis when needed
  const showLeftDots = leftSiblingIndex > 2;
  const showRightDots = rightSiblingIndex < pageCount - 1;
  
  // Constant for ellipsis
  const ELLIPSIS = 'ellipsis';
  
  // Various cases
  if (!showLeftDots && showRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, ELLIPSIS, pageCount];
  }
  
  if (showLeftDots && !showRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => pageCount - rightItemCount + i + 1
    );
    return [1, ELLIPSIS, ...rightRange];
  }
  
  if (showLeftDots && showRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, ELLIPSIS, ...middleRange, ELLIPSIS, pageCount];
  }
  
  // Fallback
  return Array.from({ length: pageCount }, (_, i) => i + 1);
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
  siblingCount = 1,
  showFirstLast = false,
  variant = 'default',
  size = 'md',
  disabled = false,
  showJumper = false,
  mode = 'pages',
  itemsPerPage = 10,
  totalItems = 0,
  showControls = true,
  showPageInfo = true,
}: PaginationProps) {
  // Internal state for jumper
  const [jumpValue, setJumpValue] = useState('');
  
  // Calculate page range
  const pageRange = useMemo(() => {
    return getPageRange(page, pageCount, siblingCount);
  }, [page, pageCount, siblingCount]);
  
  // Size classes
  const sizeClasses = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };
  
  // Variant classes
  const variantClasses = {
    default: 'bg-background hover:bg-muted border',
    simple: 'bg-transparent hover:bg-muted',
    compact: 'bg-background hover:bg-muted border-0',
    outline: 'bg-transparent hover:bg-muted border',
  };
  
  // Current page information
  const currentPageInfo = useMemo(() => {
    if (mode === 'results' && totalItems > 0) {
      const start = (page - 1) * itemsPerPage + 1;
      const end = Math.min(page * itemsPerPage, totalItems);
      return `${start}-${end} of ${totalItems}`;
    }
    return `Page ${page} of ${pageCount}`;
  }, [mode, page, pageCount, itemsPerPage, totalItems]);
  
  // Handle jumper submission
  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const jumpPage = parseInt(jumpValue, 10);
    if (!isNaN(jumpPage) && jumpPage >= 1 && jumpPage <= pageCount) {
      onPageChange(jumpPage);
      setJumpValue('');
    }
  };
  
  // Render page button
  const renderPageButton = (pageNum: number | string, index: number) => {
    // For ellipsis
    if (pageNum === 'ellipsis') {
      return (
        <span 
          key={`ellipsis-${index}`}
          className="flex items-center justify-center w-8"
        >
          <MoreHorizontal className="h-4 w-4" />
        </span>
      );
    }
    
    // For numbered pages
    const isActive = pageNum === page;
    
    return (
      <Button
        key={pageNum}
        variant={isActive ? 'primary' : 'ghost'}
        size="icon"
        className={cn(
          sizeClasses[size],
          !isActive && variantClasses[variant],
          isActive && 'pointer-events-none',
        )}
        onClick={() => onPageChange(pageNum as number)}
        disabled={disabled}
        aria-current={isActive ? 'page' : undefined}
      >
        {pageNum}
      </Button>
    );
  };
  
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center justify-center space-x-2', className)}
    >
      {/* First page button */}
      {showFirstLast && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(sizeClasses[size], variantClasses[variant])}
          onClick={() => onPageChange(1)}
          disabled={disabled || page === 1}
          aria-label="Go to first page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="11 17 6 12 11 7" />
            <polyline points="18 17 13 12 18 7" />
          </svg>
        </Button>
      )}
      
      {/* Previous page button */}
      {showControls && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(sizeClasses[size], variantClasses[variant])}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={disabled || page === 1}
          aria-label="Go to previous page"
        >
          <ChevronLeft className={cn('h-4 w-4', size === 'lg' && 'h-5 w-5')} />
        </Button>
      )}
      
      {/* Page info text */}
      {showPageInfo && mode === 'results' && (
        <span className="text-sm text-muted-foreground">
          {currentPageInfo}
        </span>
      )}
      
      {/* Page numbers */}
      {mode === 'pages' && (
        <div className="flex items-center space-x-1">
          {pageRange.map(renderPageButton)}
        </div>
      )}
      
      {/* Next page button */}
      {showControls && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(sizeClasses[size], variantClasses[variant])}
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={disabled || page === pageCount}
          aria-label="Go to next page"
        >
          <ChevronRight className={cn('h-4 w-4', size === 'lg' && 'h-5 w-5')} />
        </Button>
      )}
      
      {/* Last page button */}
      {showFirstLast && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(sizeClasses[size], variantClasses[variant])}
          onClick={() => onPageChange(pageCount)}
          disabled={disabled || page === pageCount}
          aria-label="Go to last page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="13 17 18 12 13 7" />
            <polyline points="6 17 11 12 6 7" />
          </svg>
        </Button>
      )}
      
      {/* Page jumper */}
      {showJumper && (
        <form onSubmit={handleJump} className="flex items-center space-x-2 ml-4">
          <span className="text-sm text-muted-foreground">Go to</span>
          <input
            type="text"
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            className={cn(
              'w-12 h-8 px-2 rounded border border-input text-center text-sm',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={disabled}
            aria-label="Jump to page"
          />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={disabled}
            className={cn(
              'text-xs',
              variantClasses[variant]
            )}
          >
            Go
          </Button>
        </form>
      )}
      
      {/* Page info (shown when not in results mode) */}
      {showPageInfo && mode === 'pages' && (
        <span className="text-sm text-muted-foreground ml-2">
          {currentPageInfo}
        </span>
      )}
    </nav>
  );
}

// ============================================================================
// PAGINATION COMPONENT PARTS
// ============================================================================

export interface PaginationContentProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const PaginationContent = React.forwardRef<HTMLElement, PaginationContentProps>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn('flex items-center gap-1', className)}
      role="navigation"
      aria-label="pagination"
      {...props}
    />
  )
);
PaginationContent.displayName = 'PaginationContent';

export interface PaginationItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
}

export const PaginationItem = React.forwardRef<HTMLLIElement, PaginationItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('list-none', className)} {...props} />
  )
);
PaginationItem.displayName = 'PaginationItem';

export interface PaginationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Whether link is for current page */
  isActive?: boolean;
}

export const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, isActive, ...props }, ref) => (
    
      ref={ref}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'bg-transparent hover:bg-muted',
        className
      )}
      {...props}
    />
  )
);
PaginationLink.displayName = 'PaginationLink';

export interface PaginationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether button is disabled */
  isDisabled?: boolean;
}

export const PaginationPrevious = React.forwardRef<HTMLButtonElement, PaginationButtonProps>(
  ({ className, isDisabled, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      disabled={isDisabled}
      className={cn('h-9 w-9', className)}
      aria-label="Go to previous page"
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
  )
);
PaginationPrevious.displayName = 'PaginationPrevious';

export const PaginationNext = React.forwardRef<HTMLButtonElement, PaginationButtonProps>(
  ({ className, isDisabled, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      disabled={isDisabled}
      className={cn('h-9 w-9', className)}
      aria-label="Go to next page"
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  )
);
PaginationNext.displayName = 'PaginationNext';

export interface PaginationEllipsisProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const PaginationEllipsis = React.forwardRef<HTMLSpanElement, PaginationEllipsisProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('flex h-9 w-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
);
PaginationEllipsis.displayName = 'PaginationEllipsis';