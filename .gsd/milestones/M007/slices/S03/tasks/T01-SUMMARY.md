---
id: T01
parent: S03
milestone: M007
key_files:
  - src/ui/workspace-home/useFieldStatus.ts
  - src/ui/workspace-home/__tests__/useFieldStatus.test.ts
key_decisions:
  - Read prefers-reduced-motion inside onBlur (blur time) not in useEffect (render time) — matches spec and makes testing with fake matchMedia straightforward
  - Skip transient 'saving' state: hook sets success directly since onCommit is synchronous; 'saving' and 'error' remain in the FieldStatus type for future async use
  - valueRef + onCommitRef pattern (assign current on every render) avoids stale closures without adding deps to stable useCallback arrays
duration: 
verification_result: passed
completed_at: 2026-04-24T10:02:39.060Z
blocker_discovered: false
---

# T01: Created useFieldStatus hook with idle→success→idle state machine, no-op guard, and 6-scenario test suite

**Created useFieldStatus hook with idle→success→idle state machine, no-op guard, and 6-scenario test suite**

## What Happened

Created two files from scratch.

`src/ui/workspace-home/useFieldStatus.ts` — a generic React hook `useFieldStatus<T>(value, onCommit)` that implements the required state machine:
- `valueRef` and `onCommitRef` are kept fresh on every render without re-creating callbacks (pattern avoids stale closures without dep arrays on stable refs).
- `prevRef` holds the value captured at focus time; synced via `useEffect([value])` for Jazz CRDT external updates while not focused.
- `onFocus()` explicitly captures `valueRef.current` into `prevRef` at interaction start.
- `onBlur(next)` performs strict `===` comparison: no-op if equal (R049 fix), otherwise calls `onCommit(prev, next)`, sets status to `"success"`, then schedules a reset timer.
- `prefers-reduced-motion` is read synchronously inside `onBlur` (at "fire time", not render time) to decide between delay=0 (immediate reset) and delay=1500ms.
- Pending timer is cancelled on re-commit and on unmount.
- No imports from HeroUI, Jazz, or Legend State — pure React.

`src/ui/workspace-home/__tests__/useFieldStatus.test.ts` — 6 test cases using `renderHook` + `act` + `vi.useFakeTimers()`:
1. Same-value blur → onCommit not called, status stays idle.
2. Different-value blur → onCommit(prev, next) called exactly once.
3. Status transitions to "success" after a change.
4. Status returns to "idle" after `vi.advanceTimersByTime(1500)`.
5. Mocked `prefers-reduced-motion: reduce` → reset fires at delay=0, visible after advancing 1ms.
6. Focus without blur → onCommit not called, status stays idle.

`matchMedia` is mocked in `beforeEach` (returns `matches: false`) and overridden in test (5) to return `matches: true` for the reduce query. `vi.restoreAllMocks()` in `afterEach` cleans up.

## Verification

pnpm test --run: 6/6 pass (532ms). pnpm tsc --noEmit: clean. wc -l: 73 lines (≥30). grep export function: 1 match at line 11. rg observer|use$: 0 matches.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm test --run src/ui/workspace-home/__tests__/useFieldStatus.test.ts` | 0 | ✅ pass — 6/6 tests | 532ms |
| 2 | `pnpm tsc --noEmit` | 0 | ✅ pass — clean | 0ms |
| 3 | `wc -l src/ui/workspace-home/useFieldStatus.ts` | 0 | ✅ pass — 73 lines (≥30) | 0ms |
| 4 | `grep -n 'export function useFieldStatus' src/ui/workspace-home/useFieldStatus.ts` | 0 | ✅ pass — 1 match at line 11 | 0ms |
| 5 | `rg 'observer\(|use\$\(' src/ui/workspace-home/useFieldStatus.ts` | 1 | ✅ pass — 0 matches (no Legend State) | 0ms |

## Deviations

Skipped the transient 'saving' state emission: the plan describes idle→saving→success but no test verifies 'saving'. Since onCommit is synchronous the transition would be invisible due to React batching. Status goes idle→success directly; 'saving' and 'error' remain in the FieldStatus type for downstream use.

## Known Issues

none

## Files Created/Modified

- `src/ui/workspace-home/useFieldStatus.ts`
- `src/ui/workspace-home/__tests__/useFieldStatus.test.ts`
