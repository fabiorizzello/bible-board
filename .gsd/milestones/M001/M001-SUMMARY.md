---
id: M001
title: "Prototipo completo su layout 3-pane consolidato"
status: complete
completed_at: 2026-04-23T12:30:26.527Z
key_decisions:
  - editingFieldId replaces page-level isEditing — per-field inline editing with no mode swap as the universal pattern
  - Blur-to-save + 5s toast undo as the unified commit grammar for all field mutations (not just soft delete) — one reversible pattern, no explicit Save/Cancel buttons
  - normalizeElementoInput as single source of truth for all 8 ElementoTipo; compile-time exhaustiveness guard via `const _exhaustive: never = tipo`
  - FonteTipo union = scrittura|articolo-wol|pubblicazione|link|altro for M001 (video deferred to M004)
  - fontiOverrides as Record<elementId, NormalizedFonte[]> in workspace-ui-store with full-replacement semantics
  - Atomic bidirectional link writes: single observable.set() patching both source and target to prevent half-patched intermediate state
  - Boards stored as co.list(BoardSchema) (first-class Jazz CoMaps) in WorkspaceSchema — not string ID lists
  - syncJazzX() + lastModified bump as canonical Jazz→LegendState reactivity bridge
  - D3 manages all SVG DOM in timeline-d3.ts; Timeline.tsx is a pure React lifecycle shell — no React-rendered SVG elements (Principio IV)
  - FONTE_TIPO_LABEL and FONTE_TIPI_IN_SCOPE colocated with getFontiGroupedByTipo as single source of truth for picker and renderer
  - INVALID_DATA as unique symbol (no throw, no null) for parseDataStorica — returns DataStorica | undefined | typeof INVALID_DATA
  - Jazz migration deferred from S03 to S08 — demo contract deliverable on mock store first, Jazz persistence as a dedicated slice
key_files:
  - src/ui/workspace-home/ElementoEditor.tsx
  - src/ui/workspace-home/workspace-ui-store.ts
  - src/ui/workspace-home/display-helpers.ts
  - src/ui/workspace-home/DetailPane.tsx
  - src/ui/workspace-home/NavSidebar.tsx
  - src/ui/workspace-home/ListPane.tsx
  - src/ui/workspace-home/WorkspacePreviewPage.tsx
  - src/ui/workspace-home/FullscreenOverlay.tsx
  - src/ui/timeline/Timeline.tsx
  - src/ui/timeline/timeline-d3.ts
  - src/features/elemento/elemento.rules.ts
  - src/features/elemento/elemento.errors.ts
  - src/features/elemento/elemento.schema.ts
  - src/features/elemento/elemento.adapter.ts
  - src/features/board/board.adapter.ts
  - src/features/board/board.schema.ts
  - src/features/workspace/workspace.schema.ts
  - src/features/workspace/workspace.adapter.ts
  - src/app/auth-context.tsx
  - src/main.tsx
lessons_learned:
  - HeroUI v3 Chip does not expose onClose — replace with inline <button><X/></button> inside children; training data on HeroUI v3 is sparse and unreliable, always read local docs first
  - buildElementoInput must use spread rather than mutation because ElementoInput fields are readonly (TS2540 errors are the signal)
  - Stale worktree symlinks in .gsd/worktrees/ cause phantom 'Cannot find module' failures in vitest discovery — add .gsd/worktrees to vitest test.exclude
  - filter link parentela by predicate on link.tipo, never by array index — index-based filtering breaks silently when link order changes
  - ScalarChip blur-to-save needs a skipBlur ref to distinguish Escape (cancel) from blur (commit) — without it, Escape triggers an unwanted save
  - Jazz→LegendState reactivity requires an explicit lastModified bump after CoValue mutations — Jazz observable changes do not propagate automatically to Legend State computed values
  - Atomic bidirectional store writes (single observable.set patching both entities) prevent reactive subscribers from observing half-patched state — never use two sequential writes for bidirectional mutations
  - Jazz persistence migration is safest as a dedicated slice after the UI demo is stable — attempting to co-deliver UI features and Jazz wiring in the same slice creates scope overload and risk of both failing
---

# M001: Prototipo completo su layout 3-pane consolidato

**Delivered a full iPad-native prototype: 3-pane layout, per-field inline editor across 8 ElementoTipo, fonti/bidirectional-link editors, Board CRUD, D3 SVG timeline with zoom/pan, Jazz CRDT persistence, and end-to-end UAT PASS.**

## What Happened

M001 decomposed a 785-line monolith into a fully modular 3-pane workspace and iteratively added every user-visible feature planned in the milestone brief.

**S01** extracted NavSidebar, ListPane, DetailPane, FullscreenOverlay, and WorkspacePreviewPage from the monolith, introduced a Legend State observable store for shared UI state, and established the display-helpers bridge between domain types and UI shapes. Dark mode (ThemeSwitcher FAB) and DemoAuth were confirmed working; UAT PASS 2026-04-03.

**S02** replaced the page-level `isEditing` mode swap with an `editingFieldId`-driven per-field inline editor aligned to the UnifiedEditorMockup canon. `normalizeElementoInput` was extended to cover all 8 ElementoTipo with a compile-time exhaustiveness guard. Blur-to-save + 5s toast undo became the unified commit grammar. Annotazioni as first-class Elemento, soft delete with 30s Annulla toast, and ScalarChip blur-to-save with skipBlur ref all landed here. 78 tests passing at slice close.

**S03** added the FonteTipo union (scrittura|articolo-wol|pubblicazione|link|altro), pure `addFonte`/`removeFonte` helpers returning `Result<readonly NormalizedFonte[], ElementoError>`, session-scoped `fontiOverrides` in the store, and `getFontiGroupedByTipo` with `FONTE_TIPO_LABEL`/`FONTE_TIPI_IN_SCOPE` as single source of truth. Bidirectional link helpers (`createBidirectionalLink`/`removeBidirectionalLink`) landed with atomic single-commit semantics and parentela role inversion via `getInverseLink`. R006 and R007 demo contracts satisfied. (Jazz persistence intentionally deferred to S08.)

**S04** wired full Board CRUD — create, rename, delete — from the NavSidebar backed by Jazz CoMaps (`BoardSchema` as `co.list()` on WorkspaceSchema). `isElementMatchingSearch` was extracted for reuse; `sortElementi` normalized BC dates to negative numbers. `syncJazzBoards()` + `lastModified` bump became the canonical Jazz→LegendState sync pattern.

**S05** built the D3 SVG timeline from scratch: vertical time axis, cards positioned by `DataStorica`, zoom (wheel/pinch) and pan (drag) with 60fps constraints, compact popup on card click. `timeline-d3.ts` is a standalone D3 module; `Timeline.tsx` is a pure React shell holding the ref and bridging lifecycle. Both files were new.

**S06** applied iPad-native polish: eliminated all forbidden `width`/`height` CSS animations that forced layout reflow, replaced with `opacity`/`transform` only. Fixed all subsidiary animation regressions across sidebar, list, detail, and timeline views.

**S07** ran the full UAT scenario end-to-end and confirmed PASS: navigation, selection, inline editing, fonti add/undo/remove, bidirectional link create/undo/remove, board CRUD, timeline zoom/pan/popup, dark mode, DemoAuth — all verified on a tablet viewport.

**S08** completed Jazz CRDT persistence: `elemento.schema.ts` + `workspace.schema.ts` (CoMap + CoList definitions), `elemento.adapter.ts` (Jazz ↔ domain bidirectional), `workspace.adapter.ts`, `auth-context.tsx` wired to a real Jazz Account with DemoAuth fallback. All session-override reads/writes in `workspace-ui-store` replaced with CoValue mutations. Elements, links, and fonti now survive hard reload.

## Success Criteria Results

## Success Criteria Results

| Criterion | Result | Evidence |
|---|---|---|
| Layout 3-pane identico agli screenshot con dark mode e DemoAuth funzionante | ✅ PASS | S01 UAT PASS 2026-04-03; NavSidebar + ListPane + DetailPane + FullscreenOverlay extracted; ThemeSwitcher FAB; DemoAuth confirmed |
| Editor inline per-campo (no mode swap) sui 8 TipoElemento, annotazioni, soft delete | ✅ PASS | S02: `editingFieldId` replaces `isEditing`; `normalizeElementoInput` exhaustive for all 8 tipo with `_exhaustive: never` guard; annotazioni as first-class Elemento; soft delete toast 30s; 78 tests |
| Fonti documentabili e link bidirezionali editabili inline | ✅ PASS | S03: FonteTipo 5-variant union, `addFonte`/`removeFonte`, `getFontiGroupedByTipo`, clickable `<Link>` in DetailPane; `createBidirectionalLink`/`removeBidirectionalLink` with atomic inverse; R006+R007 demo contracts met |
| Board CRUD con ricerca cross-view | ✅ PASS | S04: create/rename/delete boards from NavSidebar; Jazz CoMaps; `isElementMatchingSearch` reusable; cross-view search wired |
| Timeline D3 SVG con zoom/pan e popup | ✅ PASS | S05: `timeline-d3.ts` + `Timeline.tsx` built from scratch; vertical axis, card positioning, zoom (wheel/pinch), pan (drag), compact popup on click |
| Scenario UAT end-to-end PASS e app iPad-native | ✅ PASS | S07 UAT PASS confirmed; S06 eliminated all forbidden width/height animations; all features verified on tablet viewport |

## Definition of Done Results

## Definition of Done

| Item | Result |
|---|---|
| All 8 slices marked `[x]` in roadmap | ✅ S01–S08 all complete |
| All slice summaries exist | ✅ S01–S08 SUMMARY.md files present |
| Code changes exist (non-.gsd files) | ✅ 25 files changed, 2558 insertions vs milestone-start commit b2b71be |
| Full test suite passes | ✅ 126/126 tests pass (vitest run 2026-04-23) |
| TypeScript strict passes | ✅ `tsc --noEmit` exit 0 (verified at each slice close) |
| Jazz persistence end-to-end | ✅ S08: schema + adapter + JazzProvider + DemoAuth wired; elements/links/fonti survive reload |
| Cross-slice integration | ✅ S04 `isElementMatchingSearch` reused in timeline dimming; S02 commit grammar reused in S03 fonti/links; S03 bidirectional helpers reused by S08 Jazz adapter |

## Requirement Outcomes

## Requirement Outcomes

| Requirement | Transition | Evidence |
|---|---|---|
| R001 — Layout 3-pane | Active → Validated | S01 UAT PASS; 33 display-helper unit tests; tsc clean |
| R002 — Editor inline tipo-specific | Active → Validated | S02: `editingFieldId`, 8 ElementoTipo exhaustive, blur-to-save grammar |
| R003 — Annotazioni mie/altrui | Active → Validated | S02: annotazioni as first-class Elemento filtered by `autore` |
| R004 — Soft delete + restore | Active → Validated | S02: toast Annulla 30s + restore re-selects id |
| R005 — UnifiedEditor rewrite | Active → Validated | S02 T04+T05: editingFieldId, no mode swap, blur-to-save + 5s undo, add-field global |
| R006 — Fonti editor inline | Active → Validated | S03: grouped by FonteTipo, clickable Link, add/remove with 5s undo; 16 new test cases |
| R007 — Bidirectional link editor inline | Active → Validated | S03: TipoLink + RuoloLink selector, 5 role inversions, atomic inverse propagation; 13 test cases |

## Deviations

**S03 Jazz migration deferred:** The S03 goal stated Jazz CRDT migration (schema, adapter, provider wiring). Executors delivered the UI/demo level only (mock store). Jazz persistence was extracted as a standalone S08 slice which fully delivered. Final outcome is equivalent — persistence works end-to-end — but the scope was re-sequenced mid-milestone.

**Milkdown wiring for descrizione:** Plain textarea was used throughout M001; Milkdown rich editor was present in the mockup but not wired to the production editor. Deferred to a future milestone as an explicit known limitation.

**Video FonteTipo:** Intentionally deferred to M004 per S03 decision; `video` is not in the M001 FonteTipo union.

## Follow-ups

- Wire Milkdown rich editor for `Elemento.descrizione` (markdown string → rich editor); mockup exists at src/ui/mockups/UnifiedEditorMockup.tsx
- Add `.gsd/worktrees` to vitest `test.exclude` to prevent phantom stale-worktree test discovery
- Remove dead `commitPatch` link branch in ElementoEditor (link mutations now bypass it via bidirectional helpers)
- Consider promoting FONTE_TIPO_LABEL / FONTE_TIPI_IN_SCOPE from display-helpers.ts to shared/fonte-labels.ts when downstream features need them
- Video FonteTipo (deferred to M004)
- Large fonti list UAT coverage (MOCK_FONTI is minimal, Abraamo-only)
- Soft-delete + bidirectional-link undo edge case: behavior when target is soft-deleted between link creation and undo (likely benign but untested)
