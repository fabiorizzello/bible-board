---
id: T05
parent: S02
milestone: M001
key_files:
  - src/ui/workspace-home/ElementoEditor.tsx
  - src/ui/workspace-home/DetailPane.tsx
  - src/ui/mockups/UnifiedEditorMockup.tsx
key_decisions:
  - ScalarChip adopts blur-to-save with skipBlur ref (not explicit buttons) — undo is via toast, not inline Cancel
  - buildElementoInput rewritten as spread-based return to satisfy readonly ElementoInput contract
  - Chip remove buttons rendered as inline X button children since HeroUI v3 Chip has no onClose prop
  - DashedAddChip exported in mockup to resolve noUnusedLocals without deleting the reference design
duration: 
verification_result: passed
completed_at: 2026-04-22T09:26:33.397Z
blocker_discovered: false
---

# T05: Rewrote ElementoEditor to unified mockup grammar: per-field undo toast on every commit, ScalarChip blur-to-save, robust link filtering, and all TypeScript errors resolved

**Rewrote ElementoEditor to unified mockup grammar: per-field undo toast on every commit, ScalarChip blur-to-save, robust link filtering, and all TypeScript errors resolved**

## What Happened

## Context

T04 had already aligned ElementoEditor's visual/structural hierarchy to the UnifiedEditorMockup (integrated header, metadata chips, body-native add-field flow). T05's job was to complete the behavioral gap: the "blur-to-save + toast undo as the single commit grammar" — the one thing the mockup locked that the production code was missing.

## What Changed

### 1. Per-field undo toast (`commitPatch` rewrite)
The core change: every field mutation now shows a 5-second toast with an "Annulla" rollback action, matching the mockup's unified commit grammar. The implementation captures a `prevElement` snapshot before committing, then the toast's `onPress` handler re-normalizes and re-commits the previous state via `commitNormalizedElement` (with `commitElementPatch` for `link` patches). This makes every scalar field, array add/remove, and link add/remove reversible from the toast — not just soft delete.

The `successMessage: string` parameter was replaced with `label: string` (the field label), and all callers updated: `"Titolo aggiornato"`, `"Tag aggiunto"`, `"Collegamento rimosso"`, etc.

### 2. ScalarChip: blur-to-save
Removed the explicit Salva/Annulla buttons from the ScalarChip popover. The chip now commits on blur (moves focus away) or Enter, and cancels on Escape via a `skipBlur` ref that blocks the blur handler when Escape is pressed. Added `autoFocus` so the input is immediately active. This aligns with the mockup's `MetaChipText` pattern.

### 3. Robust link filtering
Replaced index-based `familyLinks`/`genericLinks` filtering (fragile when array reorders) with `link.tipo === "parentela"` predicate on the resolved links array.

### 4. TypeScript fixes (all in scope)
- **Unused imports**: removed `Text` from heroui imports, `DataTemporale` from value-objects import. `X` kept (now used in chip remove buttons).
- **`buildElementoInput` readonly mutation**: rewrote from mutating `input.date = ...` pattern to a spread-based return: `{ ...base, ...(hasDate ? { date } : {}), ...typeSpecific }`. Eliminates 9 TS2540 errors against `ElementoInput`'s readonly fields.
- **`globalAddOptions` type**: added `as EditableFieldId` casts on field literals so `.filter()` doesn't widen them to `string`.
- **`Chip.onClose` (HeroUI v3)**: HeroUI v3 Chip has no `onClose` prop. Replaced with an inline `<button>` + `<X />` icon inside the chip's children in both `ArraySection` and `LinkSection`. Resolves 2 TS2322 errors.
- **`DetailPane.tsx` unused imports**: removed `BookOpen`, `Link2`, `formatElementDate` (pre-existing).
- **`UnifiedEditorMockup.tsx` unused local**: added `export` to `DashedAddChip` (was defined but never used in scope).

### commitScalar label threading
Added optional `label` parameter to `commitScalar` (default `"Campo aggiornato"`). Call sites for tribu and regione now pass `"Tribu aggiornata"` and `"Regione aggiornata"` respectively for clearer toast messages.

## Result
All three must-haves satisfied:
1. ✅ Mode-swap removed; unified inline editor shell derived from mockup (done across T01-T05)
2. ✅ Blur-to-save + toast undo is now the SINGLE commit grammar across all field types
3. ✅ `editingFieldId`, session overlays, `normalizeElementoInput`, annotations, soft delete, and fullscreen parity all preserved

## Verification

- `pnpm run lint` (`tsc -b --noEmit`): exit 0, no errors
- `pnpm test` (`vitest run`): 74 tests across 3 files, all pass
- Must-have checklist manually confirmed via code review: per-field undo toast in `commitPatch`, `ScalarChip` blur-to-save with `skipBlur` ref, link filtering uses `link.tipo` predicate

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm run lint` | 0 | ✅ pass | 8200ms |
| 2 | `pnpm test` | 0 | ✅ pass — 74 tests, 3 files | 804ms |

## Deviations

Fixed pre-existing TypeScript errors (buildElementoInput readonly mutations, Chip.onClose, unused imports in DetailPane and UnifiedEditorMockup) that blocked `tsc -b --noEmit` exit 0. These were outside the T05 plan but required for the verification gate.

## Known Issues

none

## Files Created/Modified

- `src/ui/workspace-home/ElementoEditor.tsx`
- `src/ui/workspace-home/DetailPane.tsx`
- `src/ui/mockups/UnifiedEditorMockup.tsx`
