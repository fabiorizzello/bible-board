---
id: T01
parent: S05
milestone: M001
key_files:
  - src/ui/workspace-home/NavSidebar.tsx
  - src/ui/workspace-home/workspace-ui-store.ts
  - src/features/board/board.adapter.ts
  - src/ui/workspace-home/display-helpers.ts
  - src/ui/workspace-home/ListPane.tsx
key_decisions:
  - Board CRUD and cross-view search were fully delivered in S04 (T01 + T02); S05/T01 is a carry-forward verification pass
  - No new implementation required — all R008/R009 acceptance criteria already met
duration: 
verification_result: passed
completed_at: 2026-04-23T12:20:09.618Z
blocker_discovered: false
---

# T01: Board CRUD (create/rename inline/delete with confirm) + cross-view search verified — R008 and R009 delivered in S04, all 126 tests pass, tsc clean

**Board CRUD (create/rename inline/delete with confirm) + cross-view search verified — R008 and R009 delivered in S04, all 126 tests pass, tsc clean**

## What Happened

This task (S05/T01) covers the same requirements as S04/T01 (Board CRUD) and S04/T02 (cross-view search), both of which were delivered and validated in the prior slice. Full inventory of what was confirmed present:

**Board CRUD (R008):** `NavSidebar.tsx` exposes create (AlertDialog modal + form), inline rename (transparent `<input>` overlay with Enter/Escape/blur handling), and delete (AlertDialog confirmation). All three operations call through `workspace-ui-store.ts` wrappers (`createBoardInWorkspace`, `renameBoardInWorkspace`, `deleteBoardFromWorkspace`) to `board.adapter.ts`, which validates via `board.rules.ts` and mutates Jazz CoMaps directly. Results are `Result<T, BoardError>` from neverthrow — no try/catch in domain code.

**Cross-view search (R009):** `display-helpers.ts` exports `isElementMatchingSearch(el, query)` (case-insensitive substring across titolo, descrizione, tags) and `getElementsForView(viewId, filterText, activeTipo)` which delegates to it. `ListPane.tsx` renders a HeroUI `SearchField` bound to `filterText` in Legend State. Search works across all views (recenti, tutti, board-X).

**Sort:** `sortElementi(elementi, sortBy, sortDir)` pure sort function supports titolo/data/tipo × asc/desc. Sort controls rendered in `ListPane.tsx` toggle sort buttons.

Memory entries MEM047–MEM050 document the key architectural patterns established in S04 (ViewId template literals, HeroUI ListBox workaround for inline rename, syncJazzBoards bump pattern, isElementMatchingSearch export rationale).

Verification ran cleanly: 126/126 tests, tsc --noEmit no errors.

## Verification

Ran `npm test -- --run`: 5 test files, 126 tests, all passed. Ran `npx tsc --noEmit`: no type errors. Requirements R008 and R009 were confirmed covered by existing implementation from S04.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npm test -- --run` | 0 | ✅ pass | 643ms |
| 2 | `npx tsc --noEmit` | 0 | ✅ pass | 8000ms |

## Deviations

No deviations — task confirmed that S04 output fully satisfies S05/T01 contract. No new code written.

## Known Issues

none

## Files Created/Modified

- `src/ui/workspace-home/NavSidebar.tsx`
- `src/ui/workspace-home/workspace-ui-store.ts`
- `src/features/board/board.adapter.ts`
- `src/ui/workspace-home/display-helpers.ts`
- `src/ui/workspace-home/ListPane.tsx`
