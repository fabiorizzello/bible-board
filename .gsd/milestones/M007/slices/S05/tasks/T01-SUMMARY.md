---
id: T01
parent: S05
milestone: M007
key_files:
  - src/ui/workspace-home/NavSidebar.tsx
key_decisions:
  - onKeyDown guard mirrors onClick guard (!isRenaming) — keyboard nav is suppressed while inline rename is active, preserving the rename's own Enter/Escape handling
duration: 
verification_result: passed
completed_at: 2026-04-24T10:49:44.301Z
blocker_discovered: false
---

# T01: Added tabIndex={0} and onKeyDown (Enter/Space) to NavSidebar board item divs, making them keyboard-navigable without breaking inline rename

**Added tabIndex={0} and onKeyDown (Enter/Space) to NavSidebar board item divs, making them keyboard-navigable without breaking inline rename**

## What Happened

The board items in NavSidebar are rendered as `div[role="option"]` (MEM049 workaround — HeroUI ListBox conflicts with inline rename). These divs were not keyboard-focusable. The fix adds two attributes to the outer div at line 223 of NavSidebar.tsx:\n\n1. `tabIndex={0}` — makes the div reachable via Tab navigation; the global `:focus-visible` rule in tokens.css (lines 78-82) provides the focus ring automatically.\n2. `onKeyDown` handler — intercepts Enter and Space, calls `e.preventDefault()` to suppress scroll-on-space, then invokes `handleNavChange(board.viewId)` — identical to the existing onClick path. The guard `!isRenaming` matches the onClick guard, so keyboard nav is suppressed while the inline rename input is active (the input itself already handles Enter/Escape via `e.stopPropagation()`).\n\n`aria-selected` was already present and correctly reflects the selected state. No other changes were needed.

## Verification

Ran `pnpm tsc --noEmit` (0 errors), `pnpm test --run` (150/150 tests green), and `rg -n 'tabIndex={0}' src/ui/workspace-home/NavSidebar.tsx` (matched line 227).

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm tsc --noEmit` | 0 | ✅ pass | 8000ms |
| 2 | `pnpm test --run` | 0 | ✅ pass | 715ms |
| 3 | `rg -n 'tabIndex=\{0\}' src/ui/workspace-home/NavSidebar.tsx` | 0 | ✅ pass | 50ms |

## Deviations

none

## Known Issues

none

## Files Created/Modified

- `src/ui/workspace-home/NavSidebar.tsx`
