import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { RoleRowActions } from '@/features/roles/components/RoleRowActions';
import type { Role } from '@/features/roles/roles.types';

// Projected shape for the list table — the whole `Role` object, since
// `GET /auth/roles` returns full records (not paginated/`.select()`-ed like
// `Branch`/`StaffListItem`).
export type RoleListRow = Role;

const EMPTY_CELL = '—';

export const roleColumns: ColumnDef<RoleListRow>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => row.original.name,
    meta: { headerClassName: 'min-w-40', cellClassName: 'font-medium' },
  },
  {
    id: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <span
        className="block max-w-80 truncate"
        title={row.original.description}
      >
        {row.original.description || EMPTY_CELL}
      </span>
    ),
    meta: {
      headerClassName: 'min-w-48',
      cellClassName: 'text-muted-foreground',
    },
  },
  {
    id: 'permissions',
    header: 'Permissions',
    cell: ({ row }) => {
      const count = row.original.permissions.length;
      let suffix = 's';
      if (count === 1) {
        suffix = '';
      }
      return (
        <Badge variant="neutral">
          {count} permission{suffix}
        </Badge>
      );
    },
    meta: { headerClassName: 'w-40' },
  },
  {
    id: 'userCount',
    header: 'Users',
    cell: ({ row }) => row.original.userCount,
    meta: {
      headerClassName: 'w-20',
      cellClassName: 'font-mono text-xs tabular-nums',
    },
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RoleRowActions role={row.original} />,
    meta: { headerClassName: 'w-11', cellClassName: 'text-right' },
  },
];
