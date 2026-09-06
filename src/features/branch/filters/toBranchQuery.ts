// The single translation seam between the URL-backed list UI state
// (`BranchListQuery`) and the backend query contract (a Branch `QueryBuilder`).
// Pure: no I/O, no React, no `new Date()`.
//
// Deliberately absent:
//   - `filter[branchId]` — irrelevant here, and the `toPatientQuery` reason for
//     omitting it is NOT replicated. `GET /patients` force-overwrites
//     `filter[branchId]` from the JWT for tenant isolation (backend INV-B1);
//     branches are the tenant's OWN directory, not branch-scoped rows, so there
//     is no JWT-overwrite behaviour to mirror or work around.
//   - a trailing `id` sort — the backend always appends `id ASC` (INV-Q8);
//     `branchQueryMeta.sortFields` is `name, code` only.
//   - `.cursor(...)` — the list page pages by offset (D7), not cursor.

import { branchQuery } from '@/features/branch/api/branch.queryMeta';
import type { BranchQueryBuilder } from '@/features/branch/api/branches.api';
import { BRANCH_LIST_FIELDS } from '@/features/branch/components/branchColumns';
import type { BranchListQuery } from '@/features/branch/filters/branchListParams';

const MAX_SEARCH_TERM_LENGTH = 200;

type Builder = BranchQueryBuilder;

function applySearch(builder: Builder, rawSearch: string): Builder {
  const term = rawSearch.trim().slice(0, MAX_SEARCH_TERM_LENGTH);
  if (term === '') return builder;
  // AllowedSearch is `code` + `name`, both trigram (queryconfig.go:22-25); the
  // backend ORs them.
  return builder.search('name', 'tri', term).search('code', 'tri', term);
}

function applyStatus(
  builder: Builder,
  status: BranchListQuery['status'],
): Builder {
  if (status === 'active') return builder.where('isActive', 'eq', true);
  if (status === 'inactive') return builder.where('isActive', 'eq', false);
  return builder;
}

export function toBranchQuery(
  ui: BranchListQuery,
): BranchQueryBuilder<(typeof BRANCH_LIST_FIELDS)[number]> {
  let builder = branchQuery();

  builder = applySearch(builder, ui.search);
  builder = applyStatus(builder, ui.status);
  builder = builder.sort(ui.sortField, ui.sortDir);

  return builder
    .offset(ui.page, ui.pageSize)
    .withTotal(true)
    .select(...BRANCH_LIST_FIELDS);
}
