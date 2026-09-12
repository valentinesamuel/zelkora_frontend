// R-5 drift tripwire: `staff.queryMeta.ts` is hand-authored and nothing
// mechanically ties it to `zelkora_backend/internal/staff/queryconfig.go`.
// These count/membership assertions are the primary defence against silent
// drift — if the backend's Allowed* lists ever change, this file must be
// updated (and re-verified against `queryconfig.go`) in lockstep, or these
// tests fail.

import { describe, expect, it } from 'vitest';

import { staffQueryMeta } from './staff.queryMeta';

const EXPECTED_SORT_COUNT = 3;
const EXPECTED_FIELD_COUNT = 5;
const EXPECTED_RELATION_COUNT = 2;

describe('staffQueryMeta drift tripwire', () => {
  it('resolves the entity name to the exact staffcols.StaffEntityName value', () => {
    expect(staffQueryMeta.entity).toBe('Staff');
  });

  it('exposes exactly 2 relations, "user" and "branch" (AllowedRelations, queryconfig.go)', () => {
    expect(staffQueryMeta.relations).toHaveLength(EXPECTED_RELATION_COUNT);
    expect(staffQueryMeta.relations).toEqual(['user', 'branch']);
  });

  it('allows branch as an includable relation (AllowedRelations + dotted branch.name in queryconfig.go)', () => {
    expect(staffQueryMeta.relations).toContain('branch');
  });

  it('never adds user to projectableFields (it drives fields[Staff], not the join)', () => {
    expect(staffQueryMeta.projectableFields).not.toContain('user');
  });

  it('never adds branch to projectableFields (it drives fields[Staff], not the join)', () => {
    expect(staffQueryMeta.projectableFields).not.toContain('branch');
  });

  it('exposes exactly 5 filterable fields (AllowedFilters ∩ list-UI whitelist)', () => {
    expect(Object.keys(staffQueryMeta.fields)).toHaveLength(
      EXPECTED_FIELD_COUNT,
    );
  });

  it('never adds branch to fields (filterable root columns only, branchId already covers filtering)', () => {
    expect(Object.keys(staffQueryMeta.fields)).not.toContain('branch');
  });

  it('exposes exactly 3 sort fields (AllowedSort, queryconfig.go)', () => {
    expect(staffQueryMeta.sortFields).toHaveLength(EXPECTED_SORT_COUNT);
  });

  it('exposes exactly 2 AllowedSearch fields, "user.fullName" (trigram) and "staffNumber" (ilike)', () => {
    expect(staffQueryMeta.searchFields).toHaveLength(2);
    expect(staffQueryMeta.searchFields).toEqual(['user.fullName', 'staffNumber']);
  });
});
