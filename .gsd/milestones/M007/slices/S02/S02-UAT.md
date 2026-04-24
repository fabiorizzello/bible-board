# S02: Warning reali (rimozione check di completezza) — UAT

**Milestone:** M007
**Written:** 2026-04-24T09:53:31.947Z

# UAT — S02: Warning reali

## Precondizioni
- App avviata (`pnpm dev`) in un browser su viewport 1180×820 (iPad landscape).
- Workspace con almeno un elemento esistente e un elemento soft-deleted (o inesistente).

## TC-01: Elemento minimale (solo titolo) → 0 warning

**Precondizione:** creare un nuovo elemento di tipo "Annotazione" con solo il titolo compilato (descrizione, tag, ruoli, link: tutti vuoti).

**Passi:**
1. Selezionare l'elemento dalla lista.
2. Aprire il ReviewDrawer / sezione avvertenze (se visibile).

**Atteso:** Nessun warning visualizzato. Il drawer avvertenze non appare o appare vuoto.

---

## TC-02: Data elemento malformata → warning inline

**Precondizione:** creare un elemento con campo "data" impostata a un valore non valido (es. anno fuori range o mese non valido). In dev, forzare via console Jazz un valore malformato.

**Passi:**
1. Selezionare l'elemento.
2. Aprire il ReviewDrawer.

**Atteso:** Appare esattamente 1 warning con etichetta "Data" e messaggio "La data dell'elemento non è valida." Nessun altro warning.

---

## TC-03: Data di nascita malformata (tipo Personaggio) → warning inline

**Precondizione:** elemento di tipo "Personaggio" con `nascita` impostata a un valore non valido.

**Passi:**
1. Selezionare l'elemento.
2. Aprire il ReviewDrawer.

**Atteso:** 1 warning etichetta "Nascita", messaggio "La data di nascita non è valida."

---

## TC-04: Data di morte malformata (tipo Personaggio) → warning inline

**Precondizione:** elemento di tipo "Personaggio" con `morte` impostata a un valore non valido.

**Passi:**
1. Selezionare l'elemento.
2. Aprire il ReviewDrawer.

**Atteso:** 1 warning etichetta "Morte", messaggio "La data di morte non è valida."

---

## TC-05: Link a elemento soft-deleted → warning inline

**Precondizione:** elemento A con un link a elemento B; elemento B eliminato (soft-delete).

**Passi:**
1. Selezionare elemento A.
2. Aprire il ReviewDrawer.

**Atteso:** 1 warning etichetta "Collegamento", messaggio "Collegamento a elemento non trovato (potrebbe essere stato eliminato)." Il `targetId` del link rotto è incluso nei dati del warning.

---

## TC-06: Link a elemento esistente → 0 warning

**Precondizione:** elemento A con link a elemento B; B non eliminato.

**Passi:**
1. Selezionare elemento A.
2. Aprire il ReviewDrawer.

**Atteso:** Nessun warning relativo a collegamento.

---

## TC-07: Mix link (1 valido + 1 rotto) → esattamente 1 warning

**Precondizione:** elemento A con 2 link: uno a B (esistente), uno a C (eliminato).

**Passi:**
1. Selezionare elemento A.
2. Aprire il ReviewDrawer.

**Atteso:** Esattamente 1 warning per C. Nessun warning per B.

---

## TC-08: Regressione completezza — campo vuoto non produce warning

**Precondizione:** elemento senza descrizione, senza tag, senza ruoli, senza link (solo titolo).

**Passi:**
1. Selezionare l'elemento.
2. Aprire il ReviewDrawer.

**Atteso:** 0 warning. Stringhe "manca una descrizione", "nessun ruolo definito", "tag sono vuoti", "nessun collegamento visibile" non compaiono nell'UI.
