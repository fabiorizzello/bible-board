---
id: T03
parent: S02
milestone: M002
key_files:
  - src/ui/workspace-home/workspace-ui-store.ts
  - src/ui/workspace-home/display-helpers.ts
  - src/ui/workspace-home/__tests__/display-helpers.test.ts
  - src/ui/workspace-home/ListPane.tsx
  - src/ui/workspace-home/DetailPane.tsx
  - src/ui/workspace-home/FullscreenOverlay.tsx
  - src/ui/workspace-home/WorkspacePreviewPage.tsx
key_decisions:
  - Toast placement set to "bottom" (HeroUI v3 only exposes bottom/bottom end/bottom start/top variants — no literal "bottom-center" string)
  - handleSoftDelete extracted as exported helper from DetailPane so DetailPane and FullscreenOverlay share identical toast wiring
  - softDeleteElement also exits fullscreen + edit mode so the soft-deleted element disappears completely from view
  - finalizeDelete kept as a documented no-op stub for the future Jazz adapter (called by toast onClose conceptually)
duration: ~45min
verification_result: passed
completed_at: 2026-04-13T11:51:00Z
blocker_discovered: false
---

# T03: Wire soft delete with 30s toast undo and Toast.Provider

**Wired the Elimina dropdown in ActionToolbar to soft-delete the selected element with a 30-second HeroUI toast undo flow, mounted Toast.Provider at the WorkspacePreviewPage shell.**

## What Happened

Extended `workspace-ui-store.ts` with `deletedElementIds: string[]` plus three actions: `softDeleteElement(id)` (marks deleted, clears selection, exits edit/fullscreen), `restoreElement(id)` (un-marks and re-selects so undo lands on the item), and `finalizeDelete(id)` (no-op stub for the future Jazz layer). Updated `getElementsForView` in `display-helpers.ts` to accept an optional `deletedIds: readonly string[]` parameter that filters out matching elements before the text/tipo filters; added 6 unit tests covering single id, multiple ids, unknown id no-op, composition with text+tipo, board-patriarchi filtering, and omitted-arg defaults. `ListPane.tsx` now reads `deletedElementIds` from the store and passes it through to `getElementsForView`.

The ActionToolbar gained an `onDelete?: () => void` prop and routes the Dropdown.Menu key `"delete"` through it. A new exported helper `handleSoftDelete(element)` in `DetailPane.tsx` captures `titolo` + `id` BEFORE mutating the store (so the toast message and undo handler keep working after `softDeleteElement` clears the selection), then fires the HeroUI toast with `timeout: 30_000`, `variant: "default"`, and `actionProps: { children: "Annulla", onPress: () => restoreElement(elementId) }`. Both `DetailPane` and `FullscreenOverlay` import and pass this helper to their `<ActionToolbar>` so delete works identically in both contexts. Finally, `<Toast.Provider placement="bottom" />` is mounted as the last child of the `WorkspacePreviewPage` composition shell.

## Verification

`npx tsc --noEmit` passes clean. `npx vitest run` passes all 104 tests (98 baseline + 6 new for soft-delete filtering). `npx vite build` passes (760KB bundle, pre-existing chunk-size warning is out of scope).

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npx tsc --noEmit` | 0 | pass | ~5s |
| 2 | `npx vitest run` | 0 | pass (104/104) | 636ms |
| 3 | `npx vite build` | 0 | pass | 1.38s |

## Deviations

**[Rule 3 - Blocking issue] Toast placement adjusted from `"bottom-center"` to `"bottom"`.**
- **Found during:** Step 5 (mounting Toast.Provider).
- **Issue:** The plan and T03-PLAN.md both prescribe `placement="bottom-center"`, but HeroUI v3's `ToastVariants` type (in `@heroui/styles/dist/components/toast/toast.styles.d.ts`) only exposes the literals `"bottom"`, `"bottom end"`, `"bottom start"`, `"top"`, `"top end"`, `"top start"`. Passing `"bottom-center"` would fail `tsc --noEmit`.
- **Fix:** Used `placement="bottom"`, which is the horizontally-centered bottom variant — semantically identical to the "bottom-center" intent (toast appears centered along the bottom edge).
- **Files modified:** `src/ui/workspace-home/WorkspacePreviewPage.tsx`
- **Commit:** `5c7ce57`

**[Plan extension] `softDeleteElement` also exits fullscreen + edit mode.**
- **Why:** If the user is editing or in fullscreen when they hit Elimina, leaving those modes active would re-show stale state. Resetting both ensures the detail pane returns cleanly to its empty state.
- **Captured in:** `softDeleteElement` action in `workspace-ui-store.ts`.

**[Plan extension] `restoreElement` re-selects the restored id.**
- **Why:** Per the constitution's app-native feel principle, when the user clicks Annulla they expect to land back on the element they accidentally deleted, not on an empty detail pane.
- **Captured in:** `restoreElement` action in `workspace-ui-store.ts`.

**[Plan extension] FullscreenOverlay also wires `onDelete`.**
- **Why:** ActionToolbar is shared by both DetailPane and FullscreenOverlay. If FullscreenOverlay were left without an `onDelete`, hitting Elimina from fullscreen would silently do nothing. Both panes now share the exported `handleSoftDelete(element)` helper.
- **Captured in:** `src/ui/workspace-home/FullscreenOverlay.tsx`.

## Known Issues

None. The pre-existing chunk-size > 500KB warning from `vite build` is unrelated to T03 and out of scope.

## Files Created/Modified

- `src/ui/workspace-home/workspace-ui-store.ts` (modified) — `deletedElementIds` + `softDeleteElement` / `restoreElement` / `finalizeDelete`
- `src/ui/workspace-home/display-helpers.ts` (modified) — `getElementsForView` accepts optional `deletedIds`
- `src/ui/workspace-home/__tests__/display-helpers.test.ts` (modified) — 6 new tests for soft-delete filtering
- `src/ui/workspace-home/ListPane.tsx` (modified) — reads `deletedElementIds`, passes through
- `src/ui/workspace-home/DetailPane.tsx` (modified) — `ActionToolbar.onDelete`, `handleSoftDelete` exported helper, toast call
- `src/ui/workspace-home/FullscreenOverlay.tsx` (modified) — wires `onDelete` via shared `handleSoftDelete`
- `src/ui/workspace-home/WorkspacePreviewPage.tsx` (modified) — mounts `<Toast.Provider placement="bottom" />`
