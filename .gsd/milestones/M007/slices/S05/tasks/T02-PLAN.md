---
estimated_steps: 16
estimated_files: 2
skills_used: []
---

# T02: Aggiungere aria-label ai pulsanti icon-only/action residui in ElementoEditor e DetailPane

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

## Inputs

- ``src/ui/workspace-home/ElementoEditor.tsx``
- ``src/ui/workspace-home/DetailPane.tsx``

## Expected Output

- ``src/ui/workspace-home/ElementoEditor.tsx``
- ``src/ui/workspace-home/DetailPane.tsx``

## Verification

pnpm tsc --noEmit && pnpm test --run && rg -n 'aria-label="Modifica titolo"' src/ui/workspace-home/ElementoEditor.tsx && rg -n 'aria-label="Modifica descrizione"' src/ui/workspace-home/ElementoEditor.tsx && rg -n 'aria-label=\{`Apri annotazione' src/ui/workspace-home/DetailPane.tsx

## Observability Impact

none — solo attributi ARIA.
