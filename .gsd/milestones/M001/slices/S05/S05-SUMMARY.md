---
id: S05
parent: M001
milestone: M001
provides:
  - (none)
requires:
  []
affects:
  []
key_files:
  - ["src/ui/workspace-home/NavSidebar.tsx", "src/ui/workspace-home/workspace-ui-store.ts", "src/features/board/board.adapter.ts", "src/ui/workspace-home/display-helpers.ts", "src/ui/workspace-home/ListPane.tsx"]
key_decisions:
  - ["S05 era un ghost slice duplicato di S04 — T01 era solo verifica, nessun nuovo codice", "Timeline D3 (R010) è stata assegnata e consegnata da S06, non S05", "R008 e R009 validati in S04 rimangono validi — nessuna regressione"]
patterns_established:
  - (none)
observability_surfaces:
  - none
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-04-23T12:21:52.766Z
blocker_discovered: false
---

# S05: Board CRUD + ricerca cross-view — verifica carry-forward da S04

**S05 è stato un ghost slice: T01 ha confermato che S04 ha già consegnato Board CRUD (R008) e ricerca cross-view (R009) — nessun nuovo codice, 126/126 test pass, tsc clean.**

## What Happened

## Contesto

S05 era stato pianificato come "Timeline D3 SVG" ma il suo piano effettivo conteneva gli stessi requisiti di S04 (Board CRUD + ricerca cross-view). La timeline D3 è stata consegnata da S06. S05 è risultato un **ghost slice** — un duplicato di S04 con un unico task di verifica (T01).

## Cosa è successo

**T01 — Board CRUD + ricerca cross-view (verifica carry-forward)**

S05/T01 è stata una pass di verifica, non un'implementazione. Ha confermato che S04 aveva già consegnato tutti i criteri di accettazione di R008 e R009:

- **R008 (Board CRUD):** `NavSidebar.tsx` espone creazione (modal AlertDialog + form), rinomina inline (input trasparente con Enter/Escape/blur), eliminazione con conferma (AlertDialog). Le tre operazioni chiamano `workspace-ui-store.ts` → `board.adapter.ts` → `board.rules.ts` → mutazione Jazz CoMap. Risultati `Result<T, BoardError>` da neverthrow.

- **R009 (Ricerca cross-view):** `display-helpers.ts` esporta `isElementMatchingSearch(el, query)` (substring case-insensitive su titolo, descrizione, tags) e `getElementsForView(viewId, filterText, activeTipo)`. `ListPane.tsx` monta un `SearchField` HeroUI legato a `filterText` in Legend State. La ricerca funziona su tutte le viste (recenti, tutti, board-X).

- **Sort:** `sortElementi(elementi, sortBy, sortDir)` funzione pura che supporta titolo/data/tipo × asc/desc.

Nessun codice nuovo scritto in S05. La verifica ha confermato 126/126 test passati e `tsc --noEmit` senza errori.

## Pattern stabiliti da S04 (documentati in S05)

- `ViewId` come template literal type (`"recenti" | "tutti" | \`board-${string}\``) — unico discriminante per la vista attiva.
- `isElementMatchingSearch` esportata come funzione pura da `display-helpers.ts` — testabile senza Jazz runtime.
- Rename inline HeroUI: `<input>` trasparente sovrapposto al testo, non `HeroUI Input` (che introduce padding/border inattesi).
- `syncJazzBoards` bump pattern: mutare `workspace.boards` per triggerare re-render React da Jazz CoList.

## Nota per il prossimo slice (S06/S07)

S06 ha già consegnato la timeline D3 (R010 validato). S07 deve completare il polish iPad-native e il passaggio UAT end-to-end.

## Verification

**T01 PASS** — verifica carry-forward:
- `npm test -- --run`: 5 file, 126/126 test, exit 0 (643ms)
- `npx tsc --noEmit`: 0 errori (8000ms)
- R008: Board CRUD (create/rename/delete) presente in NavSidebar.tsx + board.adapter.ts + workspace-ui-store.ts
- R009: isElementMatchingSearch + getElementsForView presenti in display-helpers.ts; SearchField in ListPane.tsx
- Nessun nuovo codice introdotto in S05

## Requirements Advanced

None.

## Requirements Validated

- R008 — S05/T01 verifica carry-forward: Board CRUD (create/rename/delete) presente e funzionante in NavSidebar.tsx + board.adapter.ts. 126/126 test pass, tsc clean. Originalmente validato in S04.
- R009 — S05/T01 verifica carry-forward: isElementMatchingSearch + getElementsForView in display-helpers.ts, SearchField in ListPane.tsx. 126/126 test pass. Originalmente validato in S04.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

S05 era pianificato come "Timeline D3 SVG" ma il piano effettivo conteneva Board CRUD + ricerca (stessi requisiti di S04). La timeline D3 è stata consegnata da S06. S05 si è risolto in una sola pass di verifica senza nuovo codice.

## Known Limitations

Nessuna limitazione — S05 non ha introdotto nuove funzionalità. La timeline D3 (obiettivo originale del nome S05) è in S06.

## Follow-ups

S07 deve completare il polish iPad-native e superare lo scenario UAT end-to-end (R011).

## Files Created/Modified

None.
