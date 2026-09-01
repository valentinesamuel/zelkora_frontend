export type QueryValidationCode =
  | 'limit_out_of_range'
  | 'page_out_of_range'
  | 'page_size_out_of_range'
  | 'page_size_product_exceeded'
  | 'between_arity'
  | 'list_arity'
  | 'cursor_too_long'
  | 'search_term_too_long'
  | 'filter_value_too_long'
  | 'pagination_mode_conflict'
  | 'invalid_sort_field'
  | 'invalid_include'
  | 'invalid_search_field'
  | 'invalid_filter_field'
  | 'invalid_filter_operator';

export class QueryValidationError extends Error {
  readonly code: QueryValidationCode;
  readonly field?: string;

  constructor(code: QueryValidationCode, message: string, field?: string) {
    super(message);
    this.name = 'QueryValidationError';
    this.code = code;
    this.field = field;
  }
}
