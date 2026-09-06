import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/app/providers/queryClient';
import { apiRequest } from '@/lib/apiClient';

import { staffKeys } from '@/features/staff/api/staff.keys';
import type { OnboardStaffBody } from '@/features/staff/types/staff.types';

// Response of `POST /staff` — mirrors `StaffResponse` in
// `zelkora_backend/internal/staff/dto.go`. Success is HTTP 200 (NOT 201);
// `apiRequest` resolves on any success envelope and throws `ApiError`
// otherwise — do NOT assert a status code here.
interface OnboardedStaff {
  id: string;
  userId: string;
  staffNumber: string;
  profession: string;
  branchId: string;
  baseBranchId: string;
  departmentId: string | null;
  licenseNumber: string;
  createdAt: string;
  updatedAt: string;
}

export function onboardStaff(body: OnboardStaffBody): Promise<OnboardedStaff> {
  return apiRequest<OnboardedStaff>('/staff', { method: 'POST', body });
}

// Invalidates the whole `['staff']` subtree so `useStaffList` (and
// `useStaffMe`) re-run after an onboard.
function invalidateStaff(): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: staffKeys.all });
}

export function useOnboardStaff() {
  return useMutation({
    mutationFn: onboardStaff,
    onSuccess: invalidateStaff,
  });
}
