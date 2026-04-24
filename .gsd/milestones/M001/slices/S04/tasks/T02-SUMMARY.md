---
id: T02
parent: S04
milestone: M001
key_files:
  - src/ui/workspace-home/display-helpers.ts
  - src/ui/workspace-home/workspace-ui-store.ts
  - src/ui/workspace-home/ListPane.tsx
  - src/ui/workspace-home/__tests__/display-helpers.test.ts
key_decisions:
  - sortElementi is a pure function (no mutation, returns new array) — consistent with the functional domain style in the codebase
  - isElementMatchingSearch is exported separately from getElementsForView so spatial views can use it for dimming without re-running the full filter pipeline
  - SortBy/SortDir types are defined in display-helpers.ts and re-exported from workspace-ui-store.ts so UI components have a single import point
  - Sort state lives in Legend State observable so it persists across view switches within the session but resets on page reload (intentional — no explicit persistence requirement)
duration: 
verification_result: passed
completed_at: 2026-04-23T11:43:01.738Z
blocker_discovered: false
---

# T02: Add sortable list view and cross-view search (title + description + tags) to board views, with per-session sort persistence

**Add sortable list view and cross-view search (title + description + tags) to board views, with per-session sort persistence**

## What Happened

Implemented all three components of the board list + search feature:

**Sort helpers (`display-helpers.ts`)**
- Added `SortBy` ("titolo" | "data" | "tipo") and `SortDir` ("asc" | "desc") types
- `sortElementi(elementi, sortBy, sortDir)` — pure sort function that does not mutate input; BC dates are normalised to negative numbers so ascending sort = chronological oldest-first; elements without any date sort last (Infinity sentinel)
- `isElementMatchingSearch(el, query)` — returns true when query matches titolo, descrizione, or any tag (case-insensitive); returns true unconditionally when query is empty, ready for dimming use in future spatial views

**Extended text search**
- `getElementsForView` text filter now delegates to `isElementMatchingSearch` instead of the previous title-only `.includes()` check, so searches match across titolo + descrizione + tags

**UI state (`workspace-ui-store.ts`)**
- Added `sortBy: SortBy` (default "titolo") and `sortDir: SortDir` (default "asc") to `WorkspaceUIState` and `initialState` so sort persists for the session

**Sort bar UI (`ListPane.tsx`)**
- Inserted a compact sort bar above the scroll list, visible in all element views (tutti + board-*)
- Three clickable column labels ("Titolo", "Tipo", "Data") — clicking active column toggles direction, clicking inactive column switches to it ascending; active column shown with ArrowUpDown / ArrowDownUp indicator and tinted background
- Applied `sortElementi` after `getElementsForView` filtering so the displayed list respects the sort state
- Header count uses `filteredElements.length` (pre-sort count) for accuracy; a "N risultati" badge appears in the sort bar when a board view has active search

**Tests (`display-helpers.test.ts`)**
- 14 new tests covering `isElementMatchingSearch` (empty query, titolo, descrizione, tags, no match), extended getElementsForView search (tag match, descrizione match), and `sortElementi` (asc/desc titolo, tipo grouping, chronological data sort, no mutation, undated elements last)
- Pre-existing "combines text and tipo filters" test updated: the assertion now uses `isElementMatchingSearch` to verify the broader invariant (each result must match in at least one field) rather than requiring a titolo substring match

## Verification

126/126 tests pass across all 5 test files (npx vitest run). TypeScript strict check (npx tsc --noEmit) exits clean. New test coverage: sortElementi (6 cases), isElementMatchingSearch (5 cases), extended search in getElementsForView (3 cases).

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npx vitest run src/ui/workspace-home/__tests__/display-helpers.test.ts` | 0 | ✅ 55/55 tests pass (14 new) | 644ms |
| 2 | `npx vitest run` | 0 | ✅ 126/126 tests pass across 5 files | 688ms |
| 3 | `npx tsc --noEmit` | 0 | ✅ No TypeScript errors | 4200ms |

## Deviations

The sort bar is shown in both board-* and tutti views (not board-only). The task focused on board list view, but tutti is also an element list so showing sort there is consistent and adds no complexity. The task plan said 'filter by titolo, tag e descrizione' — the extended search is implemented in getElementsForView directly (rather than a separate function) because the filter already owns that responsibility.

## Known Issues

Spatial views (timeline, grafo, genealogia) are not yet implemented; isElementMatchingSearch is wired and exported but dimming cannot be exercised until those views exist in S08+.

## Files Created/Modified

- `src/ui/workspace-home/display-helpers.ts`
- `src/ui/workspace-home/workspace-ui-store.ts`
- `src/ui/workspace-home/ListPane.tsx`
- `src/ui/workspace-home/__tests__/display-helpers.test.ts`
