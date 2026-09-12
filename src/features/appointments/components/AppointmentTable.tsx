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
  appointmentColumns,
  type AppointmentListRow,
} from '@/features/appointments/components/appointmentColumns';
import type {
  AppointmentSortDir,
  AppointmentSortField,
} from '@/features/appointments/filters/appointmentListParams';

// Minimal sort shape — `AppointmentListQuery` is structurally compatible.
export interface AppointmentTableSort {
  readonly sortField: AppointmentSortField;
  readonly sortDir: AppointmentSortDir;
}

interface AppointmentTableProps {
  readonly appointments: AppointmentListRow[];
  readonly sort: AppointmentTableSort;
  readonly onToggleSort: (field: AppointmentSortField) => void;
}

function ariaSortFor(
  meta: ColumnMeta<AppointmentListRow, unknown> | undefined,
  sort: AppointmentTableSort,
): 'ascending' | 'descending' | 'none' | undefined {
  if (!meta?.sortKey) return undefined;
  if (sort.sortField !== meta.sortKey) return 'none';
  if (sort.sortDir === 'asc') return 'ascending';
  return 'descending';
}

export function AppointmentTable({
  appointments,
  sort,
  onToggleSort,
}: AppointmentTableProps) {
  const table = useReactTable({
    data: appointments,
    columns: appointmentColumns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
    getRowId: (a) => a.id,
    meta: {
      sortField: sort.sortField,
      sortDir: sort.sortDir,
      // Shared `TableMeta.onToggleSort` is `(field: string) => void`; the
      // appointment columns only ever pass an `AppointmentSortField`, so it is
      // re-narrowed here.
      onToggleSort: (field: string) => {
        onToggleSort(field as AppointmentSortField);
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
