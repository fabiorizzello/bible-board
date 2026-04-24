---
id: T01
parent: S04
milestone: M007
key_files:
  - src/ui/workspace-home/notifications-store.ts
  - src/ui/workspace-home/__tests__/notifications-store.test.ts
key_decisions:
  - undoFn stored in module-level Map (not in observable) to prevent Legend State infinite recursion when diffing arrays containing function values — same pattern as workspace-ui-store jazz refs
  - Notifica public type extends NotificaStored with undoFn merged at read time via useNotifications() — components always see the full Notifica shape
  - notificationsUi$ is a separate observable from notifications$ to keep drawer state concerns isolated
duration: 
verification_result: passed
completed_at: 2026-04-24T10:25:55.238Z
blocker_discovered: false
---

# T01: Created notifications-store.ts with Legend State observable, backing Map for undoFn, full write/read/rollback API, and 9-test suite — all green

**Created notifications-store.ts with Legend State observable, backing Map for undoFn, full write/read/rollback API, and 9-test suite — all green**

## What Happened

Created `src/ui/workspace-home/notifications-store.ts` as a module-level Legend State singleton following the `workspace-ui-store.ts` pattern exactly: plain observable for scalars, thin wrapper functions for writes, `useSelector` for all reads.

**Key architectural decision:** `undoFn` values are kept in a module-level `_undoFns: Map<string, () => void>` backing store rather than inside the observable. Storing functions directly in a Legend State observable array caused `Maximum call stack size exceeded` in `updateNodes → handleDeletedChild` when replacing the array with `set([])` — Legend State recursively traverses function objects (which have enumerable prototype properties) during its array diff/delete logic. This is the same pattern used in `workspace-ui-store.ts` where Jazz CoMap refs are kept outside the observable. The `Notifica` public type includes `undoFn: (() => void) | null`, merged from the backing Map at read time via `useNotifications()`.

**Store shape:**
- `notifications$` observable with `items: NotificaStored[]` (plain scalars: id, tipo, label, ts, undone)
- `notificationsUi$` observable with `drawerOpen: boolean` for drawer state
- `_undoFns` Map for function references — cleared by `clearAll()`

**API implemented:**
- `notifyMutation(tipo, label, undoFn?)` — inserts at head via `set([new, ...peek()])`, returns UUID
- `rollback(id)` — peeks array to find index, checks `!undone && _undoFns.has(id)`, calls fn, sets `items[idx].undone.set(true)` — idempotent
- `clearAll()` — sets items to [] and clears the backing Map
- `markRead(id)` — stub, body empty as specified

**Hooks:** `useNotifications()` merges undoFn from Map; `useUnreadCount()` counts `!undone` via selector callback; `useDrawerOpen()` reads `notificationsUi$.drawerOpen`.

Test file has 9 scenarios covering all 8 required plan cases plus one additional shape test for `useNotifications` merging undoFn=null correctly.

## Verification

Three verification commands run:
1. `pnpm test --run notifications-store.test.ts` → 9 tests pass (0 failures)
2. `pnpm tsc --noEmit` → clean, no output
3. `rg 'observer\(|use\$\(' notifications-store.ts` → exit 1 (0 hits)

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm test --run src/ui/workspace-home/__tests__/notifications-store.test.ts` | 0 | ✅ pass — 9 tests passed | 497ms |
| 2 | `pnpm tsc --noEmit` | 0 | ✅ pass — no type errors | 8000ms |
| 3 | `rg 'observer\(|use\$\(' src/ui/workspace-home/notifications-store.ts` | 1 | ✅ pass — 0 hits (exit 1 = no matches) | 50ms |

## Deviations

Test 3 from the plan ('entry con undoFn=null') is verified in two ways: (a) rollback-as-no-op test (undone stays false when no undoFn), (b) useNotifications shape test (undoFn=null when not provided). Direct peek inspection of `item.undoFn` on the raw stored type was not possible since undoFn is not in the observable — this is the correct behavior given the backing Map architecture.

## Known Issues

none

## Files Created/Modified

- `src/ui/workspace-home/notifications-store.ts`
- `src/ui/workspace-home/__tests__/notifications-store.test.ts`
