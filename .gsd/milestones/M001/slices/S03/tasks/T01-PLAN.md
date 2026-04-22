---
estimated_steps: 1
estimated_files: 5
skills_used: []
---

# T01: Fonti inline editor su mock data

Aggiungere editor inline di Fonti nella sezione Fonti del detail/editor Elemento, operando sul mock store in-memory (M001 resta mock-only). Rendering raggruppato per `FonteTipo` con link cliccabili. Mutazioni tramite helper puri, integrate nel commit grammar S02 (blur-to-save + toast undo 5s).

## Inputs

- `src/ui/workspace-home/DetailPane.tsx` (sezione Fonti già presente in sola lettura)
- `src/ui/workspace-home/ElementoEditor.tsx` (editor inline per-campo S02 funzionante — riusare editingFieldId)
- `src/ui/workspace-home/display-helpers.ts` (helper pure per display shape fonti)
- `src/features/elemento/elemento.model.ts` (tipi `Fonte`, `FonteTipo`)
- Mock data store in `src/ui/mock-data.ts`

## Expected Output

- Sezione Fonti nel detail con editor inline: aggiungi/rimuovi fonte per i tipi in scope (scrittura, articolo-wol, pubblicazione, link; video escluso in M001)
- Rendering raggruppato per `FonteTipo` con link cliccabili
- Helper puri che aggiornano il mock store e sono riusabili per i test
- Commit grammar S02 rispettato: blur-to-save, toast undo 5s, nessuna modalità edit separata

## Verification

Aprire detail di un Elemento → sezione Fonti mostra le fonti mock raggruppate per FonteTipo; "Aggiungi fonte" inline crea una fonte nuova; rimozione la toglie dalla vista e dal mock store; undo toast ripristina lo stato precedente. Nessun import Jazz nel codice toccato. Lint + type-check + test passano.
