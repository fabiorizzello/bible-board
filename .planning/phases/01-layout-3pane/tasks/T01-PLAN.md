---
estimated_steps: 25
estimated_files: 3
skills_used: []
---

# T01: Create Legend State UI store and mock data display helpers

Create the shared Legend State observable store for workspace UI state (currentView, selectedElementId, filterText, activeTipo, sidebarOpen, fullscreen) and a set of display helper functions that adapt domain-typed mock data to what the UI components need.

## Why
The monolith has 7 useState calls that need to be shared across the decomposed components. Legend State (D029, already installed) provides fine-grained reactivity. Additionally, the monolith uses simplified inline types but the real mock module uses domain types (branded ElementoId, ElementoLink with targetId, DataStorica/DataTemporale instead of string dates, no fonti field). Display helpers bridge this gap.

## Steps
1. Create `src/ui/workspace-home/workspace-ui-store.ts` with a Legend State `observable()` containing all 7 state fields from the monolith, typed with a `ViewId` union.
2. Create `src/ui/workspace-home/display-helpers.ts` with:
   - `ViewId` type export: `'recenti' | 'tutti' | 'board-patriarchi' | 'board-profeti'`
   - `TIPO_FILTERS` array: `['Tutti', 'Personaggi', 'Eventi', 'Luoghi', 'Profezie']`
   - `TIPO_ABBREV` map for tipo → abbreviation display
   - `tipoFilterMap` for filter label → ElementoTipo mapping
   - `formatElementDate(el: Elemento): string | undefined` — formats nascita/date to display string like '2018 a.e.v.' using `formatHistoricalEra` from value-objects
   - `getElementsForView(viewId, filterText, activeTipo): Elemento[]` — replaces the monolith's `getElementsForView` callback, using ELEMENTI/BOARDS from mock data
   - `resolveCollegamenti(el: Elemento): { titolo: string; tipo: string }[]` — resolves link targetIds to display names via ELEMENTI_MAP
   - `resolveBoardsForElement(el: Elemento): string[]` — finds which boards contain the element
   - `MOCK_FONTI: Map<string, string[]>` — fonti data for Abraamo (the only element with fonti in the monolith)
   - `getFontiForElement(el: Elemento): string[]` — returns fonti from the MOCK_FONTI map
3. Create `src/ui/workspace-home/__tests__/display-helpers.test.ts` with tests for date formatting, element filtering, link resolution, board resolution, and fonti lookup.

## Skills
No UI skill needed — this is pure data/state logic.

## Constraints
- Import from `@legendapp/state` (not `@legendapp/state/react` — that's for component hooks)
- Import domain types from `@/features/` and mock data from `@/mock/`
- Do NOT import from Jazz schemas
- `formatHistoricalEra` already exists in `@/features/shared/value-objects`
- The store is a module-level singleton observable, not a React context

## Inputs

- ``src/features/elemento/elemento.model.ts` — Elemento type, ElementoLink, ElementoTipo`
- ``src/features/shared/value-objects.ts` — DataStorica, DataTemporale, formatHistoricalEra`
- ``src/features/shared/newtypes.ts` — branded ID types`
- ``src/mock/data.ts` — ELEMENTI, BOARDS, RECENTI, ELEMENTI_MAP, ELEMENTO_IDS, BOARD_IDS`
- ``src/ui/workspace-home/WorkspacePreviewPage.tsx` — reference for state shape, TIPO_FILTERS, TIPO_ABBREV, getElementsForView logic`

## Expected Output

- ``src/ui/workspace-home/workspace-ui-store.ts` — Legend State observable store with ViewId type and 7 state fields`
- ``src/ui/workspace-home/display-helpers.ts` — ViewId, TIPO_FILTERS, TIPO_ABBREV, format/filter/resolve functions, MOCK_FONTI`
- ``src/ui/workspace-home/__tests__/display-helpers.test.ts` — unit tests for display helpers`

## Verification

npx vitest run src/ui/workspace-home/__tests__/display-helpers.test.ts && npx tsc --noEmit
