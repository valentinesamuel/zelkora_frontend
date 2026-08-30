// Pure serde for the persisted filter blob (I-37) — NO I/O. The store
// (`dashboardFiltersStore.ts`) owns persistence, reaching `localStorage` only
// through `@/lib/storage`; this file just turns a raw string into a validated
// shape and back.

import { DEFAULT_BRANCH_ID, isKnownBranchId } from '@/features/branch/branches';
import {
  normalizeSelection,
  type RangeSelection,
} from '@/features/dashboard/filters/dateRange';

export const FILTERS_STORAGE_KEY = 'zelkora.dashboard.filters';

// The on-disk shape: one key, one JSON blob, one version stamp (I-32b).
export interface PersistedFilters {
  v: 1;
  branchId: string;
  preset: RangeSelection['preset'];
  from?: string;
  to?: string;
}

export interface DecodedFilters {
  branchId: string;
  selection: RangeSelection;
  /** `raw !== null` — i.e. a stored value existed at all. */
  present: boolean;
  // A present stored value had to be corrected (bad JSON, wrong shape,
  // unrecognised `v`, unknown branch, or a healed range). Always `false` when
  // `present` is `false` — a fresh profile is not "healed" (I-32c). `present`
  // and `healed` are separate questions; never conflate them at the call site.
  healed: boolean;
}

function defaults(
  today: string,
): Pick<DecodedFilters, 'branchId' | 'selection'> {
  return {
    branchId: DEFAULT_BRANCH_ID,
    selection: normalizeSelection(undefined, today),
  };
}

// `JSON.parse` must stay inside this try/catch — a malformed string throws, and
// an unguarded parse white-screens the app on every boot (F1-d).
export function decodeFilters(
  raw: string | null,
  today: string,
): DecodedFilters {
  if (raw === null) {
    return { ...defaults(today), present: false, healed: false };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ...defaults(today), present: true, healed: true };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ...defaults(today), present: true, healed: true };
  }

  const blob = parsed as Partial<PersistedFilters>;

  // An unrecognised version stamp heals to defaults.
  if (blob.v !== 1) {
    return { ...defaults(today), present: true, healed: true };
  }

  const rawBranchId = typeof blob.branchId === 'string' ? blob.branchId : '';
  const branchId = isKnownBranchId(rawBranchId)
    ? rawBranchId
    : DEFAULT_BRANCH_ID;

  const storedFrom = typeof blob.from === 'string' ? blob.from : undefined;
  const storedTo = typeof blob.to === 'string' ? blob.to : undefined;
  const selection = normalizeSelection(
    { preset: blob.preset, from: storedFrom, to: storedTo },
    today,
  );

  // `healed` iff the decoded result differs from what was literally stored.
  const healed =
    branchId !== rawBranchId ||
    selection.preset !== blob.preset ||
    selection.from !== storedFrom ||
    selection.to !== storedTo;

  return { branchId, selection, present: true, healed };
}

/** Serialise the current selection to the on-disk string. */
export function encodeFilters(
  branchId: string,
  selection: RangeSelection,
): string {
  const blob: PersistedFilters = {
    v: 1,
    branchId,
    preset: selection.preset,
  };
  if (selection.preset === 'custom') {
    blob.from = selection.from;
    blob.to = selection.to;
  }
  return JSON.stringify(blob);
}
