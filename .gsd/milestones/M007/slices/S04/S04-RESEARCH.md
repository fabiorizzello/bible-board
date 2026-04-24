# S04 Research: Notification Center iPad-native (bell + drawer + rollback)

## Summary

S04 is a well-scoped wiring slice. The required primitives are all present: Legend State observable pattern (workspace-ui-store.ts), HeroUI Drawer component (three existing right-drawer instances in ElementoEditor), useFieldStatus.onCommit contract (S03 output), and all rollback actions already embedded in existing toast calls. The work is to build `notifications-store.ts`, wire `notifyMutation()` at every mutation site, replace `Toast.Provider` + all `toast()` calls, and add `<NotificationBell>` + `<NotificationDrawer>` components.

Risk is HIGH as tagged — not because of uncertainty, but because the scope touches 4 files with toast calls and requires replacing a live feedback channel without regressions.

## Recommendation

Build in this order:
1. **notifications-store.ts** — isolated, testable, no UI dependency
2. **Unit tests** for the store (add/rollback/markRead/ordering)
3. **`<NotificationDrawer>`** — renders from store, no bell wiring yet
4. **`<NotificationBell>`** — reads unreadCount, opens drawer
5. **Wire bell into NavSidebar** footer
6. **Wire notifyMutation at all mutation sites** (ElementoEditor + DetailPane), remove toast calls
7. **Remove Toast.Provider** from WorkspacePreviewPage
8. ListPane error toasts: convert to inline error display (not drawer — they are system errors, not mutations)

## Implementation Landscape

### Existing Toast Calls to Migrate

All calls use `import { toast } from "@heroui/react"`.

**ElementoEditor.tsx** — 8 calls:
| Line | Message | Timeout | Has Undo | Migration |
|------|---------|---------|----------|-----------|
| 412 | `label` (dynamic field update) | 5s | Yes — restores prevElement | `notifyMutation('update', label, undoFn)` |
| 511 | "Collegamento famiglia aggiunto" | 5s | Yes — removeBidirectionalLink | `notifyMutation('create', ..., undoFn)` |
| 534 | "Collegamento aggiunto" | 5s | Yes — removeBidirectionalLink | `notifyMutation('create', ..., undoFn)` |
| 549 | "Collegamento rimosso" | 5s | Yes — addBidirectionalLink | `notifyMutation('delete', ..., undoFn)` |
| 575 | "Fonte aggiunta" | 5s | Yes — removeFonteFromElemento | `notifyMutation('create', ..., undoFn)` |
| 605 | "Fonte rimossa" | 5s | Yes — addFonteToElemento | `notifyMutation('delete', ..., undoFn)` |
| 935 | "Duplicazione rimandata..." | — | No | Remove (stub, not a mutation) |
| 1186 | "Usa solo anni interi positivi" | — | No | Keep inline field error (validation, not mutation) |

**DetailPane.tsx** — 1 call:
| Line | Message | Timeout | Has Undo | Migration |
|------|---------|---------|----------|-----------|
| ~58 | `"${titolo}" eliminato` | 30s | Yes — restoreElement(id) | `notifyMutation('delete', titolo, () => restoreElement(id))` |

**ListPane.tsx** — 2 calls:
| Line | Message | Migration |
|------|---------|-----------|
| 120 | "Account non disponibile" | Inline error (not a mutation, no rollback) |
| 140 | `"Errore creazione: ${error.type}"` | Inline error (creation failed, no state to roll back) |

**WorkspacePreviewPage.tsx** line 142: `<Toast.Provider placement="bottom end" />` — remove entirely.

### notifications-store.ts API Design

Follow `workspace-ui-store.ts` pattern exactly: module-level `observable`, thin wrapper functions, `useSelector` for reading. No observer() HOC, no use$().

```typescript
// src/ui/workspace-home/notifications-store.ts

import { observable } from "@legendapp/state";
import { useSelector } from "@legendapp/state/react";

export type NotificaTipo = "create" | "update" | "delete";

export interface Notifica {
  id: string;           // crypto.randomUUID()
  tipo: NotificaTipo;
  label: string;        // human-readable: "Titolo aggiornato", '"Abraamo" eliminato'
  ts: number;           // Date.now()
  undone: boolean;
  undoFn: (() => void) | null;
}

interface NotificationsState {
  items: Notifica[];
}

const notifications$ = observable<NotificationsState>({ items: [] });

// Write API
export function notifyMutation(
  tipo: NotificaTipo,
  label: string,
  undoFn: (() => void) | null = null,
): string {
  const id = crypto.randomUUID();
  const notifica: Notifica = { id, tipo, label, ts: Date.now(), undone: false, undoFn };
  notifications$.items.unshift(notifica);  // newest first
  return id;
}

export function rollback(id: string): void {
  const item = notifications$.items.find((n) => n.peek().id === id);
  if (!item || item.peek().undone || !item.peek().undoFn) return;
  item.peek().undoFn!();
  item.undone.set(true);
}

export function markRead(id: string): void { /* optional — badge is count-based */ }
export function clearAll(): void { notifications$.items.set([]); }

// Read hooks
export function useNotifications() {
  return useSelector(notifications$.items);
}

export function useUnreadCount(): number {
  return useSelector(() => notifications$.items.get().filter((n) => !n.undone).length);
}

export function useDrawerOpen(): boolean {
  return useSelector(notificationsUi$.drawerOpen);
}
```

**Unread count**: count of items where `undone === false`. Badge clears when drawer opens (mark all read on open, or just show count and clear on close).

**Granularity decision (open question from M007-CONTEXT)**: Implement 1-entry-per-commit (simplest, most predictable). Multiple blurs on the same field create multiple entries. Consolidation is a follow-up if the list gets noisy.

**Drawer open state**: Add `drawerOpen: boolean` to a separate `notificationsUi$` observable (or extend `workspaceUi$`). Either works; a dedicated module keeps concerns separate.

### Component Architecture

#### `<NotificationBell>` (new file or inline in NavSidebar)

```tsx
// Minimal: icon button + badge
function NotificationBell() {
  const unread = useUnreadCount();
  const open = useDrawerOpen();
  return (
    <Tooltip>
      <Button
        variant="ghost"
        isIconOnly
        aria-label={`Notifiche${unread > 0 ? `, ${unread} nuove` : ""}`}
        className="relative h-[44px] w-[44px] rounded-lg ..."
        onPress={() => notificationsUi$.drawerOpen.set(true)}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent
                           animate-[pulse_300ms_ease-out]" />
        )}
      </Button>
      <Tooltip.Content>Notifiche</Tooltip.Content>
    </Tooltip>
  );
}
```

Bell bounce animation: `animate-[bounce_150ms_ease-out_1]` triggered via a key or class toggle when new entry arrives. Use a `useEffect` on `items.length` to add/remove the class.

`prefers-reduced-motion`: wrap pulse and bounce keyframes with `@media (prefers-reduced-motion: reduce) { animation: none }` in tokens.css, or conditionally apply class.

#### `<NotificationDrawer>` (new file)

Follows existing ElementoEditor drawer pattern exactly:

```tsx
<Drawer.Backdrop isOpen={open} onOpenChange={(v) => notificationsUi$.drawerOpen.set(v)} className="bg-black/30">
  <Drawer.Content placement="right">
    <Drawer.Dialog className="w-full max-w-[420px] bg-panel">
      <Drawer.Header>
        <Drawer.Heading>Attività recente</Drawer.Heading>
        <Drawer.CloseTrigger />
      </Drawer.Header>
      <Drawer.Body className="overflow-y-auto">
        {items.length === 0 ? <EmptyState /> : items.map((n) => <NotificaRow key={n.id} notifica={n} />)}
      </Drawer.Body>
    </Drawer.Dialog>
  </Drawer.Content>
</Drawer.Backdrop>
```

#### `<NotificaRow>` (inline in NotificationDrawer)

```tsx
function NotificaRow({ notifica }: { notifica: Notifica }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-primary/6">
      <TipoIcon tipo={notifica.tipo} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] truncate">{notifica.label}</p>
        <p className="text-[11px] text-ink-lo">{formatRelativeTime(notifica.ts)}</p>
      </div>
      {notifica.undoFn && !notifica.undone && (
        <Button size="sm" variant="ghost" onPress={() => rollback(notifica.id)}>
          Annulla
        </Button>
      )}
      {notifica.undone && (
        <span className="text-[11px] text-ink-lo">Annullato</span>
      )}
    </div>
  );
}
```

### Bell Insertion Point in NavSidebar

**File:** `src/ui/workspace-home/NavSidebar.tsx`, lines 384–408 (Settings footer).

Insert `<NotificationBell>` in the `flex items-center gap-1` row alongside `ThemeSwitcher` and the close button:

```tsx
<div className="flex items-center gap-1">
  <Button ...>Impostazioni</Button>
  <NotificationBell />    {/* ← INSERT HERE */}
  <ThemeSwitcher />
  <Tooltip>...</Tooltip>  {/* close-sidebar button */}
</div>
```

### Wire notifyMutation at Mutation Sites

**ElementoEditor.tsx commitPatch (line 412):** Replace `toast(label, {...})` with `notifyMutation('update', label, () => { normalizeElementoInput(buildElementoInput(prevElement)).match(...) })`. The rollback lambda is identical to the current `actionProps.onPress`.

**ElementoEditor.tsx link/fonte mutations (lines 511, 534, 549, 575, 605):** Same pattern — move the existing `actionProps.onPress` lambda into the `undoFn` argument to `notifyMutation`.

**DetailPane.tsx handleSoftDelete (line ~58):** Replace `toast(...)` with `notifyMutation('delete', \`"${titolo}" eliminato\`, () => restoreElement(elementId))`.

**ListPane.tsx errors (lines 120, 140):** These are system errors (account unavailable, creation failed), not mutations. Convert to inline error UI — a `<p className="text-danger text-sm">` near the list or creation button. **Do NOT route to notification drawer.**

### Files to Create

- `src/ui/workspace-home/notifications-store.ts` — store + write API + read hooks
- `src/ui/workspace-home/NotificationDrawer.tsx` — drawer component
- `src/ui/workspace-home/__tests__/notifications-store.test.ts` — unit tests

### Files to Modify

- `src/ui/workspace-home/NavSidebar.tsx` — add `<NotificationBell>` to footer row
- `src/ui/workspace-home/ElementoEditor.tsx` — replace 6 actionable toasts with notifyMutation, remove 2 non-mutation toasts, remove `toast` import
- `src/ui/workspace-home/DetailPane.tsx` — replace handleSoftDelete toast with notifyMutation, remove `toast` import
- `src/ui/workspace-home/ListPane.tsx` — replace 2 error toasts with inline error display, remove `toast` import
- `src/ui/workspace-home/WorkspacePreviewPage.tsx` — remove `<Toast.Provider>`, remove `toast` import

### Verification Commands

```bash
pnpm test --run                          # 141+ tests pass (6 new store tests)
pnpm tsc --noEmit                        # clean
rg "toast(" src/ui/ --include="*.tsx" --include="*.ts"   # zero hits
rg "Toast.Provider" src/ui/             # zero hits
rg "notifyMutation" src/ui/ --include="*.tsx" --include="*.ts"   # 7+ hits
rg "NotificationDrawer\|NotificationBell" src/ui/        # present
```

## Constraints

- **Legend State MEM030**: `useSelector()` from `@legendapp/state/react`. Never `observer()`, never `use$()`.
- **MEM040**: Jazz CoMap refs MUST NOT be wrapped in Legend State. `notifications-store.ts` is pure in-memory — no Jazz refs involved here.
- **Animate only `opacity` and `transform`** (CLAUDE.md Principle IX). Bell bounce = `transform` scale or translateY. Badge pulse = `opacity`/`transform` scale. Never `width`/`height`.
- **`prefers-reduced-motion`**: pulse and bounce MUST be suppressed. Pattern: check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` at animation-trigger time (consistent with useFieldStatus pattern from S03).
- **Touch target ≥44×44px**: Bell button must be `h-[44px] w-[44px]` (matches existing footer buttons).
- **HeroUI Drawer**: uses composable `Drawer.Backdrop > Drawer.Content > Drawer.Dialog > Drawer.Header/Body` pattern. Three identical instances already exist in ElementoEditor — copy that structure exactly.

## Open Questions Resolved

- **Granularity**: 1 entry per commit (not consolidated). Simplest; revisit if noisy.
- **ListPane errors**: Inline error, not drawer. They are system errors, not user mutations.
- **Drawer unread clear**: Clear badge on drawer open (set a `lastOpenedAt` timestamp, count items newer than that). Simpler than per-item read tracking.

## Skills Discovered

No new skills needed. HeroUI Drawer documented via existing codebase patterns (3 drawer instances in ElementoEditor). Legend State pattern from MEM030.
