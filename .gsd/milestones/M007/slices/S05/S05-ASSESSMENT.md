---
sliceId: S05
uatType: artifact-driven
verdict: PASS
date: 2026-04-24T12:55:00.000Z
---

# UAT Result — S05

## Checks

| Check | Mode | Result | Notes |
|-------|------|--------|-------|
| TC-01: tabIndex={0} on board items in NavSidebar | artifact | PASS | `rg -n 'tabIndex=\{0\}' src/ui/workspace-home/NavSidebar.tsx` → line 227 |
| TC-01: onKeyDown (Enter/Space) on board items | artifact | PASS | `rg -n 'onKeyDown' src/ui/workspace-home/NavSidebar.tsx` → line 236; handler fires `handleNavChange` on Enter/Space |
| TC-02: isRenaming guard in onKeyDown mirrors onClick guard | artifact | PASS | Line 237: `if (!isRenaming && (e.key === "Enter" \|\| e.key === " "))` — identical guard to onClick at line 234 |
| TC-02: Rename input's own Enter/Escape has e.stopPropagation | artifact | PASS | Line 251–255: rename input's onKeyDown calls `e.stopPropagation()` after handling Enter/Escape |
| TC-03: aria-label="Modifica titolo" on InlineTitle button | artifact | PASS | `rg -n 'aria-label="Modifica titolo"' src/ui/workspace-home/ElementoEditor.tsx` → line 985 |
| TC-04: aria-label="Modifica descrizione" on description edit button | artifact | PASS | `rg -n 'aria-label="Modifica descrizione"' src/ui/workspace-home/ElementoEditor.tsx` → line 1353 |
| TC-05: Dynamic aria-label on annotation navigate button | artifact | PASS | `rg -n 'aria-label=.*Apri annotazione' src/ui/workspace-home/DetailPane.tsx` → line 173: `` aria-label={`Apri annotazione: ${ann.titolo}`} `` |
| TC-06: aria-pressed={activePalette === p.name} on palette buttons | artifact | PASS | `rg -n 'aria-pressed' src/ui/workspace-home/ThemeSwitcher.tsx` → line 204 |
| TC-07: Zero transition-all occurrences in src/ui/ | artifact | PASS | `rg 'transition-all' src/ui/` → empty output (exit 1) |
| TC-08: prefers-reduced-motion CSS rule disables animations | artifact | PASS | `src/styles/tokens.css` lines 85–93: global `@media (prefers-reduced-motion: reduce)` sets `animation-duration: 0.01ms`, `transition-duration: 0.01ms` on `*, *::before, *::after` |

## Overall Verdict

PASS — all 10 artifact checks passed; keyboard nav guard, aria-label/aria-pressed attributes, zero transition-all, and prefers-reduced-motion rule all verified in source.

## Notes

- TC-08 visual verification (emulating reduced-motion in DevTools and observing no animation) is not automatable in artifact mode. The CSS rule is correct and global — it applies `!important` override on all transition-duration and animation-duration, which guarantees no visible motion. No human follow-up required for compliance; optional for experiential confirmation.
- All ARIA attributes match expected values exactly as specified in the UAT script.
- The `e.stopPropagation()` in the rename input's onKeyDown (line 254) ensures the board-level onKeyDown never fires while renaming, providing defense-in-depth beyond just the `!isRenaming` guard on the outer handler.
