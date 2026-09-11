import { describe, expect, it } from 'vitest';

import { roleFormSchema } from '@/features/roles/roleForm.schema';

const uuid = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('roleFormSchema', () => {
  it('accepts a valid payload with a non-empty permissionIds array', () => {
    const result = roleFormSchema.safeParse({
      name: 'Nurse',
      description: 'Ward nurse',
      permissionIds: [uuid],
    });
    expect(result.success).toBe(true);
  });

  // INVARIANT: the server's `permissionIds` binding is `dive,uuid` with no
  // `min` — an empty array is legal and must stay legal here.
  it('accepts an EMPTY permissionIds array', () => {
    const result = roleFormSchema.safeParse({
      name: 'Nurse',
      description: '',
      permissionIds: [],
    });
    expect(result.success).toBe(true);
  });

  it('accepts an empty description', () => {
    const result = roleFormSchema.safeParse({
      name: 'Nurse',
      description: '',
      permissionIds: [],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a name shorter than 2 characters (matches server min=2)', () => {
    const result = roleFormSchema.safeParse({
      name: 'N',
      description: '',
      permissionIds: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a name longer than 64 characters (matches server max=64)', () => {
    const result = roleFormSchema.safeParse({
      name: 'a'.repeat(65),
      description: '',
      permissionIds: [],
    });
    expect(result.success).toBe(false);
  });

  it('accepts a name at exactly the 2 and 64 character boundaries', () => {
    expect(
      roleFormSchema.safeParse({
        name: 'ab',
        description: '',
        permissionIds: [],
      }).success,
    ).toBe(true);
    expect(
      roleFormSchema.safeParse({
        name: 'a'.repeat(64),
        description: '',
        permissionIds: [],
      }).success,
    ).toBe(true);
  });

  it('rejects a non-uuid permission id', () => {
    const result = roleFormSchema.safeParse({
      name: 'Nurse',
      description: '',
      permissionIds: ['not-a-uuid'],
    });
    expect(result.success).toBe(false);
  });
});
