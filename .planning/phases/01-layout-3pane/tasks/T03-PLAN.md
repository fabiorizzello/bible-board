---
estimated_steps: 44
estimated_files: 3
skills_used: []
---

# T03: Extract DetailPane, FullscreenOverlay, and assemble WorkspaceLayout shell

Extract the detail pane and fullscreen overlay from the monolith, then replace WorkspacePreviewPage.tsx with a thin WorkspaceLayout shell that composes all components. Verify the full app works identically.

## Why
This is the final assembly task that completes the decomposition. The detail pane (~250 lines with renderDetailBody + renderToolbar) and fullscreen overlay (~60 lines) are the remaining monolith sections. After extraction, WorkspacePreviewPage becomes a slim composition shell.

## Steps
1. Create `src/ui/workspace-home/DetailPane.tsx`:
   - Extract the entire detail pane `<div className='flex flex-1 flex-col'>` including: detail header Card (title, tipo chip, tags, date), action toolbar, scrollable body (description, collegamenti, fonti, board sections), and empty state
   - Import `workspaceUI$` from workspace-ui-store; read `selectedElementId` and `fullscreen` with `use$()`
   - Use `resolveCollegamenti`, `resolveBoardsForElement`, `getFontiForElement`, `formatElementDate` from display-helpers to transform domain data for display
   - Find the selected element from `ELEMENTI` + board-specific elements via `ELEMENTI_MAP` from mock data
   - The renderDetailBody helper renders: Descrizione (if present), Collegamenti (chips with titolo + tipo), Fonti (links), Board (chips with LayoutGrid icon)
   - The renderToolbar helper renders: Modifica, Link, Fonte, Board buttons + overflow Dropdown (Duplica, Elimina)
   - Extract `renderDetailBody` as a local helper or a `DetailBody` sub-component (used by both DetailPane and FullscreenOverlay)
   - Extract `renderToolbar` as an `ActionToolbar` sub-component
2. Create `src/ui/workspace-home/FullscreenOverlay.tsx`:
   - Extract the fullscreen overlay `<div className='fixed inset-0 z-40'>` with its header (back button, title, tipo chip, date, minimize button), toolbar, and scrollable detail body
   - Import `workspaceUI$`; read `selectedElementId` and `fullscreen`; write `fullscreen.set(false)` on close
   - Reuse `DetailBody` and `ActionToolbar` from DetailPane (or import shared sub-components)
   - Preserve the opacity + translate-y transition animation
3. Rewrite `src/ui/workspace-home/WorkspacePreviewPage.tsx` as a thin shell:
   - `<div className='flex h-screen bg-panel font-body'>` containing `<NavSidebar />`, `<ListPane />`, `<DetailPane />`, `<ThemeSwitcher />`, `<FullscreenOverlay />`
   - Remove ALL inline mock data, local types, useState calls, handler functions, and render logic
   - The file should be ~20-30 lines — just imports and composition
4. Update `src/app/router.tsx` import if the export name changes (it shouldn't — keep `WorkspacePreviewPage` as the export name for the shell)
5. Run full verification:
   - `npx tsc --noEmit` — zero errors
   - `npx vitest run` — 16 tests pass
   - Start dev server and visually confirm:
     - 3-pane layout renders correctly
     - Sidebar navigation works (Recenti/Tutti/boards)
     - Element selection populates detail pane
     - Sidebar auto-collapses on element selection
     - Tipo filters and search work
     - Fullscreen overlay opens/closes
     - ThemeSwitcher changes palette + dark/light toggle
     - DemoAuth login/logout flow works

## Skills
- `heroui-react` — for HeroUI v3 Card, Chip, Button, Dropdown composition patterns
- `ui-ux-pro-max` — MANDATORY: load before verifying existing UI components, for touch target, accessibility, and dark mode contrast checks, and to validate that reused code meets project UI/UX standards

## Constraints
- **UI/UX Review Gate (Override 2026-04-03)**: Even when reusing existing code, if it contains UI/UX work, human validation MUST be requested as specified in CLAUDE.md "UI/UX Review Gate". For this task: verify existing DetailPane, FullscreenOverlay, and WorkspacePreviewPage meet project standards, capture screenshots of all interactions (detail view, fullscreen overlay, theme switching), and request approval before marking complete.
- **Override applied (2026-04-03)**: Reuse existing code instead of extracting from scratch — all three components already exist and meet all requirements
- All Tailwind classes and visual appearance already match requirements
- Fullscreen overlay correctly uses `pointer-events-none` when hidden
- `DetailBody` and `ActionToolbar` correctly exported from DetailPane.tsx and imported by FullscreenOverlay.tsx
- Domain type adaptation correctly uses display-helpers from T01 throughout
- ThemeSwitcher.tsx, router.tsx, auth-context.tsx, auth-guards.tsx unchanged (as required)
- ElementoEditor.tsx integration already complete in both DetailPane and FullscreenOverlay

## Inputs

- ``src/ui/workspace-home/WorkspacePreviewPage.tsx` — source of detail pane, fullscreen overlay, and composition logic`
- ``src/ui/workspace-home/workspace-ui-store.ts` — Legend State store (from T01)`
- ``src/ui/workspace-home/display-helpers.ts` — resolveCollegamenti, resolveBoardsForElement, getFontiForElement, formatElementDate (from T01)`
- ``src/ui/workspace-home/NavSidebar.tsx` — sidebar component (from T02)`
- ``src/ui/workspace-home/ListPane.tsx` — list pane component (from T02)`
- ``src/ui/workspace-home/ThemeSwitcher.tsx` — existing ThemeSwitcher component (unchanged)`
- ``src/mock/data.ts` — ELEMENTI, ELEMENTI_MAP mock data`

## Expected Output

- ``src/ui/workspace-home/DetailPane.tsx` — detail pane with header, toolbar, body sections, empty state`
- ``src/ui/workspace-home/FullscreenOverlay.tsx` — fullscreen overlay with header, toolbar, body`
- ``src/ui/workspace-home/WorkspacePreviewPage.tsx` — rewritten as thin ~25-line composition shell`

## Verification

npx tsc --noEmit && npx vitest run
