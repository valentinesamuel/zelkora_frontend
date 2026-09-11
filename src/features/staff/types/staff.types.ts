// Wire + form shapes for the Staff entity.
//
// Mirrors `zelkora_backend/internal/staff/dto.go` (StaffResponse /
// OnboardStaffRequest) and the query-engine row projection for `GET /staff`.
//
// Optionals are `?: string` (not `| null`) for Go `*string` +
// `json:",omitempty"` request fields; `| null` where the backend sends an
// explicit `null` on a response.

// mirrors zelkora_backend/internal/staff/model.go Profession constants
export const PROFESSION_VALUES = [
  'doctor',
  'nurse',
  'pharmacist',
  'receptionist',
  'admin',
] as const;

export type Profession = (typeof PROFESSION_VALUES)[number];

export interface StaffMe {
  fullName: string;
  staffNumber: string;
  profession: Profession;
  branchName: string;
  departmentName: string | null;
}

// Nested join object, populated only when the request sends `include=user`
// (backend: internal/staff/queryconfig.go AllowedRelations + dotted
// AllowedFields). `fullName`/`email` are NOT NULL on `users`, so they are
// non-nullable here — the ref itself only exists on a join hit.
//
// `roleId` is in the same dotted `user.*` whitelist, so it arrives with the
// default join projection — `include=user` alone is enough, no `fields[user]`
// param needed (queryengine/build.go `buildJoinSelects`: with a config
// restriction and no user projection, `cols = relAllowed`, i.e. ALL
// config-listed columns). It is the CURRENT role of the joined user; the
// role's NAME is resolved client-side from `useRoles()` — deliberately not a
// wire field.
export interface StaffUserRef {
  id: string;
  fullName: string;
  email: string;
  roleId: string;
}

export interface StaffListItem {
  id: string;
  userId: string;
  staffNumber: string;
  profession: Profession;
  branchId: string;
  departmentId: string | null;
  createdAt: string;
  // `null` means the joined `users` row is soft-deleted, not "not requested" —
  // the engine always emits this key when `user` is in the query plan.
  user: StaffUserRef | null;
}

export interface OnboardStaffBody {
  email: string;
  fullName: string;
  roleId: string;
  branchId: string;
  profession: Profession;
  licenseNumber: string;
  departmentId?: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  branchId: string;
}
