---
id: S05
parent: M007
milestone: M007
provides:
  - ["pattern: keyboard nav guard on div role=option", "convention: aria-label on icon-only buttons", "convention: aria-pressed on palette toggles", "convention: transition-[opacity,transform] ban on transition-all", "zero transition-all occurrences in src/ui/"]
requires:
  []
affects:
  []
key_files:
  - (none)
key_decisions:
  - [
  "onKeyDown guard on board items mirrors onClick guard (!isRenaming) to prevent keyboard activation from conflicting with the inline rename's own Enter/Escape handling",
  "transition-all replacement scope includes mockup files — the ban applies to all of src/ui/, not just production components",
  "aria-label on annotation navigate button is dynamic (template literal with ann.titolo) to give screen reader users per-item context"
]
patterns_established:
  - [
  "Keyboard nav guard pattern: onKeyDown on div role=option must mirror the same isRenaming guard used by onClick to avoid conflicts with inline edit modes",
  "aria-label convention: icon-only and action-only buttons must have aria-label; dynamic labels use template literals with entity-specific context (e.g., annotation title)",
  "aria-pressed convention: palette/toggle buttons must expose boolean aria-pressed state tied to the active selection variable",
  "transition-all ban: all src/ui/ code must use transition-[opacity,transform] — never transition-all; enforced by rg gate at slice close"
]
observability_surfaces:
  - none
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-04-24T10:54:49.142Z
blocker_discovered: false
---

# S05: A11y baseline + density uniforme + animation polish

**Tab-nav keyboard accessibility on 3-pane board items, aria-labels on 3 icon-only buttons, aria-pressed on palette toggles, and zero transition-all occurrences in src/ui/.**

## What Happened

S05 closed four focused a11y gaps in the workspace-home 3-pane without any runtime logic changes — all work was additive attribute and class-level changes.

**T01 — NavSidebar keyboard nav**: Board items rendered as `<div role="option">` lacked `tabIndex={0}` and an `onKeyDown` handler, breaking tab-nav at the sidebar column. Added both: `tabIndex={0}` makes the div reachable by Tab; `onKeyDown` intercepts Enter/Space and fires the same board-selection handler used by `onClick`. Critically, the handler is guarded by `!isRenaming` — the same guard used by `onClick` — so keyboard activation is silently suppressed while the inline rename mode is active, preserving that feature's own Enter/Escape handling. `aria-selected` was already present.

**T02 — aria-label on icon-only buttons**: Three action buttons had no accessible name for screen readers: the InlineTitle edit trigger in ElementoEditor (~line 985), the description edit trigger wrapping MarkdownPreview (~line 1353), and the annotation navigate button in DetailPane (~line 173). Added `aria-label="Modifica titolo"`, `aria-label="Modifica descrizione"`, and `aria-label={\`Apri annotazione: ${ann.titolo}\`}` respectively. The dynamic annotation label provides per-item context.

**T03 — aria-pressed on palette toggles**: ThemeSwitcher palette buttons are toggle controls but had no state signal for assistive tech. Added `aria-pressed={activePalette === p.name}` to each palette button so screen readers announce the selected state correctly.

**T04 — Eliminate transition-all**: Four occurrences of `transition-all` remained in mockup files (`CommitInteractionMockup.tsx:274`, `UnifiedEditorMockup.tsx:1895`, `MockupsIndex.tsx:175`, `MockupsIndex.tsx:243`). All replaced with `transition-[opacity,transform]` (preserving `duration-200` where present), aligning with the KNOWLEDGE.md animation policy and the constitutional rule to never animate layout properties.

All changes were purely declarative (ARIA attributes + Tailwind class renames). No new runtime signals, no new hooks, no state changes.

## Verification

- `rg 'transition-all' src/ui/` → **zero hits** (PASS)
- `rg -n 'tabIndex=\{0\}' src/ui/workspace-home/NavSidebar.tsx` → line 227 (PASS)
- `rg -n 'aria-label="Modifica titolo"' src/ui/workspace-home/ElementoEditor.tsx` → line 985 (PASS)
- `rg -n 'aria-label="Modifica descrizione"' src/ui/workspace-home/ElementoEditor.tsx` → line 1353 (PASS)
- `rg -n 'aria-label=\{`Apri annotazione' src/ui/workspace-home/DetailPane.tsx` → line 173 (PASS)
- `rg -n 'aria-pressed' src/ui/workspace-home/ThemeSwitcher.tsx` → line 204 (PASS)
- `pnpm tsc --noEmit` → **clean** (PASS)
- `pnpm test --run` → **150/150 passed** (PASS — suite grew from 126 to 150 due to earlier slice additions)

## Requirements Advanced

None.

## Requirements Validated

None.

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

- `src/ui/workspace-home/NavSidebar.tsx` — Added tabIndex={0} and onKeyDown (Enter/Space) to board item div role=option; guard mirrors onClick !isRenaming guard
- `src/ui/workspace-home/ElementoEditor.tsx` — Added aria-label='Modifica titolo' to InlineTitle button and aria-label='Modifica descrizione' to description edit button
- `src/ui/workspace-home/DetailPane.tsx` — Added aria-label dynamic template literal to annotation navigate button
- `src/ui/workspace-home/ThemeSwitcher.tsx` — Added aria-pressed={activePalette === p.name} to palette toggle buttons
- `src/ui/mockups/CommitInteractionMockup.tsx` — Replaced transition-all with transition-[opacity,transform]
- `src/ui/mockups/UnifiedEditorMockup.tsx` — Replaced transition-all with transition-[opacity,transform]
- `src/ui/mockups/MockupsIndex.tsx` — Replaced 2 occurrences of transition-all with transition-[opacity,transform]
