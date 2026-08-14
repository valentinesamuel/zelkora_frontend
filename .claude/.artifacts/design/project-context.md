# Project Context

The business source of truth. Authored at stage 0, read by every stage. Every
specialist reconstructs its understanding of the product from this file, so
vagueness here degrades every stage downstream.

## Product

A hospital management system (HMS) covering the operational and clinical workflows
of running one or more hospitals: patient records, appointments, consultations,
billing and HMO/insurance claims, lab and pharmacy operations, inventory, staffing,
and reporting. This redesign effort covers the internal staff-facing side only.

## Users

Hospital staff across many roles: CMO, hospital admin, clinical lead, receptionist,
doctor, nurse, cashier, pharmacist, lab tech, and related supporting roles. Most use
the system daily, for extended hours, as the primary tool of their job — expert in
their clinical/administrative domain, but with a wide range of general software
literacy. Interfaces should default to low cognitive load and forgiving guidance
rather than assuming power-user fluency, while staying dense and fast enough for
staff who live in the tool all day.

## Primary job

Give hospital staff a fast, role-appropriate way to manage the patients, records and
tasks in front of them without leaving their workflow.

## Deployment context

Internal tool only. Staff-facing, not customer/patient-facing. The existing
patient portal in clinic-flow is explicitly out of scope for this pipeline — see
"Out of scope" below. What would embarrass the business: clinical or billing errors
surfaced by a confusing UI, and any appearance of carelessness with patient data.

## Scale

Multi-hospital / multi-tenant: the system must serve multiple hospital branches or
separate hospital clients from one deployment, not a single facility. Concurrent
user counts and per-hospital record volume are not yet known precisely — treat as
estimate: tens to low hundreds of concurrent staff per hospital, scaling with the
number of onboarded hospitals.

## Domain vocabulary

Carried over from the existing clinic-flow implementation as a starting point (to be
confirmed/expanded by `senior-product-designer` at stage 1): episodes, queue
(check-in/triage/waiting-room), vitals, consultation, HMO coverage, claims, service
pricing, sample queue, stock requests, roster/shifts, protocols. Roles listed above
(CMO, hospital admin, clinical lead, receptionist, doctor, nurse, cashier,
pharmacist, lab tech) are used as-is by the business and should not be renamed.

## Technology

Existing codebase for reference (not to be reused directly — this is a from-scratch
visual/UX redesign, not a port): `../clinic-flow`, React 18.3 + Vite 5 + TypeScript,
react-router-dom v6 with role-scoped route groups, shadcn/ui on Radix primitives,
Tailwind CSS 3.4 (deviates from `.claude/knowledge/stack.md`'s Tailwind v4 default —
confirm at stage 4 whether to upgrade or stay on v3), @tanstack/react-query v5 for
server state, zustand for client state, xstate for workflow state machines,
react-hook-form + zod for forms. The backend is being rewritten in Go in a separate
repo (`../zelkora_backend`, replacing `../deyon_be`) — that work is out of scope for
this pipeline; the frontend/backend contract is captured later via `api-contract.md`
at stage 4, developed in the meantime against the fixture-backed data layer per
`.claude/knowledge/stack.md`.

## Brand and visual constraints

Fully open. No existing brand, logo, or colour palette to preserve — the current
clinic-flow visual design ("HMS Design System — Healthcare Professional Theme",
blue-led with clinical status colours) is explicitly disliked and is not a
constraint. `senior-product-designer` may propose new art direction from scratch at
stage 1. No accessibility requirements stated beyond WCAG AA.

## Out of scope

The patient-facing portal (patients viewing their own lab results, etc. — present in
clinic-flow but not part of this redesign). The backend rewrite in Go
(`../zelkora_backend`) — tracked and executed separately from this pipeline. No
other roles or modules are excluded; all internal staff-facing feature areas are in
scope over time, one feature at a time.

## Non-negotiables

Nigerian healthcare compliance applies and overrides design preference where it
conflicts: NDPR data protection requirements, HMO/insurance claim formatting
conventions, and standard clinical audit-log retention. Specific rules should be
confirmed with the relevant domain skills (`hmo-expert`, `regulatory-compliance`)
as each feature touching claims, patient data handling, or audit trails is
designed.
