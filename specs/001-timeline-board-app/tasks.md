# Tasks: Timeline Board App

**Input**: Design documents from `/specs/001-timeline-board-app/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include domain, contract, and integration tests because the constitution requires coverage for domain rules/validation and the quickstart defines explicit validation flows.

**Organization**: Tasks are grouped by user story so each story can be implemented, validated, and demonstrated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (`US1` maps to spec `US-01`, etc.)
- Every task includes exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the project skeleton and developer tooling for the static tablet-first PWA.

- [X] T001 Initialize project manifest and scripts in `/home/fabio/dev/bible-board/package.json`
- [X] T002 Configure Vite, React, Tailwind v4, and PWA plugins in `/home/fabio/dev/bible-board/vite.config.ts` and `/home/fabio/dev/bible-board/src/styles/index.css`
- [X] T003 [P] Configure TypeScript strict mode and path aliases in `/home/fabio/dev/bible-board/tsconfig.json` and `/home/fabio/dev/bible-board/tsconfig.app.json`
- [X] T004 [P] Configure Vitest and browser test setup in `/home/fabio/dev/bible-board/vitest.config.ts` and `/home/fabio/dev/bible-board/tests/setup.ts`
- [X] T005 [P] Create base app entrypoints in `/home/fabio/dev/bible-board/src/main.tsx` and `/home/fabio/dev/bible-board/src/app/App.tsx`
- [X] T006 [P] Add shared design tokens and base styles in `/home/fabio/dev/bible-board/src/styles/tokens.css` and `/home/fabio/dev/bible-board/src/styles/index.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish core architecture, contracts, schema ownership, and shared primitives that block all user stories.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T007 Create app provider composition for router, Jazz, and query-free local state in `/home/fabio/dev/bible-board/src/app/providers/AppProviders.tsx`
- [X] T008 [P] Implement route skeletons from the navigation contract in `/home/fabio/dev/bible-board/src/app/router.tsx`
- [X] T009 [P] Implement shared branded types and result helpers in `/home/fabio/dev/bible-board/src/features/shared/newtypes.ts`, `/home/fabio/dev/bible-board/src/features/shared/value-objects.ts`, and `/home/fabio/dev/bible-board/src/features/shared/result.ts`
- [X] T010 [P] Create workspace schema with Jazz account migration bootstrap in `/home/fabio/dev/bible-board/src/features/workspace/workspace.schema.ts`
- [X] T011 [P] Create elemento and board schema shells in `/home/fabio/dev/bible-board/src/features/elemento/elemento.schema.ts` and `/home/fabio/dev/bible-board/src/features/board/board.schema.ts`
- [X] T012 [P] Create workspace, elemento, and board domain model/error shells in `/home/fabio/dev/bible-board/src/features/workspace/workspace.model.ts`, `/home/fabio/dev/bible-board/src/features/workspace/workspace.errors.ts`, `/home/fabio/dev/bible-board/src/features/elemento/elemento.model.ts`, `/home/fabio/dev/bible-board/src/features/elemento/elemento.errors.ts`, `/home/fabio/dev/bible-board/src/features/board/board.model.ts`, and `/home/fabio/dev/bible-board/src/features/board/board.errors.ts`
- [X] T013 Implement Jazz-to-domain adapter shells in `/home/fabio/dev/bible-board/src/features/workspace/workspace.adapter.ts`, `/home/fabio/dev/bible-board/src/features/elemento/elemento.adapter.ts`, and `/home/fabio/dev/bible-board/src/features/board/board.adapter.ts`
- [X] T014 [P] Implement route contract tests in `/home/fabio/dev/bible-board/tests/contract/navigation-routes.test.ts`
- [X] T015 [P] Implement WOL link resolver contract tests in `/home/fabio/dev/bible-board/tests/contract/wol-link-resolver.test.ts`
- [X] T016 Implement the WOL study-edition resolver adapter in `/home/fabio/dev/bible-board/src/features/elemento/wol-link-resolver.ts`

**Checkpoint**: Foundation ready; user story phases can proceed according to dependencies below.

---

## Phase 3: User Story 1 - Autenticazione e Onboarding (Priority: P0) 🎯 MVP

**Goal**: Authenticate the user, create the single workspace automatically, and show a usable empty-state home.

**Independent Test**: Open the app as a new user, complete auth, and confirm automatic workspace creation with onboarding guidance on `/`.

- [X] T017 [P] [US1] Add auth/onboarding integration test in `/home/fabio/dev/bible-board/tests/integration/ui/auth-onboarding.test.tsx`
- [X] T018 [US1] Implement workspace bootstrap and single-workspace rule in `/home/fabio/dev/bible-board/src/features/workspace/workspace.rules.ts`
- [X] T019 [US1] Implement auth gate UI in `/home/fabio/dev/bible-board/src/ui/auth-gate/AuthGate.tsx`
- [X] T020 [US1] Implement workspace home page and empty-state onboarding in `/home/fabio/dev/bible-board/src/ui/workspace-home/WorkspaceHomePage.tsx`

**Checkpoint**: User can authenticate and land in a single auto-created workspace.

---

## Phase 4: User Story 2 - CRUD Elemento Base (Priority: P1)

**Goal**: Create, edit, view, and delete typed elementi with autosave and delete confirmation/undo.

**Independent Test**: Create five elementi of different types, edit them, inspect full detail, then delete one and undo immediately.

- [X] T021 [P] [US2] Add elemento CRUD domain tests in `/home/fabio/dev/bible-board/tests/unit/elemento/elemento-crud.test.ts`
- [X] T022 [P] [US2] Implement typed elemento creation/update/delete rules in `/home/fabio/dev/bible-board/src/features/elemento/elemento.rules.ts`
- [X] T023 [US2] Implement elemento editor form with autosave, note-centric editing, and type-specific fields in `/home/fabio/dev/bible-board/src/ui/elemento-editor/ElementoEditorPage.tsx`
- [X] T024 [US2] Implement elemento detail view with note display and personaggio chronology in `/home/fabio/dev/bible-board/src/ui/elemento-detail/ElementoDetailPage.tsx`
- [X] T025 [US2] Implement delete confirmation dialog and undo toast in `/home/fabio/dev/bible-board/src/ui/elemento-detail/ElementoDeleteAction.tsx`

**Checkpoint**: Base typed elemento CRUD is fully testable.

---

## Phase 5: User Story 3 - Date Storiche (Priority: P1)

**Goal**: Support historical dates with eras, precision, point/range values, and cross-era handling.

**Independent Test**: Create elementi with exact, approximate, and range dates in both eras and confirm they persist correctly.

- [X] T026 [P] [US3] Add historical date validation tests in `/home/fabio/dev/bible-board/tests/unit/elemento/data-storica.test.ts`
- [X] T027 [US3] Implement `DataStorica` and `DataTemporale` domain logic, including `giorno`-requires-`mese` validation, in `/home/fabio/dev/bible-board/src/features/shared/value-objects.ts`
- [X] T028 [US3] Integrate date parsing and validation into elemento rules in `/home/fabio/dev/bible-board/src/features/elemento/elemento.rules.ts`
- [X] T029 [US3] Implement historical date fields for the editor UI with detail selector (`anno`, `anno+mese`, `anno+mese+giorno`) in `/home/fabio/dev/bible-board/src/ui/elemento-editor/ElementoEditorPage.tsx`

**Checkpoint**: Historical date entry and persistence are independently testable.

---

## Phase 6: User Story 4 - Tag Registry e Categorizzazione (Priority: P1)

**Goal**: Maintain a workspace-wide tag registry with color and descriptive-element metadata plus tag autocomplete.

**Independent Test**: Create tags from elemento editing, reuse them via autocomplete, and confirm registry entries persist independently of tag usage.

- [ ] T030 [P] [US4] Add tag registry domain tests in `/home/fabio/dev/bible-board/tests/unit/workspace/tag-registry.test.ts`
- [ ] T031 [US4] Implement tag registry rules and uniqueness constraints in `/home/fabio/dev/bible-board/src/features/workspace/workspace.rules.ts`
- [ ] T032 [US4] Implement tag input with autocomplete in `/home/fabio/dev/bible-board/src/ui/elemento-editor/TagField.tsx`
- [ ] T033 [US4] Implement workspace tag registry management panel in `/home/fabio/dev/bible-board/src/ui/workspace-home/TagRegistryPanel.tsx`

**Checkpoint**: Tags are reusable, discoverable, and independently manageable.

---

## Phase 7: User Story 5 - Link Bidirezionali tra Elementi (Priority: P1)

**Goal**: Create typed bidirectional links with automatic inverse handling and cascade deletion safety.

**Independent Test**: Link two elementi, confirm inverse link generation, then delete the link or source elemento and verify inverse cleanup.

- [ ] T034 [P] [US5] Add bidirectional link rule tests in `/home/fabio/dev/bible-board/tests/unit/elemento/link-bidirezionali.test.ts`
- [ ] T035 [US5] Implement link inverse and cascade rules in `/home/fabio/dev/bible-board/src/features/elemento/elemento.rules.ts`
- [ ] T036 [US5] Implement link editing controls in `/home/fabio/dev/bible-board/src/ui/elemento-editor/ElementoLinkEditor.tsx`
- [ ] T037 [US5] Implement grouped link display in `/home/fabio/dev/bible-board/src/ui/elemento-detail/ElementoLinksPanel.tsx`

**Checkpoint**: Linking and inverse behavior work independently of later board views.

---

## Phase 8: User Story 6 - Fonti (Priority: P1)

**Goal**: Add scripture, article, and free-form sources to elementi with computed WOL study-edition links.

**Independent Test**: Add all three source types to one elemento and confirm scripture/article links open correctly.

- [ ] T038 [P] [US6] Add fonte domain tests in `/home/fabio/dev/bible-board/tests/unit/elemento/fonti.test.ts`
- [ ] T039 [US6] Implement fonte validation and resolver integration in `/home/fabio/dev/bible-board/src/features/elemento/elemento.rules.ts`
- [ ] T040 [US6] Implement source editor controls in `/home/fabio/dev/bible-board/src/ui/elemento-editor/FonteEditor.tsx`
- [ ] T041 [US6] Implement source display and outbound link actions in `/home/fabio/dev/bible-board/src/ui/elemento-detail/FontiPanel.tsx`

**Checkpoint**: Sources are fully usable and testable from elemento editing/detail flows.

---

## Phase 9: User Story 7 - Media Immagini Offline (Priority: P2)

**Goal**: Upload, store, display, and delete offline-capable immagini for each elemento.

**Independent Test**: Upload three images, go offline, confirm display, then delete one and verify space accounting changes.

- [ ] T042 [P] [US7] Add offline media integration test in `/home/fabio/dev/bible-board/tests/integration/ui/media-offline.test.tsx`
- [ ] T043 [US7] Implement Jazz image upload and storage adapter in `/home/fabio/dev/bible-board/src/features/elemento/elemento.adapter.ts`
- [ ] T044 [US7] Implement image gallery and zoom UI in `/home/fabio/dev/bible-board/src/ui/elemento-detail/MediaGallery.tsx`
- [ ] T045 [US7] Implement workspace media usage meter in `/home/fabio/dev/bible-board/src/ui/workspace-home/MediaStoragePanel.tsx`

**Checkpoint**: Offline image media works independently from advanced board views.

---

## Phase 10: User Story 8 - Gestione Board (Priority: P2)

**Goal**: Create, rename, update, and delete fixed or dynamic board selections.

**Independent Test**: Create a dynamic board and a fixed board, rename them, update filters, and confirm empty-state behavior on unmatched filters.

- [ ] T046 [P] [US8] Add board selection and filter semantics tests in `/home/fabio/dev/bible-board/tests/unit/board/board-selection.test.ts`
- [ ] T047 [US8] Implement board model and selection rules in `/home/fabio/dev/bible-board/src/features/board/board.rules.ts`
- [ ] T048 [US8] Implement board shell page and routing integration in `/home/fabio/dev/bible-board/src/ui/board-view/BoardViewPage.tsx`
- [ ] T049 [US8] Implement board CRUD and filter configuration UI in `/home/fabio/dev/bible-board/src/ui/workspace-home/BoardManagerPanel.tsx`

**Checkpoint**: Boards are manageable and dynamic filters behave as clarified.

---

## Phase 11: User Story 9 - Visualizzazione Timeline (Priority: P2)

**Goal**: Render the board timeline with vertical time axis, segmented scale, sticky cards, range bars, and minimap.

**Independent Test**: Open a board in timeline view, scroll and interact smoothly, inspect range bars/sticky cards, and adjust scale/tag grouping.

- [ ] T050 [P] [US9] Add timeline interaction integration test in `/home/fabio/dev/bible-board/tests/integration/ui/timeline-view.test.tsx`
- [ ] T051 [US9] Implement D3 timeline renderer and SVG lifecycle hook in `/home/fabio/dev/bible-board/src/ui/board-view/timeline/useTimelineD3.ts`
- [ ] T052 [US9] Implement timeline canvas, sticky cards, and minimap components in `/home/fabio/dev/bible-board/src/ui/board-view/timeline/TimelineView.tsx`
- [ ] T053 [US9] Implement timeline configuration panel for scale and tagGroups in `/home/fabio/dev/bible-board/src/ui/board-view/timeline/TimelineConfigPanel.tsx`

**Checkpoint**: Timeline view is independently demoable once boards and dated elementi exist.

---

## Phase 12: User Story 10 - Visualizzazione Lista (Priority: P2)

**Goal**: Show board elements in a sortable, configurable, virtualized list.

**Independent Test**: Open the list view on a large board, sort columns, scroll smoothly, and open an elemento from a row.

- [ ] T054 [P] [US10] Add list view integration test in `/home/fabio/dev/bible-board/tests/integration/ui/list-view.test.tsx`
- [ ] T055 [US10] Implement virtualized list view with sorting and columns in `/home/fabio/dev/bible-board/src/ui/board-view/list/BoardListView.tsx`
- [ ] T056 [US10] Wire list view selection and navigation in `/home/fabio/dev/bible-board/src/ui/board-view/list/useBoardListView.ts`

**Checkpoint**: Board list view stands alone as a usable management surface.

---

## Phase 13: User Story 11 - Ricerca nel Board (Priority: P2)

**Goal**: Provide simple case-insensitive board search adapted to the active view.

**Independent Test**: Search for an elemento term in list and graph/timeline contexts, confirm matching results, then clear the query and restore the full board.

- [ ] T057 [P] [US11] Add board search domain tests in `/home/fabio/dev/bible-board/tests/unit/board/board-search.test.ts`
- [ ] T058 [US11] Implement view-aware board search logic in `/home/fabio/dev/bible-board/src/features/board/board.rules.ts`
- [ ] T059 [US11] Implement search bar and route query synchronization in `/home/fabio/dev/bible-board/src/ui/search-bar/BoardSearchBar.tsx` and `/home/fabio/dev/bible-board/src/ui/board-view/useBoardSearch.ts`

**Checkpoint**: Board search is independently verifiable against the route contract and current views.

---

## Phase 14: User Story 12 - Navigazione e Breadcrumbs (Priority: P2)

**Goal**: Preserve navigation path across linked elementi and support long-press add-to-board actions.

**Independent Test**: Navigate across several linked elementi, jump back via breadcrumbs, then long-press an elemento to add it to a fixed board.

- [ ] T060 [P] [US12] Add breadcrumb and long-press integration test in `/home/fabio/dev/bible-board/tests/integration/ui/breadcrumbs.test.tsx`
- [ ] T061 [US12] Implement breadcrumb state and route context handling in `/home/fabio/dev/bible-board/src/ui/elemento-detail/useBreadcrumbs.ts`
- [ ] T062 [US12] Implement breadcrumb bar and add-to-board context menu in `/home/fabio/dev/bible-board/src/ui/elemento-detail/BreadcrumbBar.tsx` and `/home/fabio/dev/bible-board/src/ui/elemento-detail/AddToBoardMenu.tsx`

**Checkpoint**: Navigation flow becomes independently usable for focused study.

---

## Phase 15: User Story 13 - Visualizzazione Grafo (Priority: P3)

**Goal**: Render a force-directed graph of board elementi and typed links with link-type filters.

**Independent Test**: Open graph view on a connected board, filter by link type, zoom/pan, and preview an elemento from a node tap.

- [ ] T063 [P] [US13] Add graph view integration test in `/home/fabio/dev/bible-board/tests/integration/ui/graph-view.test.tsx`
- [ ] T064 [US13] Implement D3 force-graph hook in `/home/fabio/dev/bible-board/src/ui/board-view/graph/useGraphD3.ts`
- [ ] T065 [US13] Implement graph view and link filter controls in `/home/fabio/dev/bible-board/src/ui/board-view/graph/GraphView.tsx`

**Checkpoint**: Graph view is functional and independently testable.

---

## Phase 16: User Story 14 - Visualizzazione Genealogia (Priority: P3)

**Goal**: Render a genealogical tree from parentela links with a configurable root and depth.

**Independent Test**: Select a root personaggio, limit depth, and open detail from a genealogy node.

- [ ] T066 [P] [US14] Add genealogy view integration test in `/home/fabio/dev/bible-board/tests/integration/ui/genealogy-view.test.tsx`
- [ ] T067 [US14] Implement genealogy projection rules in `/home/fabio/dev/bible-board/src/features/board/board.rules.ts`
- [ ] T068 [US14] Implement genealogy view and root/depth controls in `/home/fabio/dev/bible-board/src/ui/board-view/genealogy/GenealogyView.tsx`

**Checkpoint**: Genealogy works independently when parentela links are present.

---

## Phase 17: User Story 15 - Offline e Sincronizzazione (Priority: P2)

**Goal**: Ensure the PWA works offline and resynchronizes Jazz-backed changes across reconnects.

**Independent Test**: Install the app, create/edit data offline, reconnect, and confirm sync to another device/account session.

- [ ] T069 [P] [US15] Add offline/sync integration test in `/home/fabio/dev/bible-board/tests/integration/ui/offline-sync.test.tsx`
- [ ] T070 [US15] Implement PWA install/offline status handling in `/home/fabio/dev/bible-board/src/app/pwa.ts` and `/home/fabio/dev/bible-board/src/ui/shared/OfflineStatusBanner.tsx`
- [ ] T071 [US15] Implement sync state presentation and reconnect handling in `/home/fabio/dev/bible-board/src/ui/shared/SyncStatusBadge.tsx`

**Checkpoint**: Offline-first and reconnect behavior are independently testable.

---

## Phase 18: User Story 16 - Collaborazione Workspace (Priority: P3)

**Goal**: Share the workspace with read/write permissions and enforce read-only restrictions in the UI.

**Independent Test**: Invite a second user, verify write access for one role and blocked edits for the read-only role.

- [ ] T072 [P] [US16] Add workspace permission domain tests in `/home/fabio/dev/bible-board/tests/unit/workspace/workspace-permissions.test.ts`
- [ ] T073 [P] [US16] Add read-only collaboration integration test in `/home/fabio/dev/bible-board/tests/integration/ui/workspace-sharing.test.tsx`
- [ ] T074 [US16] Implement Jazz group membership and permission checks in `/home/fabio/dev/bible-board/src/features/workspace/workspace.adapter.ts`
- [ ] T075 [US16] Implement workspace sharing management UI in `/home/fabio/dev/bible-board/src/ui/workspace-home/WorkspaceSharingPanel.tsx`

**Checkpoint**: Collaboration and role enforcement are independently testable.

---

## Phase 19: User Story 17 - Log Azioni e Rollback (Priority: P3)

**Goal**: Record user actions and allow safe compensating rollback of supported operations.

**Independent Test**: Perform create/update/delete actions, inspect the log, then trigger rollback and confirm a compensating action is appended.

- [ ] T076 [P] [US17] Add action-log and rollback domain tests in `/home/fabio/dev/bible-board/tests/unit/workspace/action-log.test.ts`
- [ ] T077 [P] [US17] Add rollback integration test in `/home/fabio/dev/bible-board/tests/integration/ui/action-log.test.tsx`
- [ ] T078 [US17] Implement action logging and compensating rollback rules in `/home/fabio/dev/bible-board/src/features/workspace/workspace.rules.ts`
- [ ] T079 [US17] Implement action log and rollback UI in `/home/fabio/dev/bible-board/src/ui/workspace-home/ActionLogPanel.tsx`

**Checkpoint**: Audit history and rollback are independently usable on top of collaboration-aware state.

---

## Phase 20: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening across multiple stories before implementation is considered complete.

- [ ] T080 [P] Add cross-story accessibility and reduced-motion refinements in `/home/fabio/dev/bible-board/src/ui/shared/` and `/home/fabio/dev/bible-board/src/styles/tokens.css`
- [ ] T081 [P] Add performance instrumentation and virtualization/timeline tuning in `/home/fabio/dev/bible-board/src/ui/board-view/timeline/useTimelineD3.ts`, `/home/fabio/dev/bible-board/src/ui/board-view/graph/useGraphD3.ts`, and `/home/fabio/dev/bible-board/src/ui/board-view/list/BoardListView.tsx`
- [ ] T082 Run quickstart validation and capture gaps in `/home/fabio/dev/bible-board/specs/001-timeline-board-app/quickstart.md`
- [ ] T083 Update implementation documentation and final usage notes in `/home/fabio/dev/bible-board/README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 onward**: Start only after Phase 2, then follow story dependencies below.
- **Phase 20 (Polish)**: Depends on all selected user stories being complete.

### User Story Dependencies

- **US1 / spec US-01**: Starts immediately after Foundational.
- **US2 / spec US-02**: Depends on US1.
- **US3 / spec US-03**: Depends on US2.
- **US4 / spec US-04**: Depends on US2.
- **US5 / spec US-05**: Depends on US2.
- **US6 / spec US-06**: Depends on US2 and Foundational WOL resolver work.
- **US7 / spec US-07**: Depends on US2 and Foundational Jazz media support.
- **US8 / spec US-08**: Depends on US2, US3, and US4.
- **US9 / spec US-09**: Depends on US3, US4, and US8.
- **US10 / spec US-10**: Depends on US8.
- **US11 / spec US-11**: Depends on US8 and at least one concrete board view (US10 recommended first).
- **US12 / spec US-12**: Depends on US5 and US8.
- **US13 / spec US-13**: Depends on US5 and US8.
- **US14 / spec US-14**: Depends on US5 and US8.
- **US15 / spec US-15**: Depends on US1 and Foundational PWA/Jazz setup.
- **US16 / spec US-16**: Depends on US1 and US15.
- **US17 / spec US-17**: Depends on US2, US5, and US16.

### Parallel Opportunities

- Setup tasks T003-T006 can run in parallel once T001-T002 establish the toolchain direction.
- Foundational tasks T008-T015 can run in parallel after T007 defines the provider boundary.
- After US2 completes, US3, US4, US5, and US6 can proceed in parallel.
- After US8 completes, US9, US10, US11, US12, US13, and US14 can be split across team members according to dependencies.
- US15 can progress in parallel with view work once US1 and Foundational are done.
- US16 and US17 can be parallelized late in the roadmap after their shared prerequisites exist.

---

## Parallel Example: User Story 1

```text
T017 auth/onboarding integration test
T018 workspace bootstrap rule
```

## Parallel Example: User Story 2

```text
T021 elemento CRUD domain tests
T022 typed elemento rules
```

## Parallel Example: User Story 3

```text
T026 historical date validation tests
T027 DataStorica/DataTemporale logic
```

## Parallel Example: User Story 4

```text
T030 tag registry domain tests
T032 tag autocomplete field
```

## Parallel Example: User Story 5

```text
T034 bidirectional link tests
T036 link editing controls
```

## Parallel Example: User Story 6

```text
T038 fonte domain tests
T040 source editor controls
```

## Parallel Example: User Story 7

```text
T042 offline media integration test
T045 media usage meter
```

## Parallel Example: User Story 8

```text
T046 board selection tests
T049 board manager panel
```

## Parallel Example: User Story 9

```text
T050 timeline integration test
T053 timeline config panel
```

## Parallel Example: User Story 10

```text
T054 list view integration test
T055 board list view
```

## Parallel Example: User Story 11

```text
T057 board search tests
T059 search bar and route sync
```

## Parallel Example: User Story 12

```text
T060 breadcrumbs integration test
T062 breadcrumb bar and add-to-board menu
```

## Parallel Example: User Story 13

```text
T063 graph view integration test
T065 graph view and filters
```

## Parallel Example: User Story 14

```text
T066 genealogy integration test
T068 genealogy view and controls
```

## Parallel Example: User Story 15

```text
T069 offline/sync integration test
T071 sync status badge
```

## Parallel Example: User Story 16

```text
T072 workspace permission tests
T073 read-only collaboration integration test
```

## Parallel Example: User Story 17

```text
T076 action-log domain tests
T077 rollback integration test
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 Auth & Onboarding
4. Validate single-user bootstrap on tablet viewport

### Incremental Delivery

1. Add US2-US6 to complete the core knowledge model
2. Add US8 and US10 to make board management and list review usable
3. Add US15 to lock offline-first behavior
4. Add US9 and US11-US14 for advanced study views
5. Add US16-US17 for collaboration and audit/rollback

### Suggested MVP Scope

- Phase 1
- Phase 2
- Phase 3

---

## Notes

- All tasks follow the required checklist format with IDs, optional `[P]`, optional `[USx]`, and explicit file paths.
- Story labels map directly to the numbered user stories in `spec.md`.
- Tasks are ordered for independent validation, not merely by file type.
- The branch-specific workflow scripts may require `SPECIFY_FEATURE=001-timeline-board-app` while the repository remains on `main`.
