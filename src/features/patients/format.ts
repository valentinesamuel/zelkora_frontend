// Pure formatting helpers for the patients feature. No React, no side effects.
// Locale is `en-NG`, matching `src/features/dashboard/format.ts`. `now` is
// injectable everywhere so callers and tests stay deterministic.

const EM_DASH = '—';

/** Trim a value for display; empty / nullish -> `"—"`. */
export function formatOptionalText(value: string | null | undefined): string {
  if (value == null) return EM_DASH;
  const trimmed = value.trim();
  return trimmed === '' ? EM_DASH : trimmed;
}

// UTC-pinned: registration/visit values are day-precision and must render the
// same wherever the code runs (and in tests, regardless of the runner's zone).
const registeredDateFormatter = new Intl.DateTimeFormat('en-NG', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const ISO_DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * Whole years from an ISO date (`"YYYY-MM-DD"` or RFC3339) to `now`.
 * Newborn -> `0`. Unparseable / future / absurd (>150) -> `null`.
 *
 * Calendar parts are compared in a single frame of reference (the date's own
 * `YYYY-MM-DD`, and `now` in UTC) so the result never shifts with the runner's
 * timezone.
 */
export function calculateAge(
  dob: string | null | undefined,
  now: Date = new Date(),
): number | null {
  if (dob == null || dob.trim() === '') return null;

  const match = ISO_DATE_PREFIX.exec(dob.trim());
  if (match === null) return null;

  const birthYear = Number(match[1]);
  const birthMonth = Number(match[2]); // 1-12
  const birthDay = Number(match[3]); // 1-31
  if (birthMonth < 1 || birthMonth > 12 || birthDay < 1 || birthDay > 31) {
    return null;
  }

  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth() + 1;
  const nowDay = now.getUTCDate();

  let age = nowYear - birthYear;
  if (
    nowMonth < birthMonth ||
    (nowMonth === birthMonth && nowDay < birthDay)
  ) {
    age -= 1;
  }

  if (age < 0 || age > 150) return null;
  return age;
}

/** `null` -> `"—"`, `0` -> `"0 yr"`, `47` -> `"47 yr"`. */
export function formatAge(age: number | null): string {
  if (age === null) return EM_DASH;
  return `${age} yr`;
}

const SEX_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
};

export function formatSex(sex: string): string {
  return SEX_LABELS[sex] ?? EM_DASH;
}

/**
 * Display a phone number as stored, lightly grouped for scanning. We never
 * reformat aggressively — a hospital's numbers arrive in many shapes and a
 * wrong "correction" is worse than the raw value. `null` -> `"—"`.
 */
export function formatPatientPhone(phone: string | null): string {
  if (phone === null) return EM_DASH;
  const trimmed = phone.trim();
  if (trimmed === '') return EM_DASH;

  const digits = trimmed.replace(/\D/g, '');
  // Nigerian mobile, local form: 0803 123 4567
  if (/^0\d{10}$/.test(digits)) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return trimmed;
}

/** RFC3339 / `YYYY-MM-DD` -> `"6 Aug 2026"`. Unparseable -> `"—"`. */
export function formatRegisteredDate(iso: string | null): string {
  if (iso == null || iso.trim() === '') return EM_DASH;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return EM_DASH;
  return registeredDateFormatter.format(date);
}

/**
 * Last encounter date. No backend field yet, so this is `"—"` for a `null`
 * value today; wired to render a real date the moment one exists.
 */
export function formatLastVisit(iso: string | null): string {
  return formatRegisteredDate(iso);
}
