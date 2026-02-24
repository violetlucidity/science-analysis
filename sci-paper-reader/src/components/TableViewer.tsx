/**
 * TableViewer component.
 *
 * Renders tables with sortable columns using @tanstack/react-table,
 * and provides a CSV download button.
 */
import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import type { Table as TableData } from '../types';

/** Props for TableViewer. */
interface TableViewerProps {
  /** The table data to render. */
  table: TableData;
}

/**
 * TableViewer renders a data table with sortable columns and a CSV download button.
 * Uses @tanstack/react-table for sorting functionality.
 *
 * @param props - TableViewerProps
 * @returns The rendered table with controls.
 */
const TableViewer: React.FC<TableViewerProps> = ({ table }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Build column definitions from headers
  const columns = useMemo<ColumnDef<Record<string, string>>[]>(
    () =>
      table.headers.map((header, i) => ({
        id: `col-${i}`,
        accessorKey: header,
        header,
        cell: (info) => info.getValue() as string,
      })),
    [table.headers]
  );

  // Convert rows to objects keyed by header
  const data = useMemo<Record<string, string>[]>(
    () =>
      table.rows.map((row) =>
        Object.fromEntries(table.headers.map((h, i) => [h, row[i] ?? '']))
      ),
    [table.headers, table.rows]
  );

  const reactTable = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const downloadCsv = () => {
    const rows = [table.headers, ...table.rows];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table-${table.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      {table.caption && (
        <p className="px-4 pt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          {table.caption}
        </p>
      )}

      <table
        className="w-full text-sm text-left text-gray-700 dark:text-gray-300"
        aria-label={table.caption || 'Data table'}
      >
        <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 dark:text-gray-400">
          {reactTable.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className="px-4 py-2 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={header.column.getToggleSortingHandler()}
                  aria-sort={
                    header.column.getIsSorted() === 'asc'
                      ? 'ascending'
                      : header.column.getIsSorted() === 'desc'
                        ? 'descending'
                        : 'none'
                  }
                >
                  <span className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' && ' ↑'}
                    {header.column.getIsSorted() === 'desc' && ' ↓'}
                    {!header.column.getIsSorted() && (
                      <span className="text-gray-300 dark:text-gray-600">↕</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {reactTable.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={downloadCsv}
          className="text-xs rounded border border-teal-500 text-teal-600 dark:text-teal-400 px-3 py-1 hover:bg-teal-50 dark:hover:bg-teal-900"
          aria-label="Download table as CSV"
        >
          Download CSV
        </button>
      </div>
    </div>
  );
};

export default TableViewer;
