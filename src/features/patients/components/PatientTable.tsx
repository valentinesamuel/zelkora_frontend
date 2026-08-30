/* eslint-disable react-hooks/incompatible-library */
// `useReactTable` returns non-memoizable functions, so the React Compiler skips
// memoizing this component. That is fine here: manual mode keeps no client row
// models and no derived state, nothing downstream depends on the memoization,
// and the rule cannot be silenced with an inline directive. File-top disable,
// matching the project's precedent (`ui/badge.tsx`, `ui/button.tsx`).
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

/**
 * `aria-sort` belongs on the `<th>` and only on sortable columns. Non-sortable
 * heads (no `meta.sortKey`) get no attribute at all — returning `undefined`, not
 * `'none'`, so screen readers do not announce them as sortable.
 */
function ariaSortFor(
  meta: ColumnMeta<Patient, unknown> | undefined,
  sort: PatientListQuery,
): 'ascending' | 'descending' | 'none' | undefined {
  if (!meta?.sortKey) return undefined;
  if (sort.sortField !== meta.sortKey) return 'none';
  return sort.sortDir === 'asc' ? 'ascending' : 'descending';
}

/**
 * The patients list, rendered through TanStack Table in MANUAL mode:
 * `manualSorting`/`manualPagination`/`manualFiltering` are all `true`, there is
 * no `state.sorting`/`onSortingChange` and no row model beyond `getCoreRowModel`.
 * `data` is the already-server-sorted, already-paginated page. Sorting is driven
 * entirely by the column-header buttons, which call `onToggleSort` (a URL write).
 */
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
                  {header.isPlaceholder
                    ? null
                    : flexRender(
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
