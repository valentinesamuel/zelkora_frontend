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
import { patientColumns } from '@/features/patients/components/patientColumns';
import type { Patient } from '@/features/patients/types/patient.types';
import type { PatientListQuery } from '@/features/patients/types/patientListQuery.types';

interface PatientTableProps {
  readonly patients: Patient[];
  readonly sort: PatientListQuery;
  readonly onToggleSort: (field: 'name' | 'age') => void;
}


function ariaSortFor(
  meta: ColumnMeta<Patient, unknown> | undefined,
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
      onToggleSort,
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
