# S04: Board CRUD e ricerca

**Goal:** Detail mostra fonti come link cliccabili raggruppati per tipo. Editor link inline con selettore TipoLink e RuoloLink parentela; link bidirezionali automatici.
**Demo:** crea board da sidebar, rinomina inline, elimina con conferma, vista lista compatta con ordinamento, ricerca cross-view.

## Must-Haves

- Utente aggiunge fonte a elemento e clicca per aprire URL; crea link "padre" da personaggio A a B e il link inverso appare su B senza intervento manuale.

## Proof Level

- This slice proves: Not provided.

## Integration Closure

Not provided.

## Verification

- Not provided.

## Tasks

- [ ] **T01: Fonti cliccabili + editor link inline con ruolo parentela** `est:3h`
  Sezione Fonti nel detail: link cliccabili raggruppati per FonteTipo. Editor link inline su detail con picker HeroUI popover e selettore tipo/ruolo. Creazione link propaga inverso automatico.
  - Files: `src/features/elemento/elemento.rules.ts`, `src/ui/workspace-home/DetailPane.tsx`, `src/ui/workspace-home/FullscreenOverlay.tsx`
  - Verify: Fonte bibbia mostra URL WOL cliccabile; link padre da A→B crea figlio B→A; R006 e R007 coperti

## Files Likely Touched

- src/features/elemento/elemento.rules.ts
- src/ui/workspace-home/DetailPane.tsx
- src/ui/workspace-home/FullscreenOverlay.tsx
