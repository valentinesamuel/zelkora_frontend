import { apiRequest } from '@/lib/apiClient';
import type { ListPatientsResponse } from '@/features/patients/types/patient.types';
import type {
  PatientListQuery,
  PatientListResult,
} from '@/features/patients/types/patientListQuery.types';

export interface PatientsRepository {
  list(query: PatientListQuery): Promise<PatientListResult>;
}

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

    const response = await apiRequest<ListPatientsResponse>(
      `/patients?page=${page}&limit=${limit}`,
    );

    const total = response.total;
    const hasPrev = page > 1;
    const hasNext = page * limit < total;

    return {
      patients: response.patients,
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
