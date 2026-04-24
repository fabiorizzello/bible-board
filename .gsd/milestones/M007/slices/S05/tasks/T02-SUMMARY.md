---
id: T02
parent: S05
milestone: M007
key_files:
  - src/ui/workspace-home/ElementoEditor.tsx
  - src/ui/workspace-home/DetailPane.tsx
key_decisions:
  - Description display button uses static aria-label 'Modifica descrizione' rather than conditionally reflecting the preview text, because the label communicates the action (edit), not the content
duration: 
verification_result: passed
completed_at: 2026-04-24T10:51:16.742Z
blocker_discovered: false
---

# T02: Added aria-label to 3 icon-only/action buttons in ElementoEditor (titolo, descrizione) and DetailPane (annotation navigate)

**Added aria-label to 3 icon-only/action buttons in ElementoEditor (titolo, descrizione) and DetailPane (annotation navigate)**

## What Happened

Located and labelled the three buttons identified in the S05 research audit:

1. **ElementoEditor InlineTitle display button** (line 985): added `aria-label="Modifica titolo"` to the bare `<button>` that renders the element title and triggers inline editing. Without this label, a screen reader would read the title text as the button label — ambiguous as an action.

2. **ElementoEditor description display button** (line 1353): added `aria-label="Modifica descrizione"` to the button wrapping `<MarkdownPreview>`. The child renders markdown HTML, so a screen reader would read the raw markdown content rather than the button's purpose.

3. **DetailPane annotation navigate button** (line 173): added `aria-label={\`Apri annotazione: ${ann.titolo}\`}` to the per-annotation button in the annotations list. This gives each button a unique, action-qualified label instead of having the screen reader read the title span contents twice.

No other buttons were touched. ChipButton remove buttons (already labelled via `aria-label` on X buttons) and HeroUI `isIconOnly` buttons (already labelled via `aria-label`) were left unchanged per plan instructions.

## Verification

Ran `pnpm tsc --noEmit` (0 errors), `pnpm test --run` (150/150 passed), and three `rg` checks confirming each aria-label is present at the expected lines.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm tsc --noEmit` | 0 | ✅ pass | 8200ms |
| 2 | `pnpm test --run` | 0 | ✅ pass | 729ms |
| 3 | `rg -n 'aria-label="Modifica titolo"' src/ui/workspace-home/ElementoEditor.tsx` | 0 | ✅ pass | 30ms |
| 4 | `rg -n 'aria-label="Modifica descrizione"' src/ui/workspace-home/ElementoEditor.tsx` | 0 | ✅ pass | 30ms |
| 5 | `rg -n 'aria-label=\{`Apri annotazione' src/ui/workspace-home/DetailPane.tsx` | 0 | ✅ pass | 30ms |

## Deviations

none

## Known Issues

none

## Files Created/Modified

- `src/ui/workspace-home/ElementoEditor.tsx`
- `src/ui/workspace-home/DetailPane.tsx`
