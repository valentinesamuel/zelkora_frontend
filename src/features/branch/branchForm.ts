import type { DefaultValues, FieldNamesMarkedBoolean } from 'react-hook-form';

import type { BranchFormValues } from '@/features/branch/schemas/branchForm.schema';
import type {
  Branch,
  CreateBranchBody,
  UpdateBranchBody,
} from '@/features/branch/types/branch.types';

type BranchDirtyFields = Partial<
  Readonly<FieldNamesMarkedBoolean<BranchFormValues>>
>;

const OPTIONAL_TEXT_FIELDS = ['address', 'phoneNumber', 'email'] as const;

export function emptyBranchFormValues(): DefaultValues<BranchFormValues> {
  return {
    name: '',
    address: '',
    phoneNumber: '',
    email: '',
    // Default TRUE. `isActive` is always sent on create (INV-B4) — a `false`
    // here would create a branch INV-B3 immediately hides from the switcher.
    isActive: true,
  };
}

export function toBranchFormValues(wire: Branch): BranchFormValues {
  return {
    name: wire.name,
    address: wire.address ?? '',
    phoneNumber: wire.phoneNumber ?? '',
    email: wire.email ?? '',
    isActive: wire.isActive,
  };
}

export function buildCreateBranchBody(
  values: BranchFormValues,
): CreateBranchBody {
  // `isActive` assigned UNCONDITIONALLY — never inside an `if` / empty-check
  // (INV-B4).
  const body: CreateBranchBody = {
    name: values.name.trim(),
    isActive: values.isActive,
  };

  for (const field of OPTIONAL_TEXT_FIELDS) {
    const value = values[field].trim();
    if (value !== '') body[field] = value;
  }

  return body;
}

export function buildUpdateBranchBody(
  values: BranchFormValues,
  dirtyFields: BranchDirtyFields,
): UpdateBranchBody {
  const body: UpdateBranchBody = {};

  // `name` and `code` are NEVER read here — not updatable (INV-B1).
  for (const field of OPTIONAL_TEXT_FIELDS) {
    // A dirty-but-emptied optional field sends the trimmed `''` — the backend
    // takes `*string`, and silently dropping a user's deletion is wrong
    // (matches `buildUpdatePatientBody`).
    if (dirtyFields[field]) body[field] = values[field].trim();
  }

  if (dirtyFields.isActive) body.isActive = values.isActive;

  return body;
}
