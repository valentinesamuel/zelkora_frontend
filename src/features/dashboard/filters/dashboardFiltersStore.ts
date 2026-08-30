// The single source of truth for `{ branchId, selection }` (I-31). Hand-rolled
// `try/catch` persistence mirroring `AppSidebar`'s readCollapsed/writeCollapsed
// (D-cmo-ui-overhaul-6) — NOT `zustand/middleware/persist` (I-32).
//
// This module must NOT import the auth store. Seeding `branchId` from the
// logged-in user is a Phase 3 concern and lives in `useBranchHydration.ts`,
// kept out of here so init stays at module-eval time with no dependency on
// async auth.

import { useMemo } from 'react';
import { format } from 'date-fns';
import { create } from 'zustand';

import {
  normalizeSelection,
  resolveRange,
  type RangeSelection,
} from '@/features/dashboard/filters/dateRange';
import {
  decodeFilters,
  encodeFilters,
  FILTERS_STORAGE_KEY,
} from '@/features/dashboard/filters/filtersPersistence';
import { isKnownBranchId } from '@/features/branch/branches';

/**
 * The single sanctioned impurity in this feature (I-37). Everything downstream
 * takes `today` as an injected `YYYY-MM-DD` string.
 */
export function todayIso(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

interface DashboardFiltersState {
  branchId: string;
  selection: RangeSelection;

  /**
   * DE Issue A / D7 — two SEPARATE questions, two SEPARATE fields. Neither is
   * persisted into the JSON blob; both are session-scoped runtime state.
   */
  /** "Was there a stored value at module-eval time?" — set ONCE, never mutated. */
  persistedOnInit: boolean;
  /** "Has the one-shot post-auth user seed run this session?" — starts false. */
  userSeedApplied: boolean;

  setBranchId(id: string): void;
  setSelection(sel: RangeSelection): void;
  markUserSeedApplied(): void;
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(FILTERS_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeRaw(value: string): void {
  try {
    localStorage.setItem(FILTERS_STORAGE_KEY, value);
  } catch {
    // Storage unavailable (private mode / webview) — the selection just won't
    // persist. Never throws, never white-screens (I-32).
  }
}

// --- Init: runs at module-eval time, not in an effect (I-32b) -----------------
const initialToday = todayIso();
const decoded = decodeFilters(readRaw(), initialToday);

// Write back IFF a genuinely stored value was genuinely wrong (I-32c / DE Issue
// C). A fresh profile (`present === false`) writes NOTHING — the key first
// appears on the user's first real setBranchId / setSelection.
if (decoded.present && decoded.healed) {
  writeRaw(encodeFilters(decoded.branchId, decoded.selection));
}

export const useDashboardFiltersStore = create<DashboardFiltersState>()((set, get) => ({
  branchId: decoded.branchId,
  selection: decoded.selection,
  persistedOnInit: decoded.present,
  userSeedApplied: false,

  setBranchId: (id) => {
    if (!isKnownBranchId(id)) {
      return; // ignore an unknown id rather than storing it
    }
    set({ branchId: id });
    writeRaw(encodeFilters(id, get().selection));
  },

  setSelection: (sel) => {
    // The UI is not trusted to be the only writer — re-heal before storing.
    const normalized = normalizeSelection(sel, todayIso());
    set({ selection: normalized });
    writeRaw(encodeFilters(get().branchId, normalized));
  },

  markUserSeedApplied: () => {
    // Session state, not a preference — writes nothing to storage.
    set({ userSeedApplied: true });
  },
}));

/**
 * The single read surface the 11 dashboard hooks consume in Phase 5. Returns a
 * referentially stable object memoised on `(branchId, selection, today)` so the
 * `useQuery` options object stays stable (removes any doubt about I-36). All key
 * segments are plain strings (I-33).
 */
export function useDashboardQueryScope(): {
  branchId: string;
  rangeKey: string;
  from: string;
  to: string;
} {
  const branchId = useDashboardFiltersStore((s) => s.branchId);
  const selection = useDashboardFiltersStore((s) => s.selection);
  const today = todayIso();

  return useMemo(() => {
    const resolved = resolveRange(selection, today);
    return {
      branchId,
      rangeKey: resolved.rangeKey,
      from: resolved.from,
      to: resolved.to,
    };
  }, [branchId, selection, today]);
}
