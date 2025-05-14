'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useVirtual } from 'react-virtual';
import { Search, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Types from the original DataTable
type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => any);
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
};

type Action<T> = {
  label: string;
  onClick: (rows: T[]) => void;
  color?: string;
  disabled?: boolean;
};

type BulkAction<T> = {
  label: string;
  onClick: (rows: T[]) => void;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
};

interface VirtualizedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  bulkActions?: BulkAction<T>[];
  idField?: keyof T;
  isLoading?: boolean;
  pagination?: {
    pageSize: number;
    pageIndex: number;
    pageCount: number;
    onPageChange: (page: number) => void;
  };
  defaultSortField?: keyof T;
  defaultSortDirection?: 'asc' | 'desc';
  rowHeight?: number;
  tableHeight?: number;
}

export function VirtualizedDataTable<T>({
  data,
  columns,
  actions,
  bulkActions,
  idField = 'id' as keyof T,
  isLoading = false,
  pagination,
  defaultSortField,
  defaultSortDirection = 'asc',
  rowHeight = 56,
  tableHeight = 500,
}: VirtualizedDataTableProps<T>) {
  const { toast } = useToast();
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortField, setSortField] = useState<keyof T | null>(defaultSortField || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  // Pagination state (if not provided via props)
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 10);
  const [pageIndex, setPageIndex] = useState(pagination?.pageIndex || 0);
  const pageCount = pagination?.pageCount || Math.ceil(data.length / pageSize);

  // Filter state
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [activeFilterColumn, setActiveFilterColumn] = useState<keyof T | null>(null);
  const [filterValue, setFilterValue] = useState('');

  // Active filters display
  const [activeFilters, setActiveFilters] = useState<Array<{ column: string; value: string }>>([]);

  // Process data with sorting, filtering, and pagination
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm) {
      result = result.filter((row) => {
        return columns.some((column) => {
          const value =
            typeof column.accessor === 'function' ? column.accessor(row) : row[column.accessor];

          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Apply column filters
    if (Object.keys(filters).length > 0) {
      result = result.filter((row) => {
        return Object.entries(filters).every(([key, filterValue]) => {
          const value = row[key as keyof T];
          return value && value.toString().toLowerCase().includes(filterValue.toLowerCase());
        });
      });
    }

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        const valueA = a[sortField];
        const valueB = b[sortField];

        if (valueA === valueB) return 0;

        if (valueA === null || valueA === undefined) return 1;
        if (valueB === null || valueB === undefined) return -1;

        // Compare based on the sorted field
        const compareResult = valueA < valueB ? -1 : 1;
        return sortDirection === 'asc' ? compareResult : -compareResult;
      });
    }

    // Update active filters display
    const newActiveFilters = Object.entries(filters).map(([column, value]) => ({
      column,
      value,
    }));

    if (JSON.stringify(newActiveFilters) !== JSON.stringify(activeFilters)) {
      setActiveFilters(newActiveFilters);
    }

    return result;
  }, [data, columns, searchTerm, filters, sortField, sortDirection, activeFilters]);

  // Get current page data
  const currentPageData = useMemo(() => {
    if (pagination) {
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      return processedData.slice(start, end);
    }
    return processedData;
  }, [processedData, pageIndex, pageSize, pagination]);

  // Create virtualized list
  const parentRef = useRef<HTMLDivElement | null>(null);
  const estimateSize = useCallback(() => rowHeight, [rowHeight]);

  const rowVirtualizer = useVirtual({
    size: currentPageData.length,
    parentRef,
    estimateSize,
    overscan: 10,
  });

  // Reset selected rows when data changes
  useEffect(() => {
    setSelectedRows([]);
    setSelectAll(false);
  }, [data, searchTerm, filters, pageIndex]);

  // Select all items on current page
  useEffect(() => {
    if (selectAll) {
      setSelectedRows(currentPageData);
    } else {
      setSelectedRows([]);
    }
  }, [selectAll, currentPageData]);

  const handleSort = (column: Column<T>) => {
    if (typeof column.accessor === 'function' || !column.sortable) return;

    const accessor = column.accessor as keyof T;

    if (sortField === accessor) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(accessor);
      setSortDirection('asc');
    }
  };

  const handleRowSelect = (row: T) => {
    const isSelected = selectedRows.some((r) => r[idField] === row[idField]);

    if (isSelected) {
      setSelectedRows(selectedRows.filter((r) => r[idField] !== row[idField]));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const handleBulkAction = (action: BulkAction<T>) => {
    if (selectedRows.length === 0) {
      toast({
        title: 'No items selected',
        description: 'Please select at least one item to perform this action.',
        variant: 'destructive',
      });
      return;
    }

    if (action.requiresConfirmation) {
      if (
        window.confirm(
          action.confirmationMessage ||
            `Are you sure you want to ${action.label} ${selectedRows.length} items?`
        )
      ) {
        action.onClick(selectedRows);
      }
    } else {
      action.onClick(selectedRows);
    }
  };

  const getCellValue = (row: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor];
  };

  const renderCell = (row: T, column: Column<T>) => {
    const value = getCellValue(row, column);

    if (column.cell) {
      return column.cell(value, row);
    }

    return value;
  };

  const handlePageChange = (newPage: number) => {
    if (pagination?.onPageChange) {
      pagination.onPageChange(newPage);
    } else {
      setPageIndex(newPage);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPageIndex(0); // Reset to first page when searching
  };

  const applyFilter = () => {
    if (activeFilterColumn && filterValue) {
      setFilters((prev) => ({
        ...prev,
        [activeFilterColumn as string]: filterValue,
      }));

      // Reset filter form
      setFilterValue('');
      setFilterDropdownOpen(false);
      setPageIndex(0); // Reset to first page when filtering
    }
  };

  const removeFilter = (columnName: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[columnName];
      return newFilters;
    });
    setPageIndex(0); // Reset to first page when removing filters
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchTerm('');
    setPageIndex(0); // Reset to first page when clearing filters
  };

  const filterableColumns = columns.filter(
    (column) => column.filterable && typeof column.accessor !== 'function'
  );

  // Render loading state
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="overflow-hidden rounded-md border">
            <div className="bg-gray-50 dark:bg-slate-700 border-b">
              <div className="grid grid-cols-4 px-6 py-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-24" />
                ))}
              </div>
            </div>
            <div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-4 px-6 py-4 border-b last:border-0">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-5 w-24" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <Input
              type="text"
              className="pl-10"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="inline-flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>

            {filterDropdownOpen && (
              <div className="absolute z-10 mt-1 w-80 bg-white dark:bg-slate-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 p-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Filter by
                  </label>
                  <Select
                    value={(activeFilterColumn as string) || ''}
                    onValueChange={(value) => setActiveFilterColumn(value as keyof T)}
                  >
                    <SelectTrigger>
                      <SelectValue>Select column</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {filterableColumns.map((column) => (
                        <SelectItem
                          key={column.accessor as string}
                          value={column.accessor as string}
                        >
                          {column.header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Value
                  </label>
                  <Input
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    placeholder="Filter value..."
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setFilterDropdownOpen(false)}
                    variant="outline"
                    className="mr-2"
                  >
                    Cancel
                  </Button>
                  <Button onClick={applyFilter} disabled={!activeFilterColumn || !filterValue}>
                    Apply Filter
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {bulkActions && bulkActions.length > 0 && selectedRows.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedRows.length} selected</span>
            {bulkActions.map((action, i) => (
              <Button key={i} variant="outline" onClick={() => handleBulkAction(action)}>
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              <span>
                {columns.find((col) => col.accessor === filter.column)?.header}: {filter.value}
              </span>
              <button
                onClick={() => removeFilter(filter.column)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 px-2 text-xs">
            Clear all
          </Button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="relative w-full overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  {bulkActions && bulkActions.length > 0 && (
                    <th className="w-8 px-6 py-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </th>
                  )}
                  {columns.map((column, i) => (
                    <th
                      key={i}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                        column.sortable
                          ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600'
                          : ''
                      }`}
                      style={{ width: column.width }}
                      onClick={() => column.sortable && handleSort(column)}
                    >
                      <div className="flex items-center">
                        <span>{column.header}</span>
                        {column.sortable &&
                          typeof column.accessor !== 'function' &&
                          sortField === column.accessor && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                      </div>
                    </th>
                  ))}
                  {actions && actions.length > 0 && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
            </table>
          </div>

          {/* Virtualized Body */}
          <div ref={parentRef} className="overflow-y-auto w-full" style={{ height: tableHeight }}>
            <div
              style={{
                height: `${rowVirtualizer.totalSize}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              <table className="w-full">
                <tbody>
                  {rowVirtualizer.virtualItems.map((virtualRow) => {
                    const row = currentPageData[virtualRow.index];
                    const isSelected = selectedRows.some((r) => r[idField] === row[idField]);

                    return (
                      <tr
                        key={virtualRow.index}
                        className={`border-b border-gray-200 dark:border-gray-700 last:border-0 ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        } hover:bg-gray-50 dark:hover:bg-slate-700/50`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${rowHeight}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        {bulkActions && bulkActions.length > 0 && (
                          <td className="w-8 px-6 py-4">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleRowSelect(row)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </div>
                          </td>
                        )}

                        {columns.map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
                          >
                            {renderCell(row, column)}
                          </td>
                        ))}

                        {actions && actions.length > 0 && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <div className="flex justify-end space-x-3">
                              {actions.map((action, actionIndex) => (
                                <button
                                  key={actionIndex}
                                  onClick={() => action.onClick([row])}
                                  disabled={action.disabled}
                                  className={`text-sm ${action.color || 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}

                  {currentPageData.length === 0 && (
                    <tr>
                      <td
                        colSpan={
                          columns.length +
                          (bulkActions && bulkActions.length > 0 ? 1 : 0) +
                          (actions && actions.length > 0 ? 1 : 0)
                        }
                        className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{pageIndex * pageSize + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min((pageIndex + 1) * pageSize, processedData.length)}
                  </span>{' '}
                  of <span className="font-medium">{processedData.length}</span> results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <Button
                    onClick={() => handlePageChange(pageIndex - 1)}
                    disabled={pageIndex === 0}
                    variant="outline"
                    size="sm"
                    className="rounded-l-md"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {[...Array(pageCount)].map((_, i) => {
                    // Show at most 5 page numbers
                    const shouldShowPageNumber =
                      i === 0 || // First page
                      i === pageCount - 1 || // Last page
                      (i >= pageIndex - 1 && i <= pageIndex + 1); // Pages around current

                    if (!shouldShowPageNumber) {
                      // Show ellipsis
                      if (i === 1 || i === pageCount - 2) {
                        return (
                          <span key={i} className="px-3 py-2 text-gray-500 dark:text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        variant={pageIndex === i ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-none"
                      >
                        {i + 1}
                      </Button>
                    );
                  })}

                  <Button
                    onClick={() => handlePageChange(pageIndex + 1)}
                    disabled={pageIndex === pageCount - 1}
                    variant="outline"
                    size="sm"
                    className="rounded-r-md"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
