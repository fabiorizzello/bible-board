import { useEffect, useRef, useState } from "react";
import { Button, Tooltip } from "@heroui/react";
import { Bell } from "lucide-react";

import { notificationsUi$, useNotifications, useUnreadCount } from "./notifications-store";
import { NotificationDrawer } from "./NotificationDrawer";

export function NotificationBell(): React.ReactElement {
  const unread = useUnreadCount();
  const items = useNotifications();
  const [bellBounce, setBellBounce] = useState(false);
  const prevLengthRef = useRef(items.length);

  useEffect(() => {
    const prev = prevLengthRef.current;
    prevLengthRef.current = items.length;

    if (items.length > prev) {
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!prefersReduced) {
        setBellBounce(true);
        const t = setTimeout(() => setBellBounce(false), 200);
        return () => clearTimeout(t);
      }
    }
  }, [items.length]);

  const ariaLabel = unread > 0 ? `Notifiche, ${unread} nuove` : "Notifiche";

  return (
    <>
      <Tooltip>
        <Button
          variant="ghost"
          isIconOnly
          className={`h-[44px] w-[44px] rounded-lg text-ink-dim hover:bg-primary/6 relative${bellBounce ? " animate-[bounce_150ms_ease-out_1]" : ""}`}
          aria-label={ariaLabel}
          onPress={() => notificationsUi$.drawerOpen.set(true)}
        >
          <Bell className="h-3.5 w-3.5" />
          {unread > 0 && (
            <span
              key={unread}
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent animate-[pulse_300ms_ease-out]"
              aria-hidden="true"
            />
          )}
        </Button>
        <Tooltip.Content>Notifiche</Tooltip.Content>
      </Tooltip>
      <NotificationDrawer />
    </>
  );
}
