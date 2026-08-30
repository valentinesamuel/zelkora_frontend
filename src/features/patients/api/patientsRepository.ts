// The swap seam between the patient list UI and its data source.
//
// TODAY: `fixturePatientsRepository` filters / sorts / cursor-slices the
// synthetic dataset in memory, behind a simulated latency.
//
// TO GO LIVE: implement `PatientsRepository.list` with
//
//   const result = await apiRequest<PatientListWire>(
//     `/patients?${new URLSearchParams(toApiParams(query))}`,
//   );
//   return { patients: result.patients.map((w) => toPatient(w)), pageInfo: ..., total: result.total ?? null };
//
// and delete this file's fixture internals. The backend must, by then, accept
// `q, status, sex, ageMin, ageMax, from, to, sort, dir, cursor, limit` and
// return `{ patients, pageInfo: { nextCursor, prevCursor, hasNext, hasPrev }, total? }`.
// (It currently only takes `page` + `limit` — see zelkora_backend
// internal/patient/handler.go `ListPatients`.)

import { calculateAge } from '@/features/patients/format';
import { PATIENT_FIXTURES } from '@/features/patients/api/patients.fixtures';
import {
  fullNameOf,
  toPatient,
  type PatientWire,
} from '@/features/patients/types/patient.types';
import type {
  PatientListQuery,
  PatientListResult,
} from '@/features/patients/types/patientListQuery.types';

export interface PatientsRepository {
  list(query: PatientListQuery): Promise<PatientListResult>;
}

// Dev-only switch to exercise the page's non-happy states without a backend.
// 'data' | 'empty' | 'error'. Leave as 'data' in commits.
const FIXTURE_MODE: 'data' | 'empty' | 'error' = 'data';
const FIXTURE_LATENCY_MS = 250;

class FixturePatientsRepository implements PatientsRepository {
  async list(query: PatientListQuery): Promise<PatientListResult> {
    await delay(FIXTURE_LATENCY_MS);

    if (FIXTURE_MODE === 'error') {
      throw new Error('fixture: simulated patients load failure');
    }

    const source = FIXTURE_MODE === 'empty' ? [] : PATIENT_FIXTURES;
    const now = new Date();

    const filtered = source.filter((wire) => matches(wire, query, now));
    const sorted = sortWires(filtered, query, now);

    const total = sorted.length;
    const start = decodeCursor(query.cursor);
    const clampedStart = Math.min(Math.max(start, 0), total);
    const end = Math.min(clampedStart + query.limit, total);

    const pagePatients = sorted
      .slice(clampedStart, end)
      .map((wire) => toPatient(wire, now));

    const hasPrev = clampedStart > 0;
    const hasNext = end < total;

    return {
      patients: pagePatients,
      total,
      pageInfo: {
        hasPrev,
        hasNext,
        prevCursor: hasPrev
          ? encodeCursor(Math.max(clampedStart - query.limit, 0))
          : null,
        nextCursor: hasNext ? encodeCursor(end) : null,
      },
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Opaque forward/back cursor. Real API cursors are equally opaque to the client;
// here it just carries an absolute offset into the sorted result.
function encodeCursor(offset: number): string {
  return btoa(`o:${offset}`);
}

function decodeCursor(cursor: string | null): number {
  if (cursor === null) return 0;
  try {
    const decoded = atob(cursor);
    const match = /^o:(\d+)$/.exec(decoded);
    return match ? Number(match[1]) : 0;
  } catch {
    return 0;
  }
}

function matches(wire: PatientWire, query: PatientListQuery, now: Date): boolean {
  const search = query.search.trim().toLowerCase();
  if (search !== '') {
    const haystack = [
      fullNameOf(wire),
      wire.zrn,
      wire.phoneNumber,
      wire.email ?? '',
    ]
      .join(' ')
      .toLowerCase();
    // Also match digits-only against the phone (search "0803..." or "803...").
    const phoneDigits = wire.phoneNumber.replace(/\D/g, '');
    const searchDigits = search.replace(/\D/g, '');
    const hit =
      haystack.includes(search) ||
      (searchDigits !== '' && phoneDigits.includes(searchDigits));
    if (!hit) return false;
  }

  if (query.status !== 'all') {
    const status = wire.isActive ? 'active' : 'inactive';
    if (status !== query.status) return false;
  }

  if (query.sex !== 'all' && wire.gender !== query.sex) return false;

  if (query.ageMin !== null || query.ageMax !== null) {
    const age = calculateAge(wire.dateOfBirth, now);
    if (age === null) return false;
    if (query.ageMin !== null && age < query.ageMin) return false;
    if (query.ageMax !== null && age > query.ageMax) return false;
  }

  const registeredDay = wire.createdAt.slice(0, 10); // "YYYY-MM-DD"
  if (query.registeredFrom !== null && registeredDay < query.registeredFrom) {
    return false;
  }
  if (query.registeredTo !== null && registeredDay > query.registeredTo) {
    return false;
  }

  return true;
}

function sortWires(
  wires: PatientWire[],
  query: PatientListQuery,
  now: Date,
): PatientWire[] {
  const dir = query.sortDir === 'asc' ? 1 : -1;
  const copy = [...wires];
  copy.sort((a, b) => {
    let cmp: number;
    if (query.sortField === 'registeredAt') {
      cmp = a.createdAt.localeCompare(b.createdAt);
    } else if (query.sortField === 'age') {
      // Sort on the DERIVED age, never the raw `dateOfBirth` string (which
      // orders inversely). Use the same `now` as `matches()` so the age filter
      // and the age sort agree across a midnight boundary.
      const ageA = calculateAge(a.dateOfBirth, now);
      const ageB = calculateAge(b.dateOfBirth, now);
      // Null age sorts LAST in both directions — return before the `* dir`
      // multiply so `desc` cannot lift the nulls to the top.
      if (ageA === null && ageB === null) {
        return a.zrn.localeCompare(b.zrn);
      }
      if (ageA === null) return 1;
      if (ageB === null) return -1;
      cmp = ageA - ageB;
    } else {
      cmp = fullNameOf(a).localeCompare(fullNameOf(b), 'en');
    }
    // Stable tiebreak on ZRN so duplicate names never reorder between pages.
    if (cmp === 0) cmp = a.zrn.localeCompare(b.zrn);
    return cmp * dir;
  });
  return copy;
}

export const fixturePatientsRepository: PatientsRepository =
  new FixturePatientsRepository();
