// R-4 / INV-Q7: the cache key must be identical for two builder states that
// differ ONLY in `cursor` and/or `withTotal` — otherwise every page of an
// infinite / cursor-paginated query becomes its own cache entry and
// `useInfiniteQuery` silently refetches from page 1 forever while appearing
// to work.

import { describe, expect, it } from 'vitest';

import { patientQuery } from '@/features/patients/api/patient.queryMeta';
import { patientQueryKeys } from '@/features/patients/api/patients.keys';

describe('patientQueryKeys', () => {
  it('produces the same list() key regardless of cursor', () => {
    const base = patientQuery().where('isActive', 'eq', true).limit(25).build();
    const withCursor = patientQuery()
      .where('isActive', 'eq', true)
      .limit(25)
      .cursor('some-opaque-cursor-value')
      .build();

    expect(patientQueryKeys.list(withCursor)).toEqual(
      patientQueryKeys.list(base),
    );
  });

  it('produces the same list() key regardless of withTotal', () => {
    const base = patientQuery().where('isActive', 'eq', true).limit(25).build();
    const withTotal = patientQuery()
      .where('isActive', 'eq', true)
      .limit(25)
      .withTotal(true)
      .build();

    expect(patientQueryKeys.list(withTotal)).toEqual(
      patientQueryKeys.list(base),
    );
  });

  it('produces the same infinite() key across a cursor + withTotal pair of pages', () => {
    const firstPage = patientQuery()
      .sort('createdAt', 'desc')
      .limit(25)
      .withTotal(true)
      .build();
    const secondPage = patientQuery()
      .sort('createdAt', 'desc')
      .limit(25)
      .cursor('page-2-cursor')
      .build();

    expect(patientQueryKeys.infinite(secondPage)).toEqual(
      patientQueryKeys.infinite(firstPage),
    );
  });

  it('still varies the key when a real filter differs', () => {
    const active = patientQuery().where('isActive', 'eq', true).build();
    const inactive = patientQuery().where('isActive', 'eq', false).build();

    expect(patientQueryKeys.list(active)).not.toEqual(
      patientQueryKeys.list(inactive),
    );
  });

  it('detail() keys are stable per id', () => {
    expect(patientQueryKeys.detail('abc')).toEqual([
      'patients',
      'detail',
      'abc',
    ]);
  });
});
