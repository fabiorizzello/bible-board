# S04: Notification center iPad-native (bell + drawer + rollback)

**Goal:** Sostituire `toast(...)` ovunque con un notification center iPad-native: bell icon nel footer NavSidebar con badge pulse, drawer right HeroUI con lista mutazioni create/update/delete ordinate per ts desc, rollback inline su tutte le mutazioni con undoFn (update campo, link famiglia, link generico, fonte, soft-delete). Errori di sistema di ListPane diventano inline. `<Toast.Provider>` e ogni import `toast` rimossi. Store `notifications-store.ts` basato su Legend State con API `notifyMutation`/`rollback`/`clearAll` + hooks `useNotifications`/`useUnreadCount`/`useDrawerOpen`.
**Demo:** Click bell apre drawer da destra con lista create/update/delete di elementi/link/board/fonti; rollback funzionante; badge pulse+bell bounce su nuova entry; nessun toast residuo

## Must-Haves

- `rg 'toast\(' src/ui/ --glob='*.tsx' --glob='*.ts'` → 0 hit
- `rg 'Toast\.Provider' src/ui/` → 0 hit
- `rg 'from "@heroui/react"' src/ui/ | rg '\btoast\b|\bToast\b'` → 0 hit
- `<NotificationBell>` presente in NavSidebar footer (tra Impostazioni e ThemeSwitcher), touch target ≥44×44px, aria-label dinamico
- `<NotificationDrawer>` HeroUI Drawer placement="right", max-w-[420px], apre da bell e mostra lista mutazioni ordinate newest-first
- Rollback inline su ogni riga con `undoFn` non-null → click "Annulla" esegue undoFn e segna `undone: true` (mostra "Annullato")
- Store unit test suite verde: notifyMutation ordering, rollback idempotency, unread count, clearAll
- `pnpm test --run` verde (141+ test, >= 6 nuovi)
- `pnpm tsc --noEmit` clean
- Blur senza modifica non genera entry (verificato via wiring useFieldStatus.onCommit)
- `prefers-reduced-motion` rispettato su pulse badge e bell bounce

## Proof Level

- This slice proves: integration — la slice attraversa: store puro (unit-testabile), componenti UI (rendering + interaction), integrazione con siti di mutazione esistenti (ElementoEditor, DetailPane, NavSidebar) e rimozione di un canale legacy (Toast). Il test-suite copre il contratto della store; la verifica di integrazione è manuale + rg scans + tsc. Non richiediamo browser e2e per questa slice — S07 eseguirà il pass ui-ux-pro-max finale end-to-end.

## Integration Closure

Closure contracts:
- **S03→S04**: `useFieldStatus.onCommit(prev, next)` è già cablato in InlineTitle, DescrizioneSection, TipoChip (press-commit via justCommitted). In S04 il body di `commitPatch` in ElementoEditor, invocato da onCommit, emette `notifyMutation('update', label, undoFn)` invece di `toast(...)`. Nessuna modifica al hook.
- **S04→S06**: notification center è il canale naturale per errori sync emersi durante audit Jazz. S06 potrà estendere la store con `notifyError` se serve, ma S04 non blocca quella decisione.
- **S04→S07**: tutti i nuovi componenti devono superare ui-ux-pro-max finale. Rispettano già: touch ≥44px, opacity/transform only, prefers-reduced-motion, aria-label.
Threat surface: in-memory only, no persistence, undoFn captures closures che referenziano Elemento/Board refs Jazz — verificare che undoFn non lanci se l'elemento è stato nel frattempo hard-deleted (Result pattern gestisce già).
Requirement impact: R051, R052 completamente delivered. R053/R054 toccati parzialmente (focus ring bell, transitions opacity-only) ma owned da S05.

## Verification

- La bell+drawer È il canale di osservabilità principale per mutazioni utente. Ogni notifica è un event log persistito in memoria per la sessione: tipo, label, ts, stato undone. Per debug durante sviluppo la store espone `notifications$` a module scope — ispezionabile da devtools. Non aggiungere console.log nelle write API: il drawer stesso è la superficie diagnostica. Errori di mutazione (fallimenti adapter) NON finiscono nel drawer in S04 — restano gestiti dai siti di chiamata (ListPane inline error, ElementoEditor no-op su Result.err). Future evoluzioni potrebbero aggiungere un canale "errori" separato ma è fuori scope.

## Tasks

- [x] **T01: Create notifications-store.ts con Legend State observable, API scrittura/rollback/clear, hooks lettura, e suite di unit test** `est:S`
  Creare la store di notifiche in-memory come singleton Legend State, seguendo esattamente il pattern di `workspace-ui-store.ts` (module-level observable + thin wrapper functions + `useSelector` per lettura). La store è pura — nessuna dipendenza da Jazz, HeroUI, o adapter. Esporre il tipo `Notifica` come discriminated-union-friendly record con `{ id, tipo: 'create'|'update'|'delete', label, ts, undone, undoFn }`. Scrivere la suite di unit test prima del wiring UI: garantisce che la store funzioni in isolamento.

API richieste (esatta):
- `notifyMutation(tipo, label, undoFn?): string` — crea id via `crypto.randomUUID()`, inserisce in testa (newest first), ritorna l'id.
- `rollback(id): void` — se item esiste, non è già undone, e ha undoFn: invoca undoFn(), setta `undone: true`. Idempotente.
- `clearAll(): void` — svuota la lista.
- `markRead(id): void` — presente come stub (mantenere per futuro, body vuoto accettato).
- `notificationsUi$.drawerOpen` — osservabile separato per lo stato del drawer.
- Hooks: `useNotifications()` ritorna array ordinato; `useUnreadCount()` conta `!undone`; `useDrawerOpen()` ritorna boolean.

Unread count decision: count di `!undone` entries. Clear-on-open sarà gestito successivamente da un `lastOpenedAt` timestamp se richiesto — non necessario nella store v1.

Test suite (Vitest) in `src/ui/workspace-home/__tests__/notifications-store.test.ts`:
- notifyMutation inserisce entry in testa (newest first) con tipo/label/ts/undone=false
- notifyMutation ritorna un id unico
- notifyMutation senza undoFn → entry con undoFn=null (rollback no-op)
- rollback chiama undoFn esattamente una volta e setta undone=true
- rollback su id inesistente → no-op, nessun throw
- rollback su entry già undone → undoFn NON richiamato (idempotent)
- useUnreadCount riflette count di !undone dopo notifyMutation + rollback
- clearAll svuota la lista

Nessuna UI in questo task. Deve importare SOLO da `@legendapp/state` e `@legendapp/state/react`. Niente `observer()`, niente `use$()` (MEM030).
  - Files: `src/ui/workspace-home/notifications-store.ts`, `src/ui/workspace-home/__tests__/notifications-store.test.ts`
  - Verify: pnpm test --run src/ui/workspace-home/__tests__/notifications-store.test.ts → tutti i test verdi (8 scenari). pnpm tsc --noEmit → clean. rg 'observer\(|use\$\(' src/ui/workspace-home/notifications-store.ts → 0 hit.

- [x] **T02: Implementare <NotificationBell> e <NotificationDrawer> con HeroUI; integrare bell nel footer di NavSidebar** `est:M`
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
  - Files: `src/ui/workspace-home/NotificationBell.tsx`, `src/ui/workspace-home/NotificationDrawer.tsx`, `src/ui/workspace-home/NavSidebar.tsx`
  - Verify: pnpm tsc --noEmit → clean. pnpm test --run → 141+ verdi (no regressions). rg -n 'NotificationBell' src/ui/workspace-home/NavSidebar.tsx → 1 hit nel footer row. rg 'width|height' src/ui/workspace-home/NotificationBell.tsx src/ui/workspace-home/NotificationDrawer.tsx | rg 'transition|animate' → 0 hit (solo opacity/transform). rg 'h-\[44px\]\s+w-\[44px\]' src/ui/workspace-home/NotificationBell.tsx → presente.

- [x] **T03: Rimpiazzare tutti i toast in ElementoEditor con notifyMutation; rimuovere toast non-mutation** `est:M`
  Migrare 6 siti di mutazione da `toast(...)` a `notifyMutation(tipo, label, undoFn)`. La logica di rollback esistente (già presente come `actionProps.onPress`) diventa l'argomento `undoFn` di notifyMutation — la closure è identica. Rimuovere 2 toast che non sono mutazioni.

**Siti di UPDATE (tipo='update'):**
- Linea ~412 — `commitPatch` toast(label, ...). Sostituire con `notifyMutation('update', label, () => { normalizeElementoInput(buildElementoInput(prevElement)).match(ok => updateWorkspaceElemento(jazzRef, ok).match(...)) })` — la lambda è esattamente quella corrente in actionProps.onPress (estrarre verbatim).

**Siti di CREATE (tipo='create'):**
- Linea ~511 — `toast('Collegamento famiglia aggiunto', ...)` → `notifyMutation('create', 'Collegamento famiglia aggiunto', existingActionOnPress)`.
- Linea ~534 — `toast('Collegamento aggiunto', ...)` → `notifyMutation('create', 'Collegamento aggiunto', existingActionOnPress)`.
- Linea ~575 — `toast('Fonte aggiunta', ...)` → `notifyMutation('create', 'Fonte aggiunta', existingActionOnPress)`.

**Siti di DELETE (tipo='delete'):**
- Linea ~549 — `toast('Collegamento rimosso', ...)` → `notifyMutation('delete', 'Collegamento rimosso', existingActionOnPress)`.
- Linea ~605 — `toast('Fonte rimossa', ...)` → `notifyMutation('delete', 'Fonte rimossa', existingActionOnPress)`.

**Toast da rimuovere (non-mutation):**
- Linea ~935 — `toast('Duplicazione rimandata a una fase successiva', ...)` — è uno stub. Rimuovere l'intera call (il bottone non deve mostrare nulla).
- Linea ~1186 — `toast('Usa solo anni interi positivi', ...)` — è un errore di validazione input. Lasciare inline: convertire in un `setFieldError('Usa solo anni interi positivi')` locale oppure rimuovere e lasciare che il parse zod mostri errore tramite FieldError del form (preferibile: eliminare la call, la UX esistente del form ha già FieldError).

**Pulizia import:**
- Rimuovere `toast` dall'import `@heroui/react` in ElementoEditor.tsx (mantenere gli altri identifier).
- Aggiungere `import { notifyMutation } from './notifications-store';`.

Le 6 migrazioni preservano l'intento di ogni actionProps.onPress corrente — l'undoFn non deve lanciare (se l'elemento è stato hard-deleted nel frattempo, il Result.match gestisce già con un branch err no-op, come fa oggi).
  - Files: `src/ui/workspace-home/ElementoEditor.tsx`
  - Verify: rg -n 'toast\(' src/ui/workspace-home/ElementoEditor.tsx → 0 hit. rg -n 'notifyMutation' src/ui/workspace-home/ElementoEditor.tsx → 6 hit. rg -n 'from "\./notifications-store"' src/ui/workspace-home/ElementoEditor.tsx → 1 hit. pnpm tsc --noEmit → clean. pnpm test --run → 141+ verdi (no regressions). Manual smoke: editare un Elemento (titolo/descrizione/tipo) → drawer mostra entry 'update' con rollback funzionante.

- [ ] **T04: Migrare DetailPane soft-delete; convertire errori ListPane in inline; rimuovere Toast.Provider** `est:S`
  Completare la rimozione di tutti i toast. Tre siti distinti:

**DetailPane.tsx (~linea 58)** — soft-delete toast:
- Sostituire `toast("<...> eliminato", { action: { onPress: () => restoreElement(id) }, timeout: 30000 })` con `notifyMutation('delete', `"${titolo}" eliminato`, () => restoreElement(elementId))`.
- Rimuovere import `toast` da `@heroui/react`.
- Aggiungere `import { notifyMutation } from './notifications-store'`.
- Nota timeout 30s originale: non serve più. Il drawer mantiene l'entry finché la sessione è attiva (coerente con R051 "in-memory per sessione").

**ListPane.tsx (linee 120, 140)** — errori sistema:
- Linea 120 `toast("Account non disponibile", ...)`: NON diventa notifyMutation (non è una mutazione). Convertire in inline error vicino al punto di azione (top della lista o dentro il creation button area). Pattern: aggiungere uno state locale `const [systemError, setSystemError] = useState<string | null>(null)`, settare in setSystemError('Account non disponibile') al posto del toast, renderizzare `{systemError && <p className="text-danger text-sm px-3 py-2">{systemError}</p>}` sopra la lista. Auto-dismiss dopo 5s via setTimeout se desiderato — accettabile anche persistente finché l'utente non agisce.
- Linea 140 `toast(`Errore creazione: ${error.type}`, ...)`: stessa strategia — setSystemError(`Errore creazione: ${error.type}`).
- Rimuovere import `toast`.

**WorkspacePreviewPage.tsx** — rimozione provider:
- Rimuovere `<Toast.Provider placement="bottom end" />` (~linea 142) e aggiornare/rimuovere il commento doc (~linee 11-12) che lo descrive.
- Rimuovere `Toast` dall'import `@heroui/react`.

**Verifica finale cross-file:**
- `rg 'toast\(' src/ui/` → 0 hit
- `rg 'Toast\.Provider' src/ui/` → 0 hit
- `rg '\btoast\b|\bToast\b' src/ui/ --glob='*.tsx' --glob='*.ts' | rg -v 'notifications-store|Annotazioni'` → 0 hit import dagli hero
- `rg 'notifyMutation' src/ui/` → 7+ hit totali (6 ElementoEditor + 1 DetailPane)
  - Files: `src/ui/workspace-home/DetailPane.tsx`, `src/ui/workspace-home/ListPane.tsx`, `src/ui/workspace-home/WorkspacePreviewPage.tsx`
  - Verify: rg 'toast\(' src/ui/ → 0 hit. rg 'Toast\.Provider' src/ui/ → 0 hit. rg -n 'notifyMutation' src/ui/workspace-home/DetailPane.tsx → 1 hit. pnpm tsc --noEmit → clean. pnpm test --run → 141+ verdi. pnpm build → clean. Manual smoke: soft-delete un Elemento dal DetailPane → drawer mostra entry delete con Annulla; click Annulla → elemento ripristinato. Triggerare errore creazione senza account → inline error in ListPane.

## Files Likely Touched

- src/ui/workspace-home/notifications-store.ts
- src/ui/workspace-home/__tests__/notifications-store.test.ts
- src/ui/workspace-home/NotificationBell.tsx
- src/ui/workspace-home/NotificationDrawer.tsx
- src/ui/workspace-home/NavSidebar.tsx
- src/ui/workspace-home/ElementoEditor.tsx
- src/ui/workspace-home/DetailPane.tsx
- src/ui/workspace-home/ListPane.tsx
- src/ui/workspace-home/WorkspacePreviewPage.tsx
