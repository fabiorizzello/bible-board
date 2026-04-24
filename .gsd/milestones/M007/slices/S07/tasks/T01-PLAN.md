---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T01: Fix Annulla button touch target and run ui-ux-pro-max static review

Fix the P1/P2 blocker identified in S07-RESEARCH: the Annulla button in NotificationDrawer.tsx:50 uses `h-auto px-2 py-1 min-h-0`, which overrides HeroUI's 36px default and yields ~28px touch height — violates CLAUDE.md §III (≥44px) and ui-ux-pro-max P2. Replace with `min-h-[44px] px-3 py-2` (remove `h-auto` and `min-h-0`) so the hit area meets the tablet-first touch target spec. Keep the text-size/hover classes intact. Then perform the ui-ux-pro-max static review across all M007-new/modified components (NotificationBell.tsx, NotificationDrawer.tsx, notifications-store.ts, useFieldStatus.ts, ElementoEditor.tsx modifications, NavSidebar.tsx modifications). For each priority P1–P10, record verdict (pass / flag / omitted-N-A) and one-line rationale — this report is consumed by T03. Run `pnpm tsc --noEmit` and `pnpm test --run` after the className edit to confirm no regression.

## Inputs

- ``src/ui/workspace-home/NotificationDrawer.tsx``
- ``src/ui/workspace-home/NotificationBell.tsx``
- ``src/ui/workspace-home/notifications-store.ts``
- ``src/ui/workspace-home/useFieldStatus.ts``
- ``src/ui/workspace-home/ElementoEditor.tsx``
- ``src/ui/workspace-home/NavSidebar.tsx``
- ``CLAUDE.md``

## Expected Output

- ``src/ui/workspace-home/NotificationDrawer.tsx``

## Verification

rg -n 'min-h-0' src/ui/workspace-home/NotificationDrawer.tsx returns 0 hits; rg -n 'min-h-\[44px\]' src/ui/workspace-home/NotificationDrawer.tsx returns >=1 hit on the Annulla button; pnpm tsc --noEmit exits 0; pnpm test --run reports >=150/150 passing

## Observability Impact

none
