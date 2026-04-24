---
id: T04
parent: S04
milestone: M007
key_files:
  - src/ui/workspace-home/DetailPane.tsx
  - src/ui/workspace-home/ListPane.tsx
  - src/ui/workspace-home/WorkspacePreviewPage.tsx
key_decisions:
  - System errors in ListPane (account unavailable, creation failure) remain inline state rather than notification center entries — the drawer is for user mutations, not system errors
  - ListPane inline error clears on next successful creation (setSystemError(null)) — no auto-dismiss timer needed for this use case
duration: 
verification_result: passed
completed_at: 2026-04-24T10:34:41.290Z
blocker_discovered: false
---

# T04: Migrated DetailPane soft-delete to notifyMutation, converted ListPane system errors to inline state, removed Toast.Provider from WorkspacePreviewPage

**Migrated DetailPane soft-delete to notifyMutation, converted ListPane system errors to inline state, removed Toast.Provider from WorkspacePreviewPage**

## What Happened

Three distinct changes completed to eliminate all remaining toast() calls:

**DetailPane.tsx**: Replaced `toast(...)` soft-delete call with `notifyMutation('delete', ...)` passing the restore callback. Removed `toast` from the `@heroui/react` import and added `import { notifyMutation } from './notifications-store'`. The comment block describing the 30-second undo window was updated to reflect the new notification-center pattern (session-persistent, no fixed timeout).

**ListPane.tsx**: Added `import { useState } from 'react'` and `const [systemError, setSystemError] = useState<string | null>(null)`. Both toast calls — the 'Account non disponibile' guard and the 'Errore creazione: ...' error path — were replaced with `setSystemError(...)`. On success, `setSystemError(null)` clears any previous error. An inline `{systemError && <p className="text-danger text-sm px-3 py-2">{systemError}</p>}` block was added between the list header and the search bar, so errors appear in context near the creation action. Removed `toast` from the `@heroui/react` import.

**WorkspacePreviewPage.tsx**: Removed `<Toast.Provider placement="bottom end" />` from the JSX. Removed `Toast` from the `@heroui/react` import. Updated the file-level JSDoc to remove the paragraph describing Toast.Provider's role.

All three changes together bring the toast count to zero across the entire `src/ui/` tree.

## Verification

rg 'toast\(' src/ui/ → 0 hits. rg 'Toast\.Provider' src/ui/ → 0 hits. rg -n 'notifyMutation' src/ui/workspace-home/DetailPane.tsx → 1 hit. pnpm tsc --noEmit → clean. pnpm test --run → 150 tests passed (7 files).

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `rg 'toast\(' src/ui/` | 1 | ✅ pass — 0 hits | 50ms |
| 2 | `rg 'Toast\.Provider' src/ui/` | 1 | ✅ pass — 0 hits | 40ms |
| 3 | `rg -n 'notifyMutation' src/ui/workspace-home/DetailPane.tsx` | 0 | ✅ pass — 1 hit | 40ms |
| 4 | `pnpm tsc --noEmit` | 0 | ✅ pass — clean | 8000ms |
| 5 | `pnpm test --run` | 0 | ✅ pass — 150 tests, 7 files | 705ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/ui/workspace-home/DetailPane.tsx`
- `src/ui/workspace-home/ListPane.tsx`
- `src/ui/workspace-home/WorkspacePreviewPage.tsx`
