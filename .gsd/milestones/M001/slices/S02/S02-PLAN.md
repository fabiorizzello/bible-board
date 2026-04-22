# S02: Editor inline per-campo, annotazioni, soft delete

**Goal:** Editor inline per-campo (no mode swap, `editingFieldId` sostituisce `isEditing`), campi tipo-specifici via domain contract (8 `ElementoTipo`, `ElementoInput` / `normalizeElementoInput`), descrizione con Milkdown markdown, data-driven empty fields + menu `+ aggiungi campo`, collegamento picker HeroUI popover. Annotazioni mie/altrui nel detail. Soft delete con toast Annulla 30s.

**Demo:** Il detail pane modifica i campi in place, i tipi specifici mostrano i campi giusti, annotazioni filtrabili per autore, e il soft delete ripristinabile dal toast. Stato attuale: R001-R004 verificati (plan 02-01/02-02/02-03/02-04); R005 (rewrite ElementoEditor su UnifiedEditorMockup) in corso via T05 (plan 02-05).

## Must-Haves

- Editor inline per-campo con `editingFieldId`; no mode swap di pagina.
- 8 `ElementoTipo` esaustivi nell'editor; `normalizeElementoInput` come single point of truth.
- Descrizione Milkdown (MIT) come markdown string; `Elemento.descrizione: string` invariato.
- Annotazioni first-class filtrabili mie/altrui.
- Soft delete con toast Annulla 30s, restore ripristina selezione.

## Tasks

- [x] **T01: Editor elementi con ElementoTipo + annotazioni + soft delete (plan 02-01)**
- [x] **T02: Gap closure editor type-specific, 8 ElementoTipo esaustivi (plan 02-02)** `est:~25min`
  - Close the single gap flagged in `02-VERIFICATION.md` (goal property #1, "editor inline con campi tipo-specifici"). The verification passed 2/3 truths (annotazioni + soft delete) but FAILED the editor coverage: (a) `ElementoEditor.handleSave` silently drops every type-specific field before calling `normalizeElementoInput`; (b) 3 of 8 `ElementoTipo` variants (`evento`, `periodo`, `annotazione`) have NO type-specific UI branch; (c) the domain `ElementoInput` contract literally cannot hold 9 of the editor-state fields, so even if the UI tried to forward them the rules layer would reject them.

This plan takes **Option A** from the design hints: extend the domain (`ElementoInput`, `NormalizedElementoInput`, `normalizeElementoInput`) to match the `Elemento` read model, then refactor `ElementoEditor` to be exhaustive over all 8 tipos with a compile-time `const _exhaustive: never = tipo` guard. `handleSave` is rewritten to build a complete payload (shared + parsed `nascita`/`morte` via a `parseDataStorica` helper + `date` via `DataTemporale` branch for evento/periodo + all type-specific scalars). The `Select` null-guard from WR-03 and the partial `ERROR_MESSAGES` map from IN-03 are fixed as drive-by cleanup that directly enables the new error paths.

**Purpose:** satisfy the minimum contract "editor inline con campi tipo-specifici" end-to-end, with the exact same mock-data constraint as S02-01 — no Jazz persistence, immutable `ELEMENTI`, domain validation as the single point of truth. After this plan runs, `/gsd-verify-phase 02` should find 3/3 truths verified.

**Output:**
- Extended domain rules with 7 new optional fields + 1 new `ElementoError` variant.
- `ElementoEditor` refactored to an exhaustive switch on `ElementoTipo`, with 3 new sub-components (`EventoFields`, `PeriodoFields`, `AnnotazioneFields`), rewritten `handleSave`, null-guarded `Select`, extended `ERROR_MESSAGES`.
- New Vitest file `src/features/elemento/__tests__/elemento.rules.test.ts` with ≥9 test cases pinning the new behavior.
- `npx tsc --noEmit` exit 0. `npx vitest run` exit 0 (existing 55 tests + new ones, ~64+ total).
- [x] **T03: Replan R005 inline per-campo su UnifiedEditorMockup (plan 02-03)** `est:20min`
  - Create the missing replan for `R005` inside Phase 02. The current codebase already satisfies the old S02 truths (annotations, soft delete, and the type-aware domain editor contract), but the real workspace UI still uses a coarse mode-swap editor gated by `isEditing`. The refreshed phase context and `STATE.md` now require a new plan `02-03` that maps `src/ui/mockups/UnifiedEditorMockup.tsx` into production code as the canonical UX reference.

This refactor keeps Phase 02 inside its existing boundary: inline per-field editing, not a new slice; domain invariants remain anchored in `normalizeElementoInput`; dev-only mockup routes stay available through milestone M002; and S03 scope such as full fonti/catalog editing is explicitly deferred. The end state is an app-native detail pane where fields edit in place, complex edits use drawers/popovers instead of a page-level mode swap, and committed changes are visible immediately through a session-layer overlay on top of immutable mock data.

**Output:**
- A new executable refactor plan for `R005` that replaces the mode-swap interaction model with field-level editing.
- A concrete task sequence for state, shell, field primitives, add-field flows, and verification.
- An implementation path aligned with local HeroUI React v3 docs for `TextField`, `Dropdown`, `Popover`, `Drawer`, `Toolbar`, and `Form`.
- [x] **T04: Gap closure visuale detail shell vs UnifiedEditorMockup (plan 02-04)** `est:25min`
  - Close the visual/interaction gap left after `02-03`. The codebase now has the correct session/state and inline-editing foundation for `R005`, but the real UI still does not read like the canonical `UnifiedEditorMockup.tsx`. The current implementation is too form-like and preserves structural remnants the mockup explicitly removed: a standalone toolbar, heavier section shells, and a less integrated add-field experience.

This plan is a focused gap-closure pass for `R005`, not a new slice and not a domain rework. It exists to make the real detail shell feel like the mockup canon already chosen in `02-CONTEXT.md`. The comparison standard is strict: when the real code and `UnifiedEditorMockup.tsx` disagree on hierarchy, the mockup wins unless doing so would break the already-validated domain/session contract.

**Output:**
- A new executable fix plan that realigns the real workspace detail UI to the unified mockup.
- A concrete task sequence for shell simplification, metadata/body realignment, fullscreen parity, and regression verification.
- An implementation path that keeps `R005` inside S02 while explicitly leaving S03 concerns deferred.
- [x] **T05: Rewrite ElementoEditor su UnifiedEditorMockup (plan 02-05, pending)**
  - Replace the current Phase 02 editor implementation with a rewrite guided by the canonical `UnifiedEditorMockup.tsx`. The existing codebase already has the correct domain/session foundation for `R005`, but the current `ElementoEditor.tsx` still carries too much legacy structure from the earlier form-driven implementation. The phase context now explicitly locks a stronger decision: the current editor is not to be incrementally refined into compliance; it is to be removed as the active editing model and rewritten around the mockup's structure and interaction grammar.

This plan is still inside S02. It does not reopen the domain contract, does not absorb S03 source editing, and does not change the session-overlay model. It replaces the production editor shell so the real app follows the same information architecture as the unified mockup: integrated header, metadata chips as the first control layer, prose-first body, lightweight grouped arrays, and a body-native add flow. The rewrite must preserve annotations, soft delete, and fullscreen parity.

**Output:**
- A new executable rewrite plan that replaces the current `ElementoEditor` implementation with a mockup-driven unified editor shell.
- A concrete task sequence for editor replacement, shell reintegration, body/add-flow rewrite, and regression verification.
- An implementation path that keeps the proven S02 state/domain machinery while discarding the current editor structure as the source of truth.

## Files Likely Touched

- `src/features/elemento/elemento.rules.ts`
- `src/features/elemento/elemento.errors.ts`
- `src/ui/workspace-home/ElementoEditor.tsx`
- `src/features/elemento/__tests__/elemento.rules.test.ts`
- `src/ui/workspace-home/workspace-ui-store.ts`
- `src/ui/workspace-home/display-helpers.ts`
- `src/ui/workspace-home/DetailPane.tsx`
- `src/ui/workspace-home/FullscreenOverlay.tsx`
- `src/ui/workspace-home/ElementoEditor.tsx`
- `src/ui/workspace-home/__tests__/display-helpers.test.ts`
- `src/ui/workspace-home/DetailPane.tsx`
- `src/ui/workspace-home/FullscreenOverlay.tsx`
- `src/ui/workspace-home/ElementoEditor.tsx`
- `src/ui/workspace-home/__tests__/display-helpers.test.ts`
- `src/ui/workspace-home/ElementoEditor.tsx`
- `src/ui/workspace-home/DetailPane.tsx`
- `src/ui/workspace-home/FullscreenOverlay.tsx`
- `src/ui/workspace-home/workspace-ui-store.ts`
- `src/ui/workspace-home/__tests__/display-helpers.test.ts`
