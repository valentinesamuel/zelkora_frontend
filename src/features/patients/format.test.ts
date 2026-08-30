import { describe, expect, it } from 'vitest';

import {
  calculateAge,
  formatAge,
  formatLastVisit,
  formatPatientPhone,
  formatRegisteredDate,
  formatSex,
} from '@/features/patients/format';

const NOW = new Date('2026-08-30T12:00:00Z');

describe('calculateAge', () => {
  it('returns 0 for a newborn', () => {
    expect(calculateAge('2026-08-20', NOW)).toBe(0);
  });

  it('counts a birthday that has already passed this year', () => {
    expect(calculateAge('1979-01-15', NOW)).toBe(47);
  });

  it('does not count a birthday still to come this year', () => {
    expect(calculateAge('1979-12-15', NOW)).toBe(46);
  });

  it('handles the birthday being today', () => {
    expect(calculateAge('1990-08-30', NOW)).toBe(36);
  });

  it('handles a 29 February date of birth', () => {
    expect(calculateAge('2000-02-29', NOW)).toBe(26);
  });

  it('returns null for a future date of birth', () => {
    expect(calculateAge('2027-01-01', NOW)).toBeNull();
  });

  it('returns null for an unparseable value', () => {
    expect(calculateAge('not-a-date', NOW)).toBeNull();
  });

  it('returns null for null / empty input', () => {
    expect(calculateAge(null, NOW)).toBeNull();
    expect(calculateAge('', NOW)).toBeNull();
    expect(calculateAge(undefined, NOW)).toBeNull();
  });

  it('returns null for an implausible age (> 150)', () => {
    expect(calculateAge('1850-01-01', NOW)).toBeNull();
  });
});

describe('formatAge', () => {
  it('renders an em dash for null', () => {
    expect(formatAge(null)).toBe('—');
  });

  it('renders "0 yr" for a newborn', () => {
    expect(formatAge(0)).toBe('0 yr');
  });

  it('renders "47 yr"', () => {
    expect(formatAge(47)).toBe('47 yr');
  });
});

describe('formatSex', () => {
  it('title-cases known values', () => {
    expect(formatSex('male')).toBe('Male');
    expect(formatSex('female')).toBe('Female');
    expect(formatSex('other')).toBe('Other');
  });

  it('falls back to an em dash for anything else', () => {
    expect(formatSex('unknown')).toBe('—');
  });
});

describe('formatPatientPhone', () => {
  it('renders an em dash for null / empty', () => {
    expect(formatPatientPhone(null)).toBe('—');
    expect(formatPatientPhone('   ')).toBe('—');
  });

  it('groups a local Nigerian mobile number', () => {
    expect(formatPatientPhone('08031234567')).toBe('0803 123 4567');
  });

  it('leaves an already-formatted or non-standard number as-is', () => {
    expect(formatPatientPhone('+234 803 123 4567')).toBe('+234 803 123 4567');
  });
});

describe('formatRegisteredDate / formatLastVisit', () => {
  it('formats an RFC3339 timestamp', () => {
    expect(formatRegisteredDate('2026-08-06T09:30:00Z')).toBe('6 Aug 2026');
  });

  it('formats a plain YYYY-MM-DD', () => {
    expect(formatRegisteredDate('2024-01-02')).toBe('2 Jan 2024');
  });

  it('renders an em dash for null / unparseable', () => {
    expect(formatRegisteredDate(null)).toBe('—');
    expect(formatRegisteredDate('nope')).toBe('—');
  });

  it('last visit is an em dash while there is no data', () => {
    expect(formatLastVisit(null)).toBe('—');
  });
});
