# S05: A11y baseline + density uniforme + animation polish

**Goal:** Chiudere le gap a11y residue nel 3-pane workspace-home: navigazione da tastiera sui board item della NavSidebar, aria-label sui pulsanti edit di ElementoEditor/DetailPane, aria-pressed sui palette button di ThemeSwitcher, ed eliminare le ultime occorrenze di `transition-all` (mockups inclusi). prefers-reduced-motion e focus ring sono già coperti dalla regola globale in `src/styles/tokens.css`.
**Demo:** Tab-nav sidebar->list->detail con focus ring visibile; ogni icon-only etichettato; prefers-reduced-motion disabilita animazioni; rg 'transition-all' zero

## Must-Haves

- Tab-nav sidebar->list->detail con focus ring teal (#0d9488) visibile su ogni elemento interattivo; ogni `isIconOnly` e ogni `<button>` solo-icona ha `aria-label` significativo; palette selection ha `aria-pressed`; `rg 'transition-all' src/ui/` restituisce zero hit; suite Vitest 126/126 green; tsc --noEmit pulito.

## Proof Level

- This slice proves: contract + manual keyboard verification via rg gates

## Integration Closure

Consuma layout fullheight di S01 come base stabile per focus management. Nessun nuovo wiring runtime. Produce convenzioni (aria-label su icon-only, tabIndex su role=option custom, ban di transition-all) consumate da S07 nel proof finale ui-ux-pro-max.

## Verification

- none — slice è puramente front-end dichiarativo (attributi ARIA + class rename), nessun runtime signal o failure path introdotto.

## Tasks

- [x] **T01: Rendere i board item della NavSidebar focusabili da tastiera (tabIndex + onKeyDown)** `est:30m`
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
  - Files: `src/ui/workspace-home/NavSidebar.tsx`
  - Verify: pnpm tsc --noEmit && pnpm test --run && rg -n 'tabIndex=\{0\}' src/ui/workspace-home/NavSidebar.tsx

- [x] **T02: Aggiungere aria-label ai pulsanti icon-only/action residui in ElementoEditor e DetailPane** `est:20m`
  Il research audit (S05-RESEARCH sezione 3) ha identificato 3 pulsanti che espongono testo visibile ma non comunicano l'azione allo screen reader:
- `ElementoEditor.tsx` ~riga 1022 (InlineTitle display button): aggiungere `aria-label="Modifica titolo"`
- `ElementoEditor.tsx` ~riga 1354 (description display button che contiene MarkdownPreview): aggiungere `aria-label="Modifica descrizione"`
- `DetailPane.tsx` ~riga 178 (annotation navigate button): aggiungere `aria-label={`Apri annotazione: ${ann.titolo}`}` (sintassi template literal).

Nota: i numeri di riga sono indicativi — localizza i pulsanti per contesto (InlineTitle component, description edit trigger, annotation list item button). NON toccare i ChipButton/remove-chip (già accessibili via testo visibile) né i pulsanti HeroUI con isIconOnly già etichettati.

Steps:
1. Aprire `src/ui/workspace-home/ElementoEditor.tsx`, localizzare il button InlineTitle (cerca il component InlineTitle o il button che wrappa il valore del titolo editabile).
2. Aggiungere `aria-label="Modifica titolo"`.
3. Localizzare il button che apre l'editor di descrizione (contiene `<MarkdownPreview>`). Aggiungere `aria-label="Modifica descrizione"`.
4. Aprire `src/ui/workspace-home/DetailPane.tsx`, localizzare il button per navigate annotation (contiene `ann.titolo`).
5. Aggiungere `aria-label={`Apri annotazione: ${ann.titolo}`}` (attenzione a escapare correttamente).
6. Verificare con `pnpm tsc --noEmit` e `pnpm test --run`.

Must-haves:
- Tutti e 3 i pulsanti hanno aria-label specifico dell'azione
- Nessun regression su test esistenti
- Tsc clean
  - Files: `src/ui/workspace-home/ElementoEditor.tsx`, `src/ui/workspace-home/DetailPane.tsx`
  - Verify: pnpm tsc --noEmit && pnpm test --run && rg -n 'aria-label="Modifica titolo"' src/ui/workspace-home/ElementoEditor.tsx && rg -n 'aria-label="Modifica descrizione"' src/ui/workspace-home/ElementoEditor.tsx && rg -n 'aria-label=\{`Apri annotazione' src/ui/workspace-home/DetailPane.tsx

- [x] **T03: Aggiungere aria-pressed ai palette button del ThemeSwitcher** `est:10m`
  I pulsanti palette in `ThemeSwitcher.tsx` (~riga 201) sono toggle di selezione ma mancano di `aria-pressed` per comunicare lo stato attivo allo screen reader. Aggiungere `aria-pressed={activePalette === p.name}` (o equivalente — usa il nome reale della variabile di stato presente nel file). Il test del toggle: quando la palette corrente combacia con p.name → aria-pressed="true", altrimenti "false".

Steps:
1. Aprire `src/ui/workspace-home/ThemeSwitcher.tsx`, localizzare il map dei palette button (ricerca: `p.name` o il button che imposta la palette).
2. Aggiungere `aria-pressed={<paletteAttiva> === p.name}` (sostituire `<paletteAttiva>` con il nome della variabile/derivazione esistente).
3. Verificare tsc clean e test pass.

Must-haves:
- Ogni palette button ha aria-pressed booleano dinamico
- Nessun regression
- Tsc clean
  - Files: `src/ui/workspace-home/ThemeSwitcher.tsx`
  - Verify: pnpm tsc --noEmit && pnpm test --run && rg -n 'aria-pressed' src/ui/workspace-home/ThemeSwitcher.tsx

- [x] **T04: Eliminare le 4 occorrenze di `transition-all` nei mockup (compliance AC slice)** `est:15m`
  L'AC S05 richiede `rg 'transition-all' src/ui/` → zero hit. Il research ha identificato 4 occorrenze residue nei file mockup:
- `src/ui/mockups/CommitInteractionMockup.tsx:274` — `transition-all duration-200`
- `src/ui/mockups/UnifiedEditorMockup.tsx:1895` — `transition-all duration-200`
- `src/ui/mockups/MockupsIndex.tsx:175` — `transition-all`
- `src/ui/mockups/MockupsIndex.tsx:243` — `transition-all`

Sostituire con `transition-[opacity,transform]` (pattern KNOWLEDGE.md: animare solo opacity/transform, mai width/height/top/left). Mantenere duration-200 dove presente. Non modificare altro nei file.

Steps:
1. Per ciascuno dei 4 siti, sostituire esattamente `transition-all` con `transition-[opacity,transform]` (conservando eventuali modificatori duration-*).
2. Eseguire il gate finale: `rg 'transition-all' src/ui/` → zero hit atteso.
3. Eseguire `pnpm tsc --noEmit` e `pnpm test --run`.

Must-haves:
- Zero occorrenze di `transition-all` in `src/ui/`
- Nessuna modifica a logica dei mockup (solo class rename)
- Tsc clean, 126/126 test green
  - Files: `src/ui/mockups/CommitInteractionMockup.tsx`, `src/ui/mockups/UnifiedEditorMockup.tsx`, `src/ui/mockups/MockupsIndex.tsx`
  - Verify: test -z "$(rg -l 'transition-all' src/ui/ 2>/dev/null)" && pnpm tsc --noEmit && pnpm test --run

## Files Likely Touched

- src/ui/workspace-home/NavSidebar.tsx
- src/ui/workspace-home/ElementoEditor.tsx
- src/ui/workspace-home/DetailPane.tsx
- src/ui/workspace-home/ThemeSwitcher.tsx
- src/ui/mockups/CommitInteractionMockup.tsx
- src/ui/mockups/UnifiedEditorMockup.tsx
- src/ui/mockups/MockupsIndex.tsx
