import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useRole } from '@/features/roles/hooks/useRole';
import { RoleForm } from '@/features/roles/components/RoleForm';
import { RoleUsersRail } from '@/features/roles/components/RoleUsersRail';
import { ApiError } from '@/lib/apiClient';

export function RoleEditPage() {
  const { roleId } = useParams();
  const id = roleId ?? '';
  const { data, isPending, isError, error, refetch } = useRole(id);

  const notFound = error instanceof ApiError && error.statusCode === 404;

  let body: ReactNode;
  if (isPending) {
    body = (
      <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
        <Spinner />
        Loading role…
      </div>
    );
  } else if (isError) {
    let errorMessage = 'Could not load this role. Please try again.';
    if (notFound) {
      errorMessage = 'This role could not be found.';
    }
    body = (
      <div className="flex flex-col items-start gap-3 p-8">
        <Alert variant="destructive" role="alert">
          {errorMessage}
        </Alert>
        {!notFound && (
          <Button variant="outline" onClick={() => void refetch()}>
            Retry
          </Button>
        )}
      </div>
    );
  } else {
    body = <RoleForm mode="edit" roleId={id} initialData={data} />;
  }

  let subtitle = 'Update an existing role.';
  if (data) {
    subtitle = data.name;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-base font-semibold">Edit role</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_580px]">
        <div className="min-w-0">{body}</div>
        {/* Only once the role has loaded — during the loading/error states
            there is no membership list to show yet. */}
        {data && <RoleUsersRail users={data.users} />}
      </div>
    </div>
  );
}
