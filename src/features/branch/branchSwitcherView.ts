// Pure decision function for `BranchSwitcher`. No `react`, no `@tanstack/*`, no
// store — plain values in, a tagged view out. Runs in the `node` Vitest env.
//
// Enforces INV-B16: a populated `useActiveBranches` cache ALWAYS renders. One
// unretried background refetch failure flips React Query `status` to `'error'`
// permanently while `data` stays populated; gating on `isError`/`isPending`
// would then blank a working switcher. This function never sees those flags —
// visibility is derived purely from `branches` + `branchId`, so an error status
// degrades the UI only when there is genuinely nothing cached (`branches` empty).

import type { ActiveBranch } from '@/features/branch/api/branches.api';

export interface BranchSwitcherViewInput {
  readonly canRead: boolean;
  readonly branches: readonly ActiveBranch[];
  readonly branchId: string | null;
}

export type BranchSwitcherView =
  | {
      kind: 'hidden';
      reason: 'no-permission' | 'no-data' | 'single-branch' | 'unreconciled';
    }
  | { kind: 'select'; active: ActiveBranch; branches: readonly ActiveBranch[] };

export function selectBranchSwitcherView(
  input: BranchSwitcherViewInput,
): BranchSwitcherView {
  const { canRead, branches, branchId } = input;

  if (!canRead) {
    return { kind: 'hidden', reason: 'no-permission' };
  }

  if (branches.length === 0) {
    return { kind: 'hidden', reason: 'no-data' };
  }

  // Data-driven, not just defensive: a genuine single-branch deployment is a
  // real case. Do NOT widen to `< 1` (INV-X1).
  if (branches.length < 2) {
    return { kind: 'hidden', reason: 'single-branch' };
  }

  // Exact `===` on ids, no trim/case-fold (INV-X2). No `?? branches[0]`
  // fallback (INV-B5) — reconciliation owns correcting a stale store; the
  // switcher stays hidden until the id is in the active set.
  const active = branches.find((b) => b.id === branchId);
  if (branchId == null || active === undefined) {
    return { kind: 'hidden', reason: 'unreconciled' };
  }

  // `branches` in server order — no client-side re-sort or `.filter(isActive)`
  // (INV-B3).
  return { kind: 'select', active, branches };
}
