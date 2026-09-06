import type { ReactNode } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStaffMe } from '@/features/staff/hooks/useStaffMe';
import type { StaffMe } from '@/features/staff/types/staff.types';
import { ApiError } from '@/lib/apiClient';

const ROW = 'flex items-center gap-4';
const LABEL = 'w-28 shrink-0 text-muted-foreground';
const NOT_SET = '—';

const SKELETON_ROWS = ['branch', 'profession', 'department', 'staff-number'];

function WelcomeSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-56" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {SKELETON_ROWS.map((row) => (
          <div key={row} className={ROW}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError && error.statusCode === 404) {
    return "Your staff profile isn't set up yet — contact an administrator.";
  }
  return "Couldn't load your profile. Try refreshing.";
}

function WelcomeError({ error }: Readonly<{ error: unknown }>) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Profile unavailable</AlertTitle>
      <AlertDescription>{errorMessage(error)}</AlertDescription>
    </Alert>
  );
}

interface DetailRow {
  label: string;
  value: ReactNode;
}

function detailRows(staff: StaffMe): DetailRow[] {
  return [
    { label: 'Branch', value: staff.branchName },
    {
      label: 'Profession',
      value: <Badge variant="neutral">{staff.profession}</Badge>,
    },
    { label: 'Department', value: staff.departmentName ?? NOT_SET },
    { label: 'Staff no.', value: staff.staffNumber },
  ];
}

function WelcomeCard({ staff }: Readonly<{ staff: StaffMe }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome, {staff.fullName}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-3 text-sm">
          {detailRows(staff).map((row) => (
            <div key={row.label} className={ROW}>
              <dt className={LABEL}>{row.label}</dt>
              <dd className="min-w-0 text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function WelcomeBody() {
  const { data, isPending, isError, error } = useStaffMe();

  if (isPending) {
    return <WelcomeSkeleton />;
  }

  if (isError) {
    return <WelcomeError error={error} />;
  }

  return <WelcomeCard staff={data} />;
}

export function WelcomeDashboard() {
  return (
    <div className="p-6">
      <WelcomeBody />
    </div>
  );
}
