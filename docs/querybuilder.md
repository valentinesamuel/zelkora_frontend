# The frontend query builder — a guide you can actually follow

This is the companion doc to [`src/lib/query/README.md`](../src/lib/query/README.md)
(the terse API reference) — the same relationship
`zelkora_backend/docs/querygen.md` has to `docs/query-engine.md`. Read this
one first, end to end, if you've never touched `src/lib/query/` before or if
the short reference isn't clicking. It explains *why* the code is shaped the
way it is, with real input and real output for every concept — nothing here
is hand-waved.

Every example below is **traced by hand against the real source** — the code
snippets are copy-paste real, and the `QueryState` objects / query strings
next to them are what that exact code actually produces, verified line-by-line
against `builder.ts`, `serializer.ts`, and `canonicalize.ts`.

---

## 1. The 30-second mental model

Think of the query builder like ordering food at a restaurant with a very
strict waiter.

- The **restaurant's menu** is `EntityQueryMeta` — it lists exactly what you're
  allowed to filter by, sort by, search, include, or ask for (project). One
  menu per "restaurant" (per entity — Patient, Appointment, whatever).
- **Opening the restaurant** is `defineEntityQuery(menu)` — you do this once,
  and it hands you a little machine (`patientQuery`, by convention) that
  prints you a brand-new, empty order pad every time you call it.
- **Filling out the order pad** is chaining methods: `.where(...)`,
  `.sort(...)`, `.select(...)`, and so on. Each one hands you back a **new**
  pad with one more line item on it — the old pad is untouched. You can scribble
  on it as much as you want; the kitchen never sees any of it yet.
- **Handing the pad to the kitchen** is `.build()`. This is the only moment
  anything gets checked. If you ordered something not on the menu (e.g. sorted
  by a field the entity doesn't allow sorting on), the strict waiter refuses
  the whole order right here — before it ever reaches the kitchen (the
  network). If it's all good, you get back a `QueryState`: the final, frozen
  order ticket.
- Somewhere else, a little clerk (`serializer.ts`) takes that ticket and
  writes it out in the *exact* format the kitchen (the Go backend) expects —
  a URL query string.

That's the whole system. Everything below is filling in the details of each
of those five bullets, with real examples.

---

## 2. The four things every feature authors

Every feature that wants to list/filter/sort a backend entity writes exactly
these four things, always in this order. The Patients feature
(`src/features/patients/**`) already does this for real — we'll use it as the
running example throughout, no hypotheticals, since it's live in production
today.

| # | What | Where (Patients' real file) | Purpose |
|---|---|---|---|
| 1 | A row type | `src/features/patients/types/patient.types.ts` — `interface Patient` | What one record looks like on the client |
| 2 | `EntityQueryMeta<Row>` | `src/features/patients/api/patient.queryMeta.ts` — `patientQueryMeta` | The "menu": what's filterable/sortable/searchable/includable/projectable |
| 3 | `defineEntityQuery(meta)` call | Same file — `patientQuery` | The "open the restaurant" step — a zero-arg factory for fresh builders |
| 4 | Everything downstream | `patientsRepository.ts`, `patients.keys.ts`, `patients.api.ts` | Turns a built `QueryState` into an actual HTTP call, a React Query cache key, and a typed hook |

The real `patientQueryMeta` (trimmed — see the full file for every field):

```ts
// src/features/patients/api/patient.queryMeta.ts
export const patientQueryMeta = {
  entity: 'Patient',   // exact wire name — capital P, verified against the Go backend
  fields: {
    id: { type: 'uuid' },
    firstName: { type: 'text' },
    lastName: { type: 'text' },
    isActive: { type: 'bool' },
    dateOfBirth: { type: 'date' },
    createdAt: { type: 'timestamptz' },
    gender: { type: 'enum', values: PATIENT_SEX_VALUES },
    // ...every other filterable column
  },
  sortFields: ['firstName', 'lastName', 'middleName', 'createdAt', 'dateOfBirth', 'id'],
  searchFields: ['firstName', 'lastName'],
  relations: ['branch', 'lga', 'lga.state'],
  projectableFields: ['id', 'zrn', 'firstName', /* ...every root column */],
} as const satisfies EntityQueryMeta<Patient>;

export const patientQuery = defineEntityQuery<Patient, typeof patientQueryMeta>(
  patientQueryMeta,
);
```

Four different whitelists, four different jobs:

| Whitelist | Controls | Example |
|---|---|---|
| `fields` | What `.where()` / `.whereIn()` / `.whereBetween()` can filter on | `.where('isActive', 'eq', true)` — legal only because `isActive` is a key of `fields` |
| `sortFields` | What `.sort()` can sort by | `.sort('firstName')` — legal only because `'firstName'` is in the array |
| `searchFields` | What `.search()` can search | `.search('firstName', 'ilike', 'ade')` |
| `relations` | What `.include()` can include | `.include('branch')` |
| `projectableFields` | What `.select()` can narrow the response to | `.select('id', 'firstName')` |

**A field can be in one list and not another** — that's intentional, not a
bug to "fix." `middleName` is sortable but not filterable in `fields` (nobody
filters patients by middle name, but sorting by it as a tiebreaker makes
sense). `updatedAt` is projectable but not filterable. Each whitelist answers
a different question, so they don't have to agree.

---

## 3. Traced examples — real code, real output

Every example below starts from `patientQuery()` — a brand-new order pad —
and shows exactly what `.build()` and the serializer produce. Read
`filter%5BisActive%5D...` as "the human-readable form `filter[isActive]...`,
after `URLSearchParams` percent-encodes the brackets" — both forms are shown
so you can recognize the string either way (in a debugger vs. in devtools'
Network tab).

### Example A — one filter, a limit

```ts
const builder = patientQuery().where('isActive', 'eq', true).limit(10);
const state = builder.build();
```

`state` (the `QueryState` — this is a real object, not paraphrased):

```json
{
  "filters": [{ "field": "isActive", "op": "eq", "value": true }],
  "searches": [],
  "sort": [],
  "includes": [],
  "select": [],
  "pagination": { "mode": "cursor", "limit": 10 },
  "withTotal": false,
  "withDeleted": false
}
```

`toQueryString(state, 'Patient')` — human-readable:
```
filter[isActive][eq]=true&limit=10&paginationMode=cursor
```
— and that's literally what `URLSearchParams#toString()` returns, except the
brackets are percent-encoded (this is what you'll actually see on the wire /
in devtools):
```
filter%5BisActive%5D%5Beq%5D=true&limit=10&paginationMode=cursor
```

Notice `paginationMode=cursor` is present even though cursor is the default —
that's the one deliberate exception to "omit defaults" (see
`serializer.ts`'s header comment): the backend should never have to *guess*
which pagination contract a request means.

### Example B — search + sort + `.select()`

```ts
const builder = patientQuery()
  .search('firstName', 'ilike', 'ade')
  .sort('createdAt', 'desc')
  .select('id', 'firstName', 'lastName')
  .limit(25);
const state = builder.build();
```

`state`:
```json
{
  "filters": [],
  "searches": [{ "field": "firstName", "mode": "ilike", "term": "ade" }],
  "sort": [{ "field": "createdAt", "direction": "desc" }],
  "includes": [],
  "select": ["id", "firstName", "lastName"],
  "pagination": { "mode": "cursor", "limit": 25 },
  "withTotal": false,
  "withDeleted": false
}
```

Query string:
```
search[firstName][ilike]=ade&sort=-createdAt&fields[Patient]=id,firstName,lastName&limit=25&paginationMode=cursor
```

Three things to notice:
- A descending sort is a `-` prefix on the field name (`-createdAt`), not a
  separate direction parameter.
- `.select(...)` becomes `fields[Patient]=...` — **`Patient`, not
  `patient`** — because that's `patientQueryMeta.entity`, verbatim, and that
  string must match whatever the Go backend registered as the entity's wire
  name exactly (case included). Get this wrong and projection either silently
  no-ops or the backend 400s.
- `fields[Patient]=id,firstName,lastName` is exactly the mechanism [the patient
  list table wiring](#4-replicating-the-pattern--narrowing-fields-for-a-second-view-of-the-same-entity)
  uses to fetch only the columns it renders.

### Example C — cursor pagination, page 2

```ts
const state = patientQuery()
  .sort('firstName', 'asc')
  .limit(10)
  .cursor('eyJpZCI6IjEyMyJ9')
  .build();
```

Query string:
```
sort=firstName&limit=10&cursor=eyJpZCI6IjEyMyJ9&paginationMode=cursor
```

An ascending sort has no prefix (compare to `-createdAt` above). The `cursor`
value is an opaque, backend-issued token — the frontend never constructs or
inspects it, only echoes back whatever `nextCursor` the previous page
returned.

### Example D — why `canonicalizeForKey` matters (the one rule that matters most)

```ts
const pageOne = patientQuery().sort('firstName', 'asc').limit(10).cursor('AAA').build();
const pageTwo = patientQuery().sort('firstName', 'asc').limit(10).cursor('BBB').build();
```

These are the same *logical* query — same filters, same sort, same limit —
just two different pages of it. If a TanStack Query cache key were built from
the raw `QueryState`, `pageOne` and `pageTwo` would get **different** cache
keys (because `cursor` differs), and `useInfiniteQuery` would think every page
is a brand-new query — pagination would appear to work in the UI but silently
refetch page 1 forever underneath.

`canonicalizeForKey` fixes this by stripping `cursor` (and `withTotal`, which
also doesn't change the *data set*, just whether a `total` count comes back):

```ts
canonicalizeForKey(pageOne)
// { filters: [], searches: [], sort: [{ field: 'firstName', direction: 'asc' }],
//   includes: [], select: [], pagination: { mode: 'cursor', limit: 10 },
//   withTotal: false, withDeleted: false }

canonicalizeForKey(pageTwo)
// — identical object to the above. `cursor: 'AAA'` vs `cursor: 'BBB'` never appears.
```

Both calls produce the exact same object, so both pages collapse onto the
same TanStack Query cache entry — which is the whole point. This is why
`patients.keys.ts`'s `list()`/`infinite()` functions call
`canonicalizeForKey(state)` and nothing else should ever build a query key by
hand.

### Example E — a range filter (`.whereBetween()`)

```ts
const state = patientQuery()
  .whereBetween('createdAt', ['2026-01-01', '2026-06-30'])
  .build();
```

Query string:
```
filter[createdAt][between]=2026-01-01,2026-06-30&paginationMode=cursor
```

The two bound values are joined with a comma — this is how every "list"-shaped
filter value serializes (`.whereIn()` does the same thing with `in`/`nin`).

### Example F — chaining never throws; `.build()` always validates

```ts
patientQuery().limit(999); // no error — this line just returns a new builder
patientQuery().limit(999).build(); // THROWS
```

The thrown error, exactly:
```
QueryValidationError {
  code: 'limit_out_of_range',
  message: '"limit" must be <= 50.',
  field: undefined,
}
```

This is deliberate: you can build up a query across several function calls,
branches, and conditionals (see `toPatientQuery.ts` for a real example that
does exactly this) without worrying about *when* a mistake gets caught — it's
always exactly once, at `.build()`, never earlier and never later. `.build()`
also **freezes** the returned `QueryState` (`Object.freeze`) so nothing can
mutate it after the fact.

---

## 4. Replicating the pattern — narrowing fields for a second view of the same entity

This is the concrete question that started this doc: *"I have another patient
list to render with another set of fields — how do I do that?"*

The patient list table already does this. `src/features/patients/components/patientColumns.tsx`
declares the exact columns it renders:

```ts
export const PATIENT_LIST_FIELDS = [
  'id', 'zrn', 'firstName', 'middleName', 'lastName',
  'dateOfBirth', 'gender', 'phoneNumber', 'isActive',
] as const;

export type PatientListRow = Pick<Patient, (typeof PATIENT_LIST_FIELDS)[number]>;
```

...and `toPatientQuery.ts` passes that exact list into `.select()`:

```ts
return builder.limit(ui.limit).select(...PATIENT_LIST_FIELDS);
```

**To build a second view with a different field subset**, the pattern is
identical — you don't touch the query-builder library at all, you just:

1. **Declare the fields that view needs**, colocated with wherever renders
   them (the same way `PATIENT_LIST_FIELDS` lives next to `patientColumns.tsx`,
   not off in some shared constants file — the renderer owns the list of what
   it needs).

   ```ts
   // e.g. src/features/patients/components/patientComboboxOptions.ts
   export const PATIENT_PICKER_FIELDS = ['id', 'firstName', 'lastName', 'zrn'] as const;
   export type PatientPickerRow = Pick<Patient, (typeof PATIENT_PICKER_FIELDS)[number]>;
   ```

2. **Call `.select(...)` with that list** wherever *that view's* query gets
   built (its own `toXQuery`-style function, or inline if it's simple):

   ```ts
   const pickerQuery = patientQuery()
     .search('firstName', 'ilike', term)
     .select(...PATIENT_PICKER_FIELDS);
   ```

3. **Hand it to `usePatients`/`usePatientsInfinite`** — nothing else changes.
   Both hooks are generic over the builder's `Selected` type parameter
   (`src/features/patients/api/patients.api.ts`), so TypeScript *automatically*
   narrows the result:

   ```ts
   // query : PatientQueryBuilder<'id' | 'firstName' | 'lastName' | 'zrn'>
   // usePatients(query) returns PaginatedResult<Pick<Patient, 'id'|'firstName'|'lastName'|'zrn'>>
   // — NOT PaginatedResult<Patient>. Try to read `.email` off a returned row
   // and it's a compile error, not a runtime `undefined`.
   const { data } = usePatients(pickerQuery);
   ```

   If you never call `.select()` at all (like `usePatient(id)` for the
   edit/detail pages, which genuinely need every field), the `Selected` type
   parameter defaults to `never` and you get the full `Patient` back, exactly
   as before — narrowing is opt-in per call site, not a breaking change to
   anything that doesn't ask for it.

That's it — two views of the same entity, two different field subsets, zero
duplication of the query-builder machinery itself. The mechanism is entirely
generic; only the field list and the component change per view.

---

## 5. Replicating the pattern — a brand-new module (Appointments)

> **Appointments doesn't exist as a backend module yet** — no
> `internal/appointment`, no `appointmentcols`, no `/appointments` route in
> `zelkora_backend` today (it's Phase 4 on the roadmap, per `CLAUDE.md`).
> Everything in this section is **illustrative** — a worked example of the
> exact pattern Patients already uses live, with names swapped. Treat every
> snippet as "this is the shape you'd write," not something you can run today.

The `src/lib/query/` code itself never has to change for a new module — it's
entity-agnostic by design (nothing in that directory imports from
`src/features/**`, or even knows the word "patient" exists). Adding
Appointments means writing the same four-things-per-feature list from §2,
plus the standard React plumbing around it. Each step below explains *why*
that file exists before showing its code.

### a. Confirm the backend contract first

*Why:* the query builder's whitelists have to match the backend's whitelists
exactly, or requests either get rejected or silently ignored. There is no
codegen bridge from Go to TypeScript for this today — it's hand-kept in sync,
so get the source of truth right before writing a line of TS.

Find the entity's real config in the Go source — typically
`internal/<module>/<module>cols/metadata.go` and `queryconfig.go` — and note
the *exact* wire entity name. Patients' is `"Patient"` — capitalized, not
`"patient"` — and getting this wrong is the single easiest mistake to make
(see Example B above).

### b. Define the row type + enum value tuples

*Why:* the row type is what every hook, component, and the query meta's
`projectableFields` all key off of — get this right once, first.

```ts
// src/features/appointments/types/appointment.types.ts
export interface Appointment {
  readonly id: string;
  readonly patientId: string;
  readonly status: AppointmentStatus;
  readonly scheduledAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'noShow';

export const APPOINTMENT_STATUS_VALUES =
  ['scheduled', 'completed', 'cancelled', 'noShow'] as const satisfies readonly AppointmentStatus[];
```

Declare an enum-like value set exactly **once**, here — never re-declared
inside the query-meta file (see the pitfall at the bottom of this doc).

### c. Author the query metadata — the "menu"

*Why:* this is the single file that decides what's legal to filter/sort/
search/include/project for this entity. Everything downstream trusts it.

```ts
// src/features/appointments/api/appointment.queryMeta.ts
import type { EntityQueryMeta } from '@/lib/query';
import { defineEntityQuery } from '@/lib/query';
import type { Appointment } from '@/features/appointments/types/appointment.types';
import { APPOINTMENT_STATUS_VALUES } from '@/features/appointments/types/appointment.types';

export const appointmentQueryMeta = {
  entity: 'Appointment', // verify against the Go entity constant — don't guess
  fields: {
    id: { type: 'uuid' },
    patientId: { type: 'uuid' },
    status: { type: 'enum', values: APPOINTMENT_STATUS_VALUES },
    scheduledAt: { type: 'timestamptz' },
    createdAt: { type: 'timestamptz' },
  },
  sortFields: ['scheduledAt', 'createdAt', 'id'],
  searchFields: [],
  relations: ['patient'],
  projectableFields: ['id', 'patientId', 'status', 'scheduledAt', 'createdAt', 'updatedAt'],
} as const satisfies EntityQueryMeta<Appointment>;

export const appointmentQuery = defineEntityQuery<Appointment, typeof appointmentQueryMeta>(
  appointmentQueryMeta,
);
```

`as const satisfies EntityQueryMeta<Appointment>` — copy this exact pattern.
`as const` keeps every array a literal tuple (the builder's generics need the
literal types, not widened `string[]`, to know which values are legal).
`satisfies` checks the shape without widening those literals away — a plain
`: EntityQueryMeta<Appointment>` annotation would defeat the whole point.

### d. Add a compile-only type-test

*Why:* the builder's whole value proposition is that illegal calls fail to
*compile* — that guarantee needs its own test, one that never runs at
runtime.

`src/features/appointments/api/appointment.queryMeta.type-test.ts`, modeled on
`patient.queryMeta.type-test.ts`: a handful of `@ts-expect-error` assertions
proving illegal calls genuinely don't compile — filtering on a field not in
`fields`, sorting on a field not in `sortFields`, `.whereBetween()` on a
non-orderable field. Run via `npm run test:types` (a separate suite from the
normal `npm test` — see `vitest.config.ts`'s `typecheck` block).

### e. Write the repository — turns a `QueryState` into an HTTP call

*Why:* this is the only layer that knows about `fetch`/`apiRequest` and the
raw wire response shape. Everything above it only ever deals with
`QueryState` and `PaginatedResult<T>`.

```ts
// src/features/appointments/api/appointmentsRepository.ts
import { apiRequest } from '@/lib/apiClient';
import { toQueryString } from '@/lib/query';
import type { PaginatedResult, PaginationMode, QueryState } from '@/lib/query';
import { appointmentQueryMeta } from './appointment.queryMeta';
import type { Appointment } from '@/features/appointments/types/appointment.types';

interface RawCursorPage<T> { readonly data: readonly T[]; readonly nextCursor?: string | null; readonly total?: number; }
interface RawOffsetPage<T> { readonly data: readonly T[]; readonly page: number; readonly pageSize: number; readonly total: number; }
type RawQueryPage<T> = RawCursorPage<T> | RawOffsetPage<T>;

function toPaginatedResult<T>(mode: PaginationMode, raw: RawQueryPage<T>): PaginatedResult<T> {
  // Discriminate by the REQUEST's pagination.mode, never by sniffing the
  // response shape — the mode is always known before the request is sent.
  if (mode === 'cursor') {
    const page = raw as RawCursorPage<T>;
    return { mode: 'cursor', data: page.data, nextCursor: page.nextCursor ?? null, total: page.total };
  }
  const page = raw as RawOffsetPage<T>;
  return { mode: 'offset', data: page.data, page: page.page, pageSize: page.pageSize, total: page.total };
}

function buildListPath(state: QueryState): string {
  const qs = toQueryString(state, appointmentQueryMeta.entity);
  return qs.length > 0 ? `/appointments?${qs}` : '/appointments';
}

async function list<T = Appointment>(state: QueryState): Promise<PaginatedResult<T>> {
  const raw = await apiRequest<RawQueryPage<T>>(buildListPath(state));
  return toPaginatedResult<T>(state.pagination.mode, raw);
}

function get(id: string): Promise<Appointment> {
  return apiRequest<Appointment>(`/appointments/${id}`);
}

export const appointmentsRepository = { list, get };
```

Keep it a plain object of functions, no class/interface indirection —
`.build()` already did the validation; this layer's only job is
"serialize the state, normalize the response."

### f. Add the key factory — required or pagination silently breaks

*Why:* this is Example D above, made concrete for a new entity. Skipping
`canonicalizeForKey` here is the single most common way to reintroduce the
"pagination looks fine but silently refetches page 1" bug.

```ts
// src/features/appointments/api/appointments.keys.ts
import { canonicalizeForKey } from '@/lib/query';
import type { QueryState } from '@/lib/query';

const all = ['appointments'] as const;
function lists() { return [...all, 'list'] as const; }
function list(state: QueryState) { return [...lists(), canonicalizeForKey(state)] as const; }
function infinite(state: QueryState) { return [...lists(), 'infinite', canonicalizeForKey(state)] as const; }
function details() { return [...all, 'detail'] as const; }
function detail(id: string) { return [...details(), id] as const; }

export const appointmentQueryKeys = { all, lists, list, infinite, details, detail };
```

### g. Add the API/hooks module

*Why:* this is the one layer feature components actually import from — it's
where the builder's generic `Selected` type parameter gets threaded through
so `.select()` (§4) works end to end for this entity too.

```ts
// src/features/appointments/api/appointments.api.ts
export type AppointmentQueryBuilder<
  Selected extends keyof Appointment & string = never,
> = QueryBuilder<Appointment, typeof appointmentQueryMeta, Selected>;

type AppointmentRow<Selected extends keyof Appointment & string> =
  [Selected] extends [never] ? Appointment : Pick<Appointment, Selected>;

function listAppointments<Selected extends keyof Appointment & string = never>(
  state: QueryState,
): Promise<PaginatedResult<AppointmentRow<Selected>>> {
  return appointmentsRepository.list<AppointmentRow<Selected>>(state);
}

export const appointmentsApi = {
  list: listAppointments,
  get: (id: string) => appointmentsRepository.get(id),
};

export function useAppointments<Selected extends keyof Appointment & string = never>(
  query: AppointmentQueryBuilder<Selected>,
) {
  const state = query.build();
  return useQuery<PaginatedResult<AppointmentRow<Selected>>>({
    queryKey: appointmentQueryKeys.list(state),
    queryFn: () => appointmentsApi.list<Selected>(state),
    placeholderData: keepPreviousData,
  });
}

// useAppointmentsInfinite: same shape as usePatientsInfinite (§4's usePatients
// example) — re-apply .cursor(pageParam) onto the SAME base builder per page,
// request withTotal(true) only on the first page.

export function useAppointment(id: string) {
  return useQuery<Appointment>({
    queryKey: appointmentQueryKeys.detail(id),
    queryFn: () => appointmentsApi.get(id),
    enabled: id.length > 0,
  });
}
```

Before adding any canned-query helper (e.g. a hypothetical
`scheduledAppointmentsQuery()` pre-filtered to `status = 'scheduled'`), check
whether the backend handler force-overwrites that field server-side from the
JWT/session — Patients deliberately has **no** `patientsByBranchQuery` helper
because `branchId` is silently discarded and replaced server-side; a helper
for a field like that would compile, serialize, and do nothing.

### h. UI filter state, translation seam, URL serde, hook, components

*Why:* everything past this point is standard React, not query-builder
specific — it's the same shape for any list feature.

- **UI filter state** (`appointmentListQuery.types.ts`) — deliberately
  decoupled from the wire `Appointment` type. Patients' cautionary tale:
  `PatientStatus` (display union, keeps `'deceased'`) and
  `PatientStatusFilter` (filter union, doesn't) are two different types with
  near-identical names — don't "harmonize" them if your feature ends up with a
  similar split.
- **The translation seam** (`toAppointmentQuery.ts`) — the *only* place UI
  state becomes a query builder. Pure function, `now: Date` injected (never
  `new Date()` inline) so it's deterministically testable, no `.cursor(...)`
  call (the infinite-query hook owns pagination position and re-applies it
  per page).
- **Pure URL serde** (`appointmentListParams.ts`) — parsing must *heal*
  invalid input silently (an out-of-range `?limit=` falls back to the
  default) rather than throw; serializing omits fields already at their
  default.
- **The React hook** (`useAppointmentListParams.ts`) — the only module that
  touches `useSearchParams` directly.
- **Components** — a filters component, a table/list, a "load more" control
  (forward-only cursor pagination — no numbered pages), and a page component
  wiring `useAppointmentListParams()` → `toAppointmentQuery(query, new Date())`
  → `useAppointmentsInfinite(builder)`.

### i. Verification checklist

- [ ] `npx tsc -b` clean, 0 errors
- [ ] Unit tests for `appointment.queryMeta`, `appointmentsRepository`,
      `appointmentListParams`, `toAppointmentQuery`
- [ ] Type-test suite passes (`npm run test:types`) — the `@ts-expect-error`
      cases genuinely fire
- [ ] Grep sweep: no hand-rolled query string outside `serializer.ts`
- [ ] `appointmentQueryKeys.list`/`.infinite` derive from
      `canonicalizeForKey`, and the resulting key excludes `cursor`/`withTotal`
- [ ] `npx eslint .` clean on new files

---

## 6. What's actually load-bearing vs. available-but-unused

This is the answer to *"some of this looks duplicated and not needed with 0
callers."* Checked by grepping the real codebase (not guessed) for every
production call site of every builder method, as of this doc's writing:

| Method / capability | Used in production today? | What that means |
|---|---|---|
| `.where()`, `.search()`, `.sort()`, `.limit()`, `.cursor()`, `.select()`, `.withTotal()` | **Yes** — Patients list | Load-bearing. Don't touch without checking every call site. |
| `.whereBetween()` | **Yes** — Patients (age range, registered-date range filters) | Load-bearing. |
| `.whereIn()` | No — exercised only by the query-builder library's own unit tests | Not dead — it's a generic library capability nothing has needed *yet*. A future "status is one of [x, y]" filter would use it exactly as written, no changes needed to the builder. |
| `.include()` | No — same | Patients' meta already lists `relations: ['branch', 'lga', 'lga.state']`, but no UI calls `.include()` yet. Ready when a feature needs it. |
| `.offset()` / offset pagination mode | No — Patients is cursor-only | Same category. A future feature that genuinely needs numbered pages (rather than "load more") would switch a builder to offset mode via this method — the validation, serialization, and canonicalization all already handle it correctly (see `builder.test.ts`/`serializer.test.ts`/`canonicalize.test.ts`). |
| `.withDeleted()` | No — same | Same category. |
| `searchPatientsQuery()` (used to live in `patients.api.ts`) | **No, and not "future capability" either — genuinely dead** | **Removed.** Zero callers anywhere, not even in a test. This is the one real case of "duplicated and not needed" in this codebase — the difference between this and everything else in this table is that a generic *library* method costs nothing to keep (it's shared infrastructure other entities can use as-is), while a feature-specific helper with zero callers is just clutter with no other purpose. |

The rule of thumb going forward: an unused method **on the generic builder**
(`.whereIn()`, `.include()`, etc.) is fine to leave — it's infrastructure,
cheap to keep, and every future feature benefits from it existing already. An
unused **feature-specific** helper (a one-off function like
`searchPatientsQuery` was) has no such justification and should be deleted
the moment it has zero callers.

---

## 7. API reference

For the full method-by-method / export-by-export reference table (every
export from `types.ts`, `operators.ts`, `builder.ts`, `serializer.ts`,
`canonicalize.ts`, `errors.ts`), see
[`src/lib/query/README.md`](../src/lib/query/README.md) — kept short and
current for quick in-editor lookup, so it isn't duplicated here.

## 8. Common pitfalls

- **Forgetting `canonicalizeForKey` in a key factory** (§3, Example D).
  Pagination appears to work but silently refetches page 1 on every
  interaction.
- **Mixing `.limit()`/`.cursor()` with `.offset()` on the same builder.**
  Throws `QueryValidationError` with code `pagination_mode_conflict` at
  `.build()` time — pick one pagination mode per builder.
- **Assuming a field can be client-filtered when the backend force-overwrites
  it** (e.g. from the JWT/session, like Patients' `branchId`). Check the Go
  handler before adding a `.where()` helper for it — it may compile,
  serialize, and do nothing.
- **Hand-rolling a query string anywhere outside `serializer.ts`.** That
  module is the only place wire-format encoding is allowed to live — if
  you're writing `` `?filter[${field}]...` `` by hand anywhere else, stop.
- **Re-declaring enum value tuples in the `queryMeta.ts` file** instead of
  importing them from the entity's own `types.ts`. Declare each value set
  exactly once, in the types file.
- **Getting the wire entity name's casing wrong.** `fields[Patient]=`, not
  `fields[patient]=` — verify against the actual Go entity constant, never
  guess (see §3, Example B and §5a).
