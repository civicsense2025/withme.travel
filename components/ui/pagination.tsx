/**
 * Pagination (Molecule)
 *
 * A themeable, accessible pagination component (stub).
 *
 * @module ui/molecules
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  // Stub: Replace with a real pagination implementation
  return (
    <div className={cn('flex gap-2', className)}>
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Prev
      </button>
      <span>
        {page} / {pageCount}
      </span>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= pageCount}>
        Next
      </button>
    </div>
  );
}
