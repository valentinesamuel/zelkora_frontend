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
import { readStorage, writeStorage } from '@/lib/storage';

export function todayIso(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

interface DashboardFiltersState {
  // `null` = "we don't know the branch yet" — a typed state, not a lie
  // dressed as a fabricated id. It is resolved to a real id by
  // `useBranchHydration` once `useActiveBranches()` returns (INV-B5).
  branchId: string | null;
  selection: RangeSelection;
  persistedOnInit: boolean;
  userSeedApplied: boolean;

  setBranchId(id: string): void;
  setSelection(sel: RangeSelection): void;
  markUserSeedApplied(): void;
}

const initialToday = todayIso();
const decoded = decodeFilters(readStorage(FILTERS_STORAGE_KEY), initialToday);

if (decoded.present && decoded.healed) {
  writeStorage(
    FILTERS_STORAGE_KEY,
    encodeFilters(decoded.branchId, decoded.selection),
  );
}

export const useDashboardFiltersStore = create<DashboardFiltersState>()(
  (set, get) => ({
    branchId: decoded.branchId,
    selection: decoded.selection,
    persistedOnInit: decoded.present,
    userSeedApplied: false,

    // No identity guard (D2 Option B): the store cannot see branch data, so a
    // guard here would be WRONG during the load window (rejecting every valid
    // id until branches arrive). Validity is guaranteed at the edges —
    // `BranchSwitcher` only emits ids it rendered, and `useBranchHydration`
    // reconciles anything else (INV-B4, enforced by test, not by a runtime
    // guard that can no longer be correct).
    setBranchId: (id) => {
      set({ branchId: id });
      writeStorage(FILTERS_STORAGE_KEY, encodeFilters(id, get().selection));
    },

    setSelection: (sel) => {
      const normalized = normalizeSelection(sel, todayIso());
      set({ selection: normalized });
      writeStorage(
        FILTERS_STORAGE_KEY,
        encodeFilters(get().branchId, normalized),
      );
    },

    markUserSeedApplied: () => {
      set({ userSeedApplied: true });
    },
  }),
);

export function useDashboardQueryScope(): {
  branchId: string | null;
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
