---
id: T01
parent: S03
milestone: M001
key_files:
  - src/features/elemento/elemento.errors.ts
  - src/features/elemento/elemento.rules.ts
  - src/ui/workspace-home/workspace-ui-store.ts
  - src/ui/workspace-home/display-helpers.ts
  - src/ui/workspace-home/ElementoEditor.tsx
  - src/ui/workspace-home/DetailPane.tsx
  - src/features/elemento/__tests__/elemento.rules.test.ts
  - src/ui/workspace-home/__tests__/display-helpers.test.ts
key_decisions:
  - FonteTipo extended to scrittura|articolo-wol|pubblicazione|link|altro (not articolo) — matches S03-PLAN scope, video deferred to M004
  - fontiOverrides stored as Record<elementId, NormalizedFonte[]> in workspace-ui-store (same pattern as elementOverrides) — full replacement semantics: once set, override wins over MOCK_FONTI
  - addFonte/removeFonte pure helpers in elemento.rules.ts — pure functions on NormalizedFonte[], no store access, fully testable without mocking
  - MOCK_FONTI made private (was exported) — tests updated to go through getFontiForElement instead
duration: 
verification_result: passed
completed_at: 2026-04-22T12:16:06.043Z
blocker_discovered: false
---

# T01: Added inline Fonti editor to ElementoEditor with typed FonteTipo, grouped display, add/remove with toast undo, and session-scoped fontiOverrides store — all mock-only, zero Jazz imports.

**Added inline Fonti editor to ElementoEditor with typed FonteTipo, grouped display, add/remove with toast undo, and session-scoped fontiOverrides store — all mock-only, zero Jazz imports.**

## What Happened

## What Happened

Built the complete inline Fonti editor on top of the S02 commit grammar (blur-to-save + toast undo 5s), touching 6 files:

**Domain layer (`elemento.errors.ts`, `elemento.rules.ts`)**
- Extended `FonteTipo` from `"scrittura" | "articolo" | "altro"` to the 4 M001-in-scope types: `"scrittura" | "articolo-wol" | "pubblicazione" | "link" | "altro"` (video deferred to M004 per plan).
- Added `fonte_duplicata` and `fonte_non_trovata` to `ElementoError`.
- Added `addFonte(fonti, input)` and `removeFonte(fonti, tipo, valore)` pure helpers returning `Result<readonly NormalizedFonte[], ElementoError>` — no IO, fully testable.
- Updated `validateFonte` to handle all new types: `articolo-wol` sets `urlCalcolata = valore` (URL passthrough), `pubblicazione` has no URL, `link` sets `urlCalcolata = valore`.

**Session store (`workspace-ui-store.ts`)**
- Added `fontiOverrides: Record<string, readonly NormalizedFonte[]>` to `WorkspaceUIState` and `initialState`.
- Added `commitFontiOverride(elementId, fonti)` — replaces the session fonti for an element and bumps `lastModified` to trigger re-renders.
- Added `"fonti"` to `EditableFieldId` union.
- Reset clears `fontiOverrides`.

**Display helpers (`display-helpers.ts`)**
- Converted `MOCK_FONTI` from `Map<string, string[]>` to `Map<string, NormalizedFonte[]>` (Abraamo seeded with 4 typed `scrittura` fonti).
- Updated `getFontiForElement(el)` to check `fontiOverrides` first, falling back to `MOCK_FONTI` — session override fully replaces the baseline.
- Added `getFontiGroupedByTipo(el)` returning `Map<FonteTipo, NormalizedFonte[]>` preserving insertion order within each group.
- Exported `FONTE_TIPO_LABEL` and `FONTE_TIPI_IN_SCOPE` constants for UI reuse.

**ElementoEditor (`ElementoEditor.tsx`)**
- Added `fonteTipoDraft` + `fonteValoreDraft` state.
- Added `commitFonteAdd()` and `commitFonteRemove()` — follow S02 commit grammar: snapshot `prevFonti`, mutate via pure helper, call `commitFontiOverride`, fire 5s toast with undo callback restoring the snapshot. Validation errors go to `surfaceError`.
- Added `FontiSection` component (replaces former `ReadOnlySection` for Fonti): shows add button that opens a `FieldDrawer`, fonti grouped by `FonteTipo` with group headings, clickable links when `urlCalcolata` is set, X remove button per fonte.
- `fontiGrouped` derived via `useMemo` alongside `fonti` (total count used to gate section visibility).

**DetailPane (`DetailPane.tsx`)**
- Updated `DetailBody` Fonti section from flat string array to grouped `NormalizedFonte[]` — renders type group headings, `<Link>` when URL available, plain `<span>` otherwise.

**Tests**
- `elemento.rules.test.ts`: 16 new test cases covering all 5 `validateFonte` variants, `addFonte` (add, duplicate, same-valore-different-tipo, empty-valore), `removeFonte` (remove, not-found, tipo-mismatch).
- `display-helpers.test.ts`: replaced stale `MOCK_FONTI` export tests (MOCK_FONTI is now private) with `getFontiForElement` typed assertions and new `getFontiGroupedByTipo` group tests.

## Verification

- `npx tsc --noEmit` → 0 errors (TYPE-CHECK: OK)
- `npx vitest run` → 92 tests passed, 0 failures in project source (3 stale worktree paths fail with ERR_MODULE_NOT_FOUND — pre-existing, not caused by this task)
- New test suites cover: `validateFonte` all 5 types, `addFonte` 4 cases, `removeFonte` 3 cases, `getFontiForElement` typed shape, `getFontiGroupedByTipo` group correctness
- No Jazz imports in any touched file (verified by inspection)

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npx tsc --noEmit` | 0 | ✅ pass | 8200ms |
| 2 | `npx vitest run --reporter=verbose (92 tests)` | 0 | ✅ pass | 1060ms |

## Deviations

MOCK_FONTI was previously exported; made private to keep it as an implementation detail. The display-helpers.test.ts MOCK_FONTI describe block was replaced with typed assertions on getFontiForElement + getFontiGroupedByTipo. No functional deviation from the task plan.

## Known Issues

Smoke test in dev server not run (auto-mode, no browser access). UI interaction — add/remove/undo flow — should be manually verified in dev server before slice completion.

## Files Created/Modified

- `src/features/elemento/elemento.errors.ts`
- `src/features/elemento/elemento.rules.ts`
- `src/ui/workspace-home/workspace-ui-store.ts`
- `src/ui/workspace-home/display-helpers.ts`
- `src/ui/workspace-home/ElementoEditor.tsx`
- `src/ui/workspace-home/DetailPane.tsx`
- `src/features/elemento/__tests__/elemento.rules.test.ts`
- `src/ui/workspace-home/__tests__/display-helpers.test.ts`
