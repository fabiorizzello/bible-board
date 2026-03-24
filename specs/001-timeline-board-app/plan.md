# Implementation Plan: Timeline Board App

**Branch**: `001-timeline-board-app` | **Date**: 2026-03-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-timeline-board-app/spec.md`

## Summary

Build a static, offline-first React PWA for collaborative biblical and historical timeline study. The implementation centers on a strict domain layer (`workspace`, `elemento`, `board`) adapted to Jazz CRDT storage, tablet-first UI with Jolly UI/React Aria + Tailwind, and D3-driven SVG rendering for timeline and graph views. The current domain model keeps shared elemento fields intentionally lean (`titolo`, `note`, general chronology) while allowing `personaggio` to carry dedicated structured `nascita` and `morte` dates with progressive detail (`anno`, optional `mese`, optional `giorno`). Research resolved the remaining planning unknowns around Jazz image/file support, schema evolution, component coverage, and external scripture-link strategy.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.x  
**Primary Dependencies**: React, React Router, Jazz (`jazz-tools`, `jazz-react`), D3, Jolly UI, React Aria, Tailwind CSS, `@tanstack/form`, `zod`, `neverthrow`, `vite-plugin-pwa`, `@tanstack/virtual`, Lucide React  
**Storage**: Jazz CoValues for persistent collaborative state; browser-local offline persistence managed by Jazz; image binaries via Jazz media/FileStream primitives  
**Testing**: Vitest for domain/unit tests; React Testing Library only for critical UI interactions; contract tests for route and link adapters  
**Target Platform**: Installable tablet PWA on recent Chrome, Firefox, Safari, iOS Safari  
**Project Type**: Static zero-server web application (client-side SPA/PWA)  
**Performance Goals**: 60fps timeline and graph interactions on mid/low-end tablets; search under 200ms for 2000 elementi; sync reconciliation visible within 5 seconds of reconnect  
**Constraints**: Offline-first, zero custom backend, Italian-only UI, WCAG 2.1 AA, minimum 48x48 touch targets, D3 owns SVG rendering, no manual merge logic, Tailwind-first styling, workspace-wide read/write collaboration  
**Scale/Scope**: 1 workspace per user; typical 50-500 elementi with peaks to 2000; 4 major board views; image assets under ~5MB each; public sharing limited to invited workspace members

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate Review

- **Offline-First & Zero Server**: PASS. Planned architecture is a static Vite build with client-side routing, PWA caching, and no project-specific backend.
- **Real-Time Collaboration via CRDTs**: PASS. All persistent entities are modeled for Jazz-backed storage, permissions, and synchronization.
- **Tablet-First Accessible UI**: PASS. UI plan uses Jolly UI first, React Aria fallback only where required, and bakes in touch and accessibility constraints.
- **D3-Driven SVG Rendering**: PASS. Timeline and graph remain imperative D3 surfaces behind React refs and callbacks.
- **TypeScript Strict & Functional React**: PASS. Plan assumes strict TypeScript, hooks-only React, and compiler-assisted optimization.
- **Domain-Driven Design & Vertical Slices**: PASS. Planned source layout matches the constitution's `features/` and `ui/` split.
- **Testing Strategy**: PASS. Domain behavior is isolated into pure functions with Vitest-first coverage.
- **Error Handling**: PASS. Domain operations remain `Result<T, E>` based via `neverthrow`.

## Project Structure

### Documentation (this feature)

```text
specs/001-timeline-board-app/
├── plan.md
├── research.md
├── data-model.md
├── ui-ux-memo.md
├── quickstart.md
├── contracts/
│   ├── navigation-routes.md
│   └── wol-link-resolver.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers/
├── features/
│   ├── workspace/
│   │   ├── workspace.model.ts
│   │   ├── workspace.rules.ts
│   │   ├── workspace.errors.ts
│   │   ├── workspace.schema.ts
│   │   └── workspace.adapter.ts
│   ├── elemento/
│   │   ├── elemento.model.ts
│   │   ├── elemento.rules.ts
│   │   ├── elemento.errors.ts
│   │   ├── elemento.schema.ts
│   │   └── elemento.adapter.ts
│   ├── board/
│   │   ├── board.model.ts
│   │   ├── board.rules.ts
│   │   ├── board.errors.ts
│   │   ├── board.schema.ts
│   │   └── board.adapter.ts
│   └── shared/
│       ├── newtypes.ts
│       ├── value-objects.ts
│       └── result.ts
├── ui/
│   ├── auth-gate/
│   ├── workspace-home/
│   ├── board-view/
│   ├── elemento-editor/
│   ├── elemento-detail/
│   ├── search-bar/
│   └── shared/
└── styles/
    └── tokens.css

tests/
├── unit/
│   ├── workspace/
│   ├── elemento/
│   └── board/
├── integration/
│   └── ui/
└── contract/
    ├── navigation-routes.test.ts
    └── wol-link-resolver.test.ts
```

**Structure Decision**: Use a single static web application with the constitution-mandated vertical slice layout. `features/` owns domain rules and Jazz adapters; `ui/` owns pages and presentation; `app/` owns composition, routing, and providers.

## Phase 0: Research

- Research outputs captured in [research.md](./research.md).
- Resolved unknowns:
  - Jazz image/file support for offline media
  - Jazz schema migration strategy
  - Jolly UI component coverage and fallback rule
  - React Compiler integration path for Vite
  - External `wol.jw.org` link strategy for scripture sources

## Phase 1: Design

- Domain entities, invariants, and state transitions captured in [data-model.md](./data-model.md).
- UI/UX decisions, control rules, and execution order captured in [ui-ux-memo.md](./ui-ux-memo.md).
- External-facing contracts documented in:
  - [contracts/navigation-routes.md](./contracts/navigation-routes.md)
  - [contracts/wol-link-resolver.md](./contracts/wol-link-resolver.md)
- Developer validation flow documented in [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **Offline-First & Zero Server**: PASS. No server-side feature leaked into design artifacts.
- **Jazz as Persistent Source of Truth**: PASS. Data model and contracts assume Jazz ownership, groups, and synchronization.
- **Tablet-First Accessible UI**: PASS. Route/UI contracts keep tablet-first navigation and component constraints.
- **D3 Boundary**: PASS. Timeline/graph remain separate visualization surfaces in `ui/board-view`.
- **DDD Vertical Slices**: PASS. Data model maps cleanly to `workspace`, `elemento`, and `board` slices.
- **Testing Strategy**: PASS. Quickstart and source layout keep domain tests independent from Jazz runtime and React rendering.
- **Error Handling**: PASS. Rollback, validation, and destructive actions are modeled as explicit domain outcomes rather than implicit exceptions.

## Complexity Tracking

No constitution violations identified. This section remains empty by design.
