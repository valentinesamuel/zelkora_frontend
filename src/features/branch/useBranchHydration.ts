// The ONLY place the filters store and the auth store meet (I-31 / INV-B12). A
// `.ts` hook — not a component (I-22). It READS `authStore` and never writes it
// — `User` is server truth; the active branch is a client-side view preference
// (F3-b).
//
// It owns TWO jobs:
//
//   1. The post-auth USER SEED — applied exactly once per session, and only
//      when the user had no persisted preference. Why two flags and not one
//      (D7 / I-31b / INV-B13): the two questions have contradictory correct
//      initialisers. `persistedOnInit` is `true` for a returning user (so the
//      seed is skipped); `userSeedApplied` is `false` for EVERY user at session
//      start (so the one-shot can fire). A single boolean cannot hold both, and
//      collapsing them silently overwrites a returning user's explicit branch
//      choice on every load (H-12 / R2 / F3-a).
//
//   2. RECONCILIATION (INV-B5) — on EVERY change to the resolved active-branch
//      set, any `branchId` that is `null` or absent from that set is replaced
//      with the first active branch by name order. This covers a legacy
//      persisted id (`dev-branch`), a branch deactivated by another admin, and
//      the branch the current user just deactivated themselves (D10 — otherwise
//      Radix `Select` renders an empty trigger).
//
// Phase 3 added ONE thing to job 1 — the "wait for the active set to resolve"
// gate — and nothing else about the flag logic changed (INV-B13).
//
// Phase 4 (D4) adds the `branch:read` pre-flight: a user who provably lacks the
// permission never issues the guaranteed-403 `GET /branches`. A disabled query
// never settles, so `!canRead` is treated as an equivalent "resolved, cannot
// validate" state — identical seeding behaviour to the `isError` (403) path:
// the JWT `user.branchId` is server truth and is seeded UNVALIDATED.

import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/authStore';
import { PERMISSIONS } from '@/features/auth/permissions';
import { useCan } from '@/features/auth/useCan';
import { useActiveBranches } from '@/features/branch/api/branches.api';
import { useDashboardFiltersStore } from '@/features/dashboard/filters/dashboardFiltersStore';

export function useBranchHydration(): void {
  const user = useAuthStore((s) => s.user);
  const persistedOnInit = useDashboardFiltersStore((s) => s.persistedOnInit);
  const userSeedApplied = useDashboardFiltersStore((s) => s.userSeedApplied);
  const branchId = useDashboardFiltersStore((s) => s.branchId);
  const setBranchId = useDashboardFiltersStore((s) => s.setBranchId);
  const markUserSeedApplied = useDashboardFiltersStore(
    (s) => s.markUserSeedApplied,
  );

  // D4 pre-flight: gate the request on the client-side permission check so a
  // provably-unauthorised user issues no `/branches` request at all.
  const canRead = useCan({ permission: [PERMISSIONS.BRANCH.READ] });
  const { data, isError, isSuccess } = useActiveBranches({ enabled: canRead });
  // "The active set has resolved" = the query settled either way, OR the query
  // was never issued because the user lacks `branch:read`. On error (403) or a
  // disabled query we still proceed — we just cannot validate against a list.
  const resolved = isSuccess || isError || !canRead;
  // Cannot validate against a live list: either the request 403'd, or it was
  // never sent. Both take the "seed the JWT branch unvalidated" path.
  const cannotValidate = isError || !canRead;

  // ── Job 1: post-auth one-shot user seed ────────────────────────────────
  useEffect(() => {
    if (userSeedApplied || user === null || !resolved) {
      return;
    }

    // Unconditional — the one-shot has been "considered" regardless of which
    // path below runs (F3-j: calling this inside the inner branch leaves a
    // returning user's seed permanently unmarked and re-evaluating all
    // session).
    markUserSeedApplied();

    // Only seed when the user had NO stored preference. `persistedOnInit` is
    // the store's init snapshot and is never mutated (F3-a).
    if (persistedOnInit) {
      return;
    }

    if (cannotValidate) {
      // A client that cannot list branches (403, or no `branch:read` so the
      // request was never sent) must not overwrite server truth with `null`.
      // Seed the JWT `branchId` UNVALIDATED; Effect 2 is a no-op without
      // `data` so it will not undo this.
      if (user.branchId !== null) {
        setBranchId(user.branchId);
      }
      return;
    }

    // Success: seed only if the JWT branch is actually in the active set.
    // Otherwise leave `branchId` as-is for reconciliation (Effect 2) to pick
    // the first active branch.
    const inActiveSet =
      user.branchId !== null &&
      (data?.data.some((b) => b.id === user.branchId) ?? false);
    if (inActiveSet) {
      setBranchId(user.branchId as string);
    }
  }, [
    user,
    userSeedApplied,
    persistedOnInit,
    resolved,
    cannotValidate,
    data,
    setBranchId,
    markUserSeedApplied,
  ]);

  // ── Job 2: reconciliation on every active-set change (INV-B5) ──────────
  useEffect(() => {
    // Unresolved or error: do nothing — never write `null`/a guess over a
    // plausible persisted id. (`data` is populated only on success.)
    if (!data) {
      return;
    }
    const activeBranches = data.data;
    if (activeBranches.length === 0) {
      return;
    }
    if (branchId === null || !activeBranches.some((b) => b.id === branchId)) {
      // First by name — `useActiveBranches()` sorts `name asc`.
      setBranchId(activeBranches[0].id);
    }
  }, [data, branchId, setBranchId]);
}
