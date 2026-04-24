---
id: T02
parent: S02
milestone: M007
key_files:
  - src/ui/workspace-home/ElementoEditor.tsx
key_decisions:
  - Jazz elements are read fresh on every render (no useMemo) to build the liveElementoIds Set — same pattern as familyCandidates/genericCandidates in the same file, which comments document as intentional so new Jazz elements are always visible
  - Field-mapping constants (VALIDITY_FIELD_MAP, VALIDITY_LABEL_MAP) are module-level to avoid recreation on every render
  - Both 'nascita' and 'morte' map to the 'vita' EditableFieldId, which is the container field for all date-related UI in the editor
duration: 
verification_result: passed
completed_at: 2026-04-24T09:51:42.740Z
blocker_discovered: false
---

# T02: Rewired ElementoEditor to use computeValidityWarnings domain helper, removing all completeness checks

**Rewired ElementoEditor to use computeValidityWarnings domain helper, removing all completeness checks**

## What Happened

Removed the local `getWarnings` function (lines 193–229) which checked for missing description, roles, tags, and links — all completeness checks that no longer belong in the warning system. 

Added `computeValidityWarnings` and `ValidityWarning` to the imports from `@/features/elemento/elemento.rules`. Two module-level constant maps (`VALIDITY_FIELD_MAP`, `VALIDITY_LABEL_MAP`) translate domain field names (`date`, `nascita`, `morte`, `link`) to UI-layer `EditableFieldId` values (`vita`, `vita`, `vita`, `collegamenti-generici`) and Italian labels (`Data`, `Nascita`, `Morte`, `Collegamento`).

In the component body, `getJazzElementi()` is called fresh on every render (matching the existing pattern for `familyCandidates`/`genericCandidates`) to build a live `Set<string>` of non-soft-deleted element IDs. The resolver predicate `(id) => liveElementoIds.has(id)` is passed directly to `computeValidityWarnings`, which returns `ValidityWarning[]` that are then mapped to `ValidationWarning[]` for `<ReviewDrawer>`.

The `ValidationWarning` local type and the `<ReviewDrawer warnings={...} />` call site required no changes — the mapping maintains type compatibility.

## Verification

Ran all four verification checks from the task plan:
1. `rg 'function getWarnings' src/ui/workspace-home/ElementoEditor.tsx | wc -l` → 0 (function removed)
2. `rg 'computeValidityWarnings' src/ui/workspace-home/ElementoEditor.tsx` → import line + call site confirmed
3. `rg -i 'manca una descrizione|nessun ruolo definito|tag sono vuoti|nessun collegamento visibile' src/` → no matches (completeness strings absent)
4. `pnpm test --run` → 135/135 tests passed
5. `pnpm tsc --noEmit` → no errors

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `rg -n 'function getWarnings' src/ui/workspace-home/ElementoEditor.tsx | wc -l | grep -q '^0$'` | 0 | ✅ pass | 50ms |
| 2 | `rg -n 'computeValidityWarnings' src/ui/workspace-home/ElementoEditor.tsx` | 0 | ✅ pass | 50ms |
| 3 | `rg -i 'manca una descrizione|nessun ruolo definito|tag sono vuoti|nessun collegamento visibile' src/ | (! grep -q .)` | 0 | ✅ pass | 50ms |
| 4 | `pnpm test --run` | 0 | ✅ pass — 135/135 tests | 689ms |
| 5 | `pnpm tsc --noEmit` | 0 | ✅ pass — no errors | 8000ms |

## Deviations

none

## Known Issues

none

## Files Created/Modified

- `src/ui/workspace-home/ElementoEditor.tsx`
