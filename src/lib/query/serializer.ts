 
import { OPERATOR_ARITY, type FilterOperator } from './operators';
import type { FilterClause, QueryState } from './types';

const PARAM_SORT = 'sort';
const PARAM_INCLUDE = 'include';
const PARAM_LIMIT = 'limit';
const PARAM_CURSOR = 'cursor';
const PARAM_PAGE = 'page';
const PARAM_PAGE_SIZE = 'pageSize';
const PARAM_PAGINATION_MODE = 'paginationMode';
const PARAM_WITH_TOTAL = 'withTotal';
const PARAM_WITH_DELETED = 'withDeleted';
const LIST_SEPARATOR = ',';
const DESC_PREFIX = '-';

function filterValueToWire(
  op: FilterOperator,
  value: FilterClause['value'],
): string {
  const arity = OPERATOR_ARITY[op];
  if (arity === 'unary') {
    return '';
  }
  if (arity === 'list' || arity === 'pair') {
    return (value as readonly string[]).join(LIST_SEPARATOR);
  }
  // scalar
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return value as string;
}

function appendFilters(params: URLSearchParams, state: QueryState): void {
  for (const clause of state.filters) {
    const key = `filter[${clause.field}][${clause.op}]`;
    params.append(key, filterValueToWire(clause.op, clause.value));
  }
}

function appendSearches(params: URLSearchParams, state: QueryState): void {
  for (const clause of state.searches) {
    const key = `search[${clause.field}][${clause.mode}]`;
    params.append(key, clause.term);
  }
}

function appendSort(params: URLSearchParams, state: QueryState): void {
  if (state.sort.length === 0) {
    return;
  }
  const value = state.sort
    .map((clause) =>
      clause.direction === 'desc'
        ? `${DESC_PREFIX}${clause.field}`
        : clause.field,
    )
    .join(LIST_SEPARATOR);
  params.append(PARAM_SORT, value);
}

function appendInclude(params: URLSearchParams, state: QueryState): void {
  if (state.includes.length === 0) {
    return;
  }
  params.append(PARAM_INCLUDE, state.includes.join(LIST_SEPARATOR));
}

function appendSelect(
  params: URLSearchParams,
  state: QueryState,
  entity: string,
): void {
  if (state.select.length === 0) {
    return;
  }
  params.append(`fields[${entity}]`, state.select.join(LIST_SEPARATOR));
}

function appendPagination(params: URLSearchParams, state: QueryState): void {
  const { pagination } = state;
  if (pagination.limit !== undefined) {
    params.append(PARAM_LIMIT, String(pagination.limit));
  }
  if (pagination.cursor !== undefined) {
    params.append(PARAM_CURSOR, pagination.cursor);
  }
  if (pagination.page !== undefined) {
    params.append(PARAM_PAGE, String(pagination.page));
  }
  if (pagination.pageSize !== undefined) {
    params.append(PARAM_PAGE_SIZE, String(pagination.pageSize));
  }
  params.append(PARAM_PAGINATION_MODE, pagination.mode);
}

function appendFlags(params: URLSearchParams, state: QueryState): void {
  if (state.withTotal) {
    params.append(PARAM_WITH_TOTAL, 'true');
  }
  if (state.withDeleted) {
    params.append(PARAM_WITH_DELETED, 'true');
  }
}

export function serializeQuery(
  state: QueryState,
  entity: string,
): URLSearchParams {
  const params = new URLSearchParams();
  appendFilters(params, state);
  appendSearches(params, state);
  appendSort(params, state);
  appendInclude(params, state);
  appendSelect(params, state, entity);
  appendPagination(params, state);
  appendFlags(params, state);
  return params;
}

export function toQueryString(state: QueryState, entity: string): string {
  return serializeQuery(state, entity).toString();
}
