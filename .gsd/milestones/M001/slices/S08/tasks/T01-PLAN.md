---
estimated_steps: 1
estimated_files: 7
skills_used: []
---

# T01: Jazz schema + adapter layer + DemoAuth integration

Definire CoMap schemas (Elemento, Link, Fonte, Board, Workspace) usando jazz-tools `co.map()` / `co.list()`. Implementare adapter bidirezionali Jazz CoMap -> Domain model puro (parse con branded types via Zod safeParse al confine; reverse map per mutation). Integrare DemoAuth con account Jazz locale (localStorage). Al primo login, migration `withMigration` crea workspace root con nome 'Il mio workspace'. Nessuna modifica al domain puro (rules, errors) - solo nuovi file schema + adapter + auth refactor.

## Inputs

- `Domain puro esistente (elemento.model, elemento.rules, board.rules)`
- `Schemi Zod branded in src/features/shared/newtypes.ts`
- `Jazz docs - verificare api co.map / co.list / withMigration / LocalStorage provider correnti`

## Expected Output

- `5 schema file Jazz + 5 adapter puri testati`
- `DemoAuth wired a Jazz account`
- `Workspace default auto-creato al primo login`

## Verification

npx tsc --noEmit clean; npx vitest run verde (test adapter puri con CoMap fixtures); app si avvia con Jazz LocalStorage provider; primo login crea workspace default; logout/login riapre stesso workspace.
