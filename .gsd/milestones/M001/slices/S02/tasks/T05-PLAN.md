# T05: Rewrite ElementoEditor su UnifiedEditorMockup (plan 02-05, pending)

**Slice:** S02 — **Milestone:** M001

## Description

Replace the current Phase 02 editor implementation with a rewrite guided by the canonical `UnifiedEditorMockup.tsx`. The existing codebase already has the correct domain/session foundation for `R005`, but the current `ElementoEditor.tsx` still carries too much legacy structure from the earlier form-driven implementation. The phase context now explicitly locks a stronger decision: the current editor is not to be incrementally refined into compliance; it is to be removed as the active editing model and rewritten around the mockup's structure and interaction grammar.

This plan is still inside S02. It does not reopen the domain contract, does not absorb S03 source editing, and does not change the session-overlay model. It replaces the production editor shell so the real app follows the same information architecture as the unified mockup: integrated header, metadata chips as the first control layer, prose-first body, lightweight grouped arrays, and a body-native add flow. The rewrite must preserve annotations, soft delete, and fullscreen parity.

**Output:**
- A new executable rewrite plan that replaces the current `ElementoEditor` implementation with a mockup-driven unified editor shell.
- A concrete task sequence for editor replacement, shell reintegration, body/add-flow rewrite, and regression verification.
- An implementation path that keeps the proven S02 state/domain machinery while discarding the current editor structure as the source of truth.

## Must-Haves

- [ ] "The current `src/ui/workspace-home/ElementoEditor.tsx` mode-swap/form-derived implementation is replaced by a unified inline editor shell derived directly from `src/ui/mockups/UnifiedEditorMockup.tsx`, not incrementally polished in place."
- [ ] "The real detail experience matches the mockup's interaction contract: integrated header, metadata chip row, prose-first descrizione, lightweight array/link sections, body-native `+ Aggiungi campo`, and `blur-to-save + toast undo` as the single commit grammar."
- [ ] "The rewrite preserves the validated S02 foundations already in the repo: `editingFieldId`, session overlays, `normalizeElementoInput`, annotations, soft delete, and fullscreen parity, while keeping S03 fonti/catalog editing explicitly deferred."

## Files

- `src/ui/workspace-home/ElementoEditor.tsx`
- `src/ui/workspace-home/DetailPane.tsx`
- `src/ui/workspace-home/FullscreenOverlay.tsx`
- `src/ui/workspace-home/workspace-ui-store.ts`
- `src/ui/workspace-home/__tests__/display-helpers.test.ts`
