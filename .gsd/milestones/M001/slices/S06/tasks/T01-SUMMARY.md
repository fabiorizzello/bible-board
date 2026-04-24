---
id: T01
parent: S06
milestone: M001
key_files:
  - src/ui/timeline/timeline-d3.ts
  - src/ui/timeline/Timeline.tsx
  - src/ui/workspace-home/workspace-ui-store.ts
  - src/ui/workspace-home/WorkspacePreviewPage.tsx
  - src/ui/workspace-home/ListPane.tsx
key_decisions:
  - D3 zoom uses rescaleY pattern (not physical group transform) for 60fps on iPad — avoids O(n) DOM moves during pan
  - Collision avoidance is pixel-based greedy at render time; column assignments are recomputed on data change but not on every zoom tick
  - Popup is plain positioned React div, not HeroUI Popover, because Popover needs a React trigger element while the click source is a D3 SVG node
  - Timeline replaces both ListPane and DetailPane per D013 (viste spaziali a piena larghezza); FAB and FullscreenOverlay hidden in timeline mode
duration: 
verification_result: passed
completed_at: 2026-04-23T11:59:32.571Z
blocker_discovered: false
---

# T01: Add D3 vertical SVG timeline with zoom/pan, collision-free card layout, and click popup — activated via list/timeline toggle in board views

**Add D3 vertical SVG timeline with zoom/pan, collision-free card layout, and click popup — activated via list/timeline toggle in board views**

## What Happened

Implemented the full D3 timeline feature across two new files and three modified files.

**`src/ui/timeline/timeline-d3.ts`** — Pure D3 module (D002 contract). Initialises an SVG canvas with a vertical time axis (top = most ancient per D019), renders cards as SVG groups with title/tipo/date text and a coloured left-accent stripe, and wires `d3.zoom()` with `rescaleY` so the Y-scale is recalculated on every zoom/pan event — giving 60fps updates by only repositioning existing DOM nodes rather than recreating them. A `requestAnimationFrame` throttle guards the zoom callback. Column-based collision avoidance assigns each card to the leftmost column where it doesn't overlap the card above it (pixel-based greedy algorithm), keeping the initial layout clean. Undated elements are counted and stacked separately. Card click fires `onCardClick(id, DOMRect)` back to React.

**`src/ui/timeline/Timeline.tsx`** — React host component. Converts `Elemento[]` → `TimelineCard[]` (AEV years become negative integers). Initialises the D3 controller in a `useEffect` on mount, updates it when Jazz data changes (via `lastModified` sentinel), and resizes via `ResizeObserver`. Popup state is plain React: clicking a card sets `{ elementoId, anchorRect }` and renders an absolutely-positioned overlay div positioned to the right of the card (flips left if near the viewport edge). The popup shows titolo, tipo, date, tags, and a description preview; "Apri scheda" switches back to list view and selects the element.

**`workspace-ui-store.ts`** — Added `BoardViewMode = 'lista' | 'timeline'` type, `activeBoardView` field (default `'lista'`), `setActiveBoardView()` setter, and auto-reset to `'lista'` when navigating to non-board views.

**`WorkspacePreviewPage.tsx`** — When `currentView.startsWith('board-') && activeBoardView === 'timeline'`, renders `<Timeline />` full-width (replacing ListPane + DetailPane per D013 "viste spaziali").

**`ListPane.tsx`** — Added a compact list/timeline toggle button group in the board-view header (only visible in `board-*` views), using `List` and `GitBranch` icons. Active view highlighted with primary background.

## Verification

1. `npx tsc --noEmit` — zero type errors.\n2. `npx vite build` — clean production build (2.57s, no errors).\n3. `npx vitest run` — 126/126 tests pass, no regressions.\n4. New files present: `src/ui/timeline/timeline-d3.ts`, `src/ui/timeline/Timeline.tsx`.\n5. Store exports verified: `setActiveBoardView`, `BoardViewMode`, `activeBoardView` in state.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npx tsc --noEmit` | 0 | ✅ pass | 12000ms |
| 2 | `npx vite build` | 0 | ✅ pass | 2570ms |
| 3 | `npx vitest run` | 0 | ✅ pass — 126/126 tests | 651ms |

## Deviations

The task plan listed 2 files (Timeline.tsx, timeline-d3.ts). Three additional files were modified to integrate the feature (workspace-ui-store, WorkspacePreviewPage, ListPane). This is expected — the plan notes S05 output as input but integration wiring was implicit.

## Known Issues

Browser interaction not testable in auto-mode; visual verification of 60fps on real iPad hardware deferred to UAT. The timeline currently uses DOM touch events via D3 (touchAction: none on SVG) — should be validated against native iPad swipe gestures in S07 UAT.

## Files Created/Modified

- `src/ui/timeline/timeline-d3.ts`
- `src/ui/timeline/Timeline.tsx`
- `src/ui/workspace-home/workspace-ui-store.ts`
- `src/ui/workspace-home/WorkspacePreviewPage.tsx`
- `src/ui/workspace-home/ListPane.tsx`
