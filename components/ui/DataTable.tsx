/**
 * DataTable Component
 *
 * A simple data table component for displaying tabular data
 *
 * @module ui/molecules
 */
import React from "react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableRow } from "./table";

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface DataTableProps<T> {
  /** The data to display in the table */
  data: T[];
  /** The columns to display */
  columns: {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
  }[];
  /** Additional class name for the table */
  className?: string;
  /** Whether to show a header */
  showHeader?: boolean;
  /** Text to display when there's no data */
  emptyText?: string;
  /** Additional props for the table */
  tableProps?: React.HTMLAttributes<HTMLTableElement>;
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
  tableProps,
}: DataTableProps<T>) {
  if (!data.length) {
    return <div className="text-center py-4 text-muted-foreground">{emptyText}</div>;
  }

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <Table {...tableProps}>
        {showHeader && (
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={column.className}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} className={column.className}>
                  {typeof column.accessor === "function"
                    ? column.accessor(row)
                    : row[column.accessor] as React.ReactNode}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 