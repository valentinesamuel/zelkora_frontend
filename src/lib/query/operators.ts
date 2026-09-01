import type { ColumnType } from './types';

export const OP_EQ = 'eq';
export const OP_NE = 'ne';
export const OP_GT = 'gt';
export const OP_GTE = 'gte';
export const OP_LT = 'lt';
export const OP_LTE = 'lte';
export const OP_IN = 'in';
export const OP_NIN = 'nin';
export const OP_BETWEEN = 'between';
export const OP_LIKE = 'like';
export const OP_ILIKE = 'ilike';
export const OP_IS_NULL = 'isNull';
export const OP_NOT_NULL = 'notNull';

export const FILTER_OPERATORS = [
  OP_EQ,
  OP_NE,
  OP_GT,
  OP_GTE,
  OP_LT,
  OP_LTE,
  OP_IN,
  OP_NIN,
  OP_BETWEEN,
  OP_LIKE,
  OP_ILIKE,
  OP_IS_NULL,
  OP_NOT_NULL,
] as const;

export type FilterOperator = (typeof FILTER_OPERATORS)[number];

export type OperatorArity = 'unary' | 'scalar' | 'list' | 'pair';

const BOOL_OPERATORS = [OP_EQ, OP_NE, OP_IS_NULL, OP_NOT_NULL] as const;

const TEXT_OPERATORS = [
  OP_EQ,
  OP_NE,
  OP_LIKE,
  OP_ILIKE,
  OP_IN,
  OP_NIN,
  OP_IS_NULL,
  OP_NOT_NULL,
] as const;

const ORDERABLE_OPERATORS = [
  OP_EQ,
  OP_NE,
  OP_GT,
  OP_GTE,
  OP_LT,
  OP_LTE,
  OP_IN,
  OP_NIN,
  OP_BETWEEN,
  OP_IS_NULL,
  OP_NOT_NULL,
] as const;

const NO_OPERATORS = [] as const;

const OPERATORS_FOR_TYPE_MAP = {
  bool: BOOL_OPERATORS,
  text: TEXT_OPERATORS,
  citext: TEXT_OPERATORS,
  enum: TEXT_OPERATORS,
  date: ORDERABLE_OPERATORS,
  timestamptz: ORDERABLE_OPERATORS,
  uuid: ORDERABLE_OPERATORS,
  jsonb: NO_OPERATORS,
} satisfies Record<ColumnType, readonly FilterOperator[]>;

export const OPERATORS_FOR_TYPE: Record<ColumnType, readonly FilterOperator[]> =
  OPERATORS_FOR_TYPE_MAP;

export type OperatorsForTypeMap = typeof OPERATORS_FOR_TYPE_MAP;

const OPERATOR_ARITY_MAP = {
  [OP_EQ]: 'scalar',
  [OP_NE]: 'scalar',
  [OP_GT]: 'scalar',
  [OP_GTE]: 'scalar',
  [OP_LT]: 'scalar',
  [OP_LTE]: 'scalar',
  [OP_LIKE]: 'scalar',
  [OP_ILIKE]: 'scalar',
  [OP_IN]: 'list',
  [OP_NIN]: 'list',
  [OP_BETWEEN]: 'pair',
  [OP_IS_NULL]: 'unary',
  [OP_NOT_NULL]: 'unary',
} satisfies Record<FilterOperator, OperatorArity>;

export const OPERATOR_ARITY: Record<FilterOperator, OperatorArity> =
  OPERATOR_ARITY_MAP;

export type OperatorArityMap = typeof OPERATOR_ARITY_MAP;

export type UnaryOperator = typeof OP_IS_NULL | typeof OP_NOT_NULL;
export type ListOperator = typeof OP_IN | typeof OP_NIN;
export type PairOperator = typeof OP_BETWEEN;
export type ScalarOperator = Exclude<
  FilterOperator,
  UnaryOperator | ListOperator | PairOperator
>;
export type UnaryOrScalarOperator = UnaryOperator | ScalarOperator;

export const SEARCH_MODE_ILIKE = 'ilike';
export const SEARCH_MODE_FTS = 'fts';
export const SEARCH_MODE_TRIGRAM = 'tri';

export const SEARCH_MODES = [
  SEARCH_MODE_ILIKE,
  SEARCH_MODE_FTS,
  SEARCH_MODE_TRIGRAM,
] as const;

export type SearchMode = (typeof SEARCH_MODES)[number];

export const PAGINATION_MODE_CURSOR = 'cursor';
export const PAGINATION_MODE_OFFSET = 'offset';

export const PAGINATION_MODES = [
  PAGINATION_MODE_CURSOR,
  PAGINATION_MODE_OFFSET,
] as const;

export type PaginationMode = (typeof PAGINATION_MODES)[number];
