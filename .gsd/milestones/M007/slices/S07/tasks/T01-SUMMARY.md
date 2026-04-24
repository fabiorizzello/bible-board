---
id: T01
parent: S07
milestone: M007
key_files:
  - src/ui/workspace-home/NotificationDrawer.tsx
key_decisions:
  - Kept only min-h-[44px] px-3 py-2 on the Annulla button; removed h-auto and min-h-0 which overrode HeroUI's internal layout
  - Five residual size=sm buttons in drawer footers noted as non-blocker P2 flag — adequate in-context padding reduces risk; flagged for T03
duration: 
verification_result: passed
completed_at: 2026-04-24T11:56:15.747Z
blocker_discovered: false
---

# T01: Fixed Annulla button touch target in NotificationDrawer (min-h-[44px]) and produced full ui-ux-pro-max P1–P10 static review report across all M007 components

**Fixed Annulla button touch target in NotificationDrawer (min-h-[44px]) and produced full ui-ux-pro-max P1–P10 static review report across all M007 components**

## What Happened

The P1/P2 blocker on the NotificationDrawer Annulla button was confirmed at line 50: the original classes `h-auto px-2 py-1 min-h-0` override HeroUI's default and produce a ~28px touch height, violating CLAUDE.md §III (≥44px). The fix replaces those four classes with `min-h-[44px] px-3 py-2`, keeping `flex-shrink-0 text-[12px] text-ink-lo hover:text-primary` intact.

**ui-ux-pro-max static review (P1–P10):**

| Priority | Verdict | Rationale |
|---|---|---|
| P1 Semantic HTML | pass | nav/section/role="list,listitem,option" present in all components |
| P2 Touch targets | flag | 5 secondary locations still use HeroUI `size="sm"` buttons without explicit `min-h-[44px]`: DescrizioneSection Annulla/Fatto, ArraySection Chiudi/Aggiungi, VitaChip Annulla (Drawer.Footer), NavSidebar AlertDialog footer (Annulla/Crea/Elimina). All in drawer/dialog footers — layout padding brings rendered height close to 44px but not guaranteed. Non-blocker; primary blocker fixed. |
| P3 Color contrast | pass | Token-based palette throughout; design system is authoritative |
| P4 Focus management | pass | HeroUI (React Aria) handles focus for all overlays; keyboard handlers on custom elements in NavSidebar board rows |
| P5 ARIA labels | pass | All icon-only buttons have aria-label; drawers have aria-label; list/listitem/option roles present; unread badge is aria-hidden; InlineTitle and DescrizioneSection edit triggers have aria-label |
| P6 Reduced motion | pass | NotificationBell bounce checks matchMedia before animating; TipoChip commit flash zeroes timeout when reduced; useFieldStatus success timer is 0ms when reduced |
| P7 Typography | pass | Fira Code/Sans via CSS tokens; design-system text sizes throughout |
| P8 Feedback states | pass | useFieldStatus drives inline Check icons; surfaceError covers mutation failures; NotificationDrawer empty-state handled |
| P9 Error handling | pass | normalizeElementoInput returns Result; surfaceError rendered; no-op guard on same-value blur (R049); undone guard in rollback |
| P10 Layout integrity | pass | Compact 220px sidebar; max-w on drawers; flex-wrap on chips; inline rename in NavSidebar degrades gracefully |

No new P1 findings. One existing P2 finding (Annulla notification button) is now resolved. Five residual P2 instances in secondary UI (size="sm" in drawer/dialog footers) are flagged for T03.

## Verification

Verification commands run:\n1. `rg -n 'min-h-0' src/ui/workspace-home/NotificationDrawer.tsx` → exit 1 (no matches) ✅\n2. `rg -n 'min-h-\\[44px\\]' src/ui/workspace-home/NotificationDrawer.tsx` → line 50 match ✅\n3. `pnpm tsc --noEmit` → exit 0, no output ✅\n4. `pnpm test --run` → 150/150 tests pass ✅

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `rg -n 'min-h-0' src/ui/workspace-home/NotificationDrawer.tsx` | 1 | ✅ pass — 0 hits (min-h-0 removed) | 40ms |
| 2 | `rg -n 'min-h-\[44px\]' src/ui/workspace-home/NotificationDrawer.tsx` | 0 | ✅ pass — line 50 hit on Annulla button | 35ms |
| 3 | `pnpm tsc --noEmit` | 0 | ✅ pass — no type errors | 8200ms |
| 4 | `pnpm test --run` | 0 | ✅ pass — 150/150 tests passing | 711ms |

## Deviations

none

## Known Issues

Five secondary size=sm buttons without explicit min-h-[44px]: DescrizioneSection Annulla/Fatto, ArraySection Chiudi/Aggiungi, VitaChip Annulla in Drawer.Footer, NavSidebar AlertDialog footer Annulla/Crea/Elimina. These are non-critical (in constrained drawer/dialog footers) but technically violate CLAUDE.md §III.

## Files Created/Modified

- `src/ui/workspace-home/NotificationDrawer.tsx`
