---
estimated_steps: 19
estimated_files: 2
skills_used: []
---

# T01: Create notifications-store.ts con Legend State observable, API scrittura/rollback/clear, hooks lettura, e suite di unit test

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

## Inputs

- ``src/ui/workspace-home/workspace-ui-store.ts``
- ``.gsd/milestones/M007/slices/S04/S04-RESEARCH.md``

## Expected Output

- ``src/ui/workspace-home/notifications-store.ts``
- ``src/ui/workspace-home/__tests__/notifications-store.test.ts``

## Verification

pnpm test --run src/ui/workspace-home/__tests__/notifications-store.test.ts → tutti i test verdi (8 scenari). pnpm tsc --noEmit → clean. rg 'observer\(|use\$\(' src/ui/workspace-home/notifications-store.ts → 0 hit.

## Observability Impact

La store stessa è il canale di osservabilità per mutazioni. Esposizione a module scope dell'observable `notifications$` è accettabile per devtools. No console.log nelle write API — il drawer è la superficie utente.
