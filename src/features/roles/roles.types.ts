// Wire + form shapes for the Role entity.
//
// Mirrors the `GET /auth/roles`, `GET /auth/roles/:id`, `GET /auth/permissions`,
// `POST /auth/roles`, and `PUT /auth/roles/:id` contracts documented in the
// Phase 4 plan.
//
// `description` is UNVALIDATED server-side but is always present as a string
// on the wire response (never omitted) — optionals live on the request
// bodies, not the response type.

export interface Permission {
  readonly id: string;
  readonly name: string; // "resource:action", e.g. "patient:read"
}

// One member of a role's membership list (GetRole's "who holds this role"
// section). Mirrors zelkora_backend/internal/auth/dto.go RoleUserResponse.
// Included (disabled accounts too) — not the same as `userCount`, which
// excludes disabled users for last-admin protection.
export interface RoleUser {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly status: string;
}

export interface Role {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly userCount: number;
  readonly permissions: readonly Permission[];
  // Always an array (never undefined) — populated by GET /auth/roles/:id;
  // GET /auth/roles (the list) sends `[]` for every row (INV-4).
  readonly users: readonly RoleUser[];
  readonly createdAt: string; // RFC3339
  readonly updatedAt: string; // RFC3339
}

// `POST /auth/roles` body. `permissionIds` is REQUIRED but an EMPTY array is
// legal (a role may be created with no permissions) — do not add `.min(1)`
// anywhere this type flows through validation.
export interface CreateRoleInput {
  name: string;
  description?: string;
  permissionIds: string[];
}

// `PUT /auth/roles/:id` body — same shape as create. `PUT` is a full
// replace, not a partial patch: the whole permission set is always sent.
export interface UpdateRoleInput {
  name: string;
  description?: string;
  permissionIds: string[];
}
