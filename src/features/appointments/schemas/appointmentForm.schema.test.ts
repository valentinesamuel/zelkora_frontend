import { describe, expect, it } from 'vitest';

import { appointmentFormSchema } from '@/features/appointments/schemas/appointmentForm.schema';

const PATIENT_ID = '11111111-1111-4111-8111-111111111111';
const STAFF_ID = '22222222-2222-4222-8222-222222222222';

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    patientId: PATIENT_ID,
    staffId: STAFF_ID,
    type: 'CONSULTATION',
    startAt: '2026-01-05T09:00:00Z',
    endAt: '2026-01-05T09:30:00Z',
    ...overrides,
  };
}

describe('appointmentFormSchema', () => {
  it('accepts a minimal valid appointment without a status', () => {
    const result = appointmentFormSchema.safeParse(validInput());
    expect(result.success).toBe(true);
    expect(result.success && result.data.status).toBeUndefined();
  });

  it('rejects non-uuid patient and staff ids', () => {
    expect(
      appointmentFormSchema.safeParse(validInput({ patientId: 'abc' })).success,
    ).toBe(false);
    expect(
      appointmentFormSchema.safeParse(validInput({ staffId: '' })).success,
    ).toBe(false);
  });

  it('rejects unknown status and type values', () => {
    expect(
      appointmentFormSchema.safeParse(validInput({ type: 'SURGERY' })).success,
    ).toBe(false);
    expect(
      appointmentFormSchema.safeParse(validInput({ status: 'PENDING' }))
        .success,
    ).toBe(false);
  });

  it('requires an end time strictly after the start time', () => {
    const equal = appointmentFormSchema.safeParse(
      validInput({ endAt: '2026-01-05T09:00:00Z' }),
    );
    expect(equal.success).toBe(false);
    expect(equal.success === false && equal.error.issues[0]?.path).toEqual([
      'endAt',
    ]);
    expect(equal.success === false && equal.error.issues[0]?.message).toBe(
      'End time must be after the start time',
    );

    expect(
      appointmentFormSchema.safeParse(
        validInput({ endAt: '2026-01-05T08:00:00Z' }),
      ).success,
    ).toBe(false);
  });

  it('requires non-empty start and end times', () => {
    expect(
      appointmentFormSchema.safeParse(validInput({ startAt: '' })).success,
    ).toBe(false);
    expect(
      appointmentFormSchema.safeParse(validInput({ endAt: '  ' })).success,
    ).toBe(false);
  });
});
