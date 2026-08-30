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
import { readStorage, writeStorage } from '@/lib/storage';

export function todayIso(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

interface DashboardFiltersState {
  branchId: string;
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

    setBranchId: (id) => {
      if (!isKnownBranchId(id)) {
        return;
      }
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
