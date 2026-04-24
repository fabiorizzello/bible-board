---
id: T02
parent: S04
milestone: M007
key_files:
  - src/ui/workspace-home/NotificationDrawer.tsx
  - src/ui/workspace-home/NotificationBell.tsx
  - src/ui/workspace-home/NavSidebar.tsx
key_decisions:
  - HeroUI Drawer controlled via isOpen/onOpenChange on root Drawer (extends DialogTrigger from react-aria-components) — same pattern as AlertDialog in codebase
  - Badge pulse triggered by key={unread} remount so Tailwind animate class fires fresh on each new notification
  - Bell bounce driven by useEffect + setTimeout class toggle (JS-side) guarded by window.matchMedia for reduced-motion, complementing the global CSS suppression in tokens.css
  - NotificationDrawer co-located inside NotificationBell fragment — bell owns its drawer rather than mounting at NavSidebar level
duration: 
verification_result: passed
completed_at: 2026-04-24T10:29:51.546Z
blocker_discovered: false
---

# T02: Built NotificationBell and NotificationDrawer components with HeroUI Drawer (placement=right, max-w-[420px]), badge pulse and bell bounce animations with prefers-reduced-motion guard, and integrated bell into NavSidebar footer between Impostazioni and ThemeSwitcher

**Built NotificationBell and NotificationDrawer components with HeroUI Drawer (placement=right, max-w-[420px]), badge pulse and bell bounce animations with prefers-reduced-motion guard, and integrated bell into NavSidebar footer between Impostazioni and ThemeSwitcher**

## What Happened

Created two new components wired to the notifications-store built in T01.

**NotificationDrawer.tsx**: Controlled via `notificationsUi$.drawerOpen` using the HeroUI `Drawer` compound component tree (`Drawer > Backdrop isDismissable > Content placement="right" > Dialog > Header/Body`). The body renders an Italian empty state ("Nessuna attività recente") or maps items to inline `NotificaRow` components. Each row shows a lucide icon per tipo (Plus/Pencil/Trash2), the label, a relative timestamp formatted in Italian ("ora", "1 min fa", "N min fa", "HH:mm"), an "Annullato" badge when undone, or an "Annulla" Button when undoFn is present and not yet undone. `rollback(id)` from the store is called on press.

**NotificationBell.tsx**: 44×44px ghost icon-only Button with a Bell icon. When `unread > 0`, renders a `key={unread}`-remounted absolutely-positioned 8×8 accent dot badge. The `key` remount triggers the `animate-[pulse_300ms_ease-out]` Tailwind animation on each new unread count. Bell bounce is driven by a `useEffect` watching `items.length`: when the count increases, a `animate-[bounce_150ms_ease-out_1]` class is added and removed after 200ms via `setTimeout`, guarded by `window.matchMedia("(prefers-reduced-motion: reduce)")`. The component mounts `<NotificationDrawer />` as a sibling inside the same fragment (co-location pattern). Dynamic `aria-label` switches between "Notifiche" and "Notifiche, N nuove".

**NavSidebar.tsx**: Added import for `NotificationBell` and inserted `<NotificationBell />` between the Impostazioni button and `<ThemeSwitcher />` in the footer row.

No animation uses `width`, `height`, `top`, or `left` — only `opacity`/`transform` via Tailwind's animate keyframes. The global `@media (prefers-reduced-motion: reduce)` rule in `tokens.css` suppresses all CSS animations at the OS level; the JS guard prevents the unnecessary class toggling too.

HeroUI Drawer API discovery: `DrawerRootProps` extends `ComponentPropsWithRef<typeof DialogTrigger>` from react-aria-components, so `isOpen`/`onOpenChange` are passed to the root `<Drawer>` component exactly like `AlertDialog` in the codebase.

## Verification

pnpm tsc --noEmit → clean (0 errors). pnpm test --run → 150 passing, 0 regressions. rg -n 'NotificationBell' NavSidebar.tsx → 2 hits (import + footer usage). rg 'h-[44px] w-[44px]' NotificationBell.tsx → present. rg 'width|height' Bell+Drawer | rg 'transition|animate' → 0 hits (no layout-thrashing transitions).

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm tsc --noEmit` | 0 | ✅ pass | 8200ms |
| 2 | `pnpm test --run` | 0 | ✅ pass — 150 tests green | 705ms |
| 3 | `rg -n 'NotificationBell' src/ui/workspace-home/NavSidebar.tsx` | 0 | ✅ pass — import line + footer usage | 50ms |
| 4 | `rg 'h-\[44px\] w-\[44px\]' src/ui/workspace-home/NotificationBell.tsx` | 0 | ✅ pass — present on button className | 40ms |
| 5 | `rg 'width|height' src/ui/workspace-home/NotificationBell.tsx src/ui/workspace-home/NotificationDrawer.tsx | rg 'transition|animate'` | 1 | ✅ pass — 0 hits (no width/height in animations) | 45ms |

## Deviations

none

## Known Issues

none

## Files Created/Modified

- `src/ui/workspace-home/NotificationDrawer.tsx`
- `src/ui/workspace-home/NotificationBell.tsx`
- `src/ui/workspace-home/NavSidebar.tsx`
