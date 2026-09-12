// Pure formatting helpers for the appointments feature. No React, no side
// effects. Locale is `en-NG`, matching `src/features/patients/format.ts`.
//
// Unlike the patient date helpers, these are NOT UTC-pinned: an appointment
// slot is a wall-clock time a receptionist reads off the screen, so it renders
// in the viewer's own timezone.

const EM_DASH = '—';

const dateTimeFormatter = new Intl.DateTimeFormat('en-NG', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('en-NG', {
  hour: '2-digit',
  minute: '2-digit',
});

/** RFC3339 -> `"5 Jan 2026, 09:30"`. Unparseable / empty -> `"—"`. */
export function formatAppointmentDateTime(
  value: string | null | undefined,
): string {
  if (value == null || value.trim() === '') return EM_DASH;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return EM_DASH;
  return dateTimeFormatter.format(parsed);
}

/** RFC3339 -> `"09:30"`. Unparseable / empty -> `"—"`. */
export function formatAppointmentTime(
  value: string | null | undefined,
): string {
  if (value == null || value.trim() === '') return EM_DASH;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return EM_DASH;
  return timeFormatter.format(parsed);
}

/** Trim a value for display; empty / nullish -> `"—"`. */
export function formatOptionalText(value: string | null | undefined): string {
  if (value == null) return EM_DASH;
  const trimmed = value.trim();
  return trimmed === '' ? EM_DASH : trimmed;
}
