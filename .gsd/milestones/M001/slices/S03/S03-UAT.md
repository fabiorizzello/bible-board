# S03: Fonti e link editor inline — UAT

**Milestone:** M001
**Written:** 2026-04-22T12:29:49.271Z

# S03 UAT — Fonti e link editor inline

> **Scope:** demo-level only (mock-backed). The slice Must-Have "persiste al reload" is a known gap and is intentionally excluded from this UAT.

## Preconditions

- Dev server running (`npm run dev`); browser attached.
- DemoAuth: logged in; 3-pane visible.
- Seed data loaded; an existing personaggio (e.g. "Abraamo") visible in the list pane with at least one pre-seeded fonte of tipo `scrittura` and one link.

---

## UAT-1 — Fonti: aggiunta con typed picker e undo

**Steps**
1. Selezionare Abraamo nella list pane.
2. Nel detail pane, verificare che la sezione Fonti mostra i `scrittura` esistenti sotto un heading di gruppo cliccabile (`<Link>`).
3. Entrare in modalità editor (click sul titolo o sul body).
4. Nella sezione Fonti dell'editor, cliccare "Aggiungi fonte". Si apre un `FieldDrawer` con selettore tipo e campo valore.
5. Selezionare tipo `articolo-wol`, inserire valore `https://wol.jw.org/it/wol/d/r6/lp-i/2024561`, confermare.
6. Verificare: appare un nuovo gruppo "Articoli WOL" con un `<Link>` cliccabile al valore inserito.
7. Appare un toast "Annulla" (5s).
8. Cliccare "Annulla" entro 5s.

**Expected**
- La fonte `articolo-wol` scompare; i gruppi precedenti restano invariati.
- Insertion-order preservato all'interno del gruppo `scrittura`.

---

## UAT-2 — Fonti: rimozione con undo

**Steps**
1. In editor mode, cliccare la X su una fonte esistente `scrittura`.
2. Verificare che la fonte scompare dal gruppo e appare toast undo.
3. Cliccare "Annulla".

**Expected**
- La fonte ricompare nella stessa posizione all'interno del gruppo `scrittura`.

---

## UAT-3 — Fonti: duplicato rifiutato

**Steps**
1. Aggiungere fonte `link` con valore `https://example.com`.
2. Tentare di aggiungere di nuovo `link` + `https://example.com`.

**Expected**
- Errore inline `fonte_duplicata`; nessuna nuova voce aggiunta; nessun toast.

---

## UAT-4 — Link bidirezionale parentela (padre → figlio automatico)

**Steps**
1. Aprire Abraamo in editor.
2. Nella sezione Collegamenti, cliccare "Aggiungi collegamento".
3. Selezionare tipo `parentela`, ruolo `padre`, target `Isacco`.
4. Confermare.
5. Selezionare Isacco nella list pane e aprirne il detail.

**Expected**
- Abraamo mostra collegamento `parentela · padre → Isacco`.
- Isacco mostra collegamento `parentela · figlio → Abraamo` (ruolo inverso propagato automaticamente).
- Toast "Annulla" presente su Abraamo; entrambe le propagazioni atomic — nessun stato intermedio visibile.

---

## UAT-5 — Link bidirezionale undo rimuove entrambi i lati

**Steps**
1. Ripetere UAT-4 passi 1–4.
2. Cliccare "Annulla" entro 5s.
3. Aprire Isacco.

**Expected**
- Su Abraamo il link padre→Isacco è rimosso.
- Su Isacco il link figlio→Abraamo è rimosso (inverso rimosso atomicamente).

---

## UAT-6 — Link bidirezionale idempotenza

**Steps**
1. Creare link `correlato` Abraamo ↔ Sara.
2. Senza annullare, tentare di creare di nuovo lo stesso link.

**Expected**
- Nessun duplicato su nessuno dei due lati; il comportamento è no-op silenzioso (helper idempotente).

---

## UAT-7 — RuoloLink visibile solo per parentela + target personaggio

**Steps**
1. In editor, aprire picker aggiungi collegamento.
2. Selezionare tipo `parentela`.
3. Verificare che nell'elenco candidati compaiono solo elementi con `tipo === "personaggio"`.
4. Cambiare tipo a `correlato`.
5. Verificare che il selettore ruolo parentela scompare.

**Expected**
- Con `parentela` il selettore ruolo è visibile e i candidati sono filtrati a soli personaggi.
- Con altri tipi, ruolo parentela non appare.

---

## UAT-8 — Rimozione link da un lato propaga anche all'altro

**Steps**
1. Data coppia Abraamo ↔ Sara legata da `correlato` (pre-seeded o creata).
2. Su Abraamo, cliccare X sul link verso Sara.
3. Aprire Sara.

**Expected**
- Abraamo non ha più il link verso Sara.
- Sara non ha più il link verso Abraamo (rimozione simmetrica).
- Toast undo presente su Abraamo; undo ripristina entrambi i lati.

---

## Known Gaps (NOT in this UAT)

- **Jazz persistence:** reload della pagina resetta `fontiOverrides` ed `elementOverrides`. Questo comportamento è atteso per questo slice; la migrazione a Jazz è il follow-up primario.
- **Video fonte:** non implementata (deferred a M004).
- **Overlap detection su fonti bibbia:** non in scope per M001.
