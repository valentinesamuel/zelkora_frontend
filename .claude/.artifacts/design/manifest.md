# Pipeline Manifest

Read first by every specialist. Updated last by every specialist.

## PIPELINE STATE

```
Feature: role-dashboard-shell
Feature Slug: role-dashboard-shell
Stage: 1
Owner: senior-product-designer
Next Skill: senior-product-designer
Mode: design
Status: changes-required
Iteration: 1
Max Iterations: 2
Open Required Changes: 1
Last Decision: D-role-dashboard-shell-8
Updated: 2026-07-26
Review Scope: full
```

`Status` values: `not-started` · `in-progress` · `awaiting-clarification` ·
`awaiting-review` · `changes-required` · `blocked` · `complete`

`awaiting-clarification` means the current owner asked the user something and
stopped. Ownership is unchanged; the same skill resumes when answered.

## Stage map

| Stage | Skill | Mode |
|---|---|---|
| 0 | artifact-manager | init / feature / repair / status / archive / audit |
| 1 | senior-product-designer | design |
| 2 | design-reviewer | review |
| 3 | ux-reviewer | review |
| 4 | frontend-architect | plan |
| 5 | staff-ui-engineer | implement |
| 6 | frontend-architect | validate |

## Artifact index

| Artifact | Stage | Status | Updated |
|---|---|---|---|
| project-context.md | 0 | complete | 2026-07-26 |
| product-architecture.md | 1 | complete | 2026-07-26 |
| art-direction.md | 1 | complete | 2026-07-26 |
| design-system.md | 1 | complete | 2026-07-26 |
| current-feature.md | 0 | complete | 2026-07-26 |
| clarifications.md | any | complete | 2026-07-26 |
| design-analysis.md | 1 | complete | 2026-07-26 |
| design-spec.md | 1 | complete | 2026-07-26 |
| prototype/ | 1 | complete | 2026-07-26 |
| handoff.md | 1 | complete | 2026-07-26 |
| design-review.md | 2 | complete | 2026-07-26 |
| ux-review.md | 3 | complete | 2026-07-26 |
| architecture-plan.md | 4 | — | — |
| component-architecture.md | 4 | — | — |
| implementation-guidelines.md | 4 | — | — |
| api-contract.md | 4 | — | — |
| implementation-plan.md | 5 | — | — |
| implementation-report.md | 5 | — | — |
| validation-report.md | 6 | — | — |

## Open Required Changes

Added by reviewers on APPROVED WITH REQUIRED CHANGES. Cleared by the assigned
stage. A stage may not hand off with unactioned changes assigned to it.

| # | Change | Raised by | Assigned to | Status |
|---|---|---|---|---|
| 1 | Source true IBM Plex Sans/Mono Medium (500) `woff2` subsets with their own `@font-face` rule, replacing the `500 600`-range substitution off the SemiBold file | design-reviewer (stage 2) | staff-ui-engineer (stage 5) | open |

## Changed Surfaces

Written by a producing stage after a REJECTED verdict, to scope the next review.
Cleared when `Review Scope` returns to `full`.

| Surface | What changed | Finding it addresses |
|---|---|---|

## Gate history

| Stage | Skill | Iteration | Verdict | Date |
|---|---|---|---|---|
| 2 | design-reviewer | 0 | REJECTED | 2026-07-26 |
| 2 | design-reviewer | 1 | APPROVED WITH REQUIRED CHANGES | 2026-07-26 |
| 3 | ux-reviewer | 0 | REJECTED | 2026-07-26 |
