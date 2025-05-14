'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => any);
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
};

type Action<T> = {
  label: string;
  icon?: React.ReactNode;
  onClick: (rows: T[]) => void;
  color?: string;
  disabled?: boolean;
};

type BulkAction<T> = {
  label: string;
  icon?: React.ReactNode;
  onClick: (rows: T[]) => void;
  color?: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
};

type PaginationConfig = {
  pageSize: number;
  pageIndex: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  bulkActions?: BulkAction<T>[];
  idField?: keyof T;
  pagination?: PaginationConfig;
  noDataMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  actions = [],
  bulkActions,
  idField = 'id' as keyof T,
  pagination,
  noDataMessage = 'No data to display',
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | ((row: T) => any) | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [sortedData, setSortedData] = useState<T[]>(data);

  // Pagination state (if not provided via props)
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 10);
  const [pageIndex, setPageIndex] = useState(pagination?.pageIndex || 0);
  const pageCount = pagination?.pageCount || Math.ceil(sortedData.length / pageSize);

  // Filter state
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<T[]>(sortedData);

  // Filter dropdown state
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [activeFilterColumn, setActiveFilterColumn] = useState<keyof T | null>(null);
  const [filterValue, setFilterValue] = useState('');

  // Active filters display
  const [activeFilters, setActiveFilters] = useState<Array<{ column: string; value: string }>>([]);

  // Function for getting current page data (referenced in useEffect)
  const getCurrentPageData = useCallback(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [pageIndex, pageSize, filteredData]);

  useEffect(() => {
    setSortedData(data);
  }, [data]);

  useEffect(() => {
    if (selectAll) {
      setSelectedRows(getCurrentPageData());
    } else {
      setSelectedRows([]);
    }
  }, [selectAll, getCurrentPageData]);

  useEffect(() => {
    // Apply filtering
    let result = sortedData;

    // Apply search term across all filterable columns
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((row) => {
        return columns.some((column) => {
          if (!column.filterable) return false;

          const value =
            typeof column.accessor === 'function'
              ? column.accessor(row)
              : row[column.accessor as keyof T];

          return value && String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply column-specific filters
    Object.entries(filters).forEach(([key, value]) => {
      if (!value) return;

      const filterLower = value.toLowerCase();
      result = result.filter((row) => {
        const column = columns.find(
          (col) => typeof col.accessor === 'string' && col.accessor === key
        );

        if (!column) return true;

        const rowValue = row[key as keyof T];
        return rowValue && String(rowValue).toLowerCase().includes(filterLower);
      });
    });

    setFilteredData(result);

    // Update active filters display
    const newActiveFilters = Object.entries(filters)
      .filter(([_, value]) => value)
      .map(([key, value]) => {
        const column = columns.find(
          (col) => typeof col.accessor === 'string' && col.accessor === key
        );
        return {
          column: column?.header || key,
          value,
        };
      });

    setActiveFilters(newActiveFilters);

    // Reset to first page when filters change
    if (pagination?.onPageChange) {
      pagination.onPageChange(0);
    } else {
      setPageIndex(0);
    }
  }, [sortedData, searchTerm, filters, columns, pagination]);

  // Handle row selection
  const handleRowSelect = (row: T, isChecked: boolean) => {
    if (isChecked) {
      setSelectedRows([...selectedRows, row]);
    } else {
      setSelectedRows(selectedRows.filter((r) => r[idField] !== row[idField]));
    }
  };

  // Handle select all rows
  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedRows([...data]);
    } else {
      setSelectedRows([]);
    }
  };

  // Check if row is selected
  const isSelected = (row: T) => {
    return selectedRows.some((r) => r[idField] === row[idField]);
  };

  // Handle sorting
  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    const accessor = column.accessor;

    setSortConfig((prevSort) => {
      if (prevSort.key === accessor) {
        return {
          key: accessor,
          direction: prevSort.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key: accessor, direction: 'asc' };
    });
  };

  // Get sorted data
  const getSortedData = () => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue, bValue;

      if (typeof sortConfig.key === 'function') {
        aValue = sortConfig.key(a);
        bValue = sortConfig.key(b);
      } else {
        aValue = a[sortConfig.key as keyof T];
        bValue = b[sortConfig.key as keyof T];
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc' ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1;
    });
  };

  // Get cell value
  const getCellValue = (row: T, column: Column<T>) => {
    let value;

    if (typeof column.accessor === 'function') {
      value = column.accessor(row);
    } else {
      value = row[column.accessor as keyof T];
    }

    if (column.cell) {
      return column.cell(value, row);
    }

    // Convert the value to a React-renderable format
    if (value === null || value === undefined) {
      return '';
    }
    // If value is a valid ReactNode, return as is
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      React.isValidElement(value)
    ) {
      return value;
    }
    if (typeof value === 'symbol') {
      return value.toString(); // Always convert symbol to string for ReactNode
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    // Convert to string to ensure it's a valid ReactNode
    return String(value);
  };

  // Get sorting icon
  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;

    if (sortConfig.key === column.accessor) {
      return sortConfig.direction === 'asc' ? (
        <ChevronUp className="h-4 w-4 text-primary" />
      ) : (
        <ChevronDown className="h-4 w-4 text-primary" />
      );
    }

    return <ChevronsUpDown className="h-4 w-4 text-muted-foreground opacity-50" />;
  };

  // Render pagination
  const renderPagination = () => {
    if (filteredData.length === 0) return null;

    const getPageNumbers = () => {
      const totalPages = pageCount;
      const currentPage = pageIndex;
      const maxPageButtons = 5;

      let startPage = Math.max(0, currentPage - Math.floor(maxPageButtons / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxPageButtons - 1);

      if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(0, endPage - maxPageButtons + 1);
      }

      const pages = [];
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    };

    return (
      <Pagination className="pt-4">
        <PaginationContent className="rounded-full border bg-white/50 dark:bg-black/50 shadow-sm backdrop-blur-sm p-1">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => {
                const newPage = Math.max(0, pageIndex - 1);
                if (pagination?.onPageChange) {
                  pagination.onPageChange(newPage);
                } else {
                  setPageIndex(newPage);
                }
              }}
              className={`rounded-full transition-all duration-300 ${
                pageIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/80'
              }`}
              aria-disabled={pageIndex === 0}
            />
          </PaginationItem>

          {getPageNumbers().map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                onClick={() => {
                  if (pagination?.onPageChange) {
                    pagination.onPageChange(pageNumber);
                  } else {
                    setPageIndex(pageNumber);
                  }
                }}
                isActive={pageIndex === pageNumber}
                className={`rounded-full font-medium ${
                  pageIndex === pageNumber
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                    : 'hover:bg-muted/80'
                } transition-all duration-300`}
              >
                {pageNumber + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => {
                const newPage = Math.min(pageCount - 1, pageIndex + 1);
                if (pagination?.onPageChange) {
                  pagination.onPageChange(newPage);
                } else {
                  setPageIndex(newPage);
                }
              }}
              className={`rounded-full transition-all duration-300 ${
                pageIndex === pageCount - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/80'
              }`}
              aria-disabled={pageIndex === pageCount - 1}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Render actions menu
  const renderActionsMenu = () => {
    if (actions.length === 0) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="ml-2 rounded-full transition-all duration-300 hover:shadow-sm"
          >
            Actions
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[150px] rounded-xl border shadow-lg p-1 backdrop-blur-sm"
        >
          <DropdownMenuLabel>Row Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => action.onClick(selectedRows)}
              disabled={action.disabled || selectedRows.length === 0}
              className="rounded-lg cursor-pointer transition-all duration-150 hover:bg-muted/80"
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Render filter controls
  const renderFilterControls = () => {
    const filterable = columns.some((col) => col.filterable);
    if (!filterable) return null;

    return (
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-input rounded-full bg-background hover:bg-accent/10 focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          )}
        </div>

        <DropdownMenu open={filterDropdownOpen} onOpenChange={setFilterDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full transition-all duration-300 hover:shadow-sm flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 rounded-xl p-2 shadow-lg border backdrop-blur-sm"
          >
            <DropdownMenuLabel>Filter By Column</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns
              .filter((col) => col.filterable)
              .map((column, index) => {
                const accessor = typeof column.accessor === 'string' ? column.accessor : '';
                return (
                  <DropdownMenuItem
                    key={String(index)}
                    onClick={() => {
                      setActiveFilterColumn(accessor as keyof T);
                      setFilterValue(filters[accessor] || '');
                    }}
                    className="rounded-lg cursor-pointer transition-all duration-150 hover:bg-muted/80"
                  >
                    {column.header}
                  </DropdownMenuItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>

        {activeFilterColumn && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-background rounded-xl shadow-xl border p-4 max-w-md w-full"
            >
              <h3 className="text-lg font-medium mb-4">
                Filter by{' '}
                {(() => {
                  const col = columns.find(
                    (col) => typeof col.accessor === 'string' && col.accessor === activeFilterColumn
                  );
                  // Defensive: Only render header if it's a valid ReactNode (string or number)
                  if (col && (typeof col.header === 'string' || typeof col.header === 'number')) {
                    return col.header;
                  }
                  // Fallback: render the column accessor as string, never symbol
                  if (
                    typeof activeFilterColumn === 'string' ||
                    typeof activeFilterColumn === 'number'
                  ) {
                    return activeFilterColumn;
                  }
                  // If symbol or other, render nothing
                  return '';
                })()}
              </h3>
              <input
                type="text"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-full border border-input rounded-lg p-2 mb-4"
                placeholder="Filter value..."
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (activeFilterColumn) {
                      const newFilters = { ...filters };
                      delete newFilters[activeFilterColumn as string];
                      setFilters(newFilters);
                    }
                    setActiveFilterColumn(null);
                  }}
                  className="rounded-full transition-all duration-300"
                >
                  Clear
                </Button>
                <Button
                  onClick={() => {
                    if (activeFilterColumn) {
                      setFilters({
                        ...filters,
                        [activeFilterColumn as string]: filterValue,
                      });
                    }
                    setActiveFilterColumn(null);
                  }}
                  className="rounded-full transition-all duration-300"
                >
                  Apply Filter
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  };

  // Show active filters
  const renderActiveFilters = () => {
    if (activeFilters.length === 0 && !searchTerm) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {searchTerm && (
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1 flex items-center gap-2 text-sm border shadow-sm">
            <span>Search: {searchTerm}</span>
            <button
              onClick={() => setSearchTerm('')}
              className="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full p-1 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        {activeFilters.map((filter, index) => (
          <div
            key={`${filter.column}-${filter.value}`}
            className="bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1 flex items-center gap-2 text-sm border shadow-sm"
          >
            <span>
              {filter.column}: {filter.value}
            </span>
            <button
              onClick={() => {
                const newFilters = { ...filters };
                const keyToRemove = Object.keys(filters).find(
                  (key) =>
                    columns.find((col) => typeof col.accessor === 'string' && col.accessor === key)
                      ?.header === filter.column
                );
                if (keyToRemove) {
                  delete newFilters[keyToRemove];
                  setFilters(newFilters);
                }
              }}
              className="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full p-1 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {(activeFilters.length > 0 || searchTerm) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilters({});
              setSearchTerm('');
            }}
            className="rounded-full h-7 px-3 hover:bg-muted text-sm"
          >
            Clear All
          </Button>
        )}
      </div>
    );
  };

  const paginatedData = (() => {
    const start = pageIndex * pageSize;
    const end = Math.min(start + pageSize, filteredData.length);
    return filteredData.slice(start, end);
  })();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {bulkActions && selectedRows.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedRows.length} {selectedRows.length === 1 ? 'row' : 'rows'} selected
              </span>
              {bulkActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (action.requiresConfirmation) {
                      if (window.confirm(action.confirmationMessage || 'Are you sure?')) {
                        action.onClick(selectedRows);
                      }
                    } else {
                      action.onClick(selectedRows);
                    }
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    action.color ? `bg-${action.color}-50 text-${action.color}-700` : ''
                  }`}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">{renderActionsMenu()}</div>
      </div>

      {renderFilterControls()}
      {renderActiveFilters()}

      <div className="rounded-xl border overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md bg-background/50 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
            <TableRow>
              {bulkActions && (
                <TableHead className="w-[40px] p-2">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={(checked) => {
                      setSelectAll(!!checked);
                      handleSelectAll(!!checked);
                    }}
                    className="transition-transform duration-300 data-[state=checked]:scale-105"
                  />
                </TableHead>
              )}
              {columns.map((column, index) => (
                <TableHead
                  key={String(index)}
                  className={column.sortable ? 'cursor-pointer select-none' : ''}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center">
                    <span>{column.header}</span>
                    {getSortIcon(column)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="wait">
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (bulkActions ? 1 : 0)}
                    className="text-center h-32"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="py-6 text-muted-foreground"
                    >
                      {noDataMessage}
                    </motion.div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <motion.tr
                    key={String(row[idField]) || rowIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: rowIndex * 0.03 }}
                    className={`border-b last:border-0 transition-colors ${
                      isSelected(row) ? 'bg-muted/40' : 'hover:bg-muted/20'
                    }`}
                  >
                    {bulkActions && (
                      <TableCell className="p-2">
                        <Checkbox
                          checked={isSelected(row)}
                          onCheckedChange={(checked) => handleRowSelect(row, !!checked)}
                          className="transition-transform duration-300 data-[state=checked]:scale-105"
                        />
                      </TableCell>
                    )}
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex}>{getCellValue(row, column)}</TableCell>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center">{renderPagination()}</div>
    </div>
  );
}
