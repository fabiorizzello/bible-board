---
estimated_steps: 1
estimated_files: 4
skills_used: []
---

# T01: Board CRUD: create / rename / delete dalla sidebar

Azioni CRUD su Board persistite via Jazz (adapter da S08). Pulsante + nella sezione Board apre prompt per nome e crea il board. Click sul nome del board nella sidebar permette rinomina inline (Enter conferma, Esc annulla). Menu azioni board (tre puntini) con opzione Elimina che apre modal di conferma. Integrazione con board.rules.ts (pure helpers già esistenti) e board.adapter.ts (nuovo, da S08).

## Inputs

- `S08 board.schema.ts + board.adapter.ts pronti`
- `board.rules.ts pure helpers esistenti`

## Expected Output

- `CRUD board funzionante dalla sidebar`
- `Persistenza al reload verificata`
- `Test unit per board.rules nuove funzioni (rename, delete) se necessarie`

## Verification

Crea board 'Test' dalla sidebar -> appare in lista Board con conteggio 0; rinomina inline 'Test' -> 'Rinominato' -> Enter -> persiste; ricarica pagina -> board persiste; elimina 'Rinominato' -> modal conferma -> sparisce; elementi del workspace invariati.
