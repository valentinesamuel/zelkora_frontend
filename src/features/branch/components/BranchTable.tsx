import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnMeta } from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  branchColumns,
  type BranchListRow,
} from '@/features/branch/components/branchColumns';

// Minimal sort shape — `BranchListQuery` (Phase 7) is structurally compatible.
export interface BranchTableSort {
  readonly sortField: 'name' | 'code';
  readonly sortDir: 'asc' | 'desc';
}

interface BranchTableProps {
  readonly branches: BranchListRow[];
  readonly sort: BranchTableSort;
  readonly onToggleSort: (field: 'name' | 'code') => void;
}

function ariaSortFor(
  meta: ColumnMeta<BranchListRow, unknown> | undefined,
  sort: BranchTableSort,
): 'ascending' | 'descending' | 'none' | undefined {
  if (!meta?.sortKey) return undefined;
  if (sort.sortField !== meta.sortKey) return 'none';
  if (sort.sortDir === 'asc') return 'ascending';
  return 'descending';
}

export function BranchTable({
  branches,
  sort,
  onToggleSort,
}: BranchTableProps) {
  const table = useReactTable({
    data: branches,
    columns: branchColumns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
    getRowId: (b) => b.id,
    meta: {
      sortField: sort.sortField,
      sortDir: sort.sortDir,
      // Shared `TableMeta.onToggleSort` is `(field: string) => void` (INV-B16);
      // the branch columns only ever pass `'name' | 'code'`, re-narrow here.
      onToggleSort: (field: string) => {
        onToggleSort(field as 'name' | 'code');
      },
    },
  });

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={header.column.columnDef.meta?.headerClassName}
                  aria-sort={ariaSortFor(header.column.columnDef.meta, sort)}
                >
                  {!header.isPlaceholder &&
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cell.column.columnDef.meta?.cellClassName}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
