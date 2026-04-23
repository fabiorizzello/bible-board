---
id: T01
parent: S04
milestone: M001
key_files:
  - src/features/board/board.schema.ts
  - src/features/board/board.adapter.ts
  - src/features/workspace/workspace.schema.ts
  - src/features/workspace/workspace.adapter.ts
  - src/ui/workspace-home/workspace-ui-store.ts
  - src/ui/workspace-home/display-helpers.ts
  - src/ui/workspace-home/NavSidebar.tsx
  - src/ui/workspace-home/WorkspacePreviewPage.tsx
  - src/ui/workspace-home/__tests__/display-helpers.test.ts
key_decisions:
  - Replaced boardIds: co.list(z.string()) with boards: co.list(BoardSchema) in WorkspaceSchema — boards are now first-class Jazz CoMaps, not just ID strings
  - ViewId changed from hardcoded union to template literal `board-${string}` to support dynamic Jazz-generated board IDs
  - Board section in NavSidebar replaced HeroUI ListBox with custom div rows to enable inline rename interaction (click-on-name enters edit mode)
  - syncJazzBoards() bumps workspaceUi$.lastModified to trigger NavSidebar re-renders after Jazz board mutations — consistent with existing syncJazzState pattern
  - console.debug events (board-creato, board-rinominato, board-eliminato) satisfy S04 slice verification requirement for action log structure
duration: 
verification_result: passed
completed_at: 2026-04-23T11:37:15.952Z
blocker_discovered: false
---

# T01: Wire full Board CRUD (create/rename/delete) from sidebar backed by Jazz persistence, replacing mock BOARDS data with live CoList

**Wire full Board CRUD (create/rename/delete) from sidebar backed by Jazz persistence, replacing mock BOARDS data with live CoList**

## What Happened

The task required wiring board create/rename/delete from the NavSidebar against Jazz persistence. The mock data layer (BOARDS from src/mock/data.ts) was the source of truth for boards across display-helpers, workspace-ui-store, and the sidebar; this needed replacing with a Jazz-backed CoList.

**Schema changes**: Extended `BoardSchema` with `elementiIds: co.list(z.string())` for fissa-selection membership. Replaced `boardIds: co.list(z.string())` in `WorkspaceSchema` with `boards: co.list(BoardSchema)`. Added migration guard (`if boards === undefined`) for accounts created with the old schema. Updated `workspace.adapter.ts` resolve config to include `boards: { $each: { elementiIds: true } }`.

**Domain adapter**: Rewrote `board.adapter.ts` with `coMapToBoard()` (CoMap→domain Board), `createBoard()`, `renameBoard()`, `deleteBoard()` — all return `Result<_, BoardError>` and emit `console.debug` event logs (board-creato, board-rinominato, board-eliminato) for S04 slice verification.

**UI store**: Updated `ViewId` from hardcoded union to `` "recenti" | "tutti" | `board-${string}` `` template literal. Added `lastModified: number` to `WorkspaceUIState` (already read in NavSidebar to force re-render). Added `_jazzBoards` module-level ref with `syncJazzBoards()` (bumps `lastModified`), `syncJazzBoardsForTest()`, and three CRUD wrappers (`createBoardInWorkspace`, `renameBoardInWorkspace`, `deleteBoardFromWorkspace`).

**Display helpers**: Removed `BOARDS` mock import; all board functions now read from `getJazzBoards()`. `getBoardDisplayItems()` uses `board-${board.id}` as ViewId. `getElementsForView` extracts boardId from the `board-` prefix.

**WorkspacePreviewPage**: Converts `workspace.boards` CoMaps to domain Boards via `coMapToBoard()` and calls `syncJazzBoards(domainBoards)` on every render, alongside existing `syncJazzState`.

**NavSidebar**: Replaced the board ListBox with custom div rows supporting: (1) inline rename — click board name enters edit mode; Enter confirms, Escape/blur cancels; (2) three-dots Dropdown per board with "Rinomina" and "Elimina" options; (3) "+" button triggers create AlertDialog with name input; (4) delete AlertDialog with board name and confirmation. Empty state shown when no boards.

**Tests**: Updated `display-helpers.test.ts` to seed boards via new `syncJazzBoardsForTest(BOARDS)` in `beforeEach`, and updated two board-view tests to use `` `board-${BOARD_IDS.patriarchi}` `` format. All 111 tests pass.

## Verification

1. `npx tsc --noEmit` — zero errors. 2. `npx vitest run` — 111/111 tests pass including all board view and resolveBoardsForElement tests. 3. `npx vite build` — production build succeeds (2103 kB, within PWA 3MiB limit). Board-related console.debug events (board-creato, board-rinominato, board-eliminato) fire correctly on CRUD operations as required by slice verification.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npx tsc --noEmit` | 0 | ✅ pass | 8200ms |
| 2 | `npx vitest run --reporter=verbose` | 0 | ✅ pass — 111/111 tests | 629ms |
| 3 | `npx vite build` | 0 | ✅ pass — built in 2.46s | 2460ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/features/board/board.schema.ts`
- `src/features/board/board.adapter.ts`
- `src/features/workspace/workspace.schema.ts`
- `src/features/workspace/workspace.adapter.ts`
- `src/ui/workspace-home/workspace-ui-store.ts`
- `src/ui/workspace-home/display-helpers.ts`
- `src/ui/workspace-home/NavSidebar.tsx`
- `src/ui/workspace-home/WorkspacePreviewPage.tsx`
- `src/ui/workspace-home/__tests__/display-helpers.test.ts`
