# SonarJS cleanup — outcome report

## Final state

| Metric | Before | After |
|---|---|---|
| SonarJS errors | 13 | **0** |
| SonarJS warnings | 4 (`todo-tag`) | 4 (`todo-tag`, kept on purpose) |
| Core ESLint errors | 1 (`no-empty`) | **0** |
| `npm run build` | pass | pass |
| `npm test` | 172 pass | 172 pass |
| `npm run lint` | exit 1 | exit 0 |
| `npm run format:check` | n/a | pass |

Commits on `epic/patients`:

1. `chore(lint): add eslint-plugin-sonarjs + prettier, capture baseline`
2. `chore(lint): broaden sonarjs toward full Sonar way profile`
3. `style: apply prettier + eslint --fix (no behaviour change)`
4. `refactor(lib): extract storage / name / form-error helpers`
5. `refactor(patients,dashboard): clear all no-nested-conditional / inconsistent-returns`

No behaviour change anywhere. `.tsx` refactors have no jsdom test coverage and were
verified by diff inspection (rendered element tree unchanged).

## Note on the source of truth

There is no SonarQube server, `sonar-project.properties`, or issue export for this
repo, and the VS Code / JetBrains SonarLint issue list is not reachable from the CLI
(the `goland` MCP bridge is down; `~/.sonarlint` is opaque Xodus DBs). We used
`eslint-plugin-sonarjs` — the same analyzer engine SonarLint runs for JS/TS — with a
profile broadened past `recommended` toward SonarQube's default "Sonar way":
`no-duplicate-string`, `prefer-immediate-return`, `no-collapsible-if`,
`no-inconsistent-returns`, `no-nested-switch`, `no-commented-code` were switched on.

Even with that broader profile the codebase was already very clean — the entire
finding set was **10 nested ternaries + 3 inconsistent returns + 4 TODO markers + 1
empty catch**. `cognitive-complexity` (threshold 15), `no-identical-functions`,
`no-duplicate-string`, `no-collapsible-if`, `no-commented-code` and
`prefer-immediate-return` all reported **zero**.

If you can paste the real SonarLint Problems list from your IDE, any deltas can be
reconciled — a locally-configured quality profile could differ from the defaults above.

## What was fixed

### `sonarjs/no-nested-conditional` (10) — behaviour-preserving
- `DeltaBadge.tsx` — sign→arrow selection moved into a module-level `<SignArrow>`.
- `PatientSortableHeader.tsx` — `<SortIcon>` component + a precomputed `aria-label`.
- `PatientForm.tsx` — `submitLabel(isSubmitting, isEdit)` helper for the button text.
- `PatientListPage.tsx` — the 4-way render ladder is now an `if/else` `results` var.
- `PatientDetailPage.tsx` / `PatientEditPage.tsx` — same `if/else` `body` var, and
  their byte-identical "couldn't load this patient" panels were merged into one
  shared `<PatientLoadError>` (a 404 hides Retry; error-message mapping unchanged).

### `sonarjs/no-inconsistent-returns` (3) — behaviour-preserving
- `AuthCarousel.tsx`, `PatientSearch.tsx` — `return undefined` on the effect's
  early-out (runtime-identical to a bare `return` inside `useEffect`).
- `dateRange.ts` `resolvePresetWindow` — `today` folded into an explicit `default:`.
  The union is exhaustive, so reachable inputs are unchanged; the previously
  unreachable fall-through now yields the `today` window instead of `undefined`.

### `no-empty` (1) — pre-existing, behaviour-preserving
- `dashboardFiltersStore.ts:43` empty `catch {}` — cleared by routing through the
  new `@/lib/storage` helper, whose `catch` carries an explanatory comment.

### DRY extractions (no finding, but requested)
- `@/lib/storage` (`readStorage`/`writeStorage`) — replaces the `try/catch`
  `localStorage` wrappers duplicated in `dashboardFiltersStore.ts` and `AppSidebar.tsx`.
- `@/lib/name` (`initialsOf`) — replaces the identical function in `AppSidebar.tsx`
  and `patient.types.ts` (re-exported there as `patientInitials`, so importers and
  `patient.types.test.ts` are untouched).
- `@/lib/formErrors` (`setRootSubmitError` + `GENERIC_SUBMIT_ERROR`) — replaces the
  identical submit-`catch` mapping in `PatientForm.tsx` and `CredentialsStep.tsx`.

### Tooling
- Prettier introduced (`printWidth 80`); 72 files reformatted, purely whitespace.
  `.prettierignore` excludes `src/components/ui` (shadcn-generated), `.claude/`,
  and the untracked `src/features/auth/{Can,authorize,useCan}` WIP.
- `eslint-config-prettier` added last in `extends`.

## What was deliberately NOT done (divergence from the written plan)

The plan's later phases assumed a large finding set that didn't materialise. The
following were skipped as premature abstraction / churn-for-its-own-sake with real
regression risk on untested `.tsx` and **zero** finding impact:

| Planned | Why skipped |
|---|---|
| `@/lib/enum` (`oneOf`) | Single definition, used 4× in one file — already DRY within its module; no second consumer. |
| `@/lib/date` (`isIsoDate` / `toIsoDateOrNull` / `orderedRange`) | The three existing variants have genuinely different accept-sets (`date-fns` vs `new Date()` vs a prefix regex) and `toAge('')` returns `0`, not `null`. Unifying risks behaviour change; not flagged; not worth it. |
| Age coercion (`PatientFilters.parseAge` → import `toAge`) | Two functions with different contracts (`string` vs `string \| null`, `'' → null` vs `'' → 0`). Merging couples a component to the URL-serde module's internals for negative net value. |
| `@/lib/display` (`EM_DASH` / `formatOptionalText` move) | Lateral move — `format.ts` would just import `EM_DASH` back. Not a DRY win. |
| Splitting `PatientDetailContent` (~188 lines) into 7 section components | Flat declarative JSX, `cognitive-complexity` = 0, no tests. Splitting is pure churn with regression risk. |
| Splitting `PatientForm` / `AppSidebar` / `FinancialBillingWidget` | Same — already have their sub-parts extracted (`MetricTile`, `RowIcon`, `CollapsedTooltip`, `rowLayout`, `PatientFormSection`). The remaining length is declarative, not complex. |
| `FOCUS_RING` class constant (P5) | The focus-ring tokens appear as substrings inside 14 *different* longer `className` strings, in two different token orders. Extracting means converting 14 static strings across 12 files into `cn()` calls, with real `twMerge` reordering risk — and `no-duplicate-string` doesn't flag it. The right fix is a Tailwind v4 `@utility`, which is a design-system decision, not a mechanical cleanup. |

## Items a stricter profile MIGHT flag (all currently clean, none are bugs)

If you enable rules beyond the profile we used, these would surface. All are
**correct as written** — recommendation is to leave them or `// eslint-disable` with
a reason, not to "fix" them:

| Location | Pattern | Verdict |
|---|---|---|
| `PatientForm.tsx:268`, `CredentialsStep.tsx:129` | `onCheckedChange={(v) => field.onChange(v === true)}` | `v` is `boolean \| 'indeterminate'` (Radix). The `=== true` is deliberate narrowing. Keep. |
| `apiClient.ts:74,175` | `parsed.success === false` / `=== true` | `parsed` is `unknown` after an `isRecord` guard. Explicit boolean compare is intentional. Keep. |
| `PatientTableSkeleton.tsx:41`, `SkeletonList.tsx:11`, `KpiCardRow.tsx:57` | `key={i}` in a fixed-length skeleton loop | Static, non-reordering placeholder rows. Index keys are fine here. (`eslint-plugin-sonarjs` has no such rule; `eslint-plugin-react` would.) |
| `CredentialsStep.tsx:~135` | `<a href="#">` forgot-password link (also one of the `todo-tag` sites) | Placeholder pending the reset flow. Any change (route/button/remove) is a UX decision. |
| `AppSidebar.tsx` | `<a role="link" aria-disabled onClick={preventDefault}>` | Documented deliberate deviation (R14) so the "Coming soon" tooltip is reachable. Keep. |
| `lib/name.ts`, `patient.types.ts` (pre-existing) | `tokens[0]!` / `tokens[tokens.length - 1]!` | Provably safe (guarded by an earlier `length === 0` return). Not flagged by the current profile. |

## `sonarjs/todo-tag` (4, kept as warnings per your choice)

`AuthShell.tsx:44,49` · `CredentialsStep.tsx:135` · `patientsRepository.ts:10` — real
TODO markers for known future work. Rule is downgraded to `warn` in `eslint.config.js`
so they stay visible without failing `lint`.
