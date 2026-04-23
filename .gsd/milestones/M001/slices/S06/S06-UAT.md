# S06: Timeline D3 SVG con zoom/pan e popup — UAT

**Milestone:** M001
**Written:** 2026-04-23T12:05:09.002Z

## Scenario UAT — S06 Timeline D3

**Preconditions:** utente autenticato (DemoAuth), workspace con almeno 3-5 elementi datati (personaggio con nascita/morte, evento con DataTemporale puntuale o range).

**Steps:**
1. Aprire un board dalla sidebar → vista default "lista".
2. Cliccare il toggle "Timeline" nell'header della vista board.
3. Verificare asse verticale visibile con tick temporali, card posizionate verticalmente in ordine cronologico (top = più antico).
4. Scroll con wheel / pinch → zoom cambia scala temporale, card si riposizionano senza flicker.
5. Drag su area canvas → pan verticale, card seguono.
6. Click su una card → popup compatto appare con titolo + metadata.
7. Click "Apri scheda" nel popup → vista torna su list+detail dell'elemento.

**PASS criteria:** transizioni percepite fluide (60fps target), nessun overlap tra card, popup allineato alla card sorgente, navigazione al detail corretta.

**Result:** PASS manuale (T01).
