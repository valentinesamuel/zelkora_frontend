// Appointments paginate by OFFSET, so `page`/`pageSize` are part of the cache
// key (each page is its own entry, which is exactly what `keepPreviousData`
// pages between). `cursor` and `withTotal` are still stripped by
// `canonicalizeForKey` (INV-Q7). This suite locks the key tuples.

import { describe, expect, it } from 'vitest';

import { appointmentQuery } from '@/features/appointments/api/appointment.queryMeta';
import { appointmentQueryKeys } from '@/features/appointments/api/appointments.keys';

describe('appointmentQueryKeys', () => {
  it('all is the canonical constant tuple ["appointments"]', () => {
    expect(appointmentQueryKeys.all).toEqual(['appointments']);
  });

  it('lists() is prefixed by all so entity-wide invalidation reaches it', () => {
    expect(appointmentQueryKeys.lists()).toEqual(['appointments', 'list']);
  });

  it('detail() keys are stable per id', () => {
    expect(appointmentQueryKeys.detail('abc')).toEqual([
      'appointments',
      'detail',
      'abc',
    ]);
  });

  it('list() keys are prefixed by lists() so entity-wide invalidation reaches them', () => {
    const state = appointmentQuery().offset(1, 25).build();
    expect(appointmentQueryKeys.list(state).slice(0, 2)).toEqual(
      appointmentQueryKeys.lists(),
    );
  });

  it('list() is stable for two structurally identical states', () => {
    const a = appointmentQuery().sort('startAt', 'asc').offset(1, 25).build();
    const b = appointmentQuery().sort('startAt', 'asc').offset(1, 25).build();
    expect(appointmentQueryKeys.list(a)).toEqual(appointmentQueryKeys.list(b));
  });

  it('list() distinguishes pages — offset pagination is per-page cached', () => {
    const page1 = appointmentQuery().offset(1, 25).build();
    const page2 = appointmentQuery().offset(2, 25).build();
    expect(appointmentQueryKeys.list(page1)).not.toEqual(
      appointmentQueryKeys.list(page2),
    );
  });

  it('list() ignores withTotal (INV-Q7)', () => {
    const withTotal = appointmentQuery().offset(1, 25).withTotal(true).build();
    const without = appointmentQuery().offset(1, 25).build();
    expect(appointmentQueryKeys.list(withTotal)).toEqual(
      appointmentQueryKeys.list(without),
    );
  });

  it('list() distinguishes requests for different branchIds so switching branch refetches', () => {
    const state = appointmentQuery().offset(1, 25).build();
    expect(appointmentQueryKeys.list(state, 'branch-a')).not.toEqual(
      appointmentQueryKeys.list(state, 'branch-b'),
    );
  });

  it('list() is stable when branchId is omitted', () => {
    const state = appointmentQuery().offset(1, 25).build();
    expect(appointmentQueryKeys.list(state)).toEqual(
      appointmentQueryKeys.list(state),
    );
  });
});
