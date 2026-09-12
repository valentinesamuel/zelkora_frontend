// Resolves the bare `?branchId=` query param backend `branchscope.
// ResolveBranchID` requires from admin callers on branch-scoped list/create
// endpoints. Non-admins are always pinned server-side to their own JWT
// branch, so their requests must never carry this param — sending it would
// deviate from the rest of the codebase's admin-only gating (see
// `AppointmentForm.tsx`'s `buildCreateBody`, `patientForm.ts`'s
// `resolveCreateBranchId`) for no server-side effect.
export function resolveBranchScopeParam(
  isAdminCaller: boolean,
  storeBranchId: string | null,
): string | undefined {
  if (!isAdminCaller) return undefined;
  const trimmed = storeBranchId?.trim() ?? '';
  return trimmed === '' ? undefined : trimmed;
}
