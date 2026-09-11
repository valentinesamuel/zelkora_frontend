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
//
// `status` was added to the same whitelist alongside `roleId` (see
// internal/staff/queryconfig.go) so the staff list can show account status
// without a per-row fetch. Typed as `string`, not `UserStatus`
// (`@/lib/userStatus`) — the badge helpers there already fall back safely for
// an unrecognized value, so this stays a plain string rather than risking a
// runtime cast.
export interface StaffUserRef {
  id: string;
  fullName: string;
  email: string;
  roleId: string;
  status: string;
}

// Nested join object, populated only when the request sends `include=branch`
// (backend: internal/staff/queryconfig.go AllowedRelations + the dotted
// `branch.name` AllowedFields entry). `id` is always present because the
// query engine forces it into every data join regardless of the field
// whitelist (engine INVARIANT 6); `name` is the only other column the
// whitelist admits.
export interface StaffBranchRef {
  id: string;
  name: string;
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
  // `null` means the joined `branches` row is soft-deleted, not "not
  // requested" — same semantics as `user` above. `branchId` stays the filter
  // key regardless of whether this join is requested.
  branch: StaffBranchRef | null;
}

// Wire shape of `GET /staff/:id` — mirrors `StaffDetailResponse` in
// `zelkora_backend/internal/staff/dto.go` EXACTLY. Deliberately NOT
// `StaffListItem`: this is a service-layer read, not the query engine
// (handler.go GetStaff), so there is no joined `user` object — no
// fullName/email/status, only `userId`. `roleId` IS present (unlike the plain
// `StaffResponse` that `PATCH /staff/:id` and `POST /staff` return) — it's
// GetStaffDetailByID's one addition, added specifically so the edit page can
// pre-select the member's current role. Callers that need the member's
// name/email (e.g. an edit page header) must get them from the staff list's
// cached `StaffListItem` rather than from this endpoint.
// `branchName` is a flat resolved string, NOT a join object like
// `StaffListItem.branch` — this endpoint is a hand-built DTO, not query-engine
// output, so there is no join-object convention to mirror here. It is always
// present in the JSON and is `""` only when the `branches` row no longer
// exists at all (deactivated/soft-deleted branches still resolve a name).
export interface StaffDetail {
  id: string;
  userId: string;
  staffNumber: string;
  profession: Profession;
  branchId: string;
  baseBranchId: string;
  departmentId: string | null;
  licenseNumber: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  branchName: string;
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

// `PATCH /staff/:id` body. Mirrors
// zelkora_backend/internal/staff/dto.go UpdateStaffRequest EXACTLY — no
// roleId field, because the backend doesn't accept it here (role is
// reassigned via the separate `PUT /auth/users/:id/role` flow,
// StaffRoleDialog). `branchId` IS accepted by this body, so a staff member's
// branch can be reassigned in the same PATCH as profession/licenseNumber.
// `clearDepartment: true` is how a department is unset — a JSON `null` and
// an absent key are both "nothing sent" at this layer, so it needs its own
// explicit flag.
export interface UpdateStaffBody {
  profession?: Profession;
  licenseNumber?: string;
  branchId?: string;
  departmentId?: string;
  clearDepartment?: boolean;
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
