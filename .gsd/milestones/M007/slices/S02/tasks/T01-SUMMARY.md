---
id: T01
parent: S02
milestone: M007
key_files:
  - src/features/elemento/elemento.rules.ts
  - src/features/elemento/__tests__/elemento.rules.test.ts
key_decisions:
  - computeValidityWarnings accepts a resolveId predicate (not a Set or Map) so callers control how they look up live elemento state from Jazz without coupling the domain to the adapter layer
duration: 
verification_result: passed
completed_at: 2026-04-24T09:49:07.554Z
blocker_discovered: false
---

# T01: Added computeValidityWarnings domain helper with ValidityWarning interface and 9 exhaustive unit tests covering date, link, and regression-against-completeness checks

**Added computeValidityWarnings domain helper with ValidityWarning interface and 9 exhaustive unit tests covering date, link, and regression-against-completeness checks**

## What Happened

Added `ValidityWarning` interface and `computeValidityWarnings(elemento, resolveId)` to `src/features/elemento/elemento.rules.ts`. The function stays pure domain (zero Jazz/React imports): it checks `elemento.date` via `validateDataTemporale`, `elemento.nascita`/`elemento.morte` via `validateDataStorica`, and each link via the caller-supplied `resolveId` predicate. `Elemento` was added to the existing model import on line 6; no new imports were needed since the validators were already imported.

Added 9 test cases in a new `describe('computeValidityWarnings', ...)` block in the existing test file. A `makeElemento` fixture builder constructs minimal `Elemento` objects using a type cast for the branded `ElementoId` (acceptable in test fixtures). Tests cover: minimal annotazione → empty array, valid date → 0 warnings, invalid date (anno=0) → field='date', invalid nascita (NaN) → field='nascita', invalid morte (negative) → field='morte', resolved link → 0 warnings, unresolved link → field='link' with targetId, mixed links → exactly 1 warning for the broken one, and regression check that empty descrizione/tags/ruoli/link produce no warnings.

## Verification

Ran `pnpm test --run src/features/elemento/__tests__/elemento.rules.test.ts`: 39 tests passed (30 pre-existing + 9 new). Ran `pnpm tsc --noEmit`: clean. Confirmed export with `rg -n 'export function computeValidityWarnings'`: found at line 337.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm test --run src/features/elemento/__tests__/elemento.rules.test.ts` | 0 | ✅ pass | 431ms |
| 2 | `pnpm tsc --noEmit` | 0 | ✅ pass | 8000ms |
| 3 | `rg -n 'export function computeValidityWarnings' src/features/elemento/elemento.rules.ts` | 0 | ✅ pass | 50ms |

## Deviations

none

## Known Issues

none

## Files Created/Modified

- `src/features/elemento/elemento.rules.ts`
- `src/features/elemento/__tests__/elemento.rules.test.ts`
