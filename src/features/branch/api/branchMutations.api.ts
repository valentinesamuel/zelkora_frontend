import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/app/providers/queryClient';
import { branchQueryKeys } from '@/features/branch/api/branches.keys';
import { apiRequest } from '@/lib/apiClient';
import type {
  Branch,
  CreateBranchBody,
  UpdateBranchBody,
} from '@/features/branch/types/branch.types';

// `POST /branches`. `body.isActive` must always be present — the Go field is
// `bool`, not `*bool`, so an omitted key creates an inactive branch (INV-B4).
// That guarantee is enforced upstream in `buildCreateBranchBody` (Phase 5),
// not here.
export function createBranch(body: CreateBranchBody): Promise<Branch> {
  return apiRequest<Branch>('/branches', { method: 'POST', body });
}

// `PATCH /branches/:id` — `UpdateBranchBody` structurally excludes `name` and
// `code` (INV-B1); there is no way to send them through this function.
export function updateBranch(
  id: string,
  body: UpdateBranchBody,
): Promise<Branch> {
  return apiRequest<Branch>(`/branches/${id}`, { method: 'PATCH', body });
}

// NOTE: there is deliberately NO `deleteBranch`. `internal/branch/routes.go`
// registers no DELETE route; deactivation (`isActive: false`) is the only
// retirement mechanism (INV-B2).

// Invalidates the whole `['branches']` subtree — which INCLUDES
// `activeList()`. That is required, not incidental: a create or an
// isActive toggle must re-run `useActiveBranches()` so the reconciliation
// hook re-converges the store's `branchId` (D10 / INV-B5).
function invalidateBranches(): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: branchQueryKeys.all });
}

export function useCreateBranch() {
  return useMutation({
    mutationFn: createBranch,
    onSuccess: invalidateBranches,
  });
}

export function useUpdateBranch(id: string) {
  return useMutation({
    mutationFn: (body: UpdateBranchBody) => updateBranch(id, body),
    onSuccess: invalidateBranches,
  });
}
