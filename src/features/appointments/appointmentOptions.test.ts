import { describe, expect, it } from 'vitest';

import {
  APPOINTMENT_STATUS_OPTIONS,
  APPOINTMENT_TYPE_OPTIONS,
} from '@/features/appointments/appointmentOptions';
import {
  APPOINTMENT_STATUS_VALUES,
  APPOINTMENT_TYPE_VALUES,
} from '@/features/appointments/types/appointment.types';

describe('appointmentOptions', () => {
  it('covers every appointment status exactly once, with a label', () => {
    expect(APPOINTMENT_STATUS_OPTIONS).toHaveLength(
      APPOINTMENT_STATUS_VALUES.length,
    );
    expect(APPOINTMENT_STATUS_OPTIONS.map((o) => o.value)).toEqual([
      ...APPOINTMENT_STATUS_VALUES,
    ]);
    for (const option of APPOINTMENT_STATUS_OPTIONS) {
      expect(option.label.length).toBeGreaterThan(0);
    }
  });

  it('covers every appointment type exactly once, with a label', () => {
    expect(APPOINTMENT_TYPE_OPTIONS).toHaveLength(
      APPOINTMENT_TYPE_VALUES.length,
    );
    expect(APPOINTMENT_TYPE_OPTIONS.map((o) => o.value)).toEqual([
      ...APPOINTMENT_TYPE_VALUES,
    ]);
    for (const option of APPOINTMENT_TYPE_OPTIONS) {
      expect(option.label.length).toBeGreaterThan(0);
    }
  });
});
