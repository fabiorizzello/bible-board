<!--
Sync Impact Report
==================
- Version change: 2.0.0 → 2.1.0 (MINOR: move domain model to spec)
- Modified principles: none
- Added principles: none
- Removed principles: none
- Added sections: none
- Modified sections: none
- Removed sections: Domain Model Overview (moved to feature spec
  where it belongs — constitution defines principles, not models)
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ compatible
  - .specify/templates/spec-template.md ✅ compatible
  - .specify/templates/tasks-template.md ✅ compatible
- Follow-up TODOs:
  - Jazz BinaryCoStream: verify blob support during plan
  - Jazz data migration: verify in Jazz docs during plan
  - Jolly UI: verify component coverage before implementation
-->

# Timeline Board Constitution

## Core Principles

### I. Offline-First & Zero Server

The application MUST function fully offline as a PWA.
All data MUST be stored locally first and synchronized
when connectivity is available. There MUST be no server
component — the build output is purely static files
deployable to any static host.

- No SSR, no API server, no backend process.
- Service worker via vite-plugin-pwa (Workbox) MUST
  cache all assets for offline use.
- The app MUST be installable as a PWA on tablet.

### II. Real-Time Collaboration via CRDTs

All persistent data MUST use Jazz (jazz-tools, jazz-react)
CRDTs for storage, synchronization, authentication,
groups, and permissions.

- Jazz is the single source of truth for all
  application state that persists across sessions.
- Authentication MUST be handled by Jazz's built-in
  auth system.
- Sharing and permissions MUST use Jazz groups with
  read/write access control.
- Conflict resolution is handled by CRDTs — no manual
  merge logic.

### III. Tablet-First Accessible UI

All user-facing UI components MUST use Jolly UI
(React Aria foundations + shadcn/ui styling) with
Tailwind CSS. Components MUST meet WCAG 2.1 AA
accessibility standards and be optimized for tablet
touch interaction.

- **Jolly UI**: React Aria behavior (touch-first,
  gesture-native, accessible) with shadcn/ui visual
  style. Use Jolly UI components when available; fall
  back to React Aria + Tailwind for missing ones.
- Tailwind CSS for all styling — no custom CSS files
  unless strictly necessary.
- All interactive elements MUST be keyboard-navigable.
- Form inputs MUST have proper labels and error states.
- Touch targets MUST be minimum 48x48px with 8px gap.
- `prefers-reduced-motion` MUST be respected for all
  animations.
- `touch-action: manipulation` on all interactive areas
  to eliminate 300ms tap delay.
- Long-press MUST open context menus (React Aria
  `trigger="longPress"`).
- Drag & drop for reordering MUST use React Aria
  `useDragAndDrop`.

### IV. D3-Driven SVG Rendering

Timeline and graph visualizations MUST be rendered
entirely by D3 operating directly on SVG elements via
React refs. React MUST NOT render SVG elements for
these views.

- D3 owns: scales, axes, zoom, pan, element
  positioning, transitions, and direct SVG DOM
  manipulation.
- React owns: layout, routing, forms, dialogs, and
  component lifecycle.
- Communication between layers: React passes data and
  dimensions to D3 via refs and callbacks. D3 reports
  user interactions (click, selection) back via
  callbacks.
- No hybrid rendering — a clear boundary MUST exist
  between the React UI layer and the D3 visualization
  layer.
- D3 → React callbacks during zoom/pan MUST be
  throttled to maintain 60fps.

### V. TypeScript Strict & Functional React

All code MUST be written in TypeScript with strict mode
enabled. All React components MUST be functional
components using hooks.

- `tsconfig.json` MUST set `"strict": true`.
- No class components. No `any` type unless explicitly
  justified with a comment.
- Prefer named exports. Prefer explicit return types
  on public functions.
- Keep components focused — extract hooks for complex
  logic.

### VI. Domain-Driven Design & Vertical Slices

The codebase MUST be organized in two top-level trees:
`features/` for domain logic and infrastructure,
`ui/` for pages and visual components.

- **`features/<domain>/`**: Each domain contains its
  domain models, business rules, error types, Jazz
  schemas, and adapters together. Domain logic MUST be
  pure functions operating on plain TypeScript
  interfaces — no Jazz imports in domain files.
- **`ui/<page>/`**: Each page/view gets its own folder
  with React components and hooks. Pages compose
  multiple features freely. No business logic in UI.
- **Rich domain models**: Domain functions MUST
  encapsulate validation, computed properties, and
  state transitions using NewTypes, Value Objects,
  and Aggregates.
- **NewTypes**: Branded types for IDs and domain
  primitives (ElementoId, BoardId, Tag) to prevent
  accidental type confusion.
- **Value Objects**: Immutable, compared by value
  (DataStorica, Fonte, ElementoLink). Pure domain
  logic operates on these, never on Jazz CoMaps.
- **Aggregates**: Elemento and Board are Aggregate
  Roots. Workspace is the top-level Aggregate.
- **Bounded contexts**: workspace, elemento, board
  are distinct domains. Cross-domain dependencies
  MUST flow through explicit interfaces.
- **Ubiquitous language**: Code identifiers MUST use
  domain terminology consistently. Italian domain
  terms in the model (Elemento, Board, Fonte, etc.).
- **Link bidirezionali**: When a link is created
  (e.g., Abraamo →padre→ Isacco), the inverse link
  MUST be created automatically (Isacco →figlio→
  Abraamo).

**Folder structure:**

```
src/
  features/
    workspace/
      workspace.model.ts
      workspace.rules.ts
      workspace.errors.ts
      workspace.schema.ts
      workspace.adapter.ts
    elemento/
      elemento.model.ts
      elemento.rules.ts
      elemento.errors.ts
      elemento.schema.ts
      elemento.adapter.ts
    board/
      board.model.ts
      board.rules.ts
      board.schema.ts
      board.adapter.ts
    shared/
      newtypes.ts
      value-objects.ts
  ui/
    workspace-home/
    board-view/
    elemento-editor/
    elemento-detail/
```

### VII. Testing Strategy

Testing MUST prioritize pure domain logic. Tests MUST
run without IO, without Jazz runtime, without React
rendering.

- **Framework**: Vitest (Vite-native, zero config).
- **Domain tests**: Pure unit tests on domain functions.
  Import only from `features/<domain>/` domain files —
  never from Jazz schemas or React components.
- **No mocking Jazz**: If a test needs to mock Jazz,
  the domain logic is not pure enough — refactor.
- **React Testing Library**: Only for critical UI
  interactions, not as default.
- **Coverage**: Domain rules and validation MUST have
  tests. UI components MAY have tests.

### VIII. Error Handling

Domain functions MUST use `Result<T, E>` types from
neverthrow for explicit, type-safe error handling.
Exceptions are reserved for truly exceptional cases.

- **neverthrow**: `ok()`, `err()`, `.map()`,
  `.andThen()`, `.match()` for all domain operations.
- **Domain errors**: Defined as discriminated unions
  per feature (e.g., `ElementoError`, `BoardError`).
- **React boundary**: `.match()` at the component
  level to render success or error UI.
- **Form validation**: `combineWithAllErrors()` to
  collect all validation errors at once.
- **No try/catch in domain**: Domain functions return
  `Result`, never throw.

### IX. Performance

The timeline MUST render at 60fps on low-end tablets.
React re-renders MUST be minimized.

- **React Compiler**: MUST be enabled (build-time
  automatic memoization, zero config with Vite).
- **Legend State**: MAY be added for fine-grained
  reactivity (`<Memo>` component) if profiling shows
  re-render bottlenecks in lists.
- **D3 rendering**: Already bypasses React virtual DOM
  (Principle IV). D3 transitions MUST use
  `requestAnimationFrame`.
- **Touch interactions**: `touch-action: manipulation`
  on SVG container. No 300ms tap delay.
- **Virtualization**: @tanstack/virtual for lists with
  >50 elements.

## Technology Stack Constraints

The following technology choices are fixed and MUST NOT
be substituted without a constitution amendment:

| Layer            | Technology                        |
|------------------|-----------------------------------|
| Build            | Vite + React Compiler             |
| UI Framework     | React (functional components)     |
| Language         | TypeScript (strict mode)          |
| Routing          | React Router (client-side)        |
| UI Components    | Jolly UI (React Aria + shadcn style) |
| Visualization    | D3 (direct SVG via refs)          |
| Data / Sync      | Jazz (jazz-tools, jazz-react)     |
| Auth             | Jazz built-in auth                |
| Error Handling   | neverthrow                        |
| Form Management  | @tanstack/form + zod              |
| State (UI)       | Legend State (if needed)          |
| Testing          | Vitest                            |
| Virtualization   | @tanstack/virtual                 |
| PWA              | vite-plugin-pwa (Workbox)         |
| Deployment       | Static build, zero server         |
| Icons            | Lucide React (SVG, no emojis)     |
| Design Tool      | ui-ux-pro-max skill               |

Adding new dependencies MUST be justified and MUST NOT
duplicate functionality already provided by the stack.

## Design System

The visual design follows the persisted design system
at `design-system/timeline-board/MASTER.md`.

| Token           | Value                             |
|-----------------|-----------------------------------|
| Primary          | #0D9488 (Teal)                   |
| Secondary        | #14B8A6 (Teal light)            |
| CTA / Accent     | #F97316 (Orange)                 |
| Background       | #F0FDFA (Teal wash)              |
| Text             | #134E4A (Teal dark)              |
| Heading font     | Fira Code                        |
| Body font        | Fira Sans                        |
| Style            | Micro-interactions               |
| Transitions      | 150-300ms, ease-out enter, ease-in exit |

Page-specific overrides MAY be added at
`design-system/timeline-board/pages/<page>.md`.

## Project Conventions

### Target Device

- **Tablet only** (768px — 1024px). No mobile layout,
  no desktop layout.
- **Browser support**: Last 2 major versions of Chrome,
  Firefox, Safari, and iOS Safari.

### Internationalization

- **Italian only**. Strings are hardcoded in Italian.
  No i18n library.

### Git Workflow

- **Conventional commits**: `feat:`, `fix:`, `docs:`,
  `refactor:`, `test:`, `chore:`.
- **Feature branches** from `main`.
- **Squash merge** to main.

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `elemento-rules.ts`)
- **Components**: `PascalCase.tsx` (e.g.,
  `BoardViewPage.tsx`)
- **Hooks**: `camelCase.ts` with `use` prefix (e.g.,
  `useElemento.ts`)
- **Types/Interfaces**: PascalCase (e.g., `Elemento`)
- **Constants**: SCREAMING_SNAKE_CASE
- **Folders**: `kebab-case`

### Security

- **Trusted users** — minimal security constraints.
- Basic input sanitization before SVG rendering.
- No authentication hardening beyond Jazz defaults.

### Data Migration

- Jazz CRDT schema migration strategy: **to be
  verified** in Jazz documentation during plan phase.

## Development Workflow

- **Spec-Driven**: Features follow the Spec Kit
  workflow: constitution → specify → clarify → plan →
  tasks → implement.
- **Jazz Docs First**: Before implementing any data
  model or auth flow, the Jazz documentation
  (jazz.tools/docs) MUST be consulted. Jazz is a young
  library with limited training data — always verify
  against current docs.
- **UI/UX via UI/UX Pro Max**: All UI and UX design
  decisions MUST use the `ui-ux-pro-max` skill. The
  design system MUST be generated with `--design-system
  --persist` and stored in `design-system/`. Page
  overrides MUST be created before implementing each
  new page. The pre-delivery checklist from the skill
  MUST be verified before any UI PR is merged.
- **Incremental Delivery**: Each user story MUST be
  independently testable and deliverable.
- **YAGNI**: Do not implement features not explicitly
  required. Start simple, add complexity only when
  justified.

## Governance

This constitution is the highest-authority document for
the Timeline Board project. All implementation decisions
MUST comply with these principles.

- **Amendments**: Any change to principles or stack
  requires updating this document with a version bump,
  rationale, and sync impact report.
- **Versioning**: MAJOR for principle removal/redefinition,
  MINOR for additions/expansions, PATCH for
  clarifications.
- **Compliance**: Every PR and code review MUST verify
  compliance with these principles. Violations MUST be
  flagged and resolved before merge.

**Version**: 2.1.0 | **Ratified**: 2026-03-23 | **Last Amended**: 2026-03-23
