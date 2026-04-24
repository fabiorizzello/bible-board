---
id: S02
parent: M007
milestone: M007
provides:
  - ["computeValidityWarnings(elemento, resolveId) in elemento.rules.ts — pure domain helper for real validity warnings", "ValidityWarning interface (field, targetId?, message)", "Completeness checks fully removed from ElementoEditor warning pipeline"]
requires:
  []
affects:
  []
key_files:
  - (none)
key_decisions:
  - ["computeValidityWarnings uses a resolveId predicate not a Set — keeps domain pure, callers supply Jazz state without coupling the domain layer", "Jazz element IDs read fresh every render (no useMemo) for live resolver — matches established familyCandidates pattern, prevents stale Set over removed elements", "nascita and morte both map to 'vita' EditableFieldId — 'vita' is the UI container for all date-related fields in ElementoEditor"]
patterns_established:
  - ["Domain warning helpers: pure function + caller-supplied predicate pattern for Jazz-agnostic domain logic", "Field-mapping constants at module level (VALIDITY_FIELD_MAP, VALIDITY_LABEL_MAP) for domain→UI translation without per-render object creation"]
observability_surfaces:
  - none
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-04-24T09:53:31.947Z
blocker_discovered: false
---

# S02: Warning reali (rimozione check di completezza)

**Replaced completeness-based warnings with real validity checks: elemento minimale generates 0 warnings; invalid date or broken link generates targeted inline warning.**

## What Happened

S02 replaced the old completeness-based warning system (missing description, roles, tags, links) with validity-only checks covering malformed dates and unresolvable link targets.

**T01 — Domain helper:** Added `ValidityWarning` interface and `computeValidityWarnings(elemento, resolveId)` as a pure function in `src/features/elemento/elemento.rules.ts`. The function checks `elemento.date` via `validateDataTemporale`, `elemento.nascita`/`morte` via `validateDataStorica`, and each link via a caller-supplied `resolveId: (id: string) => boolean` predicate. Zero Jazz/React imports enter the domain layer. Nine unit tests added covering: minimal annotazione → [], valid date → 0 warnings, each invalid date field → correct warning, resolved link → 0, unresolved link → 1 with targetId, mixed links → exactly 1 for broken, and regression tests confirming empty description/tags/roles/links produce no warnings.

**T02 — UI rewire:** Removed `getWarnings` (lines 193–229) from `ElementoEditor.tsx`. Imported `computeValidityWarnings` from the domain. Two module-level maps (`VALIDITY_FIELD_MAP`, `VALIDITY_LABEL_MAP`) translate domain field names to `EditableFieldId` values (`'vita'` for all date fields, `'collegamenti-generici'` for links) and Italian labels. The live resolver reads `getJazzElementi()` fresh on every render (matching the established pattern for familyCandidates/genericCandidates) to build a `Set<string>` of non-soft-deleted IDs. The `ValidationWarning[]` consumed by `<ReviewDrawer>` required no type changes.

**Net result:** Elemento minimale (solo titolo, tipo annotazione) → 0 warning. Data malformata → warning `field='vita'`. Link a ID inesistente → warning `field='collegamenti-generici'`. R048 validated.

## Verification

1. `rg 'function getWarnings' src/ui/workspace-home/ElementoEditor.tsx | wc -l` → 0 ✅
2. `rg -n 'computeValidityWarnings' src/ui/workspace-home/ElementoEditor.tsx` → import + call site confirmed ✅
3. `rg -i 'manca una descrizione|nessun ruolo definito|tag sono vuoti|nessun collegamento visibile' src/` → 0 matches ✅
4. `pnpm test --run` → 135/135 tests pass ✅ (up from 126, +9 new validity tests)
5. `pnpm tsc --noEmit` → clean ✅

## Requirements Advanced

None.

## Requirements Validated

- R048 — computeValidityWarnings checks only date invalida and referenza rotta. Completeness strings fully absent from src/. 135/135 tests pass, tsc clean. 2026-04-24.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

None.

## Known Limitations

None.

## Follow-ups

None.

## Files Created/Modified

- `src/features/elemento/elemento.rules.ts` — Added ValidityWarning interface and computeValidityWarnings pure domain function
- `src/features/elemento/__tests__/elemento.rules.test.ts` — Added 9 unit tests for computeValidityWarnings
- `src/ui/workspace-home/ElementoEditor.tsx` — Removed getWarnings, wired computeValidityWarnings with live Jazz resolver and field-mapping constants
