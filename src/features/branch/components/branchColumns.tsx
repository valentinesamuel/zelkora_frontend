import type { ColumnDef } from '@tanstack/react-table';

import { BranchRowActions } from '@/features/branch/components/BranchRowActions';
import { BranchSortableHeader } from '@/features/branch/components/BranchSortableHeader';
import { BranchStatusBadge } from '@/features/branch/components/BranchStatusBadge';
import type { Branch } from '@/features/branch/types/branch.types';

// Projected shape for the list table. Kept in sync with `toBranchQuery`'s
// `.select(...)` so a row carries exactly what the server returned.
export const BRANCH_LIST_FIELDS = [
  'id',
  'name',
  'code',
  'phoneNumber',
  'email',
  'address',
  'isActive',
] as const;

export type BranchListRow = Pick<Branch, (typeof BRANCH_LIST_FIELDS)[number]>;

const EMPTY_CELL = '—';

const MONO_CELL = 'font-mono text-xs tabular-nums';

export const branchColumns: ColumnDef<BranchListRow>[] = [
  {
    id: 'name',
    enableSorting: false,
    header: ({ table }) => (
      <BranchSortableHeader
        label="Name"
        sortKey="name"
        meta={table.options.meta}
      />
    ),
    cell: ({ row }) => row.original.name || EMPTY_CELL,
    meta: {
      headerClassName: 'min-w-56',
      cellClassName: 'font-medium',
      sortKey: 'name',
    },
  },
  {
    id: 'code',
    enableSorting: false,
    header: ({ table }) => (
      <BranchSortableHeader
        label="Code"
        sortKey="code"
        meta={table.options.meta}
      />
    ),
    cell: ({ row }) => row.original.code || EMPTY_CELL,
    meta: {
      headerClassName: 'w-28',
      cellClassName: `${MONO_CELL} text-muted-foreground`,
      sortKey: 'code',
    },
  },
  {
    id: 'phone',
    enableSorting: false,
    header: 'Phone',
    cell: ({ row }) => row.original.phoneNumber || EMPTY_CELL,
    meta: { headerClassName: 'w-40', cellClassName: MONO_CELL },
  },
  {
    id: 'email',
    enableSorting: false,
    header: 'Email',
    cell: ({ row }) => row.original.email || EMPTY_CELL,
    meta: {
      headerClassName: 'min-w-48',
      cellClassName: 'text-muted-foreground',
    },
  },
  {
    id: 'address',
    enableSorting: false,
    header: 'Address',
    cell: ({ row }) => (
      <span className="block max-w-64 truncate" title={row.original.address}>
        {row.original.address || EMPTY_CELL}
      </span>
    ),
    meta: { headerClassName: 'min-w-48' },
  },
  {
    id: 'status',
    enableSorting: false,
    header: 'Status',
    cell: ({ row }) => <BranchStatusBadge isActive={row.original.isActive} />,
    meta: { headerClassName: 'w-28' },
  },
  {
    id: 'actions',
    enableSorting: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <BranchRowActions branch={row.original} />,
    meta: { headerClassName: 'w-11', cellClassName: 'text-right' },
  },
];
