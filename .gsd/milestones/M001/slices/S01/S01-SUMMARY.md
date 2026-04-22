---
id: S01
parent: M001
provides: [layout-3pane, workspace-ui-store, display-helpers]
requires: []
affects: [src/ui/workspace-home]
key_files:
  - src/ui/workspace-home/workspace-ui-store.ts
  - src/ui/workspace-home/display-helpers.ts
  - src/ui/workspace-home/NavSidebar.tsx
  - src/ui/workspace-home/ListPane.tsx
  - src/ui/workspace-home/DetailPane.tsx
  - src/ui/workspace-home/FullscreenOverlay.tsx
  - src/ui/workspace-home/WorkspacePreviewPage.tsx
verification_result: passed
completed_at: 2026-04-03
---

# S01: Recupero layout 3-pane consolidato con dark mode

**Goal achieved:** Decomposed the 785-line `WorkspacePreviewPage.tsx` monolith into 6 modular components under `src/ui/workspace-home/` with a Legend State store for shared UI state and pure display helpers bridging domain types to UI shapes — while preserving every visible feature.

**Demo achieved:** Layout 3-pane identico agli screenshot — sidebar completa, list pane con filtri tipo, detail con descrizione + fonti + link + board, dark mode con ThemeSwitcher FAB, DemoAuth funzionante. UAT PASS confermata 2026-04-03.

## Tasks rolled up

| Task | Outcome | Verification |
|---|---|---|
| **T01** | Legend State observable store (7 UI state fields + lastModified) + 8 display helpers bridging domain types to UI shapes; NavSidebar + ListPane extracted from monolith; DetailPane + FullscreenOverlay + WorkspacePreviewPage composition shell verified | 33 unit tests passing + full vitest suite pass, tsc clean |

## What was delivered

1. **`workspace-ui-store.ts`** — Legend State module-level singleton with 7 UI state fields (`currentView`, `selectedElementId`, `filterText`, `activeTipo`, `sidebarOpen`, `fullscreen`, `isEditing`) plus `lastModified` for cache invalidation.
2. **`display-helpers.ts`** — Pure adapter layer (8 functions) between domain-typed mock data and UI display shapes.
3. **`NavSidebar.tsx`** — Sidebar with view nav (Recenti, Tutti, board list).
4. **`ListPane.tsx`** — Middle pane with search, tipo filters (TagGroup), recenti/element lists.
5. **`DetailPane.tsx`** — Right pane with header + action toolbar + `DetailBody` sections.
6. **`FullscreenOverlay.tsx`** — Fixed inset overlay reusing `DetailBody` and `ActionToolbar`.
7. **`WorkspacePreviewPage.tsx`** — Composition shell.

## Verification

| # | Command | Exit Code | Verdict |
|---|---------|-----------|---------|
| 1 | `npx vitest run src/ui/workspace-home/__tests__/display-helpers.test.ts` | 0 | pass (33 tests) |
| 2 | `npx tsc --noEmit` | 0 | pass |
| 3 | `npx vitest run` | 0 | pass (full suite) |
| 4 | UAT manuale browser (3-pane, dark mode, DemoAuth, navigation, selection, fullscreen) | — | PASS 2026-04-03 |

## Known issues

- Follow-up maintenance in `chore/unblock-s02` (commit `e30034e`) fixed latent type errors masked by a broken `pnpm lint` script. Not S02 regressions.
