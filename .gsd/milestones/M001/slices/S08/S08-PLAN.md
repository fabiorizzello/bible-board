# S08: Jazz persistence - migrazione mock a CRDT

**Goal:** Migrare il prototipo dai mock ai Jazz CRDTs. Definire schemi CoMap (Elemento, Link, Fonte, Board, Workspace), implementare adapter Jazz -> domain puro, collegare UI esistente (ElementoEditor, ListPane, DetailPane, FontiSection, helpers link bidirezionali) a Jazz. DemoAuth con account Jazz locale. Il risultato: ricaricando la pagina, tutto lo stato persiste.
**Demo:** crea elemento, ricarica pagina, persiste; crea link padre A to B, inverso figlio appare su B senza intervento; fonti persistite per tipo sopravvivono al reload; DemoAuth con account Jazz locale

## Must-Haves

- Crea elemento -> ricarica pagina -> elemento persiste con tutti i campi (descrizione, tipo-specifici, fonti, link, annotazioni)
- Crea link padre A -> B -> link inverso figlio appare su B senza intervento manuale -> persiste al reload
- Aggiungi fonte (bibbia / articolo-wol / pubblicazione / link) -> persiste per tipo -> riappare raggruppata dopo reload
- Soft delete elemento con toast Annulla -> annullato entro 30s riappare -> dopo 30s persiste come eliminato
- DemoAuth crea account Jazz al primo login -> logout / login stesso utente -> vede stesso workspace
- Workspace auto-creato al primo accesso con nome "Il mio workspace"

## Proof Level

- This slice proves: end-to-end

## Integration Closure

Sblocco per S04 (Board CRUD persistenti), S05 (Timeline su dati reali), S07 (UAT end-to-end). Dopo S08, le session overrides in workspace-ui-store (fontiOverrides, elementOverrides) vengono sostituite da mutation Jazz - il mock resta disponibile solo come fixture per i test.

## Verification

- Badge sync nell'header (sincronizzato / in sincronizzazione / offline) collegato allo stato Jazz sync. Console.warn su fallimenti adapter -> domain parse (es. CoMap malformata, branded type reject). Errori utente-facing via toast con messaggio in italiano.

## Tasks

- [x] **T01: Jazz schema + adapter layer + DemoAuth integration** `est:4h`
  Definire CoMap schemas (Elemento, Link, Fonte, Board, Workspace) usando jazz-tools `co.map()` / `co.list()`. Implementare adapter bidirezionali Jazz CoMap -> Domain model puro (parse con branded types via Zod safeParse al confine; reverse map per mutation). Integrare DemoAuth con account Jazz locale (localStorage). Al primo login, migration `withMigration` crea workspace root con nome 'Il mio workspace'. Nessuna modifica al domain puro (rules, errors) - solo nuovi file schema + adapter + auth refactor.
  - Files: `src/features/elemento/elemento.schema.ts`, `src/features/elemento/elemento.adapter.ts`, `src/features/board/board.schema.ts`, `src/features/board/board.adapter.ts`, `src/features/workspace/workspace.schema.ts`, `src/features/workspace/workspace.adapter.ts`, `src/app/auth-context.tsx`
  - Verify: npx tsc --noEmit clean; npx vitest run verde (test adapter puri con CoMap fixtures); app si avvia con Jazz LocalStorage provider; primo login crea workspace default; logout/login riapre stesso workspace.

- [x] **T02: Migrare UI da mock a Jazz: CRUD elemento + link bidirezionali + fonti** `est:4h`
  Sostituire letture da `src/mock/data.ts` + overrides in `workspace-ui-store.ts` con letture dirette dai CoMap Jazz via adapter (es. `useWorkspaceRoot()` custom hook). Sostituire le mutation (commit elementoOverrides, commit fontiOverrides, createBidirectionalLink) con chiamate adapter che mutano CoMap direttamente. Conservare il pattern commit-grammar (pure helper -> atomic set -> 5s undo toast) ma sopra Jazz CoMap. Link bidirezionale automatico: dopo aver creato il forward link nel CoMap source, creare l'inverso nel CoMap target nello stesso transaction (Jazz CRDT merge è atomico per definition). Soft delete come flag `deletedAt` sul CoMap. Rimuovere codice dead del mock una volta verificato.
  - Files: `src/ui/workspace-home/ElementoEditor.tsx`, `src/ui/workspace-home/ListPane.tsx`, `src/ui/workspace-home/DetailPane.tsx`, `src/ui/workspace-home/FullscreenOverlay.tsx`, `src/ui/workspace-home/workspace-ui-store.ts`, `src/mock/data.ts`
  - Verify: Crea personaggio 'Abraamo' con nascita/morte/tribu -> ricarica -> persiste completo; aggiungi fonte bibbia Gen 12:1-3 -> persiste raggruppata; crea link padre Abraamo -> Isacco -> su Isacco appare figlio Abraamo automaticamente -> persiste al reload su entrambi; soft delete con toast Annulla -> dopo 30s elemento rimosso dalla lista.

## Files Likely Touched

- src/features/elemento/elemento.schema.ts
- src/features/elemento/elemento.adapter.ts
- src/features/board/board.schema.ts
- src/features/board/board.adapter.ts
- src/features/workspace/workspace.schema.ts
- src/features/workspace/workspace.adapter.ts
- src/app/auth-context.tsx
- src/ui/workspace-home/ElementoEditor.tsx
- src/ui/workspace-home/ListPane.tsx
- src/ui/workspace-home/DetailPane.tsx
- src/ui/workspace-home/FullscreenOverlay.tsx
- src/ui/workspace-home/workspace-ui-store.ts
- src/mock/data.ts
