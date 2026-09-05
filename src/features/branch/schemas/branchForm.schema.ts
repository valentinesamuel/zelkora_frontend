import { z } from 'zod';

// One schema serves BOTH form modes. `name` stays in the value set in edit mode
// (seeded from the wire record, never a placeholder) but the edit form does not
// render an input for it and `buildUpdateBranchBody` never reads it — `name` is
// not updatable (INV-B1). Because the value is always the real branch name, a
// single schema needs no fake default and no create/edit split.
//
// `code` is deliberately ABSENT: server-generated, immutable, never in a
// request body or form default (INV-B6).

const optionalText = z.string().trim();

export const branchFormSchema = z.object({
  name: z.string().trim().min(1, 'Branch name is required.'),
  address: optionalText,
  phoneNumber: optionalText,
  email: optionalText.refine(
    (v) => v === '' || z.string().email().safeParse(v).success,
    { message: 'Enter a valid email address.' },
  ),
  isActive: z.boolean(),
});

export type BranchFormValues = z.infer<typeof branchFormSchema>;
