'use client';

import React, { useState, useEffect } from 'react';
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
  noDataMessage = "No data to display",
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
  const [activeFilters, setActiveFilters] = useState<Array<{column: string, value: string}>>([]);

  useEffect(() => {
    setSortedData(data);
  }, [data]);
  
  useEffect(() => {
    if (selectAll) {
      setSelectedRows(getCurrentPageData());
    } else {
      setSelectedRows([]);
    }
  }, [selectAll, pageIndex, filteredData]);
  
  // Function for getting current page data (referenced in useEffect)
  function getCurrentPageData() {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }
  
  useEffect(() => {
    // Apply filtering
    let result = sortedData;
    
    // Apply search term across all filterable columns
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(row => {
        return columns.some(column => {
          if (!column.filterable) return false;
          
          const value = typeof column.accessor === 'function'
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
      result = result.filter(row => {
        const column = columns.find(col => 
          typeof col.accessor === 'string' && col.accessor === key
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
        const column = columns.find(col => 
          typeof col.accessor === 'string' && col.accessor === key
        );
        return {
          column: column?.header || key,
          value
        };
      });
    
    setActiveFilters(newActiveFilters);
    
    // Reset to first page when filters change
    if (pagination?.onPageChange) {
      pagination.onPageChange(0);
    } else {
      setPageIndex(0);
    }
  }, [sortedData, searchTerm, filters]);

  // Handle row selection
  const handleRowSelect = (row: T, isChecked: boolean) => {
    if (isChecked) {
      setSelectedRows([...selectedRows, row]);
    } else {
      setSelectedRows(selectedRows.filter(r => r[idField] !== row[idField]));
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
    return selectedRows.some(r => r[idField] === row[idField]);
  };

  // Handle sorting
  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;
    
    const accessor = column.accessor;
    
    setSortConfig(prevSort => {
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
      
      if (typeof aValue === 'string') {
        if (sortConfig.direction === 'asc') {
          return aValue.localeCompare(String(bValue));
        }
        return String(bValue).localeCompare(String(aValue));
      }
      
      if (sortConfig.direction === 'asc') {
        return aValue - bValue;
      }
      return bValue - aValue;
    });
  };

  // Get cell value
  const getCellValue = (row: T, column: Column<T>) => {
    const accessor = column.accessor;
    let value;
    
    if (typeof accessor === 'function') {
      value = accessor(row);
    } else {
      value = row[accessor];
    }
    
    if (column.cell) {
      return column.cell(value, row);
    }
    
    return value !== null && value !== undefined ? String(value) : '';
  };

  // Get sort icon
  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    
    if (sortConfig.key !== column.accessor) {
      return <ChevronsUpDown className="h-4 w-4 ml-2 opacity-50" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 ml-2" />
      : <ChevronDown className="h-4 w-4 ml-2" />;
  };

  // Render pagination
  const renderPagination = () => {
    if (!pagination) return null;
    
    const { pageIndex, pageCount, onPageChange } = pagination;
    
    // Generate page numbers array with ellipsis for large ranges
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (pageCount <= maxVisiblePages) {
        for (let i = 0; i < pageCount; i++) {
          pages.push(i);
        }
      } else {
        pages.push(0); // Always show first page
        
        if (pageIndex > 1) {
          if (pageIndex > 2) {
            pages.push('...');
          }
          pages.push(pageIndex);
        }
        
        if (pageIndex < pageCount - 2) {
          pages.push(pageIndex + 1);
          if (pageIndex < pageCount - 3) {
            pages.push('...');
          }
        }
        
        pages.push(pageCount - 1); // Always show last page
      }
      
      return pages;
    };
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
              className={`cursor-pointer ${pageIndex === 0 ? 'opacity-50 pointer-events-none' : ''}`}
            />
          </PaginationItem>
          
          {getPageNumbers().map((page, index) => (
            <PaginationItem key={index}>
              {page === '...' ? (
                <span className="px-4 py-2">...</span>
              ) : (
                <PaginationLink
                  className={`cursor-pointer ${page === pageIndex ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => onPageChange(page as number)}
                >
                  {(page as number) + 1}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(pageIndex + 1, pageCount - 1))}
              className={`cursor-pointer ${pageIndex >= pageCount - 1 ? 'opacity-50 pointer-events-none' : ''}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Render actions dropdown menu
  const renderActionsMenu = () => {
    if (!actions || actions.length === 0 || !selectedRows.length) return null;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-2">
            Actions
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => action.onClick(selectedRows)}
              className={action.color}
              disabled={action.disabled}
            >
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Use the existing sortedData state variable
  useEffect(() => {
    // Update sortedData when sort config changes
    setSortedData(getSortedData());
  }, [sortConfig, data]);

  return (
    <div className="space-y-4">
      {/* Selection info and actions */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between mb-4 bg-muted/50 p-2 rounded-md">
          <span className="text-sm font-medium">
            {selectedRows.length} row{selectedRows.length !== 1 ? 's' : ''} selected
          </span>
          {renderActionsMenu()}
        </div>
      )}
      
      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Select all checkbox */}
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={data.length > 0 && selectedRows.length === data.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </TableHead>
              
              {/* Column headers */}
              {columns.map((column, index) => (
                <TableHead 
                  key={index}
                  className={`${column.sortable ? 'cursor-pointer select-none' : ''}`}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {getSortIcon(column)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-6 text-muted-foreground">
                  {noDataMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, rowIndex) => (
                <TableRow key={String(row[idField]) || rowIndex} className={isSelected(row) ? 'bg-accent/40' : ''}>
                  {/* Row select checkbox */}
                  <TableCell>
                    <Checkbox
                      checked={isSelected(row)}
                      onCheckedChange={(checked) => handleRowSelect(row, !!checked)}
                      aria-label={`Select row ${rowIndex + 1}`}
                    />
                  </TableCell>
                  
                  {/* Row cells */}
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {getCellValue(row, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {renderPagination()}
    </div>
  );
} 