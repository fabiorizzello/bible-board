---
id: S04
parent: M001
milestone: M001
provides:
  - (none)
requires:
  []
affects:
  []
key_files:
  - (none)
key_decisions:
  - ["Boards stored as co.list(BoardSchema) (first-class Jazz CoMaps) in WorkspaceSchema — not string ID list. Allows inline resolution and CRDT ownership.", "ViewId uses template literal `board-${string}` to support unbounded Jazz-generated IDs; boardId extracted by stripping prefix in getElementsForView.", "NavSidebar board rows use custom divs (not HeroUI ListBox) to enable inline rename — ListBox intercepts focus/keyboard events incompatibly.", "syncJazzBoards() bumps lastModified to bridge Jazz mutations to Legend State reactivity.", "isElementMatchingSearch exported separately from getElementsForView for reuse in spatial view dimming (S06+)."]
patterns_established:
  - ["Board CRUD returns Result<_, BoardError> with console.debug event emission — pattern for action log structure (M004).", "sortElementi: BC dates normalized to negative numbers (aev → negative), undated elements sorted last via Infinity sentinel.", "syncJazzX() + bump lastModified is the canonical pattern for Jazz→LegendState sync in this codebase."]
observability_surfaces:
  - none
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-04-23T11:48:37.190Z
blocker_discovered: false
---

# S04: Board CRUD e ricerca

**Board CRUD completo (crea/rinomina/elimina) dalla sidebar via Jazz persistence, vista lista ordinabile per titolo/data/tipo, ricerca cross-view su titolo+descrizione+tag. 126/126 test passati.**

## What Happened

S04 ha consegnato il Board CRUD completo e la ricerca cross-view in due task senza deviazioni strutturali.

**T01 — Board CRUD via Jazz CoList**

Il punto di partenza era un layer mock (`BOARDS` da `src/mock/data.ts`) usato come sorgente per sidebar, display-helpers e workspace-ui-store. T01 lo ha rimpiazzato completamente con entità Jazz persistenti.

Schema: `WorkspaceSchema` ora usa `boards: co.list(BoardSchema)` (CoMaps first-class) al posto di `boardIds: co.list(z.string())`. `BoardSchema` ha ricevuto `elementiIds: co.list(z.string())` per il membership fissa. Migration guard aggiunto per account con schema precedente. Il resolve config di `workspace.adapter.ts` include `boards: { $each: { elementiIds: true } }`.

Adapter: `board.adapter.ts` riscritto con `coMapToBoard()`, `createBoard()`, `renameBoard()`, `deleteBoard()` — tutti ritornano `Result<_, BoardError>` e emettono `console.debug` con eventi tipizzati (board-creato, board-rinominato, board-eliminato) per soddisfare il requisito di observability slice.

Store: `ViewId` aggiornato da union hardcoded a template literal `` "recenti" | "tutti" | `board-${string}` ``. Aggiunto `syncJazzBoards()` (bumpa `lastModified` per triggherare re-render NavSidebar) e tre CRUD wrappers (`createBoardInWorkspace`, `renameBoardInWorkspace`, `deleteBoardFromWorkspace`). `syncJazzBoardsForTest()` esposto per i test.

NavSidebar: ListBox HeroUI rimpiazzato con righe div custom (role=listitem) per supportare rename inline — click sul nome entra in edit mode; Enter conferma, Escape/blur annulla. Dropdown tre-puntini per Rinomina/Elimina. Pulsante "+" apre AlertDialog per nome. Delete AlertDialog con conferma. Empty state se nessun board.

Test: 111/111 test passati; display-helpers.test.ts aggiornato con `syncJazzBoardsForTest(BOARDS)` in beforeEach e ViewId board format corretto.

**T02 — Vista lista ordinabile e ricerca cross-view**

Aggiunti `SortBy` ("titolo"|"data"|"tipo") e `SortDir` ("asc"|"desc") in `display-helpers.ts`. `sortElementi()` funzione pura (no mutation) con normalizzazione BC: date aev convertite a numeri negativi così ascending = cronologico oldest-first; elementi senza data sortano per ultimi (sentinel Infinity). `isElementMatchingSearch()` esportata separatamente per uso futuro nelle viste spaziali (dimming).

`getElementsForView` delega ora a `isElementMatchingSearch` invece del precedente `.includes()` solo su titolo, coprendo titolo+descrizione+tag.

Store: `sortBy` (default "titolo") e `sortDir` (default "asc") aggiunti a `WorkspaceUIState` per persistenza sessione.

ListPane: sort bar compatta sopra la lista, visibile in viste tutti e board-*. Tre label cliccabili (Titolo, Tipo, Data) — click su colonna attiva togola direzione, click su inattiva la attiva ascending. Indicatore ArrowUpDown/ArrowDownUp con sfondo tinto. Badge "N risultati" in vista board con search attiva.

14 nuovi test: `isElementMatchingSearch` (5 casi), extended search in `getElementsForView` (3 casi), `sortElementi` (6 casi incluso no-mutation e undated-last). 126/126 test passati.

**Deviazione nota**: sort bar esposta anche in vista "tutti" (non solo board-*) — scelta coerente e a costo zero. Spatial views (timeline, grafo) non ancora implementate; `isElementMatchingSearch` è già wired ed esportata per il dimming futuro (S06+).

## Verification

1. `npx tsc --noEmit` — exit 0, zero errori TypeScript strict.
2. `npx vitest run` — 126/126 test passati (5 file), include 14 nuovi test T02 e test T01 aggiornati con syncJazzBoardsForTest.
3. `npx vite build` — build produzione OK (2103 kB, T01 evidence).
4. Console.debug eventi board-creato/rinominato/eliminato: emessi da board.adapter.ts su ogni operazione CRUD (T01 evidence).
5. R008 e R009 aggiornati a status validated nel DB GSD.

## Requirements Advanced

None.

## Requirements Validated

- R008 — Board CRUD (crea/rinomina/elimina) dalla sidebar via Jazz CoList. NavSidebar con inline rename (Enter/Esc), AlertDialog crea, AlertDialog elimina con conferma. console.debug board-creato/rinominato/eliminato. 126/126 test pass.
- R009 — isElementMatchingSearch copre titolo+descrizione+tag (case-insensitive). getElementsForView delega per filtro. sortElementi (titolo/data/tipo, asc/desc). Sort bar in ListPane. 126/126 test pass.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

None.

## Known Limitations

Spatial views (timeline, grafo, genealogia) non ancora implementate: isElementMatchingSearch è wired ed esportata per il dimming ma non esercitabile fino a S06. Board membership UI (aggiunta di elementi a un board) non implementata in S04 — il campo elementiIds esiste ma non c'è UI per popolarlo.

## Follow-ups

S06 (spatial views) può consumare isElementMatchingSearch per opacity dimming senza ulteriori modifiche. Board membership UI (aggiunta/rimozione elementi da board) è un requisito implicito non pianificato — da includere in S07 polish o in uno slice dedicato.

## Files Created/Modified

- `src/features/board/board.schema.ts` — 
- `src/features/board/board.adapter.ts` — 
- `src/features/workspace/workspace.schema.ts` — 
- `src/features/workspace/workspace.adapter.ts` — 
- `src/ui/workspace-home/workspace-ui-store.ts` — 
- `src/ui/workspace-home/display-helpers.ts` — 
- `src/ui/workspace-home/NavSidebar.tsx` — 
- `src/ui/workspace-home/WorkspacePreviewPage.tsx` — 
- `src/ui/workspace-home/ListPane.tsx` — 
- `src/ui/workspace-home/__tests__/display-helpers.test.ts` — 
