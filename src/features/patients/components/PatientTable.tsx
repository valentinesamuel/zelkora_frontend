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
  patientColumns,
  type PatientListRow,
} from '@/features/patients/components/patientColumns';
import type { PatientListQuery } from '@/features/patients/types/patientListQuery.types';

interface PatientTableProps {
  readonly patients: PatientListRow[];
  readonly sort: PatientListQuery;
  readonly onToggleSort: (field: 'name' | 'age') => void;
}


function ariaSortFor(
  meta: ColumnMeta<PatientListRow, unknown> | undefined,
  sort: PatientListQuery,
): 'ascending' | 'descending' | 'none' | undefined {
  if (!meta?.sortKey) return undefined;
  if (sort.sortField !== meta.sortKey) return 'none';
  if (sort.sortDir === 'asc') return 'ascending';
  return 'descending';
}

export function PatientTable({
  patients,
  sort,
  onToggleSort,
}: PatientTableProps) {
  const table = useReactTable({
    data: patients,
    columns: patientColumns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
    getRowId: (p) => p.id,
    meta: {
      sortField: sort.sortField,
      sortDir: sort.sortDir,
      // The global `TableMeta.onToggleSort` is `(field: string) => void` now
      // (INV-B16 — no entity-specific unions in the shared augmentation). The
      // patient columns only ever pass `'name' | 'age'`, so re-narrow here.
      onToggleSort: (field: string) => {
        onToggleSort(field as 'name' | 'age');
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
