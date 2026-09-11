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
  // the join is narrowed server-side to fullName/email/roleId (+ the
  // always-present id) by dotted AllowedFields
  // (internal/staff/queryconfig.go). All three arrive from a bare
  // `.include('user')` — no `fields[user]=…` param is needed, because
  // buildJoinSelects falls back to the full config whitelist when the caller
  // projects nothing.
  //
  // `branch` is likewise whitelisted — the join is narrowed server-side to
  // `name` (+ the always-present `id`) by the single dotted `branch.name`
  // entry in `internal/staff/queryconfig.go`'s AllowedFields. A bare
  // `.include('branch')` is sufficient, same fallback mechanism as `user`.
  relations: ['user', 'branch'],

  // Do NOT add 'user' or 'branch' here: projectableFields feeds
  // fields[Staff]=… (root projection), not the join. The backend silently
  // drops an unregistered root property (buildRootSelect), so either would be
  // dead weight that also invites confusion about what actually drives the
  // join (.include()).
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
