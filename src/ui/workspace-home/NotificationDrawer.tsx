import { Button, Drawer } from "@heroui/react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import {
  notificationsUi$,
  rollback,
  useDrawerOpen,
  useNotifications,
} from "./notifications-store";
import type { Notifica, NotificaTipo } from "./notifications-store";

function formatRelativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "ora";
  if (diff < 120) return "1 min fa";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} min fa`;
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

const TIPO_ICON: Record<NotificaTipo, React.ReactElement> = {
  create: <Plus className="h-3.5 w-3.5" />,
  update: <Pencil className="h-3.5 w-3.5" />,
  delete: <Trash2 className="h-3.5 w-3.5" />,
};

function NotificaRow({ n }: { n: Notifica }): React.ReactElement {
  return (
    <div
      role="listitem"
      className="flex items-start gap-3 py-2.5 px-4 border-b border-primary/6 last:border-0"
    >
      <span className="mt-0.5 flex-shrink-0 text-ink-dim" aria-hidden="true">
        {TIPO_ICON[n.tipo]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-ink-hi truncate">{n.label}</p>
        <p className="text-[11px] text-ink-dim mt-0.5">{formatRelativeTime(n.ts)}</p>
      </div>
      {n.undone ? (
        <span className="flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary">
          Annullato
        </span>
      ) : n.undoFn ? (
        <Button
          variant="ghost"
          className="flex-shrink-0 text-[12px] text-ink-lo hover:text-primary h-auto px-2 py-1 min-h-0"
          onPress={() => rollback(n.id)}
        >
          Annulla
        </Button>
      ) : null}
    </div>
  );
}

export function NotificationDrawer(): React.ReactElement {
  const drawerOpen = useDrawerOpen();
  const items = useNotifications();

  return (
    <Drawer
      isOpen={drawerOpen}
      onOpenChange={(open) => notificationsUi$.drawerOpen.set(open)}
    >
      <Drawer.Backdrop isDismissable>
        <Drawer.Content placement="right" className="max-w-[420px]">
          <Drawer.Dialog aria-label="Centro notifiche">
            <Drawer.Header className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
              <Drawer.Heading className="font-heading text-[15px] font-semibold text-ink-hi">
                Attività
              </Drawer.Heading>
              <Drawer.CloseTrigger className="rounded-lg h-[44px] w-[44px] flex items-center justify-center text-ink-dim hover:bg-primary/6">
                <X className="h-4 w-4" />
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Drawer.Body className="overflow-y-auto p-0">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <p className="text-[14px] text-ink-dim">Nessuna attività recente</p>
                </div>
              ) : (
                <div role="list" aria-label="Notifiche recenti">
                  {items.map((n) => (
                    <NotificaRow key={n.id} n={n} />
                  ))}
                </div>
              )}
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
