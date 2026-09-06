// Wire + form shapes for the Branch entity.
//
// Mirrors `zelkora_backend/internal/branch/dto.go` (BranchResponse /
// CreateBranchRequest / UpdateBranchRequest), with two deliberate omissions:
//
//   - `occupation` — declared on `BranchResponse` but NEVER populated by
//     `branchToResponse` (dto.go:37-49). It is dead on the wire; it must not
//     exist on the frontend type (INV-B15).
//   - `code` on the request bodies — server-generated (`'BR' || lpad(...)`),
//     immutable, absent from both request DTOs (INV-B6).
//
// Optionals are `?: string` (not `| null`) to match the `Patient` convention
// for Go `*string` + `json:",omitempty"` fields: the backend omits the key
// rather than sending an explicit `null`.

export interface Branch {
  readonly id: string;
  readonly createdAt: string; // RFC3339
  readonly updatedAt: string; // RFC3339
  readonly name: string;
  readonly code: string; // server-generated "BR###", immutable (INV-B6)
  readonly address?: string;
  readonly email?: string;
  readonly phoneNumber?: string;
  readonly isActive: boolean;
}

// `POST /branches` body. `isActive` is REQUIRED, never optional: the Go field
// is `bool` (not `*bool`), so an omitted key binds to `false` and silently
// creates an inactive branch that INV-B3 then hides from the switcher
// (INV-B4 / §1.2 of plan.md).
export interface CreateBranchBody {
  name: string;
  address?: string;
  email?: string;
  phoneNumber?: string;
  isActive: boolean;
}

// `PATCH /branches/:id` body — exactly the four fields of
// `UpdateBranchRequest` (dto.go:17-22). No `name`, no `code`: they are not
// updatable (INV-B1).
export interface UpdateBranchBody {
  address?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
}
