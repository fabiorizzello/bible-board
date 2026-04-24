---
estimated_steps: 17
estimated_files: 1
skills_used: []
---

# T03: Rimpiazzare tutti i toast in ElementoEditor con notifyMutation; rimuovere toast non-mutation

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

## Inputs

- ``src/ui/workspace-home/ElementoEditor.tsx``
- ``src/ui/workspace-home/notifications-store.ts``
- ``.gsd/milestones/M007/slices/S04/S04-RESEARCH.md``

## Expected Output

- ``src/ui/workspace-home/ElementoEditor.tsx``

## Verification

rg -n 'toast\(' src/ui/workspace-home/ElementoEditor.tsx → 0 hit. rg -n 'notifyMutation' src/ui/workspace-home/ElementoEditor.tsx → 6 hit. rg -n 'from "\./notifications-store"' src/ui/workspace-home/ElementoEditor.tsx → 1 hit. pnpm tsc --noEmit → clean. pnpm test --run → 141+ verdi (no regressions). Manual smoke: editare un Elemento (titolo/descrizione/tipo) → drawer mostra entry 'update' con rollback funzionante.

## Observability Impact

Ogni mutazione passa ora attraverso notifyMutation. Nessun log aggiuntivo: la entry nel drawer è l'evento. L'undoFn cattura closure su prevElement — se la capture era già corretta per toast, lo è anche per notifyMutation (codice identico).
