// Leaf module — imports nothing. The canonical list of selectable branches.
//
// Branch data is COSMETIC for this feature (resolved requirement): every
// dashboard fixture returns the same payload regardless of the active branch.
// Exactly one branch is always selected; there is no "All branches" option.
//
// `dev-branch` is deliberately index 0 (D6): the filters store initialises
// `branchId` at module-eval time, before `authStore.bootstrap()` resolves and
// the seeded `dev-cmo` user (whose `branchId` is `'dev-branch'`) is known.
// Making the seeded branch the array head means the common cold-load path never
// re-keys after auth resolves.

export interface Branch {
  id: string;
  name: string;
  shortName: string;
}

export const BRANCHES: readonly Branch[] = [
  { id: 'dev-branch', name: 'Zelkora Central Hospital', shortName: 'Central' },
  { id: 'branch-ikeja', name: 'Zelkora Ikeja Clinic', shortName: 'Ikeja' },
  { id: 'branch-lekki', name: 'Zelkora Lekki Medical Centre', shortName: 'Lekki' },
  { id: 'branch-abuja', name: 'Zelkora Abuja Hospital', shortName: 'Abuja' },
] as const;

/** The initial `branchId` before any persisted value or post-auth seed applies. */
export const DEFAULT_BRANCH_ID = BRANCHES[0]!.id;

export function isKnownBranchId(id: string): boolean {
  return BRANCHES.some((b) => b.id === id);
}

/**
 * The display name for a branch id, or `null` when the id is unknown.
 * Never returns a raw id — a caller that wants to render must handle `null`
 * (I-38: the sidebar footer renders nothing rather than a raw id).
 */
export function branchNameFor(id: string): string | null {
  return BRANCHES.find((b) => b.id === id)?.name ?? null;
}
