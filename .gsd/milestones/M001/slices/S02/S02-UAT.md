# S02: Editor inline per-campo, annotazioni, soft delete — UAT

**Milestone:** M001
**Written:** 2026-04-22T11:51:20.130Z

# S02 UAT — Editor inline per-campo, annotazioni, soft delete

## Preconditions
- Dev server attivo (`pnpm dev`), DemoAuth loggato come autore noto in `ELEMENTI` mock.
- Viewport iPad landscape (1180×820).
- Elemento selezionato nella list pane del workspace home (es. un `personaggio` con nascita/morte + link parentela).

## UC1 — Inline edit scalare (Titolo)
1. Nel detail pane, tap sul titolo inline-editable nell'header integrato.
2. Modificare il testo.
3. Spostare il focus via tab o tap fuori dall'input (blur).
4. **Atteso**: valore committato, toast "Titolo aggiornato · Annulla" visibile 5s.
5. Premere "Annulla" entro 5s.
6. **Atteso**: titolo torna al valore precedente, toast scompare.

## UC2 — Escape annulla l'edit scalare (ScalarChip)
1. Aprire un ScalarChip (es. chip `anno` o `tribù` via popover metadata chips).
2. Digitare un nuovo valore.
3. Premere Esc.
4. **Atteso**: nessun commit, nessun toast, chip mostra il valore precedente.

## UC3 — Editor type-specific: personaggio → evento
1. Selezionare un `personaggio` con campi nascita/morte/tribù compilati.
2. Cambiare `tipo` da personaggio a evento via popover chip.
3. **Atteso**: campi nascita/morte/tribù/ruoli spariti dal body; nessun errore dominio; toast "Tipo aggiornato · Annulla".
4. Annullare dal toast.
5. **Atteso**: elemento torna personaggio con tutti i campi type-specific ripristinati.

## UC4 — Editor esaustivo: 8 ElementoTipo
Per ciascun tipo (`personaggio`, `evento`, `luogo`, `profezia`, `guerra`, `regno`, `periodo`, `annotazione`):
1. Creare/selezionare un Elemento di quel tipo.
2. **Atteso**: body editor mostra i campi type-specific previsti (o nessuno per `evento`/`periodo`/`annotazione`), nessun runtime error, nessun campo estraneo di un altro tipo.

## UC5 — Validazione dominio: date invalide
1. Su un elemento `evento`, aprire il field `date` (drawer vita).
2. Impostare giorno=15 senza mese.
3. **Atteso**: warning inline "giorno richiede mese", commit bloccato o badge review header; nessuna crash.

## UC6 — Tipo specifico non ammesso
1. Selezionare un elemento `evento`.
2. Provare a impostare `tribù` programmaticamente via patch.
3. **Atteso**: `normalizeElementoInput` ritorna errore `tipo_specifico_non_ammesso`, editor non committa, nessun campo leaked.

## UC7 — Annotazioni mie vs altrui
1. Selezionare un elemento con annotazioni di almeno 2 autori (una dell'utente corrente, una di altro autore).
2. **Atteso**: sezione "Annotazioni" mostra le mie in primo piano; badge/contatore per quelle altrui; quelle altrui sono read-only.
3. Tap "+ Aggiungi annotazione".
4. **Atteso**: si crea un nuovo Elemento di tipo `annotazione` con autore = utente corrente, linkato all'elemento via link bidirezionale.

## UC8 — Soft delete con toast Annulla 30s
1. Selezionare un elemento qualsiasi.
2. Dal menu azioni header, scegliere "Elimina".
3. **Atteso**: elemento rimosso dalla list pane; detail pane torna a empty state; toast "Elemento eliminato · Annulla" visibile 30s.
4. Premere "Annulla" prima del timeout.
5. **Atteso**: elemento riappare nella list pane, detail pane lo riseleziona.

## UC9 — Soft delete senza undo
1. Ripetere UC8 passi 1-3.
2. Attendere 30s senza premere Annulla.
3. **Atteso**: toast svanisce, elemento resta eliminato, cascade link/fonti coerente.

## UC10 — Aggiungi campo globale
1. Su un elemento con campi opzionali vuoti (es. `descrizione` vuota).
2. Tap "+ Aggiungi campo" nel body.
3. **Atteso**: menu contestuale con solo i campi ancora vuoti/non ammessi; tap su "Descrizione".
4. **Atteso**: sezione descrizione appare e riceve focus, pronta per input.

## UC11 — Link parentela filtering robusto
1. Selezionare un `personaggio` con mix di link parentela e generici.
2. Riordinare l'array link (aggiungere + rimuovere un link generico).
3. **Atteso**: sezione parentela mostra sempre e solo i link `tipo === "parentela"`, nessuno slot generico leaked, nessuno slot parentela nel generico.

## UC12 — Fullscreen parity
1. Entrare in fullscreen su un elemento.
2. Ripetere UC1 (inline edit + undo).
3. **Atteso**: stessa grammatica commit, stessi campi, stessa hierarchy header/metadata/body; header fullscreen mantiene navigazione back.

## Edge Cases
- Eliminare e undo ripetuti: l'elemento deve tornare sempre nello stesso stato.
- Blur durante un altro commit pending (race): il secondo toast sostituisce il primo, l'undo del secondo ripristina il valore intermedio corretto.
- Cambio `tipo` con campi type-specific popolati: i campi non ammessi vengono scartati dall'output ma il toast undo li ripristina atomicamente.
