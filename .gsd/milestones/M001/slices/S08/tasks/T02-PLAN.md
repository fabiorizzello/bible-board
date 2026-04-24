---
estimated_steps: 1
estimated_files: 6
skills_used: []
---

# T02: Migrare UI da mock a Jazz: CRUD elemento + link bidirezionali + fonti

Sostituire letture da `src/mock/data.ts` + overrides in `workspace-ui-store.ts` con letture dirette dai CoMap Jazz via adapter (es. `useWorkspaceRoot()` custom hook). Sostituire le mutation (commit elementoOverrides, commit fontiOverrides, createBidirectionalLink) con chiamate adapter che mutano CoMap direttamente. Conservare il pattern commit-grammar (pure helper -> atomic set -> 5s undo toast) ma sopra Jazz CoMap. Link bidirezionale automatico: dopo aver creato il forward link nel CoMap source, creare l'inverso nel CoMap target nello stesso transaction (Jazz CRDT merge è atomico per definition). Soft delete come flag `deletedAt` sul CoMap. Rimuovere codice dead del mock una volta verificato.

## Inputs

- `T01 completato`
- `pattern commit-grammar esistente da S02/S03`

## Expected Output

- `Tutte le mutation UI passano per Jazz adapter`
- `Mock file svuotato o marcato come fixture-only per test`
- `Reload verification passa per tutti i casi del successCriteria`

## Verification

Crea personaggio 'Abraamo' con nascita/morte/tribu -> ricarica -> persiste completo; aggiungi fonte bibbia Gen 12:1-3 -> persiste raggruppata; crea link padre Abraamo -> Isacco -> su Isacco appare figlio Abraamo automaticamente -> persiste al reload su entrambi; soft delete con toast Annulla -> dopo 30s elemento rimosso dalla lista.
