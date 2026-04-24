---
estimated_steps: 10
estimated_files: 3
skills_used: []
---

# T02: Implementare <NotificationBell> e <NotificationDrawer> con HeroUI; integrare bell nel footer di NavSidebar

Costruire i componenti UI che leggono dalla store creata in T01 e integrarli nel chrome della workspace. Nessun mutation site viene toccato in questo task — verrà cablato in T03/T04. Il drawer deve renderizzare correttamente una lista vuota (empty state) e una lista con entry fake (iniettate manualmente via notifyMutation da devtools per smoke test).

**File nuovi:**
- `src/ui/workspace-home/NotificationDrawer.tsx` — componente che usa `Drawer.Backdrop > Drawer.Content > Drawer.Dialog` di HeroUI, placement='right', `max-w-[420px]`. Apre/chiude legge/scrive `notificationsUi$.drawerOpen` via `useDrawerOpen()` + `.set()`. Body: se `items.length === 0` mostra empty state italiano ("Nessuna attività recente"), altrimenti mappa a `<NotificaRow>`. `<NotificaRow>` è inline nel file: icon per tipo (Plus/Pencil/Trash da lucide-react), label, ts relativo (helper locale `formatRelativeTime(ts)` con i18n italiano: "ora", "1 min fa", "5 min fa", "HH:mm"), bottone "Annulla" quando `undoFn && !undone`, badge "Annullato" quando `undone`. Il bottone "Annulla" chiama `rollback(id)` dalla store.
- `src/ui/workspace-home/NotificationBell.tsx` — componente con HeroUI `<Button variant='ghost' isIconOnly>` di 44×44px, icon `<Bell>` da lucide-react, badge visivo (span absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent) SOLO quando `unread > 0`. aria-label dinamico: `Notifiche, N nuove` oppure `Notifiche`. onPress chiama `notificationsUi$.drawerOpen.set(true)`. Monta `<NotificationDrawer>` come sibling (co-locato nello stesso render tree oppure in NavSidebar — scegliere co-location nel Bell). Tooltip opzionale seguendo il pattern degli altri button footer.

Animazioni:
- Badge pulse: classe Tailwind arbitraria `animate-[pulse_300ms_ease-out]` applicata al badge quando compare (key/remount alla variazione di unread). Suppresso sotto `@media (prefers-reduced-motion: reduce)` → aggiungere override in `tokens.css` se non già coperto, oppure check inline via `window.matchMedia('(prefers-reduced-motion: reduce)').matches` come fa `useFieldStatus` (pattern S03).
- Bell bounce: trigger su new entry arrivata — usare `useEffect(() => { ... }, [items.length])` per settare una classe temporanea `animate-[bounce_150ms_ease-out_1]` per 200ms poi rimuoverla. Anche questa soppressa da prefers-reduced-motion.
- SOLO opacity/transform. MAI width/height. (CLAUDE.md Principio IX.)

**File modificato:** `src/ui/workspace-home/NavSidebar.tsx` — inserire `<NotificationBell />` nella row `flex items-center gap-1` del footer, TRA il bottone "Impostazioni" e `<ThemeSwitcher />`. Nessuna altra modifica.

Verifica manuale (smoke): in devtools, chiamare `import('path').then(m => m.notifyMutation('update', 'Test'))` → la bell mostra badge, click su bell → drawer apre da destra con l'entry.

## Inputs

- ``src/ui/workspace-home/notifications-store.ts``
- ``src/ui/workspace-home/NavSidebar.tsx``
- ``src/ui/workspace-home/ElementoEditor.tsx``
- ``src/styles/tokens.css``
- ``.gsd/milestones/M007/slices/S04/S04-RESEARCH.md``

## Expected Output

- ``src/ui/workspace-home/NotificationBell.tsx``
- ``src/ui/workspace-home/NotificationDrawer.tsx``
- ``src/ui/workspace-home/NavSidebar.tsx``

## Verification

pnpm tsc --noEmit → clean. pnpm test --run → 141+ verdi (no regressions). rg -n 'NotificationBell' src/ui/workspace-home/NavSidebar.tsx → 1 hit nel footer row. rg 'width|height' src/ui/workspace-home/NotificationBell.tsx src/ui/workspace-home/NotificationDrawer.tsx | rg 'transition|animate' → 0 hit (solo opacity/transform). rg 'h-\[44px\]\s+w-\[44px\]' src/ui/workspace-home/NotificationBell.tsx → presente.

## Observability Impact

Il drawer è la superficie diagnostica primaria per l'utente. aria-label dinamico sulla bell assicura screen reader support (`Notifiche, 3 nuove`). Nessun logging runtime aggiunto — la store è già la source of truth.
