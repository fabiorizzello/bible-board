# S05: Timeline D3 SVG con zoom/pan e popup

**Goal:** Crea board da sidebar, rinomina inline, elimina con conferma. Vista lista compatta con ordinamento. Ricerca cross-view su elementi e board.
**Demo:** vista timeline con asse verticale SVG, card posizionate, zoom cambia scala, pan con drag, popup compatto su click card.

## Must-Haves

- Utente crea board dalla sidebar, la rinomina in place, vede elementi filtrati, cambia ordinamento, cancella con conferma. La search box trova sia elementi sia board.

## Proof Level

- This slice proves: Not provided.

## Integration Closure

Not provided.

## Verification

- Not provided.

## Tasks

- [x] **T01: Board CRUD + ricerca cross-view** `est:3h`
  Board CRUD dalla sidebar (crea, rinomina inline, elimina con conferma). Vista lista compatta con ordinamento. Ricerca cross-view. Consegna R008 e R009.
  - Files: `src/features/board/board.rules.ts`, `src/ui/workspace-home/NavSidebar.tsx`, `src/ui/workspace-home/ListPane.tsx`
  - Verify: Crea board → appare in sidebar; rinomina inline → persiste; elimina con conferma → scompare; search trova board e elementi; R008 e R009 coperti

## Files Likely Touched

- src/features/board/board.rules.ts
- src/ui/workspace-home/NavSidebar.tsx
- src/ui/workspace-home/ListPane.tsx
