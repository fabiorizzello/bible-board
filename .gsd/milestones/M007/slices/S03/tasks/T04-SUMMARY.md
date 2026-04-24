---
id: T04
parent: S03
milestone: M007
key_files:
  - src/ui/workspace-home/ElementoEditor.tsx
key_decisions:
  - Used local justCommitted state instead of useFieldStatus for TipoChip: the hook's onFocus/onBlur API does not map to a press-commit popover; local state produces identical UX with less indirection.
  - prefers-reduced-motion checked at setTimeout fire time (same pattern as useFieldStatus), keeping all motion checks consistent across the codebase.
duration: 
verification_result: passed
completed_at: 2026-04-24T10:09:15.375Z
blocker_discovered: false
---

# T04: Wired no-op guard and adjacent Check icon into TipoChip for R049/R050 compliance

**Wired no-op guard and adjacent Check icon into TipoChip for R049/R050 compliance**

## What Happened

TipoChip committed on any option press, including re-selecting the already-active type — causing spurious no-op toasts (R049). The component also had no inline success feedback (R050).

Chose the local-state approach over `useFieldStatus` because TipoChip commits on press rather than blur, so the hook's onFocus/onBlur API doesn't map cleanly. The local `justCommitted` bool is simpler, produces identical UX, and avoids forcing an unnatural focus-tracking API onto a popover-driven widget.

Changes made to `TipoChip` in `ElementoEditor.tsx`:
1. Added `const [justCommitted, setJustCommitted] = useState(false)` local state.
2. Extracted `handleSelect(option)`: if `option === tipo`, closes popover and returns (no-op guard, R049 fix); otherwise calls `onCommit`, closes popover, sets `justCommitted = true`, and schedules a `setTimeout` reset to `false` after 1500ms (0ms when `prefers-reduced-motion` is active — same pattern as `useFieldStatus`).
3. Wrapped the `<Popover>` in a `<div className="flex items-center">` and appended a `<Check aria-hidden="true" className="ml-2 h-4 w-4 transition-opacity duration-300" style={{ opacity: justCommitted ? 1 : 0 }} />` adjacent to the trigger — satisfying the R050 inline feedback contract.
4. Replaced the inline `onPress={() => onCommit(option)}` on each option Button with `onPress={() => handleSelect(option)}`.

## Verification

pnpm tsc --noEmit: clean (no output). pnpm test --run: 141 tests pass. rg 'option === tipo' ElementoEditor.tsx: guard present at line 1105. rg 'justCommitted' ElementoEditor.tsx: state at line 1101, opacity binding at line 1153. rg 'transition.*width|transition.*height' ElementoEditor.tsx: 0 matches.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm tsc --noEmit` | 0 | ✅ pass | 4200ms |
| 2 | `pnpm test --run` | 0 | ✅ pass — 141/141 | 747ms |
| 3 | `rg -n 'option === tipo' src/ui/workspace-home/ElementoEditor.tsx` | 0 | ✅ pass — guard found at line 1105 | 30ms |
| 4 | `rg -n 'justCommitted' src/ui/workspace-home/ElementoEditor.tsx` | 0 | ✅ pass — state + opacity binding present | 20ms |
| 5 | `rg 'transition.*width|transition.*height' src/ui/workspace-home/ElementoEditor.tsx` | 1 | ✅ pass — 0 matches | 20ms |

## Deviations

none

## Known Issues

none

## Files Created/Modified

- `src/ui/workspace-home/ElementoEditor.tsx`
