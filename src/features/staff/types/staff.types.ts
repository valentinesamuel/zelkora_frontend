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

export interface StaffListItem {
  id: string;
  userId: string;
  staffNumber: string;
  profession: Profession;
  branchId: string;
  departmentId: string | null;
  createdAt: string;
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
