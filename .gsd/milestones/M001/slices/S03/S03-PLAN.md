# S03: Fonti e link editor inline

**Goal:** Sostituire i dati mock con Jazz CRDTs: schema reale, adapter, CRUD persistente su tutti i tipi elemento con link bidirezionali automatici e fonti.
**Demo:** detail mostra fonti come link cliccabili raggruppati per tipo; editor link inline con selettore tipo e ruolo parentela.

## Must-Haves

- App funziona con Jazz locale (no mock): crea/modifica/elimina elemento persiste al reload; link bidirezionale creato automaticamente; fonti persistite per tipo.

## Proof Level

- This slice proves: Not provided.

## Integration Closure

Not provided.

## Verification

- Not provided.

## Tasks

- [x] **T01: Jazz schema + adapter layer** `est:3h`
  Definire CoMap schemas (Elemento, Link, Fonte, Board, Workspace) con jazz-tools. Implementare adapter Jazz→domain puro. DemoAuth con account Jazz. Workspace auto-creato al primo login.
  - Files: `src/features/elemento/elemento.schema.ts`, `src/features/elemento/elemento.adapter.ts`, `src/features/workspace/workspace.schema.ts`, `src/features/workspace/workspace.adapter.ts`, `src/app/auth-context.tsx`
  - Verify: TypeScript compila senza errori; test adapter puri passano; app si avvia con Jazz LocalStorage provider

- [x] **T02: CRUD Elemento + link bidirezionali + fonti con Jazz** `est:3h`
  Collegare ElementoEditor e ListPane a Jazz: createElemento, updateElemento, deleteElemento (soft). Link bidirezionale automatico alla creazione/rimozione. Fonti persistite come CoList su Elemento.
  - Files: `src/ui/workspace-home/ElementoEditor.tsx`, `src/ui/workspace-home/ListPane.tsx`, `src/ui/workspace-home/DetailPane.tsx`, `src/features/elemento/elemento.adapter.ts`
  - Verify: Crea elemento → appare in lista al reload; soft delete → non appare; crea link padre → inverso figlio appare su target; aggiungi fonte → persiste

## Files Likely Touched

- src/features/elemento/elemento.schema.ts
- src/features/elemento/elemento.adapter.ts
- src/features/workspace/workspace.schema.ts
- src/features/workspace/workspace.adapter.ts
- src/app/auth-context.tsx
- src/ui/workspace-home/ElementoEditor.tsx
- src/ui/workspace-home/ListPane.tsx
- src/ui/workspace-home/DetailPane.tsx
