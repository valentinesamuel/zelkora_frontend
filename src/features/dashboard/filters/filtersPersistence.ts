// Pure serde for the persisted filter blob (I-37) — NO I/O, and NO branch
// IDENTITY knowledge (INV-B9). The store (`dashboardFiltersStore.ts`) owns
// persistence, reaching `localStorage` only through `@/lib/storage`; this file
// just turns a raw string into a validated shape and back.
//
// This file is called at MODULE-EVAL time by `dashboardFiltersStore.ts`,
// before React mounts and before any HTTP. Branch data is asynchronous, so
// "does this branch exist?" cannot be answered here (§1.4 of plan.md). It
// validates only the SHAPE of `branchId` (`typeof === 'string'`, non-empty)
// and returns `string | null`. Answering branch identity — repairing a
// legacy/stale id — is the job of `useBranchHydration`'s reconciliation
// (D1 Option A / INV-B5), which runs once live data resolves.

import {
  normalizeSelection,
  type RangeSelection,
} from '@/features/dashboard/filters/dateRange';

export const FILTERS_STORAGE_KEY = 'zelkora.dashboard.filters';

// The on-disk shape: one key, one JSON blob, one version stamp (I-32b).
// `branchId` is optional — it is OMITTED entirely when unknown (never written
// as an explicit `null`). The `v: 1` stamp is unchanged: a previously-stored
// `"branchId":"dev-branch"` still decodes fine (to the string `'dev-branch'`),
// and reconciliation repairs it. Bumping to `v: 2` would heal every existing
// profile to defaults and discard users' date-range preferences (I-32b) —
// strictly worse than one repaired branch id.
export interface PersistedFilters {
  v: 1;
  branchId?: string;
  preset: RangeSelection['preset'];
  from?: string;
  to?: string;
}

export interface DecodedFilters {
  branchId: string | null;
  selection: RangeSelection;
  /** `raw !== null` — i.e. a stored value existed at all. */
  present: boolean;
  // A present stored value had to be corrected (bad JSON, wrong shape,
  // unrecognised `v`, or a healed range). Always `false` when `present` is
  // `false`. `present` and `healed` are separate questions; never conflate
  // them at the call site (I-32c).
  //
  // NOTE: branch identity NO LONGER participates in `healed`. It cannot —
  // `decodeFilters` only knows the shape of `branchId`, not whether the id is
  // real, so it has nothing to heal it against. If the branch term were left
  // in `healed`, a structurally-valid but stale id (e.g. `'dev-branch'`)
  // would leave `healed` permanently `false` for that dimension while
  // reconciliation silently rewrites storage on boot — a write-on-every-boot
  // loop that looks like it works. A future reader tempted to "restore" the
  // branch check here should read §1.4 of plan.md first.
  healed: boolean;
}

function defaults(
  today: string,
): Pick<DecodedFilters, 'branchId' | 'selection'> {
  return {
    branchId: null,
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

  // STRUCTURAL check only (INV-B9): a non-empty string passes through
  // verbatim; anything else becomes `null`. No identity validation.
  const branchId =
    typeof blob.branchId === 'string' && blob.branchId !== ''
      ? blob.branchId
      : null;

  const storedFrom = typeof blob.from === 'string' ? blob.from : undefined;
  const storedTo = typeof blob.to === 'string' ? blob.to : undefined;
  const selection = normalizeSelection(
    { preset: blob.preset, from: storedFrom, to: storedTo },
    today,
  );

  // `healed` iff the decoded RANGE differs from what was literally stored.
  // Branch identity is deliberately absent (see the `DecodedFilters` note).
  const healed =
    selection.preset !== blob.preset ||
    selection.from !== storedFrom ||
    selection.to !== storedTo;

  return { branchId, selection, present: true, healed };
}

/** Serialise the current selection to the on-disk string. */
export function encodeFilters(
  branchId: string | null,
  selection: RangeSelection,
): string {
  const blob: PersistedFilters = {
    v: 1,
    preset: selection.preset,
  };
  // Omit the key entirely when unknown — never write `"branchId":null`.
  if (branchId !== null) {
    blob.branchId = branchId;
  }
  if (selection.preset === 'custom') {
    blob.from = selection.from;
    blob.to = selection.to;
  }
  return JSON.stringify(blob);
}
