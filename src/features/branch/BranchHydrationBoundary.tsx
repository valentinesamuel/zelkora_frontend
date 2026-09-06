// A null-rendering feature component whose ONLY job is to run
// `useBranchHydration()` for every authed user on every route.
//
// Why it exists: the post-auth user seed and the INV-B5 reconciliation must run
// independent of where the branch UI lives — a nurse or pharmacist never renders
// `BranchSwitcher`, yet their `branchId` still has to be seeded and reconciled so
// dashboard queries stay `enabled`. Mounting this boundary in the always-present
// authed shell (`AppLayout`) decouples hydration from the visible control.
//
// It lives in `features/branch/` — not in `app/layouts/` — so branch behaviour
// stays owned by the feature; `AppLayout` merely composes it (INV-L4). This must
// be the ONLY call site of `useBranchHydration()` (INV-H3): never zero, never
// two. It is mounted unconditionally — no role, permission, flag, or route guard
// (INV-H4). The hook itself already handles the non-`branch:read` path.

import { useBranchHydration } from '@/features/branch/useBranchHydration';

export function BranchHydrationBoundary(): null {
  useBranchHydration();
  return null;
}
