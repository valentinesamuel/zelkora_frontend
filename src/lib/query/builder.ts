import { QueryValidationError, type QueryValidationCode } from './errors';
import {
  OPERATOR_ARITY,
  PAGINATION_MODE_CURSOR,
  PAGINATION_MODE_OFFSET,
  type FilterOperator,
  type ListOperator,
  type OperatorArityMap,
  type OperatorsForTypeMap,
  type PairOperator,
  type SearchMode,
  type UnaryOrScalarOperator,
} from './operators';
import type {
  EntityQueryMeta,
  FieldMeta,
  FilterClause,
  PaginationState,
  QueryState,
  SearchClause,
  SortClause,
  SortDirection,
} from './types';

const MAX_LIMIT = 50;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 50;
const MIN_PAGE = 1;
const MAX_PAGE_TIMES_PAGE_SIZE = 10_000;
const MIN_LIST_ITEMS = 1;
const MAX_LIST_ITEMS = 100;
const MAX_CURSOR_LENGTH = 1000;
const MAX_SEARCH_TERM_LENGTH = 200;
const MAX_FILTER_VALUE_LENGTH = 500;
const BETWEEN_ARITY = 2;

type MetaShape = { fields: Readonly<Record<string, FieldMeta>> };

type FieldKey<Meta extends MetaShape> = keyof Meta['fields'] & string;

type FieldOps<
  Meta extends MetaShape,
  F extends FieldKey<Meta>,
> = OperatorsForTypeMap[Meta['fields'][F]['type']][number];

type ValueForField<
  Meta extends MetaShape,
  F extends FieldKey<Meta>,
> = Meta['fields'][F] extends { type: 'bool' }
  ? boolean
  : Meta['fields'][F] extends {
        type: 'enum';
        values: infer V extends readonly string[];
      }
    ? V[number]
    : string;

type BetweenField<Meta extends MetaShape, F extends FieldKey<Meta>> =
  PairOperator extends FieldOps<Meta, F> ? F : never;

type ScalarArgs<
  Op extends FilterOperator,
  V,
> = OperatorArityMap[Op] extends 'unary' ? [] : [V];

export interface QueryBuilder<
  Row,
  Meta extends EntityQueryMeta<Row>,
  Selected extends keyof Row & string = never,
> {
  where<
    F extends FieldKey<Meta>,
    Op extends Extract<FieldOps<Meta, F>, UnaryOrScalarOperator>,
  >(
    field: F,
    op: Op,
    ...args: ScalarArgs<Op, ValueForField<Meta, F>>
  ): QueryBuilder<Row, Meta, Selected>;

  whereIn<
    F extends FieldKey<Meta>,
    Op extends Extract<FieldOps<Meta, F>, ListOperator>,
  >(
    field: F,
    op: Op,
    values: readonly ValueForField<Meta, F>[],
  ): QueryBuilder<Row, Meta, Selected>;

  whereBetween<F extends FieldKey<Meta>>(
    field: BetweenField<Meta, F>,
    values: readonly [ValueForField<Meta, F>, ValueForField<Meta, F>],
  ): QueryBuilder<Row, Meta, Selected>;

  search<F extends Meta['searchFields'][number]>(
    field: F,
    mode: SearchMode,
    term: string,
  ): QueryBuilder<Row, Meta, Selected>;

  sort<F extends Meta['sortFields'][number]>(
    field: F,
    direction?: SortDirection,
  ): QueryBuilder<Row, Meta, Selected>;

  include<R extends Meta['relations'][number]>(
    relation: R,
  ): QueryBuilder<Row, Meta, Selected>;

  select<F extends Meta['projectableFields'][number]>(
    ...fields: readonly F[]
  ): QueryBuilder<Row, Meta, Selected | F>;

  limit(value: number): QueryBuilder<Row, Meta, Selected>;
  cursor(value: string): QueryBuilder<Row, Meta, Selected>;
  offset(page: number, pageSize: number): QueryBuilder<Row, Meta, Selected>;
  withTotal(value?: boolean): QueryBuilder<Row, Meta, Selected>;
  withDeleted(value?: boolean): QueryBuilder<Row, Meta, Selected>;

  build(): QueryState;
}

const DEFAULT_PAGINATION: PaginationState = { mode: PAGINATION_MODE_CURSOR };

const DEFAULT_STATE: QueryState = Object.freeze({
  filters: [],
  searches: [],
  sort: [],
  includes: [],
  select: [],
  pagination: DEFAULT_PAGINATION,
  withTotal: false,
  withDeleted: false,
});

class QueryBuilderImpl<
  Row,
  Meta extends EntityQueryMeta<Row>,
  Selected extends keyof Row & string = never,
> implements QueryBuilder<Row, Meta, Selected> {
  private readonly meta: Meta;
  private readonly state: QueryState;

  constructor(meta: Meta, state: QueryState) {
    this.meta = meta;
    this.state = state;
  }

  private clone<S extends keyof Row & string>(
    patch: Partial<QueryState>,
  ): QueryBuilder<Row, Meta, S> {
    return new QueryBuilderImpl<Row, Meta, S>(this.meta, {
      ...this.state,
      ...patch,
    });
  }

  where(
    field: string,
    op: FilterOperator,
    ...args: readonly unknown[]
  ): QueryBuilder<Row, Meta, Selected> {
    const value =
      args.length > 0 ? (args[0] as FilterClause['value']) : undefined;
    const clause: FilterClause = { field, op, value };
    return this.clone({ filters: [...this.state.filters, clause] });
  }

  whereIn(
    field: string,
    op: FilterOperator,
    values: readonly unknown[],
  ): QueryBuilder<Row, Meta, Selected> {
    const clause: FilterClause = {
      field,
      op,
      value: values as readonly string[],
    };
    return this.clone({ filters: [...this.state.filters, clause] });
  }

  whereBetween(
    field: string,
    values: readonly [unknown, unknown],
  ): QueryBuilder<Row, Meta, Selected> {
    const clause: FilterClause = {
      field,
      op: 'between',
      value: values as readonly [string, string],
    };
    return this.clone({ filters: [...this.state.filters, clause] });
  }

  search(
    field: string,
    mode: SearchMode,
    term: string,
  ): QueryBuilder<Row, Meta, Selected> {
    const clause: SearchClause = { field, mode, term };
    return this.clone({ searches: [...this.state.searches, clause] });
  }

  sort(
    field: string,
    direction: SortDirection = 'asc',
  ): QueryBuilder<Row, Meta, Selected> {
    const clause: SortClause = { field, direction };
    return this.clone({ sort: [...this.state.sort, clause] });
  }

  include(relation: string): QueryBuilder<Row, Meta, Selected> {
    return this.clone({ includes: [...this.state.includes, relation] });
  }

  select<F extends Meta['projectableFields'][number]>(
    ...fields: readonly F[]
  ): QueryBuilder<Row, Meta, Selected | F> {
    return this.clone<Selected | F>({
      select: [...this.state.select, ...fields],
    });
  }

  limit(value: number): QueryBuilder<Row, Meta, Selected> {
    return this.clone({
      pagination: { ...this.state.pagination, limit: value },
    });
  }

  cursor(value: string): QueryBuilder<Row, Meta, Selected> {
    return this.clone({
      pagination: { ...this.state.pagination, cursor: value },
    });
  }

  offset(page: number, pageSize: number): QueryBuilder<Row, Meta, Selected> {
    return this.clone({
      pagination: {
        ...this.state.pagination,
        mode: PAGINATION_MODE_OFFSET,
        page,
        pageSize,
      },
    });
  }

  withTotal(value = true): QueryBuilder<Row, Meta, Selected> {
    return this.clone({ withTotal: value });
  }

  withDeleted(value = true): QueryBuilder<Row, Meta, Selected> {
    return this.clone({ withDeleted: value });
  }

  build(): QueryState {
    validateState(this.state, this.meta);
    return Object.freeze({
      filters: Object.freeze([...this.state.filters]),
      searches: Object.freeze([...this.state.searches]),
      sort: Object.freeze([...this.state.sort]),
      includes: Object.freeze([...this.state.includes]),
      select: Object.freeze([...this.state.select]),
      pagination: Object.freeze({ ...this.state.pagination }),
      withTotal: this.state.withTotal,
      withDeleted: this.state.withDeleted,
    });
  }
}

function fail(
  code: QueryValidationCode,
  message: string,
  field?: string,
): never {
  throw new QueryValidationError(code, message, field);
}

function checkFilterValueLength(field: string, raw: string): void {
  if (raw.length > MAX_FILTER_VALUE_LENGTH) {
    fail(
      'filter_value_too_long',
      `Filter value for "${field}" exceeds ${MAX_FILTER_VALUE_LENGTH} characters.`,
      field,
    );
  }
}

function validateFilterClause(clause: FilterClause): void {
  const arity = OPERATOR_ARITY[clause.op];
  if (arity === 'unary') {
    return;
  }
  if (arity === 'list') {
    const items = clause.value as readonly string[];
    if (items.length < MIN_LIST_ITEMS || items.length > MAX_LIST_ITEMS) {
      fail(
        'list_arity',
        `Filter "${clause.field}" must supply between ${MIN_LIST_ITEMS} and ${MAX_LIST_ITEMS} values.`,
        clause.field,
      );
    }
    for (const item of items) {
      checkFilterValueLength(clause.field, item);
    }
    return;
  }
  if (arity === 'pair') {
    const pair = clause.value as readonly string[];
    if (pair.length !== BETWEEN_ARITY) {
      fail(
        'between_arity',
        `Filter "${clause.field}" (between) requires exactly ${BETWEEN_ARITY} values.`,
        clause.field,
      );
    }
    for (const item of pair) {
      checkFilterValueLength(clause.field, item);
    }
    return;
  }
  // scalar
  const scalar = clause.value;
  if (typeof scalar === 'string') {
    checkFilterValueLength(clause.field, scalar);
  }
}

function validateSearchClause(clause: SearchClause): void {
  if (clause.term.length > MAX_SEARCH_TERM_LENGTH) {
    fail(
      'search_term_too_long',
      `Search term for "${clause.field}" exceeds ${MAX_SEARCH_TERM_LENGTH} characters.`,
      clause.field,
    );
  }
}

function validateNoPaginationModeConflict(pagination: PaginationState): void {
  const hasCursorParams =
    pagination.limit !== undefined || pagination.cursor !== undefined;
  const hasOffsetParams =
    pagination.page !== undefined || pagination.pageSize !== undefined;

  if (hasCursorParams && hasOffsetParams) {
    fail(
      'pagination_mode_conflict',
      'Cannot combine cursor-mode params (limit/cursor) with offset-mode params (page/pageSize).',
    );
  }
}

function validateCursorModeParams(pagination: PaginationState): void {
  if (pagination.limit !== undefined && pagination.limit > MAX_LIMIT) {
    fail('limit_out_of_range', `"limit" must be <= ${MAX_LIMIT}.`);
  }

  if (
    pagination.cursor !== undefined &&
    pagination.cursor.length > MAX_CURSOR_LENGTH
  ) {
    fail(
      'cursor_too_long',
      `"cursor" must be <= ${MAX_CURSOR_LENGTH} characters.`,
    );
  }
}

function validateOffsetModeParams(pagination: PaginationState): void {
  if (pagination.mode !== PAGINATION_MODE_OFFSET) {
    return;
  }
  const { pageSize, page } = pagination;
  if (
    pageSize !== undefined &&
    (pageSize < MIN_PAGE_SIZE || pageSize > MAX_PAGE_SIZE)
  ) {
    fail(
      'page_size_out_of_range',
      `"pageSize" must be between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}.`,
    );
  }
  if (page !== undefined && page < MIN_PAGE) {
    fail('page_out_of_range', `"page" must be >= ${MIN_PAGE}.`);
  }
  if (
    page !== undefined &&
    pageSize !== undefined &&
    page * pageSize > MAX_PAGE_TIMES_PAGE_SIZE
  ) {
    fail(
      'page_size_product_exceeded',
      `"page" * "pageSize" must be <= ${MAX_PAGE_TIMES_PAGE_SIZE}.`,
    );
  }
}

function validatePagination(pagination: PaginationState): void {
  validateNoPaginationModeConflict(pagination);
  validateCursorModeParams(pagination);
  validateOffsetModeParams(pagination);
}

function validateState<Row>(
  state: QueryState,
  meta: EntityQueryMeta<Row>,
): void {
  for (const clause of state.filters) {
    validateFilterClause(clause);
  }
  for (const clause of state.searches) {
    validateSearchClause(clause);
    if (!meta.searchFields.includes(clause.field)) {
      fail(
        'invalid_search_field',
        `"${clause.field}" is not a searchable field on "${meta.entity}".`,
        clause.field,
      );
    }
  }
  for (const clause of state.sort) {
    if (!meta.sortFields.includes(clause.field)) {
      fail(
        'invalid_sort_field',
        `"${clause.field}" is not a sortable field on "${meta.entity}".`,
        clause.field,
      );
    }
  }
  for (const relation of state.includes) {
    if (!meta.relations.includes(relation)) {
      fail(
        'invalid_include',
        `"${relation}" is not an includable relation on "${meta.entity}".`,
        relation,
      );
    }
  }
  validatePagination(state.pagination);
}

export function defineEntityQuery<Row, Meta extends EntityQueryMeta<Row>>(
  meta: Meta,
): () => QueryBuilder<Row, Meta> {
  return () => new QueryBuilderImpl<Row, Meta>(meta, DEFAULT_STATE);
}
