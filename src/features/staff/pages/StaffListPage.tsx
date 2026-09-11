import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { isOffsetResult } from '@/lib/query';

import { userStatusBadgeVariant, userStatusLabel } from '@/lib/userStatus';

import { Can } from '@/features/auth/Can';
import { PERMISSIONS } from '@/features/auth/permissions';
import { staffQuery } from '@/features/staff/api/staff.queryMeta';
import { StaffRowActions } from '@/features/staff/components/StaffRowActions';
import { useRoles } from '@/features/staff/hooks/useRoles';
import { useStaffList } from '@/features/staff/hooks/useStaffList';

const PAGE_SIZE = 25;
const SKELETON_ROWS = 8;
const EMPTY_CELL = '—';
const MONO_CELL = 'font-mono text-xs tabular-nums';

const countFormatter = new Intl.NumberFormat('en-NG');
const dateFormatter = new Intl.DateTimeFormat('en-NG', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

function formatCreatedAt(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return EMPTY_CELL;
  return dateFormatter.format(parsed);
}

function StaffStatusCell({ status }: { readonly status: string | undefined }) {
  if (status === undefined) return EMPTY_CELL;
  return (
    <Badge variant={userStatusBadgeVariant(status)}>
      {userStatusLabel(status)}
    </Badge>
  );
}

export function StaffListPage() {
  const query = useMemo(
    () =>
      staffQuery()
        .sort('createdAt', 'desc')
        .offset(1, PAGE_SIZE)
        .withTotal(true)
        .include('user'),
    [],
  );
  const { data, isPending, isError, refetch } = useStaffList(query);

  const rolesQuery = useRoles();
  const roleNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const role of rolesQuery.data ?? []) {
      map.set(role.id, role.name);
    }
    return map;
  }, [rolesQuery.data]);

  let results: ReactNode;
  if (isPending) {
    results = (
      <div className="flex flex-col gap-2" aria-busy="true">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
    );
  } else if (isError) {
    results = (
      <div className="flex flex-col items-start gap-3 rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">
          Something went wrong loading staff.
        </p>
        <Button variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  } else {
    const rows = [...data.data];

    let total = rows.length;
    if (isOffsetResult(data)) {
      total = data.total;
    }

    if (rows.length === 0) {
      results = (
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">No staff yet.</p>
        </div>
      );
    } else {
      results = (
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-48">Name</TableHead>
                  <TableHead className="min-w-56">Email</TableHead>
                  <TableHead className="w-40">Staff number</TableHead>
                  <TableHead className="w-32">Profession</TableHead>
                  <TableHead className="w-40">Role</TableHead>
                  <TableHead className="min-w-56">Branch</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-32">Created</TableHead>
                  <TableHead className="w-11">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">
                      {staff.user?.fullName || EMPTY_CELL}
                    </TableCell>
                    <TableCell className="break-all text-muted-foreground">
                      {staff.user?.email || EMPTY_CELL}
                    </TableCell>
                    <TableCell className={MONO_CELL}>
                      {staff.staffNumber || EMPTY_CELL}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{staff.profession}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {(staff.user &&
                        roleNameById.get(staff.user.roleId)) ||
                        EMPTY_CELL}
                    </TableCell>
                    <TableCell className={`${MONO_CELL} text-muted-foreground`}>
                      {staff.branchId || EMPTY_CELL}
                    </TableCell>
                    <TableCell>
                      <StaffStatusCell status={staff.user?.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatCreatedAt(staff.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <StaffRowActions staff={staff} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {countFormatter.format(rows.length)} of{' '}
            {countFormatter.format(total)} staff
          </p>
        </div>
      );
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 p-6">
      <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Staff
          </h1>
          <p className="text-sm text-muted-foreground">
            View the staff records for your branch.
          </p>
        </div>
        <Can permission={[PERMISSIONS.STAFF.CREATE]}>
          <Button asChild>
            <Link to="/staff/new">
              <Plus aria-hidden="true" />
              Invite staff
            </Link>
          </Button>
        </Can>
      </header>

      {results}
    </div>
  );
}
