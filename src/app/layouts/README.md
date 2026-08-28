# `src/app/layouts/` — DEFERRED

**Status: deferred.** No layout components exist yet, and none should be created until the first
authenticated shell exists. This README is the only file in this directory, by design (per
`plan.md` Phase 4, step 7).

## Why deferred

A layout is only meaningful once two or more routed pages share real chrome. Today the app has one
public page and one authenticated page, and neither shares anything with the other. Creating a
layout now would mean inventing navigation, header content, and slot boundaries with no consumer
to validate them against — an abstraction shaped by guesswork that every later page would then
have to work around.

## Current state of `src/app/`

```
src/app/
  providers/   AppProviders.tsx, queryClient.ts   (TanStack Query singleton + dev-only devtools)
  router/      AppRouter.tsx
  layouts/     this README only — nothing implemented
```

`AppRouter` renders pages **directly**, with no shared layout wrapper:

- `/login` → `<PublicOnly><LoginPage /></PublicOnly>`
- `/` → `<RequireAuth><ProfilePage /></RequireAuth>`
- `*` → redirect to `/`

Guards (`RequireAuth` / `PublicOnly`) are access control, not layout. They must not grow into
layout components.

## What will live here

When the first authenticated shell arrives, this directory holds **shared authenticated-app
chrome** that wraps routed pages under `RequireAuth` — for example:

- an `AppLayout` (or similar) that renders persistent navigation / sidebar, a header, and an
  `<Outlet />` for the routed page;
- any secondary layout variants (e.g. a full-bleed or focused-task layout) once a page genuinely
  needs one.

Expected shape at that point: `RequireAuth` wraps a layout route, the layout renders chrome plus
`<Outlet />`, and child routes render pages. The public/auth surface (`/login`) stays outside it.

## Rules that will apply when it lands

- **Chrome only.** Layouts own structure and shared chrome. They do not fetch domain data, hold
  domain state, or implement feature behaviour — that stays in `src/features/`.
- **Layouts may import features** (`app/` is the top of the dependency graph). The reverse — a
  feature importing a layout — is a design smell. `src/components/**` may never import
  `features/**` at all (INV-L2, ESLint-enforced).
- **No barrel files.** Use explicit imports (`@/app/layouts/AppLayout`).
- **Delete this README** when the directory has real content, folding anything still relevant into
  the code or into `src/features/README.md`'s architecture notes.
