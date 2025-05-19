'use client';

/**
 * DataTable Component
 *
 * An advanced data table component for displaying tabular data
 * with sorting, pagination, and row selection.
 *
 * @module ui/molecules
 */
import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableRow } from "./table";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { Checkbox } from "./checkbox";

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  /** Header label */
  header: React.ReactNode;
  /** Data field accessor or render function */
  accessor: keyof T | ((item: T, index: number) => React.ReactNode);
  /** Column CSS class */
  className?: string;
  /** Header CSS class */
  headerClassName?: string;
  /** Whether column can be sorted */
  sortable?: boolean;
  /** Custom sort function */
  sortFn?: (a: T, b: T, direction: SortDirection) => number;
  /** Whether to show this column */
  hidden?: boolean;
  /** Cell alignment */
  align?: 'left' | 'center' | 'right';
  /** Minimum width in px */
  minWidth?: number;
  /** Maximum width in px */
  maxWidth?: number;
  /** Fixed width in px */
  width?: number;
  /** Whether this column can be resized */
  resizable?: boolean;
  /** Whether to enable cell wrapping */
  wrap?: boolean;
}

export interface DataTableProps<T> {
  /** The data to display in the table */
  data?: T[];
  /** The columns configuration */
  columns?: ColumnDef<T>[];
  /** Additional class name for the container */
  className?: string;
  /** Whether to show the table header */
  showHeader?: boolean;
  /** Text to display when there's no data */
  emptyText?: string;
  /** Alternative props: rows and columns as separate arrays */
  rows?: T[];
  /** Additional props for the table */
  tableProps?: React.HTMLAttributes<HTMLTableElement>;
  /** Whether to enable sorting */
  sortable?: boolean;
  /** Initial sort field */
  initialSortField?: keyof T;
  /** Initial sort direction */
  initialSortDirection?: SortDirection;
  /** Called when sort changes */
  onSortChange?: (field: keyof T | null, direction: SortDirection) => void;
  /** Whether to enable row selection */
  selectable?: boolean;
  /** Selected row keys */
  selectedRows?: Array<number | string>;
  /** Called when selection changes */
  onSelectionChange?: (selectedIndices: number[]) => void;
  /** ID field for selection */
  rowId?: keyof T;
  /** Whether to enable pagination */
  paginated?: boolean;
  /** Initial page index */
  initialPage?: number;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Initial page size */
  initialPageSize?: number;
  /** Called when page changes */
  onPageChange?: (page: number, pageSize: number) => void;
  /** Highlight rows on hover */
  highlightOnHover?: boolean;
  /** Whether to make table rows zebra-striped */
  striped?: boolean;
  /** Density of table cells */
  density?: 'compact' | 'normal' | 'spacious';
  /** Whether table should scroll horizontally */
  scrollable?: boolean;
  /** Maximum height of table in pixels */
  maxHeight?: number;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Whether to have sticky headers */
  stickyHeader?: boolean;
  /** Custom empty state component */
  emptyState?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Whether to render the table as a basic version without features */
  basic?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DataTable<T>({
  data,
  columns,
  className,
  showHeader = true,
  emptyText = "No data available",
  rows,
  tableProps,
  sortable = false,
  initialSortField,
  initialSortDirection = null,
  onSortChange,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  rowId,
  paginated = false,
  initialPage = 0,
  pageSizeOptions = [10, 25, 50, 100],
  initialPageSize = 10,
  onPageChange,
  highlightOnHover = true,
  striped = false,
  density = 'normal',
  scrollable = false,
  maxHeight,
  onRowClick,
  stickyHeader = false,
  emptyState,
  loading = false,
  loadingComponent,
  basic = false,
}: DataTableProps<T>) {
  // Support both data and rows props for backward compatibility
  const items = data || rows || [];
  
  // State for sorting
  const [sortField, setSortField] = useState<keyof T | null>(initialSortField || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);
  
  // State for pagination
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  // Selected rows state (for uncontrolled mode)
  const [internalSelectedRows, setInternalSelectedRows] = useState<number[]>([]);
  
  // Determine if selection is controlled or uncontrolled
  const isSelectionControlled = selectedRows !== undefined;
  const selectedRowIndices = isSelectionControlled 
    ? (rowId 
        ? items.reduce<number[]>((acc, item, index) => {
            if (selectedRows.includes(item[rowId] as any)) {
              acc.push(index);
            }
            return acc;
          }, [])
        : selectedRows.map(Number)) 
    : internalSelectedRows;
  
  // Reset pagination when data changes
  useEffect(() => {
    if (paginated) {
      setPage(0);
    }
  }, [items, paginated]);
  
  // Filter visible columns
  const visibleColumns = useMemo(() => {
    return columns?.filter(col => !col.hidden) || [];
  }, [columns]);
  
  // Adjust density padding
  const densityClasses = {
    compact: 'py-1 px-2',
    normal: 'py-2 px-4',
    spacious: 'py-3 px-6',
  };
  
  // Sort data if needed
  const sortedData = useMemo(() => {
    if (!sortable || !sortField || sortDirection === null) {
      return items;
    }
    
    return [...items].sort((a, b) => {
      const column = columns?.find(col => col.accessor === sortField);
      
      // Use custom sort function if provided
      if (column?.sortFn) {
        return column.sortFn(a, b, sortDirection);
      }
      
      // Default sorting logic
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === bValue) return 0;
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const result = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? result : -result;
    });
  }, [items, sortable, sortField, sortDirection, columns]);
  
  // Paginate data if needed
  const paginatedData = useMemo(() => {
    if (!paginated) {
      return sortedData;
    }
    
    const startIndex = page * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, paginated, page, pageSize]);
  
  // Data to display
  const displayData = paginatedData;
  
  // Toggle sorting for a column
  const handleSort = (accessor: keyof T) => {
    if (!sortable) return;
    
    const column = columns?.find(col => col.accessor === accessor);
    if (!column?.sortable && column?.sortable !== undefined) return;
    
    let direction: SortDirection = 'asc';
    
    if (sortField === accessor) {
      if (sortDirection === 'asc') {
        direction = 'desc';
      } else if (sortDirection === 'desc') {
        direction = null;
      }
    }
    
    setSortField(direction === null ? null : accessor);
    setSortDirection(direction);
    
    if (onSortChange) {
      onSortChange(direction === null ? null : accessor, direction);
    }
  };
  
  // Handle row selection
  const handleRowSelect = (index: number, checked: boolean) => {
    let newSelectedRows: number[];
    
    if (checked) {
      newSelectedRows = [...selectedRowIndices, index];
    } else {
      newSelectedRows = selectedRowIndices.filter(i => i !== index);
    }
    
    if (!isSelectionControlled) {
      setInternalSelectedRows(newSelectedRows);
    }
    
    if (onSelectionChange) {
      onSelectionChange(newSelectedRows);
    }
  };
  
  // Handle "select all" checkbox
  const handleSelectAll = (checked: boolean) => {
    const newSelectedRows = checked
      ? displayData.map((_, index) => index + page * pageSize)
      : [];
    
    if (!isSelectionControlled) {
      setInternalSelectedRows(newSelectedRows);
    }
    
    if (onSelectionChange) {
      onSelectionChange(newSelectedRows);
    }
  };
  
  // Check if all rows are selected
  const allRowsSelected = displayData.length > 0 && 
    displayData.every((_, index) => 
      selectedRowIndices.includes(index + page * pageSize)
    );
  
  // Check if some rows are selected
  const someRowsSelected = displayData.length > 0 && 
    displayData.some((_, index) => 
      selectedRowIndices.includes(index + page * pageSize)
    ) && !allRowsSelected;
  
  // Handle pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    
    if (onPageChange) {
      onPageChange(newPage, pageSize);
    }
  };
  
  const handlePageSizeChange = (newPageSize: number) => {
    const newPage = Math.floor((page * pageSize) / newPageSize);
    setPage(newPage);
    setPageSize(newPageSize);
    
    if (onPageChange) {
      onPageChange(newPage, newPageSize);
    }
  };
  
  // Render empty state
  if ((!displayData.length || !visibleColumns?.length) && !loading) {
    return (
      <div className={cn("w-full", className)}>
        {emptyState || (
          <div className="text-center py-6 text-muted-foreground">
            {emptyText}
          </div>
        )}
      </div>
    );
  }
  
  // Render loading state
  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        {loadingComponent || (
          <div className="text-center py-6 text-muted-foreground">
            Loading...
          </div>
        )}
      </div>
    );
  }
  
  // Basic version - simplified table without advanced features
  if (basic) {
    return (
      <div className={cn("w-full overflow-auto", className)}>
        <Table {...tableProps}>
          {showHeader && (
            <TableHead>
              <TableRow>
                {visibleColumns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={column.headerClassName || column.className}
                    style={{
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                      width: column.width,
                      textAlign: column.align,
                    }}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {displayData.map((item, rowIndex) => (
              <TableRow 
                key={rowIndex}
                className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : undefined}
                onClick={() => onRowClick?.(item, rowIndex)}
              >
                {visibleColumns.map((column, colIndex) => (
                  <TableCell 
                    key={colIndex} 
                    className={column.className}
                    style={{
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                      width: column.width,
                      textAlign: column.align,
                      whiteSpace: column.wrap ? 'normal' : 'nowrap',
                    }}
                  >
                    {typeof column.accessor === "function"
                      ? column.accessor(item, rowIndex + page * pageSize)
                      : item[column.accessor] as React.ReactNode}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  // Full featured table
  return (
    <div className={cn("w-full flex flex-col", className)}>
      <div 
        className={cn(
          "relative overflow-x-auto",
          scrollable && "overflow-x-auto",
          maxHeight && "overflow-y-auto"
        )}
        style={{ maxHeight }}
      >
        <Table 
          {...tableProps}
          className={cn(
            stickyHeader && "border-separate border-spacing-0",
            tableProps?.className
          )}
        >
          {showHeader && (
            <TableHead 
              className={cn(
                stickyHeader && "sticky top-0 z-10 bg-muted"
              )}
            >
              <TableRow>
                {/* Selection column */}
                {selectable && (
                  <TableHead 
                    className="w-10"
                    style={{ position: stickyHeader ? 'sticky' : undefined, left: 0 }}
                  >
                    <Checkbox
                      checked={allRowsSelected}
                      indeterminate={someRowsSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label="Select all rows"
                    />
                  </TableHead>
                )}
                
                {/* Data columns */}
                {visibleColumns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={cn(
                      column.headerClassName || column.className,
                      sortable && (column.sortable !== false) && "cursor-pointer select-none"
                    )}
                    style={{
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                      width: column.width,
                      textAlign: column.align,
                    }}
                    onClick={() => {
                      if (sortable && (column.sortable !== false) && typeof column.accessor === 'string') {
                        handleSort(column.accessor);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>{column.header}</span>
                      
                      {sortable && (column.sortable !== false) && typeof column.accessor === 'string' && (
                        <span className="inline-flex flex-col">
                          <ChevronUp 
                            className={cn(
                              "h-3 w-3 -mb-1",
                              sortField === column.accessor && sortDirection === 'asc'
                                ? "text-foreground"
                                : "text-muted-foreground/30"
                            )}
                          />
                          <ChevronDown 
                            className={cn(
                              "h-3 w-3",
                              sortField === column.accessor && sortDirection === 'desc'
                                ? "text-foreground"
                                : "text-muted-foreground/30"
                            )}
                          />
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {displayData.map((item, rowIndex) => {
              const actualIndex = rowIndex + page * pageSize;
              const isSelected = selectedRowIndices.includes(actualIndex);
              
              return (
                <TableRow 
                  key={rowIndex}
                  className={cn(
                    highlightOnHover && "hover:bg-muted/40",
                    striped && rowIndex % 2 === 1 && "bg-muted/20",
                    isSelected && "bg-primary/5",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={(e) => {
                    // Don't trigger row click when clicking on checkbox
                    if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
                      return;
                    }
                    onRowClick?.(item, actualIndex);
                  }}
                >
                  {/* Selection column */}
                  {selectable && (
                    <TableCell 
                      className={cn(
                        "w-10",
                        densityClasses[density]
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleRowSelect(actualIndex, e.target.checked)}
                        aria-label={`Select row ${rowIndex + 1}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  
                  {/* Data cells */}
                  {visibleColumns.map((column, colIndex) => (
                    <TableCell 
                      key={colIndex} 
                      className={cn(
                        column.className,
                        densityClasses[density]
                      )}
                      style={{
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                        width: column.width,
                        textAlign: column.align,
                        whiteSpace: column.wrap ? 'normal' : 'nowrap',
                      }}
                    >
                      {typeof column.accessor === "function"
                        ? column.accessor(item, actualIndex)
                        : item[column.accessor] as React.ReactNode}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination controls */}
      {paginated && totalPages > 0 && (
        <div className="flex items-center justify-between py-4 border-t mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <select
              className="h-8 rounded-md border border-input px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground mr-2">
              {`${page * pageSize + 1}-${Math.min((page + 1) * pageSize, sortedData.length)} of ${sortedData.length}`}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(0)}
              disabled={page === 0}
              aria-label="First page"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <ChevronLeft className="h-4 w-4 -ml-2" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm mx-2">
              {`Page ${page + 1} of ${totalPages}`}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={page >= totalPages - 1}
              aria-label="Last page"
            >
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="h-4 w-4 -ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}