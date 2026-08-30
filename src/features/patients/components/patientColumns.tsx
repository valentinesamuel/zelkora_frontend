import type { ColumnDef } from '@tanstack/react-table';

import { PatientIdentityCell } from '@/features/patients/components/PatientIdentityCell';
import { PatientRowActions } from '@/features/patients/components/PatientRowActions';
import { PatientSortableHeader } from '@/features/patients/components/PatientSortableHeader';
import { PatientStatusBadge } from '@/features/patients/components/PatientStatusBadge';
import {
  formatAge,
  formatLastVisit,
  formatPatientPhone,
  formatSex,
} from '@/features/patients/format';
import type { Patient } from '@/features/patients/types/patient.types';

/**
 * Column model for the patients table. Every column is a DISPLAY column — `id` +
 * `header` + `cell`, no `accessorKey` — because sorting/filtering/pagination are
 * all server-side and the table never reads values itself. `enableSorting` is
 * `false` everywhere so TanStack never attaches its own sort handlers. Width and
 * alignment classes live entirely in `meta.headerClassName` / `meta.cellClassName`
 * so the render loop in PatientTable stays generic. `meta.sortKey` marks the two
 * sortable columns and is what drives `aria-sort` on the `<th>`.
 */
export const patientColumns: ColumnDef<Patient>[] = [
  {
    id: 'patient',
    enableSorting: false,
    header: ({ table }) => (
      <PatientSortableHeader
        label="Patient"
        sortKey="name"
        meta={table.options.meta!}
      />
    ),
    cell: ({ row }) => <PatientIdentityCell patient={row.original} />,
    meta: { headerClassName: 'min-w-56', sortKey: 'name' },
  },
  {
    id: 'zrn',
    enableSorting: false,
    header: 'ZRN',
    cell: ({ row }) => row.original.zrn || '—',
    meta: {
      headerClassName: 'w-40',
      cellClassName: 'font-mono text-xs tabular-nums text-muted-foreground',
    },
  },
  {
    id: 'age',
    enableSorting: false,
    header: ({ table }) => (
      <PatientSortableHeader
        label="Age"
        sortKey="age"
        align="end"
        meta={table.options.meta!}
      />
    ),
    cell: ({ row }) => formatAge(row.original.age),
    meta: {
      headerClassName: 'w-20 text-right',
      cellClassName: 'tabular-nums text-right',
      sortKey: 'age',
    },
  },
  {
    id: 'sex',
    enableSorting: false,
    header: 'Sex',
    cell: ({ row }) => formatSex(row.original.sex),
    meta: { headerClassName: 'w-20' },
  },
  {
    id: 'phone',
    enableSorting: false,
    header: 'Phone',
    cell: ({ row }) => formatPatientPhone(row.original.phone),
    meta: {
      headerClassName: 'w-36',
      cellClassName: 'font-mono text-xs tabular-nums',
    },
  },
  {
    id: 'lastVisit',
    enableSorting: false,
    header: () => (
      <abbr title="No visit data recorded yet" className="no-underline">
        Last visit
      </abbr>
    ),
    cell: ({ row }) => formatLastVisit(row.original.lastVisitAt),
    meta: {
      headerClassName: 'w-28',
      cellClassName: 'text-muted-foreground tabular-nums',
    },
  },
  {
    id: 'status',
    enableSorting: false,
    header: 'Status',
    cell: ({ row }) => <PatientStatusBadge status={row.original.status} />,
    meta: { headerClassName: 'w-28' },
  },
  {
    id: 'actions',
    enableSorting: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <PatientRowActions patient={row.original} />,
    meta: { headerClassName: 'w-11', cellClassName: 'text-right' },
  },
];
