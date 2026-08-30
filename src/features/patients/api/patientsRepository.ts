// The swap seam between the patient list UI and its data source.
//
// LIVE: `list()` calls `GET /api/v1/patients?page=&limit=` through the single
// HTTP seam and maps the page-based response back onto the FE's cursor-based
// `PatientListResult`. The opaque `cursor` string encodes a 1-based page number
// (`p:<n>`), mirroring the fixture era's `o:<offset>` trick, so the list page,
// its URL serde (`patientListParams`), `usePatientListParams` and
// `PatientListPagination` need no changes.
//
// TODO(backend): `GET /patients` currently accepts ONLY `page` + `limit`. The
// list page still renders a search box, a Filters popover (status / sex / age /
// registered-date) and sortable column headers; until the backend accepts
// `q, status, sex, ageMin, ageMax, from, to, sort, dir` those controls update
// the URL and refetch but the server returns unfiltered, unsorted data.

import { apiRequest } from '@/lib/apiClient';
import {
  toPatient,
  type ListPatientsWire,
} from '@/features/patients/types/patient.types';
import type {
  PatientListQuery,
  PatientListResult,
} from '@/features/patients/types/patientListQuery.types';

export interface PatientsRepository {
  list(query: PatientListQuery): Promise<PatientListResult>;
}

// Hard ceiling the backend enforces on `limit` (zelkora_backend
// internal/patient/service.go `maxListLimit`). FE limit options top out at 100
// already; clamp defensively.
const MAX_LIMIT = 100;

const PAGE_CURSOR_PREFIX = 'p:';

function encodePageCursor(page: number): string {
  return btoa(`${PAGE_CURSOR_PREFIX}${page}`);
}

function decodePageCursor(cursor: string | null): number {
  if (cursor === null) return 1;
  try {
    const match = /^p:(\d+)$/.exec(atob(cursor));
    const page = match ? Number(match[1]) : 1;
    return Number.isInteger(page) && page >= 1 ? page : 1;
  } catch {
    return 1;
  }
}

class HttpPatientsRepository implements PatientsRepository {
  async list(query: PatientListQuery): Promise<PatientListResult> {
    const page = decodePageCursor(query.cursor);
    const limit = Math.min(Math.max(query.limit, 1), MAX_LIMIT);

    const wire = await apiRequest<ListPatientsWire>(
      `/patients?page=${page}&limit=${limit}`,
    );

    const now = new Date();
    const total = wire.total;
    const hasPrev = page > 1;
    const hasNext = page * limit < total;

    return {
      patients: wire.patients.map((w) => toPatient(w, now)),
      total,
      pageInfo: {
        hasPrev,
        hasNext,
        prevCursor: hasPrev ? encodePageCursor(page - 1) : null,
        nextCursor: hasNext ? encodePageCursor(page + 1) : null,
      },
    };
  }
}

export const patientsRepository: PatientsRepository =
  new HttpPatientsRepository();
