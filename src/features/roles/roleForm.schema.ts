import { z } from 'zod';

// INVARIANT: this schema must NEVER be stricter than the server's binding
// tags (`POST`/`PUT /auth/roles[/:id]`):
//   - `name`      binding:"required,min=2,max=64"
//   - `description` unvalidated — any string, including empty, is legal
//   - `permissionIds` binding:"dive,uuid" — an EMPTY array is legal; do not
//     add `.min(1)` here.

export const roleFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Role name must be at least 2 characters.')
    .max(64, 'Role name must be at most 64 characters.'),
  description: z.string().trim(),
  permissionIds: z.array(z.string().uuid()),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
