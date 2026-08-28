# `src/components/shared/` — app-wide composed components

**This directory is currently empty of components.** Nothing in the app has ≥2 genuine feature
consumers yet, so nothing has earned a place here. That is the correct state, not an omission.

`shared/` holds **app-wide composed components** — components built from `ui/` and `form/`
primitives that more than one feature genuinely needs, and that still carry no domain knowledge.

## The promotion rule

```
feature-specific  →  (used by ≥2 genuine feature consumers?)  →  shared/
                  →  (generic visual primitive?)              →  ui/
```

Read it strictly, left to right:

1. **Everything starts feature-specific.** A new component lives in
   `src/features/<feature>/components/` until reality forces it out.
2. **Promote to `shared/` only on the second genuine consumer.** "Genuine" means a second
   *feature* actually imports it today — not "we will probably need this in billing later".
   Anticipated reuse is not reuse.
3. **Promote to `ui/` only if it is a generic visual primitive** — zero domain knowledge, zero
   app-specific composition, the kind of thing shadcn itself would ship. Most `shared/`
   components never make this hop, and should not.

Corollary: do not pre-create empty directories, and do not over-generalise a component to make it
"shared-ready". Generalise at the moment of the second consumer, when its real requirements are
visible.

## Not a dumping ground

`shared/` is **not a dumping ground.** It is not "components I could not place", not "generic-ish
stuff", and not a staging area. A component with exactly one consumer belongs in that consumer's
feature, full stop. Every file added here must be justifiable by naming its ≥2 real consumers at
review time.

## INV-L2 — `components/**` never imports `features/**` (ESLint-enforced)

`src/components/**` — including `shared/` — is domain-agnostic and **MUST NEVER** import from
`**/features/*` or `**/features/**`.

This is enforced, not advisory: `eslint.config.js` scopes a `no-restricted-imports` rule to
`src/components/**/*.{ts,tsx}` at **error** severity (Decision D9, DE-approved 2026-08-27). If you
need a feature's type, schema, store, or component inside `shared/`, the component is not shared —
it is feature code wearing the wrong hat. Either move it back into the feature, or lift the
generic part (props in, callbacks out) so no feature import is needed.

Dependency direction for the whole app: **`features → shared → form/ui`**. Lower layers never
import upward.

## Neighbours

- `src/components/ui/` — shadcn primitives + thin extensions. Zero domain knowledge.
- `src/components/form/` — generic form composition (`FormField`, `FormError`). No domain logic.
- `src/features/` — anything that understands a domain. See `src/features/README.md`.

## No barrel files

Do not add an `index.ts` here. There are no barrels in `src/`, deliberately — use explicit path
imports (`@/components/shared/SomeComponent`).
