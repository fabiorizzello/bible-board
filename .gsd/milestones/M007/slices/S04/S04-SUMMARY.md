---
id: S04
parent: M007
milestone: M007
provides:
  - ["notifications-store.ts with notifyMutation/rollback/clearAll API", "NotificationBell in NavSidebar footer (bell + badge + drawer)", "NotificationDrawer HeroUI placement=right with per-entry rollback", "Zero toast() / Toast.Provider in src/ui/"]
requires:
  []
affects:
  - ["S06 (notification center available as sync error channel)", "S07 (bell+drawer subject to ui-ux-pro-max final review)"]
key_files:
  - ["src/ui/workspace-home/notifications-store.ts", "src/ui/workspace-home/__tests__/notifications-store.test.ts", "src/ui/workspace-home/NotificationBell.tsx", "src/ui/workspace-home/NotificationDrawer.tsx", "src/ui/workspace-home/NavSidebar.tsx", "src/ui/workspace-home/ElementoEditor.tsx", "src/ui/workspace-home/DetailPane.tsx", "src/ui/workspace-home/ListPane.tsx", "src/ui/workspace-home/WorkspacePreviewPage.tsx"]
key_decisions:
  - ["undoFn stored in module-level Map (not observable) to prevent Legend State array-diff stack overflow on function values", "HeroUI Drawer controlled via isOpen/onOpenChange on root Drawer (extends react-aria-components DialogTrigger)", "System errors (account unavailable, creation failure) remain inline in ListPane — not in notification center", "NotificationDrawer co-located inside NotificationBell fragment — bell owns its drawer", "Badge pulse via key={unread} remount; bell bounce via useEffect+setTimeout with prefers-reduced-motion guard"]
patterns_established:
  - ["notifications-store: Legend State observable + parallel Map for closures + thin wrapper functions + useSelector hooks", "Notification center pattern: notifyMutation(tipo, label, undoFn) at every mutation site; rollback(id) idempotent", "Tailwind animation remount pattern: key={value} on animated element triggers fresh animation on each state change"]
observability_surfaces:
  - ["notifications$ observable exposed at module scope — inspectable from browser devtools", "notificationsUi$.drawerOpen state inspectable from devtools", "Drawer itself is the primary diagnostic surface for mutation history during dev"]
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-04-24T10:44:24.506Z
blocker_discovered: false
---

# S04: Notification center iPad-native (bell + drawer + rollback)

**Replaced all toast() calls with an in-memory notification center: bell icon + HeroUI right drawer + per-mutation rollback, zero toast residue.**

## What Happened

S04 delivered a complete replacement of the HeroUI Toast channel with an iPad-native notification center implemented across 4 tasks.

**T01 — notifications-store.ts**: Built a Legend State singleton store following the workspace-ui-store.ts module pattern. Key architectural discovery: Legend State's array diff algorithm recursively traverses function prototype properties, causing stack overflow when undoFn closures are stored directly in the observable array. Solution: a parallel module-level `_undoFns: Map<string, () => void>` keeps function references outside the observable; `useNotifications()` merges them at read time. Public API: `notifyMutation(tipo, label, undoFn?)` → UUID, `rollback(id)` (idempotent), `clearAll()`, `markRead(id)` (stub). Separate `notificationsUi$` observable tracks drawer open state. 9-test Vitest suite covers all specified scenarios.

**T02 — NotificationBell + NotificationDrawer + NavSidebar wiring**: `NotificationDrawer` uses HeroUI Drawer compound tree (root Drawer extends react-aria-components DialogTrigger — isOpen/onOpenChange on root, same as AlertDialog). Placement right, max-w-[420px]. Body renders Italian empty state or maps to inline `NotificaRow` components with lucide icons per tipo (Plus/Pencil/Trash2), relative Italian timestamps ("ora"/"N min fa"/"HH:mm"), "Annulla" button (calls rollback), "Annullato" badge. `NotificationBell` is a 44×44px ghost icon-only button with dynamic aria-label; badge pulse triggered via key={unread} React remount; bell bounce via useEffect+setTimeout class toggle, both guarded by window.matchMedia prefers-reduced-motion. NotificationDrawer co-located inside NotificationBell fragment. NavSidebar footer updated to insert `<NotificationBell />` between Impostazioni and ThemeSwitcher.

**T03 — ElementoEditor migration**: All 6 mutation toast calls migrated to notifyMutation with verbatim undo closures extracted from the previous actionProps.onPress bodies. 2 non-mutation toasts removed (duplicate stub left as comment; validation toast removed entirely since early return + form FieldError is sufficient). Import cleaned.

**T04 — DetailPane/ListPane/WorkspacePreviewPage cleanup**: DetailPane soft-delete migrated to notifyMutation('delete', ..., restoreElement). ListPane's 2 system-error toasts (account unavailable, creation failure) converted to local `useState<string | null>` inline error rendered above the list — deliberately NOT in the notification center (drawer is for user mutations only). WorkspacePreviewPage had Toast.Provider removed. All toast() references eliminated from src/ui/.

## Verification

- `rg 'toast\(' src/ui/` → 0 hits ✅
- `rg 'Toast\.Provider' src/ui/` → 0 hits ✅
- `rg -n 'notifyMutation' src/ui/` → 7 source hits (6 ElementoEditor + 1 DetailPane) ✅
- `rg -n 'NotificationBell' src/ui/workspace-home/NavSidebar.tsx` → 2 hits (import + footer usage) ✅
- `pnpm tsc --noEmit` → clean (0 errors) ✅
- `pnpm test --run` → 150/150 green (7 test files, 9 new notification-store tests) ✅
- blur without change does not emit notification (verified via useFieldStatus.onCommit wiring from S03) ✅
- prefers-reduced-motion guard present on both badge pulse (CSS @media in tokens.css) and bell bounce (window.matchMedia JS guard) ✅

## Requirements Advanced

None.

## Requirements Validated

- R051 — rg 'toast(' src/ui/ → 0 hits; 7 notifyMutation sites; drawer renders create/update/delete entries
- R052 — rollback(id) idempotent; unit tests confirm undoFn called exactly once; all 7 sites pass undoFn closures

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

None.

## Known Limitations

["In-memory only — notifications do not persist across page reload (by design, R051 spec)", "markRead(id) is a stub — unread count is based on !undone, not on drawer-open events", "undoFn closures capture Jazz CoMap refs — if element hard-deleted between mutation and rollback, the Result.err branch in adapter is a no-op (safe but silent)"]

## Follow-ups

None.

## Files Created/Modified

None.
