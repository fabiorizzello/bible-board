---
estimated_steps: 1
estimated_files: 3
skills_used: []
---

# T01: Fonti cliccabili + editor link inline con ruolo parentela

Sezione Fonti nel detail: link cliccabili raggruppati per FonteTipo. Editor link inline su detail con picker HeroUI popover e selettore tipo/ruolo. Creazione link propaga inverso automatico.

## Inputs

- `S03 output: Jazz CRUD attivo`
- `src/features/elemento/elemento.model.ts (link types)`

## Expected Output

- `Fonti raggruppate per tipo con link cliccabili`
- `Editor link inline con selettore tipo/ruolo parentela`
- `Link inverso creato automaticamente`

## Verification

Fonte bibbia mostra URL WOL cliccabile; link padre da A→B crea figlio B→A; R006 e R007 coperti
