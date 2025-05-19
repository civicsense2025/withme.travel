/**
 * Table (Molecule)
 *
 * A themeable, accessible table component (stub).
 *
 * @module ui/molecules
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface TableProps {
  children: React.ReactNode;
  className?: string;
}
export function Table({ children, className }: TableProps) {
  return <table className={cn('w-full', className)}>{children}</table>;
}

export interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}
export function TableHead({ children, className }: TableHeadProps) {
  return <thead className={className}>{children}</thead>;
}

export interface TableBodyProps {
  children: React.ReactNode;
}
export function TableBody({ children }: TableBodyProps) {
  return <tbody>{children}</tbody>;
}

export interface TableRowProps {
  children: React.ReactNode;
}
export function TableRow({ children }: TableRowProps) {
  return <tr>{children}</tr>;
}

export interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
  [key: string]: any;
}
export function TableCell({ children, className, colSpan, ...props }: TableCellProps) {
  return <td className={className} colSpan={colSpan} {...props}>{children}</td>;
}

export interface TableHeaderCellProps {
  children: React.ReactNode;
}
export function TableHeaderCell({ children }: TableHeaderCellProps) {
  return <th>{children}</th>;
}

export const TableHeader = ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>;
