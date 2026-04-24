---
sliceId: S04
uatType: artifact-driven
verdict: PASS
date: 2026-04-24T12:46:30.000Z
---

# UAT Result — S04

## Checks

| Check | Mode | Result | Notes |
|-------|------|--------|-------|
| **Test 1**: Bell appears in NavSidebar footer between Impostazioni and ThemeSwitcher | artifact | PASS | `NavSidebar.tsx:395` — `<NotificationBell />` inserted between Impostazioni button (line 393) and `<ThemeSwitcher />` (line 396). Touch target: `h-[44px] w-[44px]` confirmed in `NotificationBell.tsx:38`. Badge only rendered when `unread > 0`. |
| **Test 2**: Edit elemento title → bell shows badge, drawer opens with update entry | artifact | PASS | `notifications$.items.set([stored, ...])` prepends newest first. `TIPO_ICON.update = <Pencil />`. `formatRelativeTime` returns `"ora"` for diff < 60s. `"Annulla"` button rendered when `!n.undone && n.undoFn`. Drawer: `placement="right"`, `max-w-[420px]`. |
| **Test 3**: Blur without change does not generate notification | artifact | PASS | `useFieldStatus.ts:51` — `if (prev === next) return;` — identical value on blur is a no-op; `onCommit` is never called, so `notifyMutation` is never reached. Comment: "No-op guard (R049)". |
| **Test 4**: Rollback update via drawer; "Annullato" badge; idempotent | artifact | PASS | `rollback()` at line 71: `if (item.undone \|\| !_undoFns.has(id)) return;` — guards double-call. Sets `undone=true` after calling undoFn exactly once. Drawer renders `"Annullato"` badge when `n.undone`, removes "Annulla" button. Test "calls undoFn exactly once" + "on already-undone entry does not call undoFn again (idempotent)" both pass (150/150 tests green). |
| **Test 5**: Create link → drawer shows create entry with rollback (undo removes bidirectional link) | artifact | PASS | `ElementoEditor.tsx:504` — `notifyMutation("create", "Collegamento famiglia aggiunto", () => removeBidirectionalLink(..., "parentela"))`. Generic link: line 521. Undo closure calls `removeBidirectionalLink` with both directions. |
| **Test 6**: Delete link → drawer shows delete entry with rollback (undo restores bidirectional link) | artifact | PASS | `ElementoEditor.tsx:530` — `notifyMutation("delete", "Collegamento rimosso", () => createBidirectionalLink(...))`. Undo closure calls `createBidirectionalLink` restoring both directions. `Trash2` icon via `TIPO_ICON.delete`. |
| **Test 7**: Soft-delete elemento → drawer shows delete entry; rollback restores elemento | artifact | PASS | `DetailPane.tsx:57` — `notifyMutation('delete', '"${titolo}" eliminato', () => restoreElement(elementId))`. Trash icon. Rollback calls `restoreElement` from workspace-ui-store. |
| **Test 8**: Add/remove fonte → two independent drawer entries, each with Annulla | artifact | PASS | `ElementoEditor.tsx:550` — `notifyMutation("create", "Fonte aggiunta", ...)`. Line 573 — `notifyMutation("delete", "Fonte rimossa", ...)`. Each carries independent undoFn. Rollback of each is independent (separate Map entries). |
| **Test 9**: Empty drawer shows "Nessuna attività recente" | artifact | PASS | `NotificationDrawer.tsx:83` — `<p className="...">Nessuna attività recente</p>` rendered when `items.length === 0`. `clearAll()` empties both `notifications$.items` and `_undoFns` map. |
| **Test 10**: Badge pulse animation ~300ms; no animation under prefers-reduced-motion | artifact | PASS | Badge: `key={unread}` remount triggers fresh `animate-[pulse_300ms_ease-out]` class on each new notification. Bell bounce: `window.matchMedia("(prefers-reduced-motion: reduce)").matches` guard in `useEffect` — bounce skipped entirely. CSS: `tokens.css:85-93` — `@media (prefers-reduced-motion: reduce)` sets `animation-duration: 0.01ms !important` globally, suppressing CSS animations too. |
| **Test 11**: Multiple notifications ordered newest-first | artifact | PASS | `notifications-store.ts:62` — `notifications$.items.set([stored, ...notifications$.items.peek()])` — prepends new item so newest is always first. Test "inserts entry at head so newest is first" verified at line 17 of test file. |
| **Test 12**: System errors in ListPane are inline, not in drawer | artifact | PASS | `ListPane.tsx:67` — `useState<string \| null>(null)` for `systemError`. Line 121: `setSystemError("Account non disponibile")`. Line 142: `setSystemError("Errore creazione: ...")`. No `notifyMutation` calls in ListPane. Rendered inline at line 245-247 above search bar. |
| **Test 13**: No Toast.Provider / no toast visible anywhere | artifact | PASS | `rg 'toast\(' src/ui/` → 0 hits. `rg 'Toast\.Provider' src/ui/` → 0 hits. `rg 'from.*toast\|import.*Toast' src/ui/ -i` → 0 hits. All feedback exclusively via notification drawer. |
| **TypeScript strict** | runtime | PASS | `pnpm tsc --noEmit` → 0 errors |
| **Test suite** | runtime | PASS | 150/150 tests green across 7 test files (including 9 notification-store-specific tests covering: head-insert, unique ids, no-undoFn rollback no-op, undoFn merging, called-once semantics, nonexistent-id no-op, idempotency, clearAll, unread count) |

## Overall Verdict

PASS — All 13 UAT checks pass via artifact and runtime evidence; no human-only checks required for this artifact-driven slice.

## Notes

- `useFieldStatus` is the key guard for Test 3: `prev === next` on blur prevents any downstream call to `commitPatch` and therefore `notifyMutation`. This was established in S03.
- Badge remount pattern (`key={unread}`) is a clean idiom: React tears down and remounts the `<span>` on every new notification, replaying the CSS animation without any JS timer.
- The `_undoFns` Map pattern (keeping function closures outside the Legend State observable) is the architectural decision that prevents the stack overflow on array diffing — confirmed by the comment in `notifications-store.ts`.
- System errors (ListPane account/creation failures) are deliberately excluded from the notification center per D024 — verified by absence of `notifyMutation` in ListPane source.
