---
created: 2026-04-24
status: WIP — investigation in corso, M002 scope in ridefinizione
---

# M002 — Continue here

## Stato corrente

M002 è `active` nel DB ma **senza CONTEXT né ROADMAP reali** (M002-ROADMAP.md esiste ma è vuoto — solo header).

**Scope in ridefinizione** (conversazione 2026-04-24, non ancora scritta a CONTEXT):

- ❌ Non più "Backend Jazz cloud sync + auth reale + gruppi/permessi"
- ✅ Diventa **"Jazz local persistence — far funzionare davvero l'app offline"**

### Problema riportato dall'utente

> "l'applicazione ha lo stato non funzionante. non salva le proprietà dell'editor e integrazione jazz non corretta/completa. mi serve che funzioni offline per il momento."

L'ipotesi da verificare: `sync: { when: 'never' }` in `src/main.tsx` potrebbe impedire il flush su IndexedDB. Forse serve comunque un peer di sync (anche locale) perché Jazz persista.

## Cosa è stato fatto in questa sessione (WIP committed)

1. **Installato `playwright`** come devDependency per E2E debugging (`package.json`, `pnpm-lock.yaml`).
2. **Aggiunto hook diagnostico `window.__BB`** in `src/ui/workspace-home/workspace-ui-store.ts` dentro `syncJazzState()` — espone `me`, `rawCoMaps`, `domainElementi`, `rootDefined`, `workspaceDefined`, `elementiLen`, `accountId` al contesto browser per ispezione via Playwright. **Da rimuovere prima del merge finale** (è strumentazione).
3. **4 script E2E di investigazione** in `tests/` (non parte della suite Vitest):
   - `e2e-repro.mjs` — riproduce il flow login → nuovo elemento → ispeziona dialog
   - `e2e-persist.mjs` — login, crea, ricarica, verifica IndexedDB + localStorage
   - `e2e-inspect.mjs` — prova a importare il modulo store via Vite HMR
   - `e2e-inspect2.mjs` — usa `window.__BB` prima/dopo create
4. Report E2E in `.gsd/reports/` (inclusi per handoff).

## Cosa manca / prossimi passi

1. **Far girare almeno uno degli script E2E fino in fondo** con `pnpm dev` attivo e cattura output. Gli script assumono `localhost:5173`.
2. **Confermare il failure mode** con evidenza:
   - I commit dell'editor arrivano a toccare il CoMap (`elemento.adapter`)?
   - Dopo reload, `me.root.workspace.elementi` ha length 0 o preserva i dati?
   - Jazz ha un peer/storage attivo? (controllare `JazzProvider` in `src/main.tsx`)
3. **Testare l'ipotesi sync**: cambiare `sync: { when: 'never' }` con un peer locale (es. `wss://cloud.jazz.tools/?key=...` o peer WebSocket locale) e vedere se la persistenza cambia. Jazz docs: https://jazz.tools/docs
4. **Scrivere `M002-CONTEXT.md`** con lo scope ridefinito una volta confermato il failure mode.
5. **Pianificare milestone** (slices) dopo il context.

## File da leggere per orientarsi

- `src/main.tsx` — config JazzProvider
- `src/ui/workspace-home/workspace-ui-store.ts` — bridge Jazz ↔ Legend State, `syncJazzState()`
- `src/features/elemento/elemento.adapter.ts` — mutazioni CoMap (add, update, softDelete)
- `src/features/elemento/elemento.schema.ts` — CoMap schemas
- `.gsd/PROJECT.md` — architettura Jazz integration attuale

## Note operative per riprendere

```bash
git pull  # sull'altro PC, siamo 28 commit ahead di origin/main
pnpm install  # playwright è nuova dep
pnpm dev  # in un terminal
node tests/e2e-persist.mjs  # in un altro terminal
```

Il branch è `main` ed è **divergente** da `origin/main` (28 ahead, 1 behind) — al momento né push né pull sono stati fatti.
