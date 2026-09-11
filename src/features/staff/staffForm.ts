import type { FieldNamesMarkedBoolean } from 'react-hook-form';

import {
  NO_DEPARTMENT_VALUE,
  type UpdateStaffValues,
} from '@/features/staff/schemas/updateStaff.schema';
import type {
  StaffDetail,
  UpdateStaffBody,
} from '@/features/staff/types/staff.types';

type StaffDirtyFields = Partial<
  Readonly<FieldNamesMarkedBoolean<UpdateStaffValues>>
>;

export function toStaffFormValues(wire: StaffDetail): UpdateStaffValues {
  return {
    profession: wire.profession,
    licenseNumber: wire.licenseNumber,
    departmentId: wire.departmentId ?? NO_DEPARTMENT_VALUE,
    branchId: wire.branchId,
    roleId: wire.roleId,
  };
}

// Partial PATCH body — only dirty fields, mirroring `buildUpdateBranchBody`.
// `departmentId` is the one field with a three-way outcome: unchanged (omit),
// set to a real department, or cleared back to none (`clearDepartment: true`
// — a JSON `null` and an absent key are both nil at the Go layer, per
// UpdateStaffBody's doc comment).
//
// `roleId` is NEVER read here — it doesn't belong to this body at all (see
// this module's schema doc comment). `StaffEditPage` reads
// `dirtyFields.roleId` itself and submits it through `useAssignStaffRole`.
export function buildUpdateStaffBody(
  values: UpdateStaffValues,
  dirtyFields: StaffDirtyFields,
): UpdateStaffBody {
  const body: UpdateStaffBody = {};

  if (dirtyFields.profession) body.profession = values.profession;
  if (dirtyFields.licenseNumber) {
    body.licenseNumber = values.licenseNumber.trim();
  }
  if (dirtyFields.branchId) body.branchId = values.branchId;

  if (dirtyFields.departmentId) {
    if (values.departmentId === NO_DEPARTMENT_VALUE) {
      body.clearDepartment = true;
    } else {
      body.departmentId = values.departmentId;
    }
  }

  return body;
}
