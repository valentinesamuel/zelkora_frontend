# `src/lib/query` — type-safe query builder

A generic, entity-agnostic, type-safe query builder that targets the backend's
query-engine wire contract, documented in
`zelkora_backend/docs/query-engine.md`. Nothing in this directory references a
concrete domain entity — no `import` from `src/features/**`, no occurrence of
a feature name like "patient" outside a comment. That's an enforced invariant
(`INV-Q1`), not an accident: every feature brings its own configuration and
gets full type-safety in return.

**This file is a terse API reference only.** For the full walkthrough — the
mental model, traced input→output examples, how to narrow fields for a second
view, how to wire up a brand-new module end to end, and which methods are
load-bearing vs. available-but-unused — see
[`zelkora_frontend/docs/querybuilder.md`](../../../docs/querybuilder.md). Read
that one first if anything below doesn't make sense on its own.

## Core concepts

### `EntityQueryMeta<Row>` — your feature's configuration object

Every feature authors exactly one of these and passes it to
`defineEntityQuery`. It's the single source of truth for what's filterable,
sortable, searchable, includable, and projectable.

```ts
interface EntityQueryMeta<Row> {
  readonly entity: string;                                    // wire entity name, e.g. "Patient"
  readonly fields: Readonly<Record<string, FieldMeta>>;       // filterable columns -> type
  readonly sortFields: readonly string[];                      // whitelisted sort columns
  readonly searchFields: readonly string[];                    // whitelisted search columns
  readonly relations: readonly string[];                       // whitelisted `include=` paths
  readonly projectableFields: readonly (keyof Row & string)[]; // whitelisted `fields[entity]=` columns
}

interface FieldMeta {
  readonly type: ColumnType;
  readonly values?: readonly string[]; // required for 'enum' fields
}
```

`fields` keys can be dotted (`'nextOfKin.relationship'`, `'branch.name'`) for
nested, relation, or JSONB columns. A field can appear in `sortFields` or
`projectableFields` without appearing in `fields` at all — that just means
it's sortable/projectable but not filterable. This is a deliberate per-field
asymmetry the Patients feature already relies on, not an oversight to "fix".

### `ColumnType` → allowed operators

```
bool                      -> eq, ne, isNull, notNull
text / citext / enum      -> eq, ne, like, ilike, in, nin, isNull, notNull
date / timestamptz / uuid -> eq, ne, gt, gte, lt, lte, in, nin, between, isNull, notNull
jsonb                      -> (no operators)
```

This mapping is enforced by TypeScript itself: the builder's generics key a
field's allowed second `.where()` argument off `meta.fields[field].type`.
`.where('isActive', 'gt', ...)` on a `bool` field is a **compile error**, not
a runtime one.

### `defineEntityQuery(meta)` — the entry point

```ts
function defineEntityQuery<Row, Meta extends EntityQueryMeta<Row>>(
  meta: Meta,
): () => QueryBuilder<Row, Meta>;
```

Call this **once**, at module load, and export the returned zero-arg factory
(convention: name it `<entity>Query`, e.g. `patientQuery`). Every call site
then calls that factory to get a fresh builder instance — never share a
factory's *result* across unrelated call sites; call the factory again.

### The builder is immutable

Every chained method (`.where()`, `.sort()`, `.include()`, `.limit()`, …)
returns a **new** builder instance. Nothing mutates in place. This means you
can safely branch a builder — build a "base" query, then call `.sort()` on it
twice to get two different builders without either affecting the other.

### Validation happens in `.build()`, not while chaining

```ts
build(): QueryState; // throws QueryValidationError
```

Chaining `.where()`/`.sort()`/`.offset()` etc. never throws — it just
accumulates state. All validation (field whitelists, value-length limits,
pagination-mode conflicts, arity checks) happens exactly once, inside
`.build()`, which returns a frozen `QueryState` or throws
`QueryValidationError`.

**`QueryValidationError` vs `ApiError` — these are unrelated classes, on
purpose:**

| | `QueryValidationError` (`src/lib/query/errors.ts`) | `ApiError` (`src/lib/apiClient.ts`) |
|---|---|---|
| Thrown by | `.build()` | `apiRequest` (after the network call) |
| Means | "your builder call was wrong" | "the server rejected the request" |
| Timing | Before any network call | After the backend responds (400/404/500/503, …) |
| Carries | `code: QueryValidationCode`, optional `field` | `statusCode`, `apiMessage`, `errors[]`, `requestId` |

Do not add an inheritance relationship between them, and don't have
`apiErrorMessage`-style helpers narrow on both — they represent genuinely
different failure classes.

### Pagination: cursor (default) vs offset

A builder is **cursor mode** until you call `.offset(page, pageSize)`, which
explicitly switches `pagination.mode` to `'offset'`. `.limit(n)` /
`.cursor(c)` set cursor-mode params without changing the mode.

**Mutual exclusivity is enforced in `.build()`:** calling both
`.limit()`/`.cursor()` **and** `.offset()` on the same builder throws
`QueryValidationError` with code `pagination_mode_conflict`. Pick one mode per
builder.

Numeric limits (mirror the backend exactly — see
`zelkora_backend/docs/query-engine.md` §14):

| Constant | Value |
|---|---|
| Cursor `limit` | ≤ 50 |
| Cursor string length | ≤ 1000 chars |
| Offset `pageSize` | 1–50 |
| Offset `page` | ≥ 1 |
| `page × pageSize` | ≤ 10,000 |
| List operator (`in`/`nin`) values | 1–100 items |
| Search term length | ≤ 200 chars |
| Filter value length | ≤ 500 chars |

### `canonicalizeForKey` — why your query keys must use it

```ts
function canonicalizeForKey(state: QueryState): CanonicalQuery; // excludes cursor and withTotal
function canonicalizeQuery(state: QueryState): CanonicalQuery;  // includes them
```

`canonicalizeForKey` deep-sorts filters/searches/includes/select (their order
is semantically irrelevant) but **preserves** `sort` clause order (multi-column
ORDER BY order matters), and **strips `cursor` and `withTotal`** from the
result.

**Every TanStack Query key factory must derive its list/infinite keys from
`canonicalizeForKey`, never by hand.** If `cursor` leaks into a query key, each
page of an infinite scroll gets its own cache entry instead of collapsing onto
one — pagination *appears* to work but silently refetches page 1 forever on
every interaction. This is the single most important rule in this document.

### `serializeQuery` / `toQueryString` — the only wire-format code

```ts
function serializeQuery(state: QueryState, entity: string): URLSearchParams;
function toQueryString(state: QueryState, entity: string): string;
```

These are the **only** functions in the codebase permitted to build a backend
query string, and they build it exclusively via `URLSearchParams` — never
manual concatenation or template-literal assembly. If you find yourself
writing `` `?filter[${field}]...` `` anywhere else, stop — that logic belongs
in, or should call through, `serializer.ts`.

Emission order: `filter[f][op]` → `search[f][mode]` → `sort` → `include` →
`fields[<entity>]` → `limit` → `cursor` → `page` → `pageSize` →
`paginationMode` → `withTotal` → `withDeleted`. Params at their default value
are omitted, **except** `paginationMode`, which is always emitted so a request
is unambiguous.

## API reference

Import everything from the barrel, `@/lib/query` — never reach into
`builder.ts`/`operators.ts`/etc. directly.

**From `types.ts`**
| Export | Purpose |
|---|---|
| `ColumnType` | `'uuid' \| 'text' \| 'citext' \| 'date' \| 'timestamptz' \| 'enum' \| 'bool' \| 'jsonb'` |
| `FieldMeta` | `{ type: ColumnType; values?: readonly string[] }` |
| `EntityQueryMeta<Row>` | Per-feature config object — see above |
| `QueryState` | Frozen output of `.build()`: filters, searches, sort, includes, select, pagination, withTotal, withDeleted |
| `ApiEnvelope<T>` | `{ statusCode, success, message, result: T, path, duration, requestId }` |
| `CursorResult<T>` | `{ mode: 'cursor'; data; nextCursor: string \| null; total?: number }` |
| `OffsetResult<T>` | `{ mode: 'offset'; data; page; pageSize; total }` |
| `PaginatedResult<T>` | `CursorResult<T> \| OffsetResult<T>` |
| `isCursorResult(result)` / `isOffsetResult(result)` | Type guards on `PaginatedResult` |

**From `operators.ts`**
| Export | Purpose |
|---|---|
| `FILTER_OPERATORS` / `FilterOperator` | The 13 backend operators: `eq ne gt gte lt lte in nin between like ilike isNull notNull` |
| `SEARCH_MODES` / `SearchMode` | `'ilike' \| 'fts' \| 'tri'` — `fts`/`tri` may silently degrade to `ilike` server-side; never branch on a mode being honoured (`INV-B7`) |
| `PAGINATION_MODES` / `PaginationMode` | `'cursor' \| 'offset'` |

**From `builder.ts`** (re-exported via the barrel)
| Export | Purpose |
|---|---|
| `defineEntityQuery(meta)` | Entry point — see above |
| `QueryBuilder<Row, Meta, Selected>` | The chainable interface (below) |

Chainable methods (every one returns a new `QueryBuilder`):

```ts
.where(field, op, ...args)              // scalar/unary filter; args is [] for isNull/notNull
.whereIn(field, 'in' | 'nin', values[]) // list filter, 1-100 items
.whereBetween(field, [a, b])            // pair filter; only date/timestamptz/uuid fields
.search(field, mode, term)              // field must be in meta.searchFields
.sort(field, direction?)                // field must be in meta.sortFields; direction defaults 'asc'
.include(relation)                      // relation must be in meta.relations
.select(...fields)                      // widens the Selected type param; fields must be in meta.projectableFields
.limit(value)                           // cursor mode
.cursor(value)                          // cursor mode
.offset(page, pageSize)                 // switches pagination.mode to 'offset'
.withTotal(value? = true)
.withDeleted(value? = true)
.build()                                // validates, freezes, returns QueryState; throws QueryValidationError
```

**From `serializer.ts`**
| Export | Purpose |
|---|---|
| `serializeQuery(state, entity)` | `QueryState` → `URLSearchParams` |
| `toQueryString(state, entity)` | `QueryState` → query string (what a repository calls) |

**From `canonicalize.ts`**
| Export | Purpose |
|---|---|
| `canonicalizeQuery(state)` | Deep-sorted representation, includes cursor + withTotal |
| `canonicalizeForKey(state)` | Same, but excludes cursor + withTotal — use this for query keys |

**From `errors.ts`**
| Export | Purpose |
|---|---|
| `QueryValidationError` | Client-side pre-flight validation error; `.code: QueryValidationCode`, optional `.field` |
| `QueryValidationCode` | `'limit_out_of_range' \| 'page_out_of_range' \| 'page_size_out_of_range' \| 'page_size_product_exceeded' \| 'between_arity' \| 'list_arity' \| 'cursor_too_long' \| 'search_term_too_long' \| 'filter_value_too_long' \| 'pagination_mode_conflict' \| 'invalid_sort_field' \| 'invalid_include' \| 'invalid_search_field' \| 'invalid_filter_field' \| 'invalid_filter_operator'` |

## Full walkthrough

For the worked "building a new feature" example (Appointments), traced
input/output examples, and the common-pitfalls list, see
[`docs/querybuilder.md`](../../../docs/querybuilder.md) — this file stays
API-reference-only so there's a single source of truth for the walkthrough
content instead of two copies drifting apart.
