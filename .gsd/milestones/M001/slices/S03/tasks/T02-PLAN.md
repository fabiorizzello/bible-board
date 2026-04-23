---
estimated_steps: 1
estimated_files: 5
skills_used: []
---

# T02: Link bidirezionali inline editor su mock data

Editor inline per `ElementoLink` nel detail: selettore TipoLink, picker elemento target (HeroUI popover con ricerca), per `parentela` selettore RuoloLink ristretto a target personaggio (vincolo già presente in `elemento.rules`). Creazione propaga l'inverso automaticamente nel mock store; rimozione è simmetrica. M001 resta mock-only — nessuna integrazione Jazz.

## Inputs

- `T01 output: sezione Fonti editor inline funzionante`
- `src/ui/workspace-home/DetailPane.tsx` (sezione Link presente in sola lettura)
- `src/ui/workspace-home/ElementoEditor.tsx` (editor inline per-campo S02)
- `src/features/elemento/elemento.rules.ts` (regole TipoLink/RuoloLink, parentela ristretta a personaggio — commit 6f8e73c)
- `src/features/elemento/elemento.model.ts` (tipi `ElementoLink`, `TipoLink`, `RuoloLink`)
- Mock data store in `src/ui/mock-data.ts`

## Expected Output

- Sezione Link nel detail con editor inline: aggiungi/rimuovi link, selettore TipoLink, picker elemento target, RuoloLink solo per parentela verso personaggio
- Helper puro `createBidirectionalLink` / `removeBidirectionalLink` nel mock store: crea o toglie l'inverso atomicamente sul target
- Commit grammar S02 rispettato (blur-to-save + toast undo 5s)
- Test unitari sugli helper di link bidirezionali

## Verification

Creare link padre da A a B → inverso "figlio" appare sul detail di B nella stessa sessione. Rimozione da A rimuove anche da B. Il selettore RuoloLink appare SOLO quando TipoLink="parentela" E il target è un personaggio (gli altri tipi nascondono il campo). Nessun import Jazz nei file toccati. Lint + type-check + test passano.
