---
estimated_steps: 12
estimated_files: 1
skills_used: []
---

# T01: Rendere i board item della NavSidebar focusabili da tastiera (tabIndex + onKeyDown)

I board item in NavSidebar sono renderizzati come `<div role="option">` (workaround storico MEM049: HeroUI ListBox confliggeva con il rename inline). Questi div non sono focusabili da tastiera: manca `tabIndex={0}` e non c'è handler per Enter/Space. Risultato: il tab nav 3-pane si interrompe sulla lista board. La fix è additiva: aggiungere tabIndex={0} al div role=option, aggiungere onKeyDown che intercetta Enter/Space e chiama lo stesso handler usato dall'onClick (selezione board). Il rename inline ha già il suo handler Escape: non toccarlo. Verificare che il focus ring globale :focus-visible (tokens.css:78-82) appaia sul div quando selezionato con Tab.

Steps:
1. Aprire `src/ui/workspace-home/NavSidebar.tsx` e localizzare il blocco board-item (ricerca: `role="option"` attorno alle righe 221-295 della versione al momento del research).
2. Aggiungere `tabIndex={0}` al div role="option".
3. Aggiungere handler `onKeyDown` che, su `e.key === 'Enter' || e.key === ' '`, preveni il default e invoca la stessa funzione usata da onClick per selezionare il board. Lascia che Escape continui a essere gestito dal rename inline esistente.
4. Verificare che l'`aria-selected` rifletta lo stato corrente (se non già presente, aggiungerlo).
5. Eseguire `pnpm tsc --noEmit` e `pnpm test --run`.

Must-haves:
- Il div role="option" ha tabIndex={0}
- onKeyDown gestisce Enter e Space equivalentemente a onClick
- Nessuna regressione su rename inline (Escape, Enter per commit)
- Tsc clean, 126/126 test green

## Inputs

- ``src/ui/workspace-home/NavSidebar.tsx``
- ``src/styles/tokens.css``

## Expected Output

- ``src/ui/workspace-home/NavSidebar.tsx``

## Verification

pnpm tsc --noEmit && pnpm test --run && rg -n 'tabIndex=\{0\}' src/ui/workspace-home/NavSidebar.tsx

## Observability Impact

none — attributi ARIA e key handler dichiarativi, nessun async o errore runtime.
