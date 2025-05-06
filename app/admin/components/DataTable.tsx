'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';

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

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  bulkActions?: BulkAction<T>[];
  idField?: keyof T;
  pagination?: {
    pageSize: number;
    pageIndex: number;
    pageCount: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({
  data,
  columns,
  actions,
  bulkActions,
  idField = 'id' as keyof T,
  pagination,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
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

  const handleSort = (column: Column<T>) => {
    if (typeof column.accessor === 'function' || !column.sortable) return;

    const accessor = column.accessor as keyof T;
    
    if (sortField === accessor) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(accessor);
      setSortDirection('asc');
    }

    const sorted = [...sortedData].sort((a, b) => {
      const valueA = a[accessor];
      const valueB = b[accessor];

      if (valueA === valueB) return 0;
      
      if (valueA === null || valueA === undefined) return 1;
      if (valueB === null || valueB === undefined) return -1;

      // Compare based on the sorted field
      const compareResult = valueA < valueB ? -1 : 1;
      return sortDirection === 'asc' ? compareResult : -compareResult;
    });

    setSortedData(sorted);
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
    if (action.requiresConfirmation) {
      if (window.confirm(action.confirmationMessage || `Are you sure you want to ${action.label} ${selectedRows.length} items?`)) {
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
  
  const getCurrentPageData = () => {
    const start = (pageIndex) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const applyFilter = () => {
    if (activeFilterColumn && filterValue) {
      setFilters(prev => ({
        ...prev,
        [activeFilterColumn as string]: filterValue
      }));
      
      // Reset filter form
      setFilterValue('');
      setFilterDropdownOpen(false);
    }
  };
  
  const removeFilter = (columnName: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[columnName];
      return newFilters;
    });
  };
  
  const clearAllFilters = () => {
    setFilters({});
    setSearchTerm('');
  };
  
  const filterableColumns = columns.filter(
    column => column.filterable && typeof column.accessor !== 'function'
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="relative">
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            
            {filterDropdownOpen && (
              <div className="absolute z-10 mt-1 w-80 bg-white dark:bg-slate-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 p-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Filter by
                  </label>
                  <select
                    value={activeFilterColumn as string || ''}
                    onChange={(e) => setActiveFilterColumn(e.target.value as keyof T)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select column</option>
                    {filterableColumns.map((column, index) => (
                      <option key={index} value={column.accessor as string}>
                        {column.header}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Value
                  </label>
                  <input
                    type="text"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Filter value..."
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setFilterDropdownOpen(false)}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyFilter}
                    disabled={!activeFilterColumn || !filterValue}
                    className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>Show {size}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <div 
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {filter.column}: {filter.value}
              <button
                onClick={() => removeFilter(Object.keys(filters).find(key => {
                  const col = columns.find(col => 
                    typeof col.accessor === 'string' && col.accessor === key
                  );
                  return col?.header === filter.column;
                }) || '')}
                className="ml-1 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {bulkActions && bulkActions.length > 0 && selectedRows.length > 0 && (
        <div className="mb-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              {selectedRows.length} selected
            </span>
            <div className="flex space-x-2">
              {bulkActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleBulkAction(action)}
                  disabled={selectedRows.length === 0}
                  className={`px-3 py-1 rounded-md text-white ${
                    action.color || 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
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
                      column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column)}
                  >
                    <div className="flex items-center">
                      <span>{column.header}</span>
                      {column.sortable && typeof column.accessor !== 'function' && sortField === column.accessor && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
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
            <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
              {getCurrentPageData().length > 0 ? (
                getCurrentPageData().map((row, rowIndex) => {
                  const isSelected = selectedRows.some((r) => r[idField] === row[idField]);
                  
                  return (
                    <tr
                      key={rowIndex}
                      className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
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
                      {columns.map((column, columnIndex) => (
                        <td key={columnIndex} className="px-6 py-4 whitespace-nowrap text-sm">
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
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (bulkActions && bulkActions.length > 0 ? 1 : 0) + (actions && actions.length > 0 ? 1 : 0)}
                    className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-600 px-4 py-3 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(0, pageIndex - 1))}
                disabled={pageIndex === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(pageCount - 1, pageIndex + 1))}
                disabled={pageIndex === pageCount - 1}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing{' '}
                  <span className="font-medium">{pageIndex * pageSize + 1}</span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min((pageIndex + 1) * pageSize, filteredData.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredData.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(0, pageIndex - 1))}
                    disabled={pageIndex === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white dark:bg-slate-700 dark:border-slate-600 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, pageCount) }).map((_, i) => {
                    let pageNum;
                    if (pageCount <= 5) {
                      pageNum = i;
                    } else if (pageIndex < 2) {
                      pageNum = i;
                    } else if (pageIndex > pageCount - 3) {
                      pageNum = pageCount - 5 + i;
                    } else {
                      pageNum = pageIndex - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageIndex === pageNum
                            ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300'
                            : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(pageCount - 1, pageIndex + 1))}
                    disabled={pageIndex === pageCount - 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white dark:bg-slate-700 dark:border-slate-600 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 