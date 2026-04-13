---
phase: "01-layout-3pane"
plan: "01-01"
parent: S01
milestone: M002
verification_result: passed
completed_at: 2026-04-03T12:34:11.878Z
uat_pass: 2026-04-03
key_files:
  - src/ui/workspace-home/workspace-ui-store.ts
  - src/ui/workspace-home/display-helpers.ts
  - src/ui/workspace-home/NavSidebar.tsx
  - src/ui/workspace-home/ListPane.tsx
  - src/ui/workspace-home/DetailPane.tsx
  - src/ui/workspace-home/FullscreenOverlay.tsx
  - src/ui/workspace-home/WorkspacePreviewPage.tsx
  - src/ui/workspace-home/ElementoEditor.tsx
key_decisions:
  - Reused existing DetailPane/FullscreenOverlay/WorkspacePreviewPage instead of re-extracting (T03 override)
  - Legend State store as module-level singleton accessed via useValue (post v3-beta migration)
  - Display helpers as pure adapter layer between domain-typed mock data and UI shapes
---

# S01: Recupero layout 3-pane consolidato con dark mode

**Goal:** Decompose the 785-line WorkspacePreviewPage.tsx monolith into modular components under `src/ui/workspace-home/` with a Legend State store for shared UI state, using domain-typed mock data — while preserving every visible feature: 3-pane layout, sidebar nav, list with search/filters, detail with sections, dark mode ThemeSwitcher FAB, fullscreen overlay, and DemoAuth.

**Demo achieved:** Layout 3-pane identico agli screenshot — sidebar completa, list pane con filtri tipo, detail con descrizione + fonti + link + board, dark mode con ThemeSwitcher FAB, DemoAuth funzionante. UAT PASS confermata 2026-04-03.

## Tasks rolled up

| Task | Outcome | Verification |
|---|---|---|
| **T01** | Legend State observable store (7 UI state fields + lastModified) + 8 display helpers bridging domain types to UI shapes | 33 unit tests passing, tsc clean |
| **T02** | NavSidebar + ListPane extracted from monolith, integrated with store via useSelector (later migrated to useValue) | tsc clean |
| **T03** | DetailPane + FullscreenOverlay + WorkspacePreviewPage composition shell already existed with full feature parity (override: reuse rather than re-extract); ElementoEditor integration verified | tsc clean, vitest full suite pass |

## What was delivered

1. **`workspace-ui-store.ts`** — Legend State module-level singleton with 7 UI state fields (`currentView`, `selectedElementId`, `filterText`, `activeTipo`, `sidebarOpen`, `fullscreen`, `isEditing`) plus `lastModified` for cache invalidation. Action helpers (`navigateToView`, `selectElement`, `startEditing`, `stopEditing`) for typed state mutations.

2. **`display-helpers.ts`** — Pure adapter layer (8 functions) between domain-typed mock data (`Elemento` with branded IDs, `DataStorica`, `ElementoLink`) and UI display shapes: `formatElementDate`, `getElementsForView`, `getBoardDisplayItems`, `resolveCollegamenti`, `resolveBoardsForElement`, `getFontiForElement`, `getAnnotazioniForElement`, `findElementById`. Plus constants `TIPO_FILTERS`, `TIPO_ABBREV`, `CURRENT_AUTORE`.

3. **`NavSidebar.tsx`** — Sidebar with view nav (Recenti, Tutti, board list) reading `currentView`/`sidebarOpen` from store.

4. **`ListPane.tsx`** — Middle pane with search field, tipo filters (TagGroup), recenti view, element view with selection sync.

5. **`DetailPane.tsx`** — Right pane with header (titolo + tipo chip + tags + date), action toolbar (Modifica/Link/Fonte/Board/overflow), and `DetailBody` sections (Descrizione, Collegamenti, Fonti, Annotazioni, Board). Toggles to `ElementoEditor` when `isEditing`.

6. **`FullscreenOverlay.tsx`** — Fixed inset overlay reusing `DetailBody` and `ActionToolbar` for the fullscreen view.

7. **`WorkspacePreviewPage.tsx`** — Composition shell wiring sidebar + list + detail with the Legend State store.

## Verification

| # | Command | Exit Code | Verdict |
|---|---------|-----------|---------|
| 1 | `npx vitest run src/ui/workspace-home/__tests__/display-helpers.test.ts` | 0 | ✅ pass (33 tests) |
| 2 | `npx tsc --noEmit` (T01) | 0 | ✅ pass |
| 3 | `npx tsc --noEmit` (T02) | 0 | ✅ pass |
| 4 | `npx tsc --noEmit` (T03) | 0 | ✅ pass |
| 5 | `npx vitest run` (T03 full suite) | 0 | ✅ pass |
| 6 | UAT manuale browser (3-pane layout, dark mode, DemoAuth, navigation, selection, fullscreen) | — | ✅ PASS 2026-04-03 |

## Deviations

- **T03 override**: instead of re-extracting DetailPane/FullscreenOverlay/WorkspacePreviewPage from the monolith, the existing implementations were verified to already deliver full feature parity (including ElementoEditor integration) and reused as-is. Documented in T03-PLAN.md.
- T01 delivered 33 tests vs the planned ~28, plus a bonus `lastModified` cache-invalidation timestamp.
- Per-task SUMMARY existed only for T01 (`tasks/T01-SUMMARY.md`); T02/T03 verification was tracked via `tasks/T0*-VERIFY.json` files. This phase-level SUMMARY rolls them up.

## Known issues

- Subsequent maintenance work in `chore/unblock-s02` (commit `e30034e`) fixed pre-existing type errors that surfaced once the broken `pnpm lint` script (a no-op `tsc --noEmit` instead of `tsc -b --noEmit`) was repaired. Those were latent S01 issues masked by the broken lint, not regressions.

## Files Created/Modified (S01 net)

- `src/ui/workspace-home/workspace-ui-store.ts`
- `src/ui/workspace-home/display-helpers.ts`
- `src/ui/workspace-home/__tests__/display-helpers.test.ts`
- `src/ui/workspace-home/NavSidebar.tsx`
- `src/ui/workspace-home/ListPane.tsx`
- `src/ui/workspace-home/DetailPane.tsx` (verified existing)
- `src/ui/workspace-home/FullscreenOverlay.tsx` (verified existing)
- `src/ui/workspace-home/WorkspacePreviewPage.tsx` (verified existing)
