---
estimated_steps: 15
estimated_files: 1
skills_used: []
---

# T01: Sostituire termini tecnici user-visible nelle warning strings di ElementoEditor

In `src/ui/workspace-home/ElementoEditor.tsx`, la funzione `getWarnings()` contiene 2 warning user-visible con termini tecnici vietati dal linguaggio di dominio (R046). Riscrivere in italiano di dominio.

Cambiamenti esatti:

1. Warning 'descrizione mancante' (~line 200):
   - OLD: `"Manca una descrizione markdown. Aggiungila inline senza lasciare il detail pane."`
   - NEW: `"Manca una descrizione. Aggiungila direttamente qui."`

2. Warning 'ruoli mancanti' (~line 207):
   - OLD: `"Nessun ruolo visibile. Il mockup canonico prevede chip modificabili per i ruoli principali."`
   - NEW: `"Nessun ruolo definito."`

NON toccare:
- Code identifiers (`editingFieldId`, `MilkdownEditorInline`, `.markdownUpdated(...)`, `EditableFieldId`, ecc.)
- Toast strings esistenti (rimozione toast è scope S04, non S01)
- Nomi componenti/import (`PanelLeft`, `SearchField`, `TextField`, `Toast`, ecc.)
- CSS token `bg-panel`

Nota: i file in `src/ui/mockups/` sono dev-only (rotta `/dev/mockup-*`) e sono scope out — non toccarli.

Assumption: non risultano test che asseriscano sul testo esatto di queste 2 warning string (verificato: test presenti sono display-helpers.test.ts e link-helpers.test.ts). Se un test inatteso rompe, aggiornare l'asserzione al nuovo testo.

## Inputs

- ``src/ui/workspace-home/ElementoEditor.tsx``

## Expected Output

- ``src/ui/workspace-home/ElementoEditor.tsx``

## Verification

1. `rg -n 'markdown|mockup|detail pane' src/ui/workspace-home/ElementoEditor.tsx` — confermare che i match rimasti sono SOLO code identifiers (es. `MilkdownEditorInline`, `.markdownUpdated`, `editingFieldId`) e NON stringhe JSX user-visible.
2. `rg -i '(markdown|mockup|detail pane)' src/ui/ --glob '!src/ui/mockups/**' -n` — ispezionare ogni hit e confermare che nessuno è testo mostrato all'utente.
3. `pnpm test` → 126/126 pass.
4. `pnpm tsc --noEmit` → clean.
