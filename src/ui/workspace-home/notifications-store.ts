/**
 * notifications-store — Legend State observable for in-session mutation notifications.
 *
 * Module-level singleton (not React context). Pure in-memory — no Jazz deps.
 * Write API: notifyMutation / rollback / clearAll / markRead (stub)
 * Read hooks: useNotifications / useUnreadCount / useDrawerOpen
 *
 * MEM030: useSelector only — never observer HOC, never use-dollar hook
 * MEM040: no Jazz CoMap refs inside the observable
 *
 * undoFn functions are kept in a backing Map (not in the observable) to avoid
 * Legend State recursively traversing function objects during array diffing,
 * which causes a "Maximum call stack size exceeded" error. Same pattern as
 * workspace-ui-store keeping Jazz refs outside the observable.
 */

import { observable } from "@legendapp/state";
import { useSelector } from "@legendapp/state/react";

export type NotificaTipo = "create" | "update" | "delete";

// Stored in the observable — plain scalars only
interface NotificaStored {
  id: string;
  tipo: NotificaTipo;
  label: string;
  ts: number;
  undone: boolean;
}

// Public type — includes undoFn merged from the backing Map at read time
export interface Notifica extends NotificaStored {
  undoFn: (() => void) | null;
}

interface NotificationsState {
  items: NotificaStored[];
}

interface NotificationsUiState {
  drawerOpen: boolean;
}

// Functions are NOT stored inside the observable — keeps Legend State
// from traversing function prototypes during array diff/delete operations
const _undoFns = new Map<string, () => void>();

// Exported for devtools inspection — do not mutate directly in app code
export const notifications$ = observable<NotificationsState>({ items: [] });
export const notificationsUi$ = observable<NotificationsUiState>({ drawerOpen: false });

// ── Write API ──

export function notifyMutation(
  tipo: NotificaTipo,
  label: string,
  undoFn: (() => void) | null = null,
): string {
  const id = crypto.randomUUID();
  if (undoFn) _undoFns.set(id, undoFn);
  const stored: NotificaStored = { id, tipo, label, ts: Date.now(), undone: false };
  notifications$.items.set([stored, ...notifications$.items.peek()]);
  return id;
}

export function rollback(id: string): void {
  const items = notifications$.items.peek();
  const idx = items.findIndex((n) => n.id === id);
  if (idx === -1) return;
  const item = items[idx];
  if (item.undone || !_undoFns.has(id)) return;
  _undoFns.get(id)!();
  notifications$.items[idx].undone.set(true);
}

// stub — badge is count-based; per-item read tracking deferred to future iteration
export function markRead(_id: string): void {}

export function clearAll(): void {
  notifications$.items.set([]);
  _undoFns.clear();
}

// ── Read hooks ──

export function useNotifications(): Notifica[] {
  return useSelector(() =>
    notifications$.items.get().map((item) => ({
      ...item,
      undoFn: _undoFns.get(item.id) ?? null,
    })),
  );
}

export function useUnreadCount(): number {
  return useSelector(() => notifications$.items.get().filter((n) => !n.undone).length);
}

export function useDrawerOpen(): boolean {
  return useSelector(notificationsUi$.drawerOpen);
}
