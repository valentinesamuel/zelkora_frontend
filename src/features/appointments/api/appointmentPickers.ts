// Option sources for the appointment patient/staff comboboxes.
//
// Both feed `components/form/AsyncComboboxField.tsx`, which expects a
// `(term) => Promise<AsyncComboboxOption[]>`.
//
//   - Patients search server-side over
//     (`patientQueryMeta.searchFields` = firstName/lastName/zrn/phoneNumber).
//   - Staff also search server-side now (`staffQueryMeta.searchFields` =
//     user.fullName/staffNumber), but the staff picker additionally needs to
//     be branch-scoped, and that scope depends on the caller's role and the
//     globally-selected branch — both of which live in stores this file (a
//     plain async-function module, not a hook) cannot read itself. So staff
//     search is exposed as a factory, `createSearchStaffOptions(scope)`,
//     which `AppointmentForm.tsx` calls with the scope it already reads for
//     the create-submit payload.

import type { AsyncComboboxOption } from '@/components/form/AsyncComboboxField';
import { useQuery } from '@tanstack/react-query';

import { patientQuery } from '@/features/patients/api/patient.queryMeta';
import { patientsApi } from '@/features/patients/api/patients.api';
import { patientFullName } from '@/features/patients/patientView';
import type { Patient } from '@/features/patients/types/patient.types';
import { staffQuery } from '@/features/staff/api/staff.queryMeta';
import { staffRepository } from '@/features/staff/api/staffRepository';
import type { StaffListItem } from '@/features/staff/types/staff.types';

const PATIENT_PAGE_SIZE = 10;
const STAFF_PAGE_SIZE = 10;

const MAX_SEARCH_TERM_LENGTH = 200;

const PATIENT_LIST_FIELDS = [
  'id',
  'firstName',
  'middleName',
  'lastName',
  'zrn',
] as const;

function patientOptionLabel(
  patient: Pick<Patient, 'firstName' | 'middleName' | 'lastName' | 'zrn'>,
): string {
  const name = patientFullName(patient);
  if (patient.zrn) return `${name} · ${patient.zrn}`;
  return name;
}

export function staffOptionLabel(staff: StaffListItem): string {
  const name = staff.user?.fullName ?? staff.staffNumber;
  if (staff.profession) return `${name} · ${staff.profession}`;
  return name;
}

export async function searchPatientOptions(
  term: string,
): Promise<AsyncComboboxOption[]> {
  const trimmed = term.trim().slice(0, MAX_SEARCH_TERM_LENGTH);

  let builder = patientQuery();
  if (trimmed !== '') {
    // Same field/mode split as `toPatientQuery` — trigram on the free-text
    // names, ilike on the structured identifiers.
    builder = builder
      .search('firstName', 'tri', trimmed)
      .search('lastName', 'tri', trimmed)
      .search('zrn', 'ilike', trimmed)
      .search('phoneNumber', 'ilike', trimmed);
  }

  const page = await patientsApi.list<(typeof PATIENT_LIST_FIELDS)[number]>(
    builder
      .sort('firstName', 'asc')
      .limit(PATIENT_PAGE_SIZE)
      .select(...PATIENT_LIST_FIELDS)
      .build(),
  );

  return page.data.map((patient) => ({
    value: patient.id,
    label: patientOptionLabel(patient),
  }));
}

// Branch-scope inputs for the staff picker. `isAdminCaller` mirrors
// `isAdmin(user)`; `branchId` mirrors the dashboard's globally-selected
// branch. Both are read by `AppointmentForm.tsx` (it already needs them for
// the create-submit payload) and passed in here rather than duplicated.
export interface StaffSearchScope {
  isAdminCaller: boolean;
  branchId: string | null;
}

// Factory, not a plain function: this module cannot call
// `useDashboardFiltersStore`/`isAdmin` itself (it only exports plain async
// functions, not hooks), so the caller resolves the scope and closes over it.
//
// Edge cases (decided): empty term still returns a default sorted page
// (mirrors patient); admin with no branch selected yet gets an unfiltered
// all-branch list rather than a disabled/blocked combo; non-admins never send
// `branchId` regardless of what is in the store.
export function createSearchStaffOptions(scope: Readonly<StaffSearchScope>) {
  return async function searchStaffOptions(
    term: string,
  ): Promise<AsyncComboboxOption[]> {
    let builder = staffQuery().include('user');

    const trimmed = term.trim().slice(0, MAX_SEARCH_TERM_LENGTH);
    if (trimmed !== '') {
      // Same name/identifier split as patient — trigram on the free-text
      // name, ilike on the structured staff code.
      builder = builder
        .search('user.fullName', 'tri', trimmed)
        .search('staffNumber', 'ilike', trimmed);
    }

    if (scope.isAdminCaller && scope.branchId) {
      builder = builder.where('branchId', 'eq', scope.branchId);
    }

    const page = await staffRepository.list(
      builder.sort('createdAt', 'desc').limit(STAFF_PAGE_SIZE).build(),
    );

    return page.data.map((staff) => ({
      value: staff.id,
      label: staffOptionLabel(staff),
    }));
  };
}

// Seeds `AsyncComboboxField`'s `initialLabel` for an already-chosen patient —
// on the edit page, and on the create page when it is opened with a
// `?patientId=` prefill. Resolved through `GET /patients/:id` rather than the
// search endpoint, so it works for a patient no search term would surface.
export function usePatientOptionLabel(id: string): string | undefined {
  const { data } = useQuery({
    queryKey: ['appointment-patient-label', id],
    queryFn: () => patientsApi.get(id),
    enabled: id.length > 0,
  });
  if (!data) return undefined;
  return patientOptionLabel(data);
}

// The staff equivalent. `GET /staff/:id` returns `StaffDetail`, which carries
// no user name at all (see `staff.types.ts`), so the label is resolved via a
// tiny one-row list query (`id eq`) rather than the search endpoint — it
// needs to work for a staff member the search page would not itself surface.
export function useStaffOptionLabel(id: string): string | undefined {
  const { data } = useQuery({
    queryKey: ['appointment-staff-label', id],
    queryFn: async () => {
      const page = await staffRepository.list(
        staffQuery()
          .where('id', 'eq', id)
          .include('user')
          .limit(1)
          .build(),
      );
      return page.data[0];
    },
    enabled: id.length > 0,
  });
  if (!data) return undefined;
  return staffOptionLabel(data);
}
