// Pure date-range logic (I-37): `today` is always injected as `YYYY-MM-DD`, all
// arithmetic goes through `date-fns` calendar helpers, and dates are emitted
// with `format(d, 'yyyy-MM-dd')` only. Converting a local date to UTC is banned
// here — it shifts the date a day west of Greenwich (F1-a).
//
// Preset semantics — this table is the test matrix (F1-f):
//   today    | today                    | today
//   last7    | today − 6d               | today   (inclusive of today → N−1 offset)
//   last30   | today − 29d              | today
//   last90   | today − 89d              | today
//   quarter  | startOfQuarter(today)    | today   (quarter TO DATE)
//   ytd      | startOfYear(today)       | today
//   custom   | sel.from                 | sel.to

import {
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
  startOfQuarter,
  startOfYear,
  subDays,
} from 'date-fns';

export const PRESETS = [
  'today',
  'last7',
  'last30',
  'last90',
  'quarter',
  'ytd',
  'custom',
] as const;
export type PresetKey = (typeof PRESETS)[number];

export interface RangeSelection {
  preset: PresetKey;
  from?: string;
  to?: string;
}

export interface ResolvedRange {
  from: string;
  to: string;
  /** `${from}_${to}` — the resolved window IS the key (D5). Always a plain string. */
  rangeKey: string;
  label: string;
}

export const PRESET_LABELS: Record<PresetKey, string> = {
  today: 'Today',
  last7: 'Last 7 days',
  last30: 'Last 30 days',
  last90: 'Last 90 days',
  quarter: 'This quarter',
  ytd: 'Year to date',
  custom: 'Custom…',
};

// 366 so a full leap year / leap-year YTD is not truncated by the span clamp
// (F1-i). No preset resolves to a wider span.
export const MAX_RANGE_DAYS = 366;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    ISO_DATE.test(value) &&
    isValid(parseISO(value))
  );
}

function toIso(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** Inclusive day count between two `YYYY-MM-DD` strings (`from`/`to` same → 1). */
function inclusiveSpanDays(from: string, to: string): number {
  return differenceInCalendarDays(parseISO(to), parseISO(from)) + 1;
}

function customLabel(from: string, to: string, today: string): string {
  const fromDate = parseISO(from);
  const toDate = parseISO(to);
  const todayYear = parseISO(today).getFullYear();
  const needYear =
    fromDate.getFullYear() !== todayYear || toDate.getFullYear() !== todayYear;

  if (from === to) {
    return needYear
      ? format(fromDate, 'MMM d, yyyy')
      : format(fromDate, 'MMM d');
  }
  const left = format(fromDate, 'MMM d');
  const right = format(toDate, 'MMM d');
  // en-dash separator; a trailing year is appended when the window is not wholly
  // inside `today`'s year (which also covers a range that crosses a year boundary).
  return needYear
    ? `${left} – ${right} ${toDate.getFullYear()}`
    : `${left} – ${right}`;
}

function resolvePresetWindow(
  preset: Exclude<PresetKey, 'custom'>,
  today: string,
): {
  from: string;
  to: string;
} {
  const todayDate = parseISO(today);
  switch (preset) {
    case 'today':
      return { from: today, to: today };
    case 'last7':
      return { from: toIso(subDays(todayDate, 6)), to: today };
    case 'last30':
      return { from: toIso(subDays(todayDate, 29)), to: today };
    case 'last90':
      return { from: toIso(subDays(todayDate, 89)), to: today };
    case 'quarter':
      return { from: toIso(startOfQuarter(todayDate)), to: today };
    case 'ytd':
      return { from: toIso(startOfYear(todayDate)), to: today };
  }
}

/**
 * Resolve a selection to a concrete window. `custom` selections are expected to
 * carry valid `YYYY-MM-DD` bounds (guaranteed by `normalizeSelection`); a
 * malformed `custom` degrades to `today` rather than throwing.
 */
export function resolveRange(
  sel: RangeSelection,
  today: string,
): ResolvedRange {
  let from: string;
  let to: string;
  let label: string;

  if (sel.preset === 'custom') {
    if (isIsoDate(sel.from) && isIsoDate(sel.to) && sel.from <= sel.to) {
      from = sel.from;
      to = sel.to;
    } else {
      from = today;
      to = today;
    }
    label = customLabel(from, to, today);
  } else {
    const win = resolvePresetWindow(sel.preset, today);
    from = win.from;
    to = win.to;
    label = PRESET_LABELS[sel.preset];
  }

  return { from, to, rangeKey: `${from}_${to}`, label };
}

// Coerce arbitrary parsed JSON into a valid `RangeSelection`. Each self-heal
// rule below has a test; the function is idempotent — `n(n(x)) === n(x)`.
export function normalizeSelection(
  raw: unknown,
  today: string,
): RangeSelection {
  if (typeof raw !== 'object' || raw === null) {
    return { preset: 'today' };
  }

  const candidate = raw as { preset?: unknown; from?: unknown; to?: unknown };
  if (!PRESETS.includes(candidate.preset as PresetKey)) {
    return { preset: 'today' };
  }
  const preset = candidate.preset as PresetKey;

  if (preset !== 'custom') {
    return { preset };
  }

  if (!isIsoDate(candidate.from) || !isIsoDate(candidate.to)) {
    return { preset: 'today' };
  }

  let from = candidate.from;
  let to = candidate.to;

  // reversed → swap
  if (from > to) {
    [from, to] = [to, from];
  }

  // future → clamp to today
  if (to > today) {
    to = today;
  }
  if (from > today) {
    from = today;
  }

  // oversized → pull `from` forward
  if (inclusiveSpanDays(from, to) > MAX_RANGE_DAYS) {
    from = toIso(subDays(parseISO(to), MAX_RANGE_DAYS - 1));
  }

  return { preset: 'custom', from, to };
}
