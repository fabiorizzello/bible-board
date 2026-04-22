# T02: Gap closure editor type-specific, 8 ElementoTipo esaustivi (plan 02-02)

**Slice:** S02 — **Milestone:** M001

## Description

Close the single gap flagged in `02-VERIFICATION.md` (goal property #1, "editor inline con campi tipo-specifici"). The verification passed 2/3 truths (annotazioni + soft delete) but FAILED the editor coverage: (a) `ElementoEditor.handleSave` silently drops every type-specific field before calling `normalizeElementoInput`; (b) 3 of 8 `ElementoTipo` variants (`evento`, `periodo`, `annotazione`) have NO type-specific UI branch; (c) the domain `ElementoInput` contract literally cannot hold 9 of the editor-state fields, so even if the UI tried to forward them the rules layer would reject them.

This plan takes **Option A** from the design hints: extend the domain (`ElementoInput`, `NormalizedElementoInput`, `normalizeElementoInput`) to match the `Elemento` read model, then refactor `ElementoEditor` to be exhaustive over all 8 tipos with a compile-time `const _exhaustive: never = tipo` guard. `handleSave` is rewritten to build a complete payload (shared + parsed `nascita`/`morte` via a `parseDataStorica` helper + `date` via `DataTemporale` branch for evento/periodo + all type-specific scalars). The `Select` null-guard from WR-03 and the partial `ERROR_MESSAGES` map from IN-03 are fixed as drive-by cleanup that directly enables the new error paths.

**Purpose:** satisfy the minimum contract "editor inline con campi tipo-specifici" end-to-end, with the exact same mock-data constraint as S02-01 — no Jazz persistence, immutable `ELEMENTI`, domain validation as the single point of truth. After this plan runs, `/gsd-verify-phase 02` should find 3/3 truths verified.

**Output:**
- Extended domain rules with 7 new optional fields + 1 new `ElementoError` variant.
- `ElementoEditor` refactored to an exhaustive switch on `ElementoTipo`, with 3 new sub-components (`EventoFields`, `PeriodoFields`, `AnnotazioneFields`), rewritten `handleSave`, null-guarded `Select`, extended `ERROR_MESSAGES`.
- New Vitest file `src/features/elemento/__tests__/elemento.rules.test.ts` with ≥9 test cases pinning the new behavior.
- `npx tsc --noEmit` exit 0. `npx vitest run` exit 0 (existing 55 tests + new ones, ~64+ total).

## Must-Haves

- [ ] "Click Modifica → editor inline mostra campi tipo-specifici (o placeholder esplicito) per ogni ElementoTipo (8/8 varianti con exhaustiveness-check); handleSave forwarda i campi type-specific a normalizeElementoInput; anni invalidi producono l'errore data_non_valida e lo espongono in UI"

## Files

- `src/features/elemento/elemento.rules.ts`
- `src/features/elemento/elemento.errors.ts`
- `src/ui/workspace-home/ElementoEditor.tsx`
- `src/features/elemento/__tests__/elemento.rules.test.ts`
