# S04: Board CRUD e ricerca

**Goal:** Board CRUD completo e ricerca cross-view. L'utente crea board dalla sidebar, rinomina inline, elimina con conferma; la vista lista mostra una lista compatta degli elementi del board con ordinamento; la ricerca filtra righe nella lista e fa dimming dei non-match nelle viste spaziali. Tutto sopra Jazz persistence (S08).
**Demo:** crea board da sidebar, rinomina inline, elimina con conferma, vista lista compatta con ordinamento, ricerca cross-view

## Must-Haves

- Creazione board dal pulsante "+" nella sidebar: prompt per nome, board appare nella sezione Board con conteggio 0
- Rinomina board inline (click su nome -> input); Enter conferma, Esc annulla
- Elimina board con modal di conferma; rimozione non elimina gli elementi del workspace (D027-like: board = query, non ownership)
- Vista lista del board: lista compatta ordinabile per titolo/data/tipo
- Ricerca cross-view: input nell'header del detail pane filtra per titolo, tag e descrizione; lista filtra righe; viste spaziali applicano dimming

## Proof Level

- This slice proves: demo

## Integration Closure

Board diventano entità Jazz persistenti (dipende da S08). CRUD e ricerca sono end-to-end verificabili: creo un board, ricarico, il board persiste con i suoi membri; cerco, i risultati sono coerenti; elimino, il board sparisce ma gli elementi restano nel workspace.

## Verification

- Azione log eventi: board-creato, board-rinominato, board-eliminato (console.debug in dev; struttura pronta per action-log in M004). Errori CRUD tipizzati via BoardError e renderizzati inline.

## Tasks

- [x] **T01: Board CRUD: create / rename / delete dalla sidebar** `est:3h`
  Azioni CRUD su Board persistite via Jazz (adapter da S08). Pulsante + nella sezione Board apre prompt per nome e crea il board. Click sul nome del board nella sidebar permette rinomina inline (Enter conferma, Esc annulla). Menu azioni board (tre puntini) con opzione Elimina che apre modal di conferma. Integrazione con board.rules.ts (pure helpers già esistenti) e board.adapter.ts (nuovo, da S08).
  - Files: `src/features/board/board.rules.ts`, `src/features/board/board.adapter.ts`, `src/ui/workspace-home/NavSidebar.tsx`, `src/ui/workspace-home/workspace-ui-store.ts`
  - Verify: Crea board 'Test' dalla sidebar -> appare in lista Board con conteggio 0; rinomina inline 'Test' -> 'Rinominato' -> Enter -> persiste; ricarica pagina -> board persiste; elimina 'Rinominato' -> modal conferma -> sparisce; elementi del workspace invariati.

- [x] **T02: Vista lista board con ordinamento + ricerca cross-view** `est:3h`
  Implementare la vista lista per un board selezionato: layout compatto con elementi membri del board, ordinabile per titolo / data / tipo. Aggiungere input di ricerca nell'header del detail pane che filtra per titolo, tag e descrizione. Nelle viste non-lista (placeholder o future), i non-match ricevono opacity-30 invece di essere rimossi.
  - Files: `src/ui/workspace-home/ListPane.tsx`, `src/ui/workspace-home/DetailPane.tsx`, `src/ui/workspace-home/display-helpers.ts`, `src/ui/workspace-home/workspace-ui-store.ts`
  - Verify: Seleziona board con 3 elementi -> vista lista mostra i 3; click header colonna -> ordinamento cambia; scrive 'Abraamo' nella search -> lista filtrata; cancella search -> lista torna completa; ordinamento persiste per sessione.

## Files Likely Touched

- src/features/board/board.rules.ts
- src/features/board/board.adapter.ts
- src/ui/workspace-home/NavSidebar.tsx
- src/ui/workspace-home/workspace-ui-store.ts
- src/ui/workspace-home/ListPane.tsx
- src/ui/workspace-home/DetailPane.tsx
- src/ui/workspace-home/display-helpers.ts
