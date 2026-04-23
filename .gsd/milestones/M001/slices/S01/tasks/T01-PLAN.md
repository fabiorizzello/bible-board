# T01: Decomposizione monolite in componenti modulari

**Slice:** S01 — **Milestone:** M001

## Description

Decomporre `WorkspacePreviewPage.tsx` (785 righe) in NavSidebar, ListPane, DetailPane, FullscreenOverlay + composition shell; introdurre `workspace-ui-store.ts` (Legend State) e `display-helpers.ts` puri; preservare feature parity (dark mode, ThemeSwitcher, DemoAuth, fullscreen).
