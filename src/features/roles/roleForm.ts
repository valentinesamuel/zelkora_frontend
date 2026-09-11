import type { DefaultValues } from 'react-hook-form';

import type { RoleFormValues } from '@/features/roles/roleForm.schema';
import type {
  CreateRoleInput,
  Role,
  UpdateRoleInput,
} from '@/features/roles/roles.types';

export function emptyRoleFormValues(): DefaultValues<RoleFormValues> {
  return {
    name: '',
    description: '',
    permissionIds: [],
  };
}

export function roleToFormValues(wire: Role): RoleFormValues {
  return {
    name: wire.name,
    description: wire.description,
    permissionIds: wire.permissions.map((p) => p.id),
  };
}

// `PUT /auth/roles/:id` is a full replace, so `toCreateInput` and
// `toUpdateInput` build structurally identical bodies. Kept as two named
// functions (rather than one shared helper) so each call site reads as the
// operation it performs, matching the plan's naming.

export function toCreateInput(values: RoleFormValues): CreateRoleInput {
  const body: CreateRoleInput = {
    name: values.name.trim(),
    permissionIds: values.permissionIds,
  };
  const description = values.description.trim();
  if (description !== '') body.description = description;
  return body;
}

export function toUpdateInput(values: RoleFormValues): UpdateRoleInput {
  const body: UpdateRoleInput = {
    name: values.name.trim(),
    permissionIds: values.permissionIds,
  };
  const description = values.description.trim();
  if (description !== '') body.description = description;
  return body;
}
