import * as React from 'react';
import { flexRender, getCoreRowModel, useReactTable, } from '@tanstack/react-table';
export function DataTable({ columns, data, }) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });
    return (<div className="rounded-md border">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (<tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (<th key={header.id} className="px-4 py-2 text-left">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>))}
            </tr>))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (<tr key={row.id} className="border-t">
              {row.getVisibleCells().map((cell) => (<td key={cell.id} className="px-4 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>))}
            </tr>))}
        </tbody>
      </table>
    </div>);
}
