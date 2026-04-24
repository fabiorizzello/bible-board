---
id: T03
parent: S03
milestone: M007
key_files:
  - src/ui/workspace-home/ElementoEditor.tsx
key_decisions:
  - Container-level blur detection (contains check on relatedTarget) preserved unchanged — it guards against Milkdown internal focus changes triggering premature commits; useFieldStatus onBlur receives the committed draft value for prev/next comparison
  - No new import needed: Check icon already imported from lucide-react for the toolbar Fatto button
duration: 
verification_result: passed
completed_at: 2026-04-24T10:07:12.279Z
blocker_discovered: false
---

# T03: Wired useFieldStatus into DescrizioneSection with absolute-positioned Check overlay for inline success feedback

**Wired useFieldStatus into DescrizioneSection with absolute-positioned Check overlay for inline success feedback**

## What Happened

Modified `DescrizioneSection` in `ElementoEditor.tsx` to integrate the `useFieldStatus` hook. Three changes applied:

1. **Hook instantiation**: Added `const { status, onFocus, onBlur } = useFieldStatus<string>(value, (_prev, next) => onCommit(next));` immediately after the draft state — the callback adapter drops `_prev` since `onCommit` takes only the new value.

2. **Blur/focus rewiring**: The existing `handleBlur` was modified to call `onBlur(draft)` instead of `onCommit(draft)` directly — the hook's `onBlur` performs the prev/next comparison and only fires `onCommit` when a real change occurred (fixing the no-op toast). Added `onFocus={onFocus}` to the milkdown container div so the hook tracks the current value at focus time.

3. **Check overlay**: Added `relative` class to the milkdown-host container div and placed a `<Check>` icon with `absolute bottom-2 right-2` positioning, `transition-opacity duration-300`, and `opacity` driven by `status === 'success'`. Uses `aria-hidden="true"` and `pointer-events-none` per accessibility convention. The existing `<Check>` import from lucide-react (already present for the toolbar button) was reused — no new import needed.

The container-level blur detection (checking `event.currentTarget.contains(event.relatedTarget)`) was preserved unchanged — this guards against internal focus movement within the Milkdown editor triggering a premature commit.

## Verification

pnpm test --run: 141 tests pass across 6 test files (all green); pnpm tsc --noEmit: clean; rg -c useFieldStatus ElementoEditor.tsx: 3 hits (import + InlineTitle T02 + DescrizioneSection T03); rg -n 'absolute.*bottom.*right' ElementoEditor.tsx: 1 hit at the Check overlay; rg 'transition.*width|transition.*height' ElementoEditor.tsx: 0 matches.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm test --run` | 0 | ✅ pass — 141 tests, 6 files | 671ms |
| 2 | `pnpm tsc --noEmit` | 0 | ✅ pass — no type errors | 8000ms |
| 3 | `rg -c 'useFieldStatus' src/ui/workspace-home/ElementoEditor.tsx` | 0 | ✅ pass — 3 hits (≥2 required) | 50ms |
| 4 | `rg -n 'absolute.*bottom.*right' src/ui/workspace-home/ElementoEditor.tsx` | 0 | ✅ pass — 1 hit in DescrizioneSection zone | 50ms |
| 5 | `rg 'transition.*width|transition.*height' src/ui/workspace-home/ElementoEditor.tsx` | 1 | ✅ pass — 0 matches (no forbidden transitions) | 50ms |

## Deviations

none

## Known Issues

none

## Files Created/Modified

- `src/ui/workspace-home/ElementoEditor.tsx`
