import { describe, expect, it } from 'vitest';

import { assignRoleSchema } from '@/features/staff/assignRole.schema';

const UUID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('assignRoleSchema', () => {
  it('accepts a uuid roleId (matches server binding:"required,uuid")', () => {
    const result = assignRoleSchema.safeParse({ roleId: UUID });
    expect(result.success).toBe(true);
  });

  it('rejects an empty roleId (server binding is `required`)', () => {
    const result = assignRoleSchema.safeParse({ roleId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a non-uuid roleId (server binding is `uuid`)', () => {
    const result = assignRoleSchema.safeParse({ roleId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing roleId', () => {
    const result = assignRoleSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects a non-string roleId', () => {
    const result = assignRoleSchema.safeParse({ roleId: 123 });
    expect(result.success).toBe(false);
  });

  // INV-5 guard: the server body carries ONLY `roleId`. The target user id
  // travels in the URL path, so it must not be required in the body — a
  // payload without it stays valid.
  it('does not require a userId in the body', () => {
    const result = assignRoleSchema.safeParse({ roleId: UUID });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ roleId: UUID });
    }
  });

  it('accepts an uppercase uuid', () => {
    const result = assignRoleSchema.safeParse({ roleId: UUID.toUpperCase() });
    expect(result.success).toBe(true);
  });
});
