---
phase: 02-editor-annotazioni
plan: 02-04
subsystem: ui
tags: [react, heroui, legend-state, workspace, ipad]
requires:
  - phase: 02-03
    provides: unified inline editor shell with session overlays and field-scoped editing
provides:
  - toolbar-free unified detail shell in pane and fullscreen
  - header-integrated actions with review badge and kebab menu
  - lighter section hierarchy and body-native add-field flow
affects: [s02, r005, workspace-home, detail-pane, fullscreen]
tech-stack:
  added: []
  patterns:
    - shared shell grammar between pane and fullscreen
    - iPad-oriented touch targets for header chips and primary actions
    - HeroUI dropdown/popover/drawer composition aligned to local v3 docs
key-files:
  created: []
  modified:
    - src/ui/workspace-home/DetailPane.tsx
    - src/ui/workspace-home/FullscreenOverlay.tsx
    - src/ui/workspace-home/ElementoEditor.tsx
key-decisions:
  - "Removed the standalone toolbar and redistributed destructive/secondary actions into the unified header menu."
  - "Kept fullscreen navigation outside the content shell so pane and fullscreen share the same editor hierarchy."
  - "Preserved S02 session/domain behavior from 02-03 and kept fonti/catalog editing deferred to S03."
patterns-established:
  - "Use the editor header itself as the primary action surface; avoid a second toolbar layer in tablet detail views."
  - "Favor lightweight chip-strip sections over card-heavy form blocks for iPad detail editing."
requirements-completed: [R005]
duration: 25min
completed: 2026-04-17
---

# Phase 02 Plan 02-04 Summary

**Mockup-parity realignment of the unified detail editor for iPad 10.9"**

## Performance

- **Duration:** 25 min
- **Completed:** 2026-04-17
- **Tasks:** 4
- **Files modified:** 3

## Accomplishments

- Removed the separate action toolbar from both pane and fullscreen and moved the active affordances into the editor header cluster.
- Realigned the shell around the canonical mockup structure: inline title, review badge, kebab actions, then metadata chips as the first editing layer.
- Lightened `ruoli`, `tags`, `collegamenti`, and read-only sections so they read as integrated chip strips instead of stacked form cards.
- Reworked `+ Aggiungi campo` into a body-native flow with explicit low-noise S03 deferral messaging.
- Sized the main interactive controls for tablet use: larger title input, larger chips, and 40px-class action controls suitable for the 10.9" target.

## Files Modified

- `src/ui/workspace-home/DetailPane.tsx` - removed toolbar/header duplication and left only a lightweight fullscreen affordance outside the unified shell
- `src/ui/workspace-home/FullscreenOverlay.tsx` - removed duplicate fullscreen header content and reused the same editor shell with external navigation chrome
- `src/ui/workspace-home/ElementoEditor.tsx` - integrated header actions, raised touch targets, simplified section weight, and made add-field body-native

## Verification

- `npx tsc --noEmit`
- `npx vitest run`

## Manual Parity Checklist

- No standalone toolbar above the detail shell in pane or fullscreen
- Header order matches the mockup grammar: title, review badge, actions, metadata chips
- Metadata chips are the primary editing layer
- `ruoli`, `tags`, and `collegamenti` read as lightweight integrated sections
- `+ Aggiungi campo` sits in the body flow and only exposes S02-supported additions
- Fullscreen extends the same shell rather than introducing a different editor layout
- Soft delete is still available from the integrated actions menu
- S03-only fonti/catalog editing remains explicitly deferred

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Existing repo state was already dirty in unrelated files, so execution was limited to the active phase files and no unrelated cleanup was attempted.

## Next Phase Readiness

- Phase 02 now has the visual parity pass for `R005` implemented and verified.
- The next logical step is phase verification / UAT for S02, using the mockup-parity checklist above during manual review.
