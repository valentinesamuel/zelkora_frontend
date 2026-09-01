import type { FilterOperator, PaginationMode, SearchMode } from './operators';

export type ColumnType =
  | 'uuid'
  | 'text'
  | 'citext'
  | 'date'
  | 'timestamptz'
  | 'enum'
  | 'bool'
  | 'jsonb';

export interface FieldMeta {
  readonly type: ColumnType;
  readonly values?: readonly string[];
}

export interface EntityQueryMeta<Row> {
  readonly entity: string;
  readonly fields: Readonly<Record<string, FieldMeta>>;
  readonly sortFields: readonly string[];
  readonly searchFields: readonly string[];
  readonly relations: readonly string[];
  readonly projectableFields: readonly (keyof Row & string)[];
}

export type FilterScalarValue = string | boolean;

export type FilterValue =
  undefined | FilterScalarValue | readonly string[] | readonly [string, string];

export interface FilterClause {
  readonly field: string;
  readonly op: FilterOperator;
  readonly value: FilterValue;
}

export interface SearchClause {
  readonly field: string;
  readonly mode: SearchMode;
  readonly term: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortClause {
  readonly field: string;
  readonly direction: SortDirection;
}

export interface PaginationState {
  readonly mode: PaginationMode;
  readonly limit?: number;
  readonly cursor?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface QueryState {
  readonly filters: readonly FilterClause[];
  readonly searches: readonly SearchClause[];
  readonly sort: readonly SortClause[];
  readonly includes: readonly string[];
  readonly select: readonly string[];
  readonly pagination: PaginationState;
  readonly withTotal: boolean;
  readonly withDeleted: boolean;
}

export interface ApiEnvelope<T> {
  readonly statusCode: number;
  readonly success: boolean;
  readonly message: string;
  readonly result: T;
  readonly path: string;
  readonly duration: number;
  readonly requestId: string;
}

export interface CursorResult<T> {
  readonly mode: 'cursor';
  readonly data: readonly T[];
  readonly nextCursor: string | null;
  readonly total?: number;
}

export interface OffsetResult<T> {
  readonly mode: 'offset';
  readonly data: readonly T[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
}

export type PaginatedResult<T> = CursorResult<T> | OffsetResult<T>;

export function isCursorResult<T>(
  result: PaginatedResult<T>,
): result is CursorResult<T> {
  return result.mode === 'cursor';
}

export function isOffsetResult<T>(
  result: PaginatedResult<T>,
): result is OffsetResult<T> {
  return result.mode === 'offset';
}
