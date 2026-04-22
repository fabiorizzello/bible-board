# T04: Gap closure visuale detail shell vs UnifiedEditorMockup (plan 02-04)

**Slice:** S02 — **Milestone:** M001

## Description

Close the visual/interaction gap left after `02-03`. The codebase now has the correct session/state and inline-editing foundation for `R005`, but the real UI still does not read like the canonical `UnifiedEditorMockup.tsx`. The current implementation is too form-like and preserves structural remnants the mockup explicitly removed: a standalone toolbar, heavier section shells, and a less integrated add-field experience.

This plan is a focused gap-closure pass for `R005`, not a new slice and not a domain rework. It exists to make the real detail shell feel like the mockup canon already chosen in `02-CONTEXT.md`. The comparison standard is strict: when the real code and `UnifiedEditorMockup.tsx` disagree on hierarchy, the mockup wins unless doing so would break the already-validated domain/session contract.

**Output:**
- A new executable fix plan that realigns the real workspace detail UI to the unified mockup.
- A concrete task sequence for shell simplification, metadata/body realignment, fullscreen parity, and regression verification.
- An implementation path that keeps `R005` inside S02 while explicitly leaving S03 concerns deferred.

## Must-Haves

- [ ] "The real detail shell visually and behaviorally matches the canonical `UnifiedEditorMockup.tsx`: no separate action toolbar, header-integrated actions, metadata chips as the primary editing layer, lighter array sections, and a body-native `+ Aggiungi campo` flow."
- [ ] "Pane and fullscreen present the same shell and editing grammar; fullscreen is an extension of the same unified detail experience, not a parallel variant."
- [ ] "The realignment preserves the validated domain/session behavior from `02-03` (`editingFieldId`, session overrides, `normalizeElementoInput`) while keeping S03 concerns explicitly deferred."

## Files

- `src/ui/workspace-home/DetailPane.tsx`
- `src/ui/workspace-home/FullscreenOverlay.tsx`
- `src/ui/workspace-home/ElementoEditor.tsx`
- `src/ui/workspace-home/__tests__/display-helpers.test.ts`
