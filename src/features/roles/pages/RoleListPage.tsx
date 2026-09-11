import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Can } from '@/features/auth/Can';
import { PERMISSIONS } from '@/features/auth/permissions';
import { RoleTable } from '@/features/roles/components/RoleTable';
import { useRoles } from '@/features/roles/hooks/useRoles';

export function RoleListPage() {
  const { data, isPending, isError, refetch } = useRoles();

  let body: ReactNode;
  if (isPending) {
    body = (
      <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
        <Spinner />
        Loading roles…
      </div>
    );
  } else if (isError) {
    body = (
      <div className="flex flex-col items-start gap-3 p-8">
        <Alert variant="destructive" role="alert">
          Could not load roles. Please try again.
        </Alert>
        <Button variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  } else if (data.length === 0) {
    body = (
      <p className="p-8 text-center text-sm text-muted-foreground">
        No roles found.
      </p>
    );
  } else {
    body = <RoleTable roles={[...data]} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Roles</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage roles and the permissions granted to each one.
          </p>
        </div>
        <Can permission={[PERMISSIONS.ROLE.CREATE]}>
          <Button asChild>
            <Link to="/settings/roles/new">New role</Link>
          </Button>
        </Can>
      </header>

      {body}
    </div>
  );
}
