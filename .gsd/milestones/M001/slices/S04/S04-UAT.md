# S04: Board CRUD e ricerca — UAT

**Milestone:** M001
**Written:** 2026-04-23T11:48:37.191Z

# UAT Script — S04: Board CRUD e ricerca

## Precondizioni

- App in esecuzione (`npx vite dev`)
- DemoAuth: accedere con un nome qualsiasi (es. "Marco")
- Workspace con almeno 3 elementi (es. Abraamo, Isacco, Giacobbe) già presenti da sessioni precedenti o creati ora

---

## TC-01: Crea board dalla sidebar

**Passi:**
1. Nella sidebar, localizzare la sezione "Board" con il pulsante "+"
2. Click su "+"
3. Inserire il nome "Patriarchi" nel campo testo del dialog
4. Premere Enter o click su Conferma

**Risultato atteso:**
- Il board "Patriarchi" appare nella sezione Board della sidebar con conteggio 0
- Nessun errore console (solo `console.debug: board-creato`)

---

## TC-02: Persistenza board dopo ricarica pagina

**Passi:**
1. Con il board "Patriarchi" creato (TC-01)
2. Ricaricare la pagina (F5)
3. Eseguire di nuovo DemoAuth con lo stesso nome

**Risultato atteso:**
- Il board "Patriarchi" è ancora presente nella sidebar
- Il conteggio è ancora 0 (nessun membro aggiunto)

---

## TC-03: Rinomina board inline — click sul nome

**Passi:**
1. Nella sidebar, click sul nome "Patriarchi"
2. Il nome diventa un campo input editabile
3. Cancellare "Patriarchi" e scrivere "Patriarchi Biblici"
4. Premere Enter

**Risultato atteso:**
- Il board appare con il nuovo nome "Patriarchi Biblici"
- `console.debug: board-rinominato` emesso
- La selezione torna al board rinominato

---

## TC-04: Rinomina board — Esc annulla

**Passi:**
1. Click sul nome del board per entrare in edit mode
2. Modificare il testo
3. Premere Escape

**Risultato atteso:**
- Il nome torna al valore precedente senza modifiche

---

## TC-05: Rinomina board dal menu tre-puntini

**Passi:**
1. Hover sul board in sidebar → appare icona tre-puntini
2. Click tre-puntini → dropdown con "Rinomina" e "Elimina"
3. Click "Rinomina"
4. Inserire "Test Board" e confermare

**Risultato atteso:**
- Il board rinominato appare come "Test Board"

---

## TC-06: Elimina board con conferma

**Passi:**
1. Click tre-puntini sul board "Test Board"
2. Click "Elimina"
3. Appare modal di conferma con nome board
4. Confermare l'eliminazione

**Risultato atteso:**
- Il board sparisce dalla sidebar
- `console.debug: board-eliminato` emesso
- Gli elementi del workspace (Abraamo, Isacco, Giacobbe) sono ancora presenti in "Tutti"

---

## TC-07: Elimina board — Annulla non elimina

**Passi:**
1. Creare un board "Da non eliminare"
2. Aprire il dialog di eliminazione
3. Click "Annulla" o chiudere il dialog con Esc

**Risultato atteso:**
- Il board rimane nella sidebar intatto

---

## TC-08: Vista lista board — seleziona board con elementi

**Precondizione:** avere un board con almeno 3 elementi membri (aggiungere via board membership se disponibile, altrimenti skippare e testare con vista "Tutti")

**Passi:**
1. Click sul board nella sidebar
2. Il list pane mostra i 3 elementi in vista lista compatta

**Risultato atteso:**
- Lista con righe compatte (titolo, tipo, data)
- Sort bar con colonne Titolo / Tipo / Data visibile

---

## TC-09: Ordinamento per colonna

**Passi:**
1. Nella vista lista (board o Tutti), click su "Titolo" nella sort bar
2. La lista si ordina A→Z (ascendente)
3. Click di nuovo su "Titolo"
4. La lista si ordina Z→A (discendente)
5. Click su "Data"

**Risultato atteso:**
- Colonna attiva evidenziata con sfondo tinto e icona freccia
- Cambio ordinamento immediato ad ogni click
- Elementi senza data appaiono in fondo

---

## TC-10: Ricerca cross-view — filtro per titolo

**Passi:**
1. Nella vista lista (Tutti o board), localizzare l'input di ricerca nell'header del detail pane
2. Digitare "Abraamo"

**Risultato atteso:**
- La lista mostra solo elementi con "Abraamo" nel titolo
- Badge "N risultati" appare nella sort bar

---

## TC-11: Ricerca cross-view — filtro per tag

**Passi:**
1. (Premessa: almeno un elemento ha tag "patriarca")
2. Digitare "patriarca" nell'input di ricerca

**Risultato atteso:**
- Elementi con tag "patriarca" appaiono nei risultati anche se "patriarca" non è nel titolo

---

## TC-12: Ricerca cross-view — filtro per descrizione

**Passi:**
1. (Premessa: almeno un elemento ha "Egitto" nella descrizione)
2. Digitare "Egitto" nell'input di ricerca

**Risultato atteso:**
- Elementi con "Egitto" nella descrizione appaiono nei risultati

---

## TC-13: Cancella search — lista torna completa

**Passi:**
1. Con search attiva (TC-10)
2. Cancellare il testo nell'input

**Risultato atteso:**
- Tutti gli elementi tornano visibili
- Badge "N risultati" scompare

---

## TC-14: Ordinamento persiste al cambio view e ritorno

**Passi:**
1. Selezionare ordinamento "Data" discendente
2. Navigare su un elemento (detail pane)
3. Tornare alla lista

**Risultato atteso:**
- Il sort "Data" discendente è ancora attivo (persistenza sessione)

---

## Edge Case EC-01: Board senza elementi

**Passi:**
1. Creare un board nuovo senza aggiungere elementi
2. Selezionarlo nella sidebar

**Risultato atteso:**
- Vista lista vuota (o messaggio "Nessun elemento")
- Sort bar visibile ma non causa errori

---

## Edge Case EC-02: Rinomina con nome vuoto

**Passi:**
1. Entrare in edit mode rinomina
2. Cancellare tutto il testo
3. Premere Enter

**Risultato atteso:**
- La rinomina non viene applicata (nome vuoto rifiutato o mantiene nome precedente)

---

## Note

- Spatial views (timeline, grafo) non presenti in S04. Il dimming dei non-match è wired (`isElementMatchingSearch` esportata) ma non esercitabile fino a S06.
- I `console.debug` eventi (board-creato, board-rinominato, board-eliminato) sono in dev mode — verificare aperendo DevTools → Console.
