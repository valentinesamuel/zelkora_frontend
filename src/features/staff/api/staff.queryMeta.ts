import type { ColumnType, EntityQueryMeta } from '@/lib/query';
import { defineEntityQuery } from '@/lib/query';

import type { StaffListItem } from '@/features/staff/types/staff.types';

const COLUMN_TYPE_UUID: ColumnType = 'uuid';
const COLUMN_TYPE_TEXT: ColumnType = 'text';
const COLUMN_TYPE_TIMESTAMPTZ: ColumnType = 'timestamptz';

export const staffQueryMeta = {
  // Query-engine entity registry key — staffcols/metadata.go.
  entity: 'Staff',

  // AllowedFilters ∩ plan whitelist — internal/staff/queryconfig.go. Backend
  // also allows `id, userId, baseBranchId, staffNumber`, but the list UI only
  // filters on these four.
  fields: {
    profession: { type: COLUMN_TYPE_TEXT },
    branchId: { type: COLUMN_TYPE_UUID },
    departmentId: { type: COLUMN_TYPE_UUID },
    createdAt: { type: COLUMN_TYPE_TIMESTAMPTZ },
  },

  // AllowedSort — queryconfig.go. Backend appends `id ASC` as the final
  // tiebreaker itself (INV-Q8) — never emit a trailing `id` sort.
  sortFields: ['createdAt', 'staffNumber', 'profession'],

  // No AllowedSearch server-side.
  searchFields: [],

  // The `branch` relation is intentionally NOT whitelisted — the list shows
  // `branchId`, not a joined name (plan: omit relations, return IDs).
  relations: [],

  projectableFields: [
    'id',
    'userId',
    'staffNumber',
    'profession',
    'branchId',
    'departmentId',
    'createdAt',
  ],
} as const satisfies EntityQueryMeta<StaffListItem>;

export const staffQuery = defineEntityQuery<StaffListItem, typeof staffQueryMeta>(
  staffQueryMeta,
);
