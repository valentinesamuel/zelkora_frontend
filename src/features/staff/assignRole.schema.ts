import { z } from 'zod';

// INV-5: this schema must NEVER be stricter than the server's binding tags.
// `PUT /auth/users/:id/role` binds `AssignRoleRequest`
// (zelkora_backend/internal/auth/dto.go):
//
//   RoleID string `json:"roleId" binding:"required,uuid"`
//
// So: a required, uuid-formatted string and nothing more. The target user id
// is the PATH parameter, not a body field, so it is deliberately absent here.

export const assignRoleSchema = z.object({
  roleId: z.string().uuid('Select a role.'),
});

export type AssignRoleValues = z.infer<typeof assignRoleSchema>;
