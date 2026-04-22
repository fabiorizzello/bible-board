# T03: Replan R005 inline per-campo su UnifiedEditorMockup (plan 02-03)

**Slice:** S02 — **Milestone:** M001

## Description

Create the missing replan for `R005` inside Phase 02. The current codebase already satisfies the old S02 truths (annotations, soft delete, and the type-aware domain editor contract), but the real workspace UI still uses a coarse mode-swap editor gated by `isEditing`. The refreshed phase context and `STATE.md` now require a new plan `02-03` that maps `src/ui/mockups/UnifiedEditorMockup.tsx` into production code as the canonical UX reference.

This refactor keeps Phase 02 inside its existing boundary: inline per-field editing, not a new slice; domain invariants remain anchored in `normalizeElementoInput`; dev-only mockup routes stay available through milestone M002; and S03 scope such as full fonti/catalog editing is explicitly deferred. The end state is an app-native detail pane where fields edit in place, complex edits use drawers/popovers instead of a page-level mode swap, and committed changes are visible immediately through a session-layer overlay on top of immutable mock data.

**Output:**
- A new executable refactor plan for `R005` that replaces the mode-swap interaction model with field-level editing.
- A concrete task sequence for state, shell, field primitives, add-field flows, and verification.
- An implementation path aligned with local HeroUI React v3 docs for `TextField`, `Dropdown`, `Popover`, `Drawer`, `Toolbar`, and `Form`.

## Must-Haves

- [ ] "The detail experience is inline per-field, not mode-swap: `editingFieldId` replaces the boolean `isEditing`, each editable affordance opens only its own control surface, and non-edited content remains visible."
- [ ] "The unified editor mockup is mapped into the real workspace shell: inline titolo, tipo chip picker, metadata chip editors, right-drawer editing for complex data, Milkdown-backed descrizione, data-driven array sections, and a single `+ Aggiungi campo` flow."
- [ ] "Field commits update the visible workspace session state immediately while preserving the existing domain contract (`ElementoInput`, `normalizeElementoInput`, 8 `ElementoTipo`) and keeping S03 concerns such as full fonti/catalog editing out of scope."

## Files

- `src/ui/workspace-home/workspace-ui-store.ts`
- `src/ui/workspace-home/display-helpers.ts`
- `src/ui/workspace-home/DetailPane.tsx`
- `src/ui/workspace-home/FullscreenOverlay.tsx`
- `src/ui/workspace-home/ElementoEditor.tsx`
- `src/ui/workspace-home/__tests__/display-helpers.test.ts`
