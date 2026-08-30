// The ONLY place the filters store and the auth store meet (I-31). A `.ts` hook
// — not a component (I-22).
//
// The filters store initialises `branchId` at module-eval time, before
// `authStore.bootstrap()` resolves and `user` is known. This hook applies the
// post-auth user seed EXACTLY ONCE per session, and only when the user had no
// persisted preference. It READS `authStore` and never writes it — `User` is
// server truth; the active branch is a client-side view preference (I-31 / F3-b).
//
// Why two fields and not one (D7 / I-31b): the two questions have contradictory
// correct initialisers. `persistedOnInit` is `true` for a returning user (so the
// seed is skipped); `userSeedApplied` is `false` for EVERY user at session start
// (so the one-shot can fire). A single boolean cannot hold both, and collapsing
// them silently overwrites a returning user's explicit branch choice with
// `user.branchId` on every load (H-12 / R2 / F3-a).

import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/authStore';
import { DEFAULT_BRANCH_ID, isKnownBranchId } from '@/features/branch/branches';
import { useDashboardFiltersStore } from '@/features/dashboard/filters/dashboardFiltersStore';

export function useBranchHydration(): void {
  const user = useAuthStore((s) => s.user);
  const persistedOnInit = useDashboardFiltersStore((s) => s.persistedOnInit);
  const userSeedApplied = useDashboardFiltersStore((s) => s.userSeedApplied);
  const setBranchId = useDashboardFiltersStore((s) => s.setBranchId);
  const markUserSeedApplied = useDashboardFiltersStore(
    (s) => s.markUserSeedApplied,
  );

  useEffect(() => {
    if (!userSeedApplied && user !== null) {
      // Unconditional — the one-shot has been "considered" regardless of which
      // branch of the inner `if` runs (F3-j: calling it inside the inner `if`
      // leaves a returning user's seed permanently unmarked and re-evaluating
      // for the whole session).
      markUserSeedApplied();

      // Only seed when the user had NO stored preference. `persistedOnInit` is
      // read from the store's init snapshot and is never mutated, so it is still
      // `true` on the hundredth render after auth resolves (F3-a).
      if (!persistedOnInit) {
        setBranchId(
          isKnownBranchId(user.branchId ?? '')
            ? user.branchId!
            : DEFAULT_BRANCH_ID,
        );
      }
    }
  }, [
    user,
    userSeedApplied,
    persistedOnInit,
    setBranchId,
    markUserSeedApplied,
  ]);
}
