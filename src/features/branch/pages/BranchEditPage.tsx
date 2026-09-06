import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { useBranch } from '@/features/branch/api/branches.api';
import { BranchForm } from '@/features/branch/components/BranchForm';
import { BranchFormSkeleton } from '@/features/branch/components/BranchFormSkeleton';
import { BranchLoadError } from '@/features/branch/components/BranchLoadError';
import { ApiError } from '@/lib/apiClient';

export function BranchEditPage() {
  const { branchId } = useParams();
  const id = branchId ?? '';
  const { data, isPending, isError, error, refetch } = useBranch(id);

  const notFound = error instanceof ApiError && error.statusCode === 404;

  let body: ReactNode;
  if (isPending) {
    body = <BranchFormSkeleton />;
  } else if (isError) {
    body = (
      <BranchLoadError
        notFound={notFound}
        error={error}
        onRetry={() => void refetch()}
      />
    );
  } else {
    body = <BranchForm mode="edit" branchId={id} initialData={data} />;
  }

  let subtitle = 'Update an existing branch.';
  if (data) {
    subtitle = `${data.name} - ${data.code}`;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Edit branch
        </h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </header>

      {body}
    </div>
  );
}
