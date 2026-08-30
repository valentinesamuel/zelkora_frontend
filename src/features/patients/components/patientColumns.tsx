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
import {
  patientAge,
  patientDisplayStatus,
  patientLastVisitAt,
} from '@/features/patients/patientView';
import type { Patient } from '@/features/patients/types/patient.types';

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
    cell: ({ row }) => formatAge(patientAge(row.original)),
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
    cell: ({ row }) => formatSex(row.original.gender),
    meta: { headerClassName: 'w-20' },
  },
  {
    id: 'phone',
    enableSorting: false,
    header: 'Phone',
    cell: ({ row }) => formatPatientPhone(row.original.phoneNumber || null),
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
    cell: () => formatLastVisit(patientLastVisitAt()),
    meta: {
      headerClassName: 'w-28',
      cellClassName: 'text-muted-foreground tabular-nums',
    },
  },
  {
    id: 'status',
    enableSorting: false,
    header: 'Status',
    cell: ({ row }) => (
      <PatientStatusBadge status={patientDisplayStatus(row.original)} />
    ),
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
