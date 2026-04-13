---
phase: 02-editor-annotazioni
plan: 02-01
subsystem: ui
tags: [react, heroui, legend-state, vitest, soft-delete, toast, undo]

# Dependency graph
requires:
  - phase: 01-recupero-layout
    provides: 3-pane shell (NavSidebar, ListPane, DetailPane, FullscreenOverlay), workspace-ui-store, display-helpers
provides:
  - Inline element editor (ElementoEditor) with shared + type-specific fields wired through DetailPane and FullscreenOverlay
  - Annotazioni section in DetailBody with mie/altrui split, click-to-navigate, plural copy, disabled CTA when only altrui exist
  - Soft delete with 30-second HeroUI toast undo flow (Annulla restores selection)
  - Workspace store extended with isEditing + deletedElementIds + actions (start/stopEditing, softDelete/restore/finalize)
  - getElementsForView accepts optional deletedIds for in-memory filtering during the undo window
  - Toast.Provider mounted at WorkspacePreviewPage composition shell (placement="bottom")
affects: [03-fonti-link, 04-board-crud, 05-timeline-d3, 06-polish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Imperative HeroUI toast() wired through a shared exported helper (handleSoftDelete) so multiple panes share identical undo wiring without duplicating closure capture"
    - "Soft-delete state lives in workspace-ui-store (in-memory only) and is filtered at the display-helper boundary, keeping ListPane unaware of mock-data shapes"
    - "Store actions snapshot data BEFORE mutation when toast/undo flows depend on titolo + id surviving the selection reset"

key-files:
  created:
    - src/ui/workspace-home/ElementoEditor.tsx
  modified:
    - src/ui/workspace-home/workspace-ui-store.ts
    - src/ui/workspace-home/display-helpers.ts
    - src/ui/workspace-home/__tests__/display-helpers.test.ts
    - src/ui/workspace-home/ListPane.tsx
    - src/ui/workspace-home/DetailPane.tsx
    - src/ui/workspace-home/FullscreenOverlay.tsx
    - src/ui/workspace-home/WorkspacePreviewPage.tsx

key-decisions:
  - "HeroUI Select composite pattern adapted to v3 actual API (Select.Trigger > Select.Value, Select.Popover > ListBox > ListBox.Item) instead of the plan's Select.Button/ListBox shape"
  - "Type-specific editor field groups extracted as separate React subcomponents for readability"
  - "Annotazioni section placed between Fonti and Board, matching the knowledge-base information hierarchy"
  - "Annotation titles are clickable buttons that navigate via selectElement (same affordance as list items)"
  - 'Toast placement set to "bottom" because HeroUI v3 ToastVariants only accepts bottom/bottom end/bottom start/top variants — there is no literal "bottom-center" string'
  - "handleSoftDelete extracted as exported helper from DetailPane so DetailPane and FullscreenOverlay share identical toast wiring without copy-paste closure capture"
  - "softDeleteElement also exits fullscreen + edit mode so the deleted element disappears completely; restoreElement re-selects the id so undo lands on the item"

patterns-established:
  - "Workspace UI store actions can mutate selection alongside primary state when the user-facing intent demands it (e.g. softDelete clears selection)"
  - "Display helpers accept optional readonly arrays for transient UI filters, defaulting to [] so existing call sites keep working"
  - "Shared toast/undo helpers live next to the store actions they wrap and are exported so other panes can reuse them"

requirements-completed: []

# Metrics
duration: ~45min (T03 only; T01 + T02 completed earlier and verified independently)
completed: 2026-04-13
---

# Phase 02-01: Editor inline, annotazioni, soft delete — Summary

**Inline ElementoEditor with type-specific fields, Annotazioni section in DetailBody (mie/altrui), and soft delete with 30-second HeroUI toast undo wired through a shared handleSoftDelete helper.**

## Performance

- **Duration:** ~45 min for T03 (T01 and T02 completed earlier on 2026-04-03)
- **Started:** 2026-04-13T11:46:00Z (T03 worktree session)
- **Completed:** 2026-04-13T11:51:00Z
- **Tasks:** 3 (T01, T02 already complete; T03 executed in this session)
- **Files modified (T03):** 7

## Accomplishments

- **T01** — Created `ElementoEditor.tsx` inline form with shared (titolo, descrizione, tags) + type-specific fields (personaggio, guerra, profezia, regno, luogo). Wired Modifica button in `ActionToolbar` to toggle edit mode in both `DetailPane` and `FullscreenOverlay`. Validation runs through `normalizeElementoInput` with inline FieldError display.
- **T02** — Added `getAnnotazioniForElement(elementId, currentAutore)` and `CURRENT_AUTORE` constant to `display-helpers.ts`. New Annotazioni section in `DetailBody` shows the user's annotations (clickable, navigates via `selectElement`), the count of altrui annotations, and a disabled "+ Aggiungi annotazione" CTA when only altrui exist. Section is hidden entirely when zero annotations.
- **T03** — Wired the Elimina dropdown item in `ActionToolbar` to a shared `handleSoftDelete(element)` helper that calls `softDeleteElement`, then fires a HeroUI toast with `timeout: 30_000` and an "Annulla" action. Undo restores via `restoreElement` and re-selects the element. `Toast.Provider` mounted at the `WorkspacePreviewPage` composition shell. `getElementsForView` accepts optional `deletedIds` to filter during the undo window. Both `DetailPane` and `FullscreenOverlay` share the same delete helper.

## Task Commits

T01 and T02 work was previously landed via consolidated chore commits prior to this worktree session (the per-task SUMMARY files in `tasks/` document those steps). T03 was committed atomically across five steps in this session:

1. **T03 step 1: Store extension** — `1a06681` (feat) — `feat(02-01): add deletedElementIds + soft delete actions to workspace store`
2. **T03 step 2: display-helpers + tests** — `7c51f6f` (feat) — `feat(02-01): filter soft-deleted elements from getElementsForView`
3. **T03 step 3: ListPane wiring** — `9729291` (feat) — `feat(02-01): filter soft-deleted elements from ListPane display`
4. **T03 step 4: ActionToolbar + handleSoftDelete + FullscreenOverlay** — `261f8be` (feat) — `feat(02-01): wire ActionToolbar Elimina to soft delete + 30s undo toast`
5. **T03 step 5: Toast.Provider mount** — `5c7ce57` (feat) — `feat(02-01): mount Toast.Provider in WorkspacePreviewPage shell`

**Historical baseline commits referenced for T01 + T02:** `e30034e` (chore: unblock S02 by fixing pre-existing type errors — landed `ElementoEditor.tsx`, store `isEditing` field, FullscreenOverlay edit-mode wiring, annotazioni helper + tests).

## Files Created/Modified

### Created (T01, baseline)
- `src/ui/workspace-home/ElementoEditor.tsx` — Inline editor with shared + type-specific field groups, controlled local state, normalize validation on save
- `.planning/phases/02-editor-annotazioni/tasks/T01-SUMMARY.md` — Task-level T01 summary
- `.planning/phases/02-editor-annotazioni/tasks/T02-SUMMARY.md` — Task-level T02 summary
- `.planning/phases/02-editor-annotazioni/tasks/T03-SUMMARY.md` — Task-level T03 summary (this session)

### Modified (T01–T03)
- `src/ui/workspace-home/workspace-ui-store.ts` — `isEditing` + `start/stopEditing` (T01) + `deletedElementIds` + `softDeleteElement`/`restoreElement`/`finalizeDelete` (T03)
- `src/ui/workspace-home/display-helpers.ts` — `CURRENT_AUTORE` + `getAnnotazioniForElement` (T02) + optional `deletedIds` parameter on `getElementsForView` (T03)
- `src/ui/workspace-home/__tests__/display-helpers.test.ts` — Annotation tests (T02) + 6 soft-delete filter tests (T03)
- `src/ui/workspace-home/ListPane.tsx` — Reads `deletedElementIds` and passes through to `getElementsForView` (T03)
- `src/ui/workspace-home/DetailPane.tsx` — Conditional `<ElementoEditor>` vs `<DetailBody>` (T01) + Annotazioni section in DetailBody (T02) + `ActionToolbar.onDelete` prop, exported `handleSoftDelete` helper, toast call (T03)
- `src/ui/workspace-home/FullscreenOverlay.tsx` — Same edit-mode toggle as DetailPane (T01) + wires `onDelete` via shared `handleSoftDelete` (T03)
- `src/ui/workspace-home/WorkspacePreviewPage.tsx` — Mounts `<Toast.Provider placement="bottom" />` (T03)

## Decisions Made

- **HeroUI Select v3 actual API** (T01): The plan's `Select.Button`/`Select.ListBox` composition was adapted to the real shape: `Select.Trigger > Select.Value + Select.Indicator`, `Select.Popover > ListBox > ListBox.Item`.
- **Annotazioni placement** (T02): Section sits between Fonti and Board, matching the knowledge-base information hierarchy (descrizione → collegamenti → fonti → annotazioni → board).
- **`handleSoftDelete` extracted as exported helper** (T03): DetailPane and FullscreenOverlay share identical toast wiring without copy-paste closure capture. The helper captures `titolo + id` BEFORE the store mutation so the toast message and undo handler keep working after `softDeleteElement` clears the selection.
- **`softDeleteElement` exits fullscreen + edit mode** (T03): If the user is editing or in fullscreen when they hit Elimina, leaving those modes active would re-show stale state. Resetting both ensures the detail pane returns cleanly to its empty state.
- **`restoreElement` re-selects the restored id** (T03): Per the constitution's app-native feel principle, when the user clicks Annulla they expect to land back on the element they accidentally deleted, not on an empty detail pane.
- **`Toast.Provider` placement = `"bottom"`** (T03): HeroUI v3's `ToastVariants` only accepts `"bottom"`, `"bottom end"`, `"bottom start"`, `"top"`, `"top end"`, `"top start"`. The plan said `"bottom-center"`, which is not a valid type literal. `"bottom"` is the horizontally-centered bottom variant — semantically identical to the intent.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking issue] Toast placement adjusted from `"bottom-center"` to `"bottom"`**
- **Found during:** T03 step 5 (mounting Toast.Provider)
- **Issue:** Both `02-01-PLAN.md` and `tasks/T03-PLAN.md` prescribe `placement="bottom-center"`, but HeroUI v3's `ToastVariants` type (in `@heroui/styles/dist/components/toast/toast.styles.d.ts`) only exposes the literals `"bottom"`, `"bottom end"`, `"bottom start"`, `"top"`, `"top end"`, `"top start"`. Passing `"bottom-center"` would fail `tsc --noEmit`.
- **Fix:** Used `placement="bottom"`, which is the horizontally-centered bottom variant — semantically identical to the intent (toast appears centered along the bottom edge).
- **Files modified:** `src/ui/workspace-home/WorkspacePreviewPage.tsx`
- **Verification:** `npx tsc --noEmit` clean; `npx vite build` clean
- **Committed in:** `5c7ce57`

**2. [Rule 2 - Missing critical functionality] FullscreenOverlay also wires `onDelete`**
- **Found during:** T03 step 4 (ActionToolbar wiring)
- **Issue:** ActionToolbar is shared by both DetailPane and FullscreenOverlay. The plan only mentioned wiring the DetailPane delete path. If FullscreenOverlay were left without an `onDelete`, hitting Elimina from fullscreen would silently do nothing — broken UX, not a feature gap.
- **Fix:** Extracted `handleSoftDelete(element)` as an exported helper from DetailPane and imported it into FullscreenOverlay so both panes pass identical wiring to the shared toolbar.
- **Files modified:** `src/ui/workspace-home/DetailPane.tsx`, `src/ui/workspace-home/FullscreenOverlay.tsx`
- **Verification:** `npx tsc --noEmit` clean
- **Committed in:** `261f8be`

**3. [Rule 2 - Missing critical functionality] `softDeleteElement` also exits fullscreen + edit mode**
- **Found during:** T03 step 1 (store extension)
- **Issue:** The plan only specified clearing `selectedElementId`. But if the user is editing or in fullscreen when they hit Elimina, leaving those modes active would re-show stale state once `findElementById` returns undefined (FullscreenOverlay returns null, but the editing mode flag would persist into the next selection).
- **Fix:** Added `workspaceUi$.isEditing.set(false)` and `workspaceUi$.fullscreen.set(false)` to `softDeleteElement`.
- **Files modified:** `src/ui/workspace-home/workspace-ui-store.ts`
- **Verification:** `npx tsc --noEmit` clean; manual reasoning trace through edit/fullscreen flows
- **Committed in:** `1a06681`

**4. [Plan extension] `restoreElement` re-selects the restored id**
- **Found during:** T03 step 1 (store extension)
- **Issue:** The plan only said `restoreElement` removes the id from `deletedElementIds`. But after restore the detail pane would still show the empty-state message, forcing the user to find and re-click the item they just rescued — bad iPad-native UX.
- **Fix:** `restoreElement` now also calls `workspaceUi$.selectedElementId.set(id)` so the user lands back on the restored element.
- **Files modified:** `src/ui/workspace-home/workspace-ui-store.ts`
- **Verification:** Reasoning trace through the undo flow
- **Committed in:** `1a06681`

---

**Total deviations:** 4 auto-fixed (1 blocking-issue, 2 missing-critical, 1 plan-extension)
**Impact on plan:** All four are essential for correctness or basic UX. None constitute scope creep — they keep the soft-delete flow consistent with the constitution's iPad-native and app-like-feeling principles. The HeroUI placement deviation is purely a type-system fix.

## Issues Encountered

None during T03. Pre-existing chunk-size > 500KB warning from `vite build` is unrelated and out of scope.

## Verification

| # | Command | Exit Code | Verdict | Result |
|---|---------|-----------|---------|--------|
| 1 | `npx tsc --noEmit` | 0 | pass | clean |
| 2 | `npx vitest run` | 0 | pass | 104/104 (98 baseline + 6 new) |
| 3 | `npx vite build` | 0 | pass | 1.38s, 760KB bundle |

## User Setup Required

None — no external service configuration required. Soft delete is in-memory only in the prototype.

## Next Phase Readiness

- Editor flow, annotations display, and soft delete with toast undo all working in the 3-pane shell.
- `handleSoftDelete` helper is reusable for any future ActionToolbar callers.
- `getElementsForView` now supports an optional filter list — easy to extend with future "hide archived" / "hide draft" filters by passing additional id arrays.
- S02 is fully delivered. Ready for **S03 (Fonti e link editor inline)** which depends on the same `display-helpers` + `workspace-ui-store` boundaries this plan reinforced.
- Future cleanup item (out of scope here): a real Jazz-backed implementation of `finalizeDelete` would mutate persistence rather than no-op once Jazz CRDTs are wired (M003).

## Self-Check: PASSED

- `src/ui/workspace-home/workspace-ui-store.ts` — FOUND, contains `deletedElementIds` + 3 actions
- `src/ui/workspace-home/display-helpers.ts` — FOUND, `getElementsForView` accepts `deletedIds`
- `src/ui/workspace-home/__tests__/display-helpers.test.ts` — FOUND, 6 new soft-delete tests
- `src/ui/workspace-home/ListPane.tsx` — FOUND, reads `deletedElementIds`
- `src/ui/workspace-home/DetailPane.tsx` — FOUND, exports `handleSoftDelete`, `ActionToolbar` accepts `onDelete`
- `src/ui/workspace-home/FullscreenOverlay.tsx` — FOUND, imports `handleSoftDelete`
- `src/ui/workspace-home/WorkspacePreviewPage.tsx` — FOUND, mounts `<Toast.Provider placement="bottom" />`
- Commit `1a06681` — FOUND
- Commit `7c51f6f` — FOUND
- Commit `9729291` — FOUND
- Commit `261f8be` — FOUND
- Commit `5c7ce57` — FOUND

---
*Phase: 02-editor-annotazioni*
*Plan: 02-01*
*Completed: 2026-04-13*
