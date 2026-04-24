---
id: T02
parent: S08
milestone: M001
key_files:
  - src/features/elemento/elemento.adapter.ts
  - src/ui/workspace-home/workspace-ui-store.ts
  - src/ui/workspace-home/display-helpers.ts
  - src/ui/workspace-home/WorkspacePreviewPage.tsx
  - src/ui/workspace-home/ElementoEditor.tsx
  - src/ui/workspace-home/ListPane.tsx
  - src/ui/workspace-home/DetailPane.tsx
  - src/ui/workspace-home/__tests__/display-helpers.test.ts
  - src/ui/workspace-home/__tests__/link-helpers.test.ts
  - vitest.config.ts
key_decisions:
  - Kept Jazz refs as module-level mutable (not in Legend State) to prevent proxy serialization issues
  - syncJazzState called during render not in useEffect to avoid stale flash
  - Soft delete via deletedAt flag filtered in WorkspacePreviewPage
  - _fontiBacking populated from raw CoMaps since NormalizedFonte is not in Elemento model
  - Boards remain on mock data pending S04
  - link-helpers tests replaced with pure getInverseLink tests
duration: 
verification_result: passed
completed_at: 2026-04-23T10:37:45.141Z
blocker_discovered: false
---

# T02: Migrated all UI reads/mutations from mock/session-overrides to Jazz CRDTs — create, update, soft-delete, links, and fonti all persist via Jazz CoMap

**Migrated all UI reads/mutations from mock/session-overrides to Jazz CRDTs — create, update, soft-delete, links, and fonti all persist via Jazz CoMap**

## What Happened

Replaced the entire mock + session-override architecture with Jazz-backed reads and mutations across 7 files: (1) elemento.adapter.ts: Added softDeleteWorkspaceElemento/restoreSoftDeletedElemento using deletedAt flag. (2) workspace-ui-store.ts: Removed all session-override state, added module-level Jazz refs (_jazzMe, _jazzElementi, _fontiBacking) outside Legend State to avoid Jazz proxy conflicts, added syncJazzState called during render, wired all mutations to Jazz adapters. (3) display-helpers.ts: All reads now use getJazzElementi()/getJazzFontiForElement(). (4) WorkspacePreviewPage.tsx: Added useWorkspaceElementiState hook, filters deletedAt, calls syncJazzState during render. (5) ElementoEditor.tsx: Fonti add/remove call Jazz adapter directly with 5s undo toast. (6) ListPane.tsx: Create element wired to createElementoInWorkspace, recenti uses live Jazz data. (7) DetailPane.tsx: Removed stale lastModified observer. Tests updated: display-helpers seeded with syncJazzElementiForTest, 6 session-override tests removed; link-helpers replaced with pure getInverseLink domain tests. vitest.config.ts fixed to exclude stale GSD worktree test copies.

## Verification

npx tsc --noEmit: zero errors. npx vitest run: 5 test files, 111 tests, 0 failures.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npx tsc --noEmit` | 0 | Zero type errors | 8000ms |
| 2 | `npx vitest run` | 0 | 5 test files, 111 tests passed | 642ms |

## Deviations

vitest.config.ts updated to add include pattern scoped to src/ — discovered and fixed during verification step to exclude stale GSD worktree test copies.

## Known Issues

None.

## Files Created/Modified

- `src/features/elemento/elemento.adapter.ts`
- `src/ui/workspace-home/workspace-ui-store.ts`
- `src/ui/workspace-home/display-helpers.ts`
- `src/ui/workspace-home/WorkspacePreviewPage.tsx`
- `src/ui/workspace-home/ElementoEditor.tsx`
- `src/ui/workspace-home/ListPane.tsx`
- `src/ui/workspace-home/DetailPane.tsx`
- `src/ui/workspace-home/__tests__/display-helpers.test.ts`
- `src/ui/workspace-home/__tests__/link-helpers.test.ts`
- `vitest.config.ts`
