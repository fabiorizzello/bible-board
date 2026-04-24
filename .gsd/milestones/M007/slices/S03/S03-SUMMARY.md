---
id: S03
parent: M007
milestone: M007
provides:
  - ["useFieldStatus hook — onCommit(prev, next) contract frozen for S04 notifyMutation wiring", "No-op guard on all 3 weighted fields (InlineTitle, DescrizioneSection, TipoChip)", "Inline Check icon feedback on all 3 weighted fields with 3 presentation variants"]
requires:
  []
affects:
  []
key_files:
  - (none)
key_decisions:
  - ["useFieldStatus reads prefers-reduced-motion at onBlur fire time (not render time) — testable with fake matchMedia, responds to OS changes between focus and blur", "valueRef+onCommitRef pattern for stable callbacks without stale closures — assigned current every render, consumed via .current in event handlers", "Skipped transient 'saving' state: onCommit is synchronous so transition is invisible due to React batching; 'saving'/'error' kept in type for future async use", "TipoChip uses local justCommitted state instead of useFieldStatus — press-commit popover does not map to onFocus/onBlur API", "Three inline-success presentation variants: endContent (Input), absolute overlay (Milkdown), adjacent ml-2 (popover chip)"]
patterns_established:
  - ["useFieldStatus<T>(value, onCommit) — shared state machine for all text field success feedback; onCommit(prev, next) is the authoritative mutation signal for S04", "press-commit widgets (popover, toggle) use local justCommitted + setTimeout pattern with prefers-reduced-motion check at fire time", "inline Check icon: transition-opacity only — never width/height", "Container-level blur detection with contains(relatedTarget) required for Milkdown to suppress internal focus-move commits"]
observability_surfaces:
  - none
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-04-24T10:11:33.670Z
blocker_discovered: false
---

# S03: Hook useFieldStatus + inline success + fix toast no-op

**Introduced useFieldStatus hook with no-op guard and wired inline Check icon feedback into all three weighted fields (InlineTitle, DescrizioneSection, TipoChip) — blur without change is now silent, blur with real change shows a 1.5s fade-out Check.**

## What Happened

## What This Slice Built

S03 delivered the `useFieldStatus` state machine hook and integrated it across all three "weighted" fields in ElementoEditor, fixing two longstanding UX issues: spurious feedback on no-op blur (R049) and the absence of inline success confirmation after a real commit (R050).

### T01 — useFieldStatus hook + 6-scenario test suite

Created `src/ui/workspace-home/useFieldStatus.ts`: a generic `useFieldStatus<T>(value, onCommit)` hook that:
- Captures the current value into `prevRef` on `onFocus()`
- On `onBlur(next)`, performs strict `===` comparison — if equal, does nothing (R049 no-op fix); if different, calls `onCommit(prev, next)` and transitions status to `"success"`
- Resets to `"idle"` after 1500ms (cancellable timer); if `prefers-reduced-motion` is active at fire time, resets immediately at delay=0
- Uses `valueRef + onCommitRef` pattern (assigned current every render) for stable callbacks without stale closures — no dep-array churn
- Syncs `prevRef` via `useEffect([value])` to handle Jazz CRDT external updates while unfocused
- No imports from HeroUI, Jazz, or Legend State — pure React

The transient `'saving'` state was skipped: since `onCommit` is synchronous, the transition would be invisible due to React batching. `'saving'` and `'error'` remain in the `FieldStatus` type for future async use.

6-scenario test suite in `__tests__/useFieldStatus.test.ts` using `renderHook` + `act` + `vi.useFakeTimers()` covers: no-op blur, change blur, success transition, idle reset at 1500ms, prefers-reduced-motion immediate reset, focus-without-blur idempotency.

### T02 — InlineTitle wire-up

Integrated `useFieldStatus` into `InlineTitle`. The parent `onCommit(next)` takes one argument, so `_prev` is discarded at the call site. Added `endContent` prop to the HeroUI `<Input>` rendering a `<Check>` icon with `transition-opacity duration-300` and inline `style={{ opacity: status === 'success' ? 1 : 0 }}`. No new imports needed — `Check` was already in scope.

### T03 — DescrizioneSection wire-up

Integrated `useFieldStatus` into `DescrizioneSection`. The Milkdown editor does not expose a native input; blur is captured at the container div level using `event.currentTarget.contains(event.relatedTarget)` to guard against internal focus moves. The existing `handleBlur` was rewired to call `onBlur(draft)` instead of `onCommit(draft)` directly. The Check icon is placed as an `absolute bottom-2 right-2` overlay inside the `relative` milkdown-host container, with `pointer-events-none` and `aria-hidden="true"`.

### T04 — TipoChip wire-up

TipoChip commits on popover-option press, not on blur — the `onFocus/onBlur` API of `useFieldStatus` does not map cleanly to this interaction. Chose `local justCommitted state + setTimeout` instead (same `prefers-reduced-motion` check at fire time, consistent with the hook's approach). Added a guard `if (option === tipo) { closePopover(); return; }` (R049 fix for type field). The `<Check>` icon is placed adjacent to the popover trigger (`ml-2`), opacity driven by `justCommitted`.

## Patterns Established

1. **Three inline-success presentation variants by control type**: `endContent` for HeroUI Input, `absolute` overlay for Milkdown/textarea, `adjacent ml-2` for popover triggers. All use `transition-opacity` only.
2. **press-commit widgets use local justCommitted state**, not useFieldStatus — the hook's onFocus/onBlur contract is for text fields only.
3. **prefers-reduced-motion always checked at fire time** (inside the callback/setTimeout), never at render time — consistent across hook and TipoChip.

## Contract for S04

`useFieldStatus.onCommit(prev, next)` is called exactly once per real mutation. S04's `notifyMutation('update', ...)` should be wired at this callback site — `prev !== next` is the authoritative signal that a mutation was persisted. The existing `toast(...)` calls inside `commitPatch` remain intact and will be replaced by S04 when the drawer absorbs the toast channel.

## Verification

All slice-level verification checks passed on 2026-04-24:

| Check | Result |
|---|---|
| `pnpm test --run` | 141/141 pass (6 test files) |
| `pnpm tsc --noEmit` | clean (exit 0) |
| `rg -c 'useFieldStatus' ElementoEditor.tsx` | 3 hits (import + InlineTitle + DescrizioneSection) |
| `rg -n 'option === tipo' ElementoEditor.tsx` | guard present at line 1105 |
| `rg -n 'justCommitted' ElementoEditor.tsx` | state at line 1101, opacity binding at line 1153 |
| `rg -n 'absolute.*bottom.*right' ElementoEditor.tsx` | 1 hit in DescrizioneSection zone |
| `rg 'transition.*width\|transition.*height\|animate.*width\|animate.*height' ElementoEditor.tsx` | 0 matches |
| `export function useFieldStatus` | 1 match at line 11 |
| `rg 'observer(\|use\$(' useFieldStatus.ts` | 0 matches |

## Requirements Advanced

None.

## Requirements Validated

- R049 — useFieldStatus strict === comparison + TipoChip option===tipo guard: onCommit never called on identical values. 141/141 tests pass.
- R050 — Check icon with transition-opacity on InlineTitle (endContent), DescrizioneSection (absolute overlay), TipoChip (adjacent). Fades out 1500ms, immediate on prefers-reduced-motion. 141/141 tests pass.

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

S04 wires notifyMutation('update', target, undoFn) at the useFieldStatus onCommit(prev, next) callback site — this is the authoritative mutation signal. The existing toast(…) calls inside commitPatch remain intact and will be replaced wholesale when S04 ships the notification drawer.

## Files Created/Modified

- `src/ui/workspace-home/useFieldStatus.ts` — 
- `src/ui/workspace-home/__tests__/useFieldStatus.test.ts` — 
- `src/ui/workspace-home/ElementoEditor.tsx` — 
