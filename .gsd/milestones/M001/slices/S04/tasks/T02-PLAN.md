---
estimated_steps: 1
estimated_files: 4
skills_used: []
---

# T02: Vista lista board con ordinamento + ricerca cross-view

Implementare la vista lista per un board selezionato: layout compatto con elementi membri del board, ordinabile per titolo / data / tipo. Aggiungere input di ricerca nell'header del detail pane che filtra per titolo, tag e descrizione. Nelle viste non-lista (placeholder o future), i non-match ricevono opacity-30 invece di essere rimossi.

## Inputs

- `T01 completato`
- `display-helpers esistenti`

## Expected Output

- `Vista lista board ordinabile`
- `Ricerca cross-view funzionante con filter su lista + dimming su spaziali`
- `Test display-helpers per sort + filter`

## Verification

Seleziona board con 3 elementi -> vista lista mostra i 3; click header colonna -> ordinamento cambia; scrive 'Abraamo' nella search -> lista filtrata; cancella search -> lista torna completa; ordinamento persiste per sessione.
