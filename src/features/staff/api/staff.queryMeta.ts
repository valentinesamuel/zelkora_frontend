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

  // `user` IS whitelisted — backend AllowedRelations includes Rel_User, and
  // the join is narrowed server-side to fullName/email by dotted
  // AllowedFields (internal/staff/queryconfig.go). `branch` is still NOT
  // whitelisted here even though the backend allows it, because the list
  // shows `branchId`, not a joined branch name.
  relations: ['user'],

  // Do NOT add 'user' here: projectableFields feeds fields[Staff]=… (root
  // projection), not the join. The backend silently drops an unregistered
  // `user` root property (buildRootSelect), so it would be dead weight that
  // also invites confusion about what actually drives the join (.include()).
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

export const staffQuery = defineEntityQuery<
  StaffListItem,
  typeof staffQueryMeta
>(staffQueryMeta);
