---
estimated_steps: 32
estimated_files: 2
skills_used: []
---

# T02: Extract NavSidebar and ListPane components from monolith

Extract the nav sidebar and list pane sections from WorkspacePreviewPage.tsx into standalone components that read/write shared state via the Legend State store from T01.

## Why
The sidebar (~180 lines) and list pane (~200 lines) are the left two-thirds of the 3-pane layout. Extracting them uses the store and display helpers from T01 and is independent from the detail pane extraction.

## Steps
1. **Reuse existing `src/ui/workspace-home/NavSidebar.tsx`**:
   - Component already extracted from the monolith with full feature parity
   - Uses `useSelector()` from `@legendapp/state/react` (not `use$()` — see D031) to read `currentView` and `sidebarOpen`
   - Includes workspace switcher dropdown, Recenti/Tutti ListBox, Board section, settings footer with collapse toggle
   - All HeroUI imports, lucide icons, class names, and aria labels preserved
2. **Reuse existing `src/ui/workspace-home/ListPane.tsx`**:
   - Component already extracted with full feature parity
   - Uses `useSelector()` to read `currentView`, `filterText`, `activeTipo`, `selectedElementId`, `sidebarOpen`, `fullscreen`
   - Includes list header, search bar (SearchField), tipo filters (TagGroup), recenti/element ListBox variants, empty state
   - Uses `getElementsForView` and `formatElementDate` from display-helpers
   - Correctly renders `RECENTI` using `elementoTipo` field with TIPO_ABBREV display
   - List pane hides (width 0) when fullscreen active
   - Auto-collapses sidebar on element selection
3. **Verification only** — ensure both components preserve all accessibility and UX features:
   - Touch targets meet 44px minimum (verified via existing classes)
   - Keyboard navigation via ListBox selectionMode='single'
   - All aria-labels and aria attributes present
   - Transition animations work correctly

## Skills
- `heroui-react` — for HeroUI v3 composition patterns
- `ui-ux-pro-max` — MANDATORY: load before verifying existing UI components, for touch target and accessibility checks, and to validate that reused code meets project UI/UX standards

## Constraints
- **UI/UX Review Gate (Override 2026-04-03)**: Even when reusing existing code, if it contains UI/UX work, human validation MUST be requested as specified in CLAUDE.md "UI/UX Review Gate". For this task: verify existing NavSidebar and ListPane meet project standards, capture screenshots, and request approval before marking complete.
- Use `use$()` from `@legendapp/state/react` to read observable values in components (triggers re-render only when that value changes)
- Do NOT use `observer()` HOC — `use$()` is simpler for reading individual fields
- Keep all Tailwind classes identical to monolith — this is decomposition, not redesign
- The Recenti mock data uses `elementoTipo` field (from src/mock/data.ts Recente interface) instead of the monolith's `badge` field — adapt the badge display to compute from elementoTipo using TIPO_ABBREV

## Inputs

- ``src/ui/workspace-home/WorkspacePreviewPage.tsx` — source of the nav sidebar and list pane markup/logic`
- ``src/ui/workspace-home/workspace-ui-store.ts` — Legend State store (from T01)`
- ``src/ui/workspace-home/display-helpers.ts` — ViewId, TIPO_FILTERS, TIPO_ABBREV, getElementsForView, formatElementDate (from T01)`
- ``src/mock/data.ts` — BOARDS, RECENTI, ELEMENTI mock data with domain types`

## Expected Output

- ``src/ui/workspace-home/NavSidebar.tsx` — sidebar component with workspace switcher, nav lists, board list, settings footer`
- ``src/ui/workspace-home/ListPane.tsx` — list pane component with search, filters, recenti/element lists, empty state`

## Verification

npx tsc --noEmit
home/workspace-ui-store.ts` — Legend State store (from T01)`
- ``src/ui/workspace-home/display-helpers.ts` — ViewId, TIPO_FILTERS, TIPO_ABBREV, getElementsForView, formatElementDate (from T01)`
- ``src/mock/data.ts` — BOARDS, RECENTI, ELEMENTI mock data with domain types`

## Expected Output

- ``src/ui/workspace-home/NavSidebar.tsx` — sidebar component with workspace switcher, nav lists, board list, settings footer`
- ``src/ui/workspace-home/ListPane.tsx` — list pane component with search, filters, recenti/element lists, empty state`

## Verification

npx tsc --noEmit
