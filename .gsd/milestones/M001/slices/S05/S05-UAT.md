# S05: Board CRUD + ricerca cross-view — verifica carry-forward da S04 — UAT

**Milestone:** M001
**Written:** 2026-04-23T12:21:52.767Z

# S05 UAT — Board CRUD + ricerca cross-view (verifica carry-forward)

> Nota: S05 era un ghost slice. La funzionalità è stata consegnata da S04. Questi test case verificano la presenza e correttezza dei comportamenti attesi.

## Precondizioni

- App in esecuzione (`npm run dev`)
- DemoAuth: login con nome arbitrario
- Workspace con almeno 3 elementi di tipo diverso e con tags

---

## TC01 — Crea board dalla sidebar

1. Aprire la sidebar
2. Premere il pulsante "+ Nuova board" nella sezione Board
3. **Expected:** Modal/AlertDialog appare con campo nome
4. Inserire "Test Board" e confermare
5. **Expected:** Board "Test Board" appare nella lista sidebar; viene selezionata automaticamente

---

## TC02 — Rinomina board inline

1. Nella sidebar, individuare "Test Board"
2. Fare doppio tap / click sul nome
3. **Expected:** Il nome diventa un campo di input editabile (inline, senza modal)
4. Modificare in "Board Rinominata" e premere Enter
5. **Expected:** Il nuovo nome persiste nella sidebar; blur ha lo stesso effetto di Enter

---

## TC03 — Elimina board con conferma

1. Individuare "Board Rinominata" nella sidebar
2. Attivare il pulsante elimina (icona trash o swipe)
3. **Expected:** AlertDialog di conferma appare ("Elimina board?")
4. Confermare
5. **Expected:** La board scompare dalla sidebar; gli elementi nel workspace non sono stati eliminati

---

## TC04 — Ricerca trova elementi per titolo

1. Selezionare vista "Tutti gli elementi" (o qualsiasi board)
2. Digitare parte del titolo di un elemento noto nella SearchField
3. **Expected:** La lista si filtra mostrando solo gli elementi con quel titolo (case-insensitive)

---

## TC05 — Ricerca trova elementi per descrizione e tags

1. Nella SearchField, digitare una parola presente solo nella descrizione di un elemento
2. **Expected:** Quell'elemento appare nei risultati
3. Cancellare e digitare un tag noto
4. **Expected:** Tutti gli elementi con quel tag appaiono

---

## TC06 — Ricerca cross-view (board diversa)

1. Con una board selezionata, digitare nella SearchField
2. **Expected:** La lista mostra solo gli elementi della board corrente che corrispondono alla query

---

## TC07 — Ordinamento lista

1. Con almeno 3 elementi visibili, attivare il sort per "Titolo" ASC
2. **Expected:** Lista ordinata alfabeticamente
3. Passare a "Titolo" DESC
4. **Expected:** Lista ordinata alfabeticamente inversa
5. Provare sort per "Data" e "Tipo"
6. **Expected:** Ordinamento coerente per campo scelto

---

## Edge cases

- **Search query vuota:** mostra tutti gli elementi senza filtro
- **Nessun risultato:** area lista vuota o messaggio "Nessun elemento trovato"
- **Elimina board con elementi:** gli elementi restano nel workspace (visibili in "Tutti")
- **Rename con nome vuoto:** non dovrebbe salvare (input rimane editabile o torna al nome precedente)
