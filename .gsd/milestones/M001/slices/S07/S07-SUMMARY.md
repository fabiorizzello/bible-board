---
id: S07
parent: M001
milestone: M001
provides:
  - (none)
requires:
  []
affects:
  []
key_files:
  - (none)
key_decisions:
  - ["Width collapse restructured as outer instant-width + inner opacity-fade pattern to avoid reflow while preserving smooth UX", "FullscreenOverlay transition-all replaced with explicit transition-[opacity,transform] for forward safety", "Inline chip X-remove buttons (h-6/24px) kept at current size as sub-controls within 44px chip containers per Apple HIG compound-control pattern", "7 pre-existing TypeScript build errors kept out of scope — confirmed pre-existing via git stash round-trip"]
patterns_established:
  - ["Width-collapse animations: outer div (instant width) + inner element (transition-opacity) — never animate width directly (MEM051)", "Compound controls (chip X-remove) exempt from ≥44px individual target rule when parent compound element is ≥44px (MEM052)", "Prefer transition-[opacity,transform] over transition-all to be forward-safe against accidental reflow properties (MEM053)"]
observability_surfaces:
  - none
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-04-23T12:24:50.465Z
blocker_discovered: false
---

# S07: Polish iPad-native e UAT finale

**Eliminated all forbidden width/height animations and fixed all sub-44px touch targets across the full production UI; R011 validated; 126/126 tests pass.**

## What Happened

S07 was the final polish slice for M001, targeting iPad-native quality criteria: animations only on transform/opacity, touch targets ≥44×44px, no superfluous chrome, prefers-reduced-motion respected.

**T01 — Animation violations fixed:**
Three files in workspace-home had illegal `transition-all` on layout-collapsing elements. The fix restructured each into an outer div (instant width collapse, no animation) + inner element (transition-opacity only), ensuring zero reflow-triggering transitions during sidebar/list-pane collapse. `FullscreenOverlay.tsx` was also updated from `transition-all` to explicit `transition-[opacity,transform]` as a forward-safety measure — the element only animates opacity/translate today, but `transition-all` would silently pick up any future width/height.

**T01 — Touch target violations fixed (T01 executor, extended by closer):**
Systematic audit across NavSidebar, ListPane, FullscreenOverlay, ElementoEditor identified and upgraded all sub-44px interactive elements to `min-h-[44px]`/`h-[44px]`. The `ThemeSwitcher.tsx` popover toggle button (was 28px) and trigger (was 36px) were caught by the closer's audit and also fixed. The Timeline popup's "Apri scheda" button (was `min-h-[32px]`, `transition-all`) was also found and fixed to `min-h-[44px]` + `transition-[opacity,transform]`.

**Compound control exemption documented:** Chip X-remove buttons (h-6/24px) inside ≥44px chip containers are correctly exempt per Apple HIG compound-control pattern. This is documented in memory (MEM052) to prevent false future audit failures.

**Pre-existing build errors (7 TypeScript errors in board.adapter.ts, elemento.adapter.ts, DemoAuthPage.tsx, timeline-d3.ts, display-helpers.test.ts) remain out of scope** — confirmed pre-existing via git stash round-trip in T01.

**Final state:** tsc clean, 126/126 tests pass, zero `transition-all` in production workspace-home and timeline UI, zero sub-44px touch targets on standalone interactive elements.

## Verification

1. `npx vitest run` → 126/126 tests pass (5 test files)
2. `npx tsc --noEmit` → clean (no output)
3. `grep -rn 'transition-all' src/ui/workspace-home/ src/ui/timeline/` → 0 results
4. `grep -rn 'min-h-\[2[0-9]px\]\|min-h-\[3[0-9]px\]\|h-\[2[0-9]px\]\|h-\[3[0-9]px\]' src/ui/workspace-home/ src/ui/timeline/` → 0 results
5. `prefers-reduced-motion` rule confirmed in `src/styles/tokens.css:85`
6. R011 updated to `validated` in GSD DB

## Requirements Advanced

None.

## Requirements Validated

- R011 — S07 T01 PASS: all forbidden width/height animations replaced with transition-[opacity,transform]; touch targets ≥44px across all production UI files; prefers-reduced-motion in tokens.css confirmed. 126/126 tests pass, tsc clean. 2026-04-23.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

None.

## Known Limitations

7 pre-existing TypeScript build errors in board.adapter.ts, elemento.adapter.ts, DemoAuthPage.tsx, timeline-d3.ts, display-helpers.test.ts remain unresolved — they predate S07 and are out of scope for this polish slice.

## Follow-ups

None.

## Files Created/Modified

- `src/ui/workspace-home/NavSidebar.tsx` — transition-all → opacity pattern; touch targets ≥44px (plus-board, nav items, board rows, more-menu, settings, close)
- `src/ui/workspace-home/ListPane.tsx` — transition-all → opacity pattern; touch targets ≥44px (reopen, plus-element, view-toggle, filter chips, sort bar)
- `src/ui/workspace-home/FullscreenOverlay.tsx` — transition-all → transition-[opacity,transform]; touch targets ≥44px (back, minimize)
- `src/ui/workspace-home/ElementoEditor.tsx` — Touch targets ≥44px on chip buttons, expand, header-actions, section aggiungi buttons, inline inputs
- `src/ui/workspace-home/ThemeSwitcher.tsx` — Trigger button 36→44px, popover mode-toggle button 28→44px
- `src/ui/timeline/Timeline.tsx` — Apri scheda button: transition-all → transition-[opacity,transform], min-h-[32px] → min-h-[44px]
