import type { ColumnType, EntityQueryMeta } from '@/lib/query';
import { defineEntityQuery } from '@/lib/query';

import type { Branch } from '@/features/branch/types/branch.types';

const COLUMN_TYPE_UUID: ColumnType = 'uuid';
const COLUMN_TYPE_TEXT: ColumnType = 'text';
const COLUMN_TYPE_CITEXT: ColumnType = 'citext';
const COLUMN_TYPE_BOOL: ColumnType = 'bool';

export const branchQueryMeta = {
  // Query-engine entity registry key — branchcols/metadata.go:8.
  entity: 'Branch',

  // AllowedFilters (7) — internal/branch/queryconfig.go:14-16.
  fields: {
    id: { type: COLUMN_TYPE_UUID },
    name: { type: COLUMN_TYPE_TEXT },
    code: { type: COLUMN_TYPE_TEXT },
    address: { type: COLUMN_TYPE_TEXT },
    phoneNumber: { type: COLUMN_TYPE_TEXT },
    email: { type: COLUMN_TYPE_CITEXT },
    isActive: { type: COLUMN_TYPE_BOOL },
  },

  // AllowedSort — queryconfig.go:18-21. EXACTLY `name, code`: no `createdAt`,
  // no `id`. The backend appends `id ASC` as the final tiebreaker itself
  // (INV-Q8) — never emit a trailing `id` sort.
  sortFields: ['name', 'code'],

  // AllowedSearch — queryconfig.go:22-25. `code` + `name`, both trigram.
  searchFields: ['code', 'name'],

  // No AllowedRelations — branch has no includable relations.
  relations: [],

  // AllowedFields is unrestricted server-side (`AllowedFields: nil`,
  // queryconfig.go) — any root column of `Branch` may be projected.
  projectableFields: [
    'id',
    'createdAt',
    'updatedAt',
    'name',
    'code',
    'address',
    'email',
    'phoneNumber',
    'isActive',
  ],
} as const satisfies EntityQueryMeta<Branch>;

export const branchQuery = defineEntityQuery<Branch, typeof branchQueryMeta>(
  branchQueryMeta,
);
