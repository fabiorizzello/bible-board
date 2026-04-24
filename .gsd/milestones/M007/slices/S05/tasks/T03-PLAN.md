---
estimated_steps: 9
estimated_files: 1
skills_used: []
---

# T03: Aggiungere aria-pressed ai palette button del ThemeSwitcher

I pulsanti palette in `ThemeSwitcher.tsx` (~riga 201) sono toggle di selezione ma mancano di `aria-pressed` per comunicare lo stato attivo allo screen reader. Aggiungere `aria-pressed={activePalette === p.name}` (o equivalente — usa il nome reale della variabile di stato presente nel file). Il test del toggle: quando la palette corrente combacia con p.name → aria-pressed="true", altrimenti "false".

Steps:
1. Aprire `src/ui/workspace-home/ThemeSwitcher.tsx`, localizzare il map dei palette button (ricerca: `p.name` o il button che imposta la palette).
2. Aggiungere `aria-pressed={<paletteAttiva> === p.name}` (sostituire `<paletteAttiva>` con il nome della variabile/derivazione esistente).
3. Verificare tsc clean e test pass.

Must-haves:
- Ogni palette button ha aria-pressed booleano dinamico
- Nessun regression
- Tsc clean

## Inputs

- ``src/ui/workspace-home/ThemeSwitcher.tsx``

## Expected Output

- ``src/ui/workspace-home/ThemeSwitcher.tsx``

## Verification

pnpm tsc --noEmit && pnpm test --run && rg -n 'aria-pressed' src/ui/workspace-home/ThemeSwitcher.tsx

## Observability Impact

none.
