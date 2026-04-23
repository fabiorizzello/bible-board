# S01: Recupero layout 3-pane consolidato con dark mode

**Goal:** Decomporre il monolite `WorkspacePreviewPage.tsx` (785 righe) in componenti modulari sotto `src/ui/workspace-home/` con Legend State store per stato UI condiviso e display helpers puri, preservando ogni feature visibile: layout 3-pane, sidebar nav, list con search/filtri, detail con sezioni, dark mode ThemeSwitcher FAB, fullscreen overlay, DemoAuth.

**Demo:** Layout 3-pane identico agli screenshot — sidebar completa, list pane con filtri tipo, detail con descrizione + fonti + link + board, dark mode con ThemeSwitcher FAB, DemoAuth funzionante.

## Must-Haves

- Decomposizione monolite in `NavSidebar`, `ListPane`, `DetailPane`, `FullscreenOverlay`, `WorkspacePreviewPage` shell.
- `workspace-ui-store.ts` Legend State con 7 campi UI state.
- `display-helpers.ts` pure functions (8 helper) bridging domain types → UI.
- Feature parity: dark mode, ThemeSwitcher 8 palette, search/filtri, fullscreen, DemoAuth.
- Test unit su display helpers.

## Tasks

- [x] **T01: Decomposizione monolite in componenti modulari**

## Files Likely Touched

- `src/ui/workspace-home/workspace-ui-store.ts`
- `src/ui/workspace-home/display-helpers.ts`
- `src/ui/workspace-home/NavSidebar.tsx`
- `src/ui/workspace-home/ListPane.tsx`
- `src/ui/workspace-home/DetailPane.tsx`
- `src/ui/workspace-home/FullscreenOverlay.tsx`
- `src/ui/workspace-home/WorkspacePreviewPage.tsx`
- `src/ui/workspace-home/__tests__/display-helpers.test.ts`
