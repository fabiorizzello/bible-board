---
estimated_steps: 30
estimated_files: 6
skills_used: []
---

# T03: Wire soft delete with 30s toast undo and Toast.Provider

Wire the "Elimina" dropdown item in ActionToolbar to soft-delete the selected element: remove it from the visible list, show a HeroUI toast with 30-second timeout and "Annulla" action button, and restore the element on undo or finalize on expiry.

## Steps

1. **Extend workspace-ui-store.ts**: Add `deletedElementIds: string[]` (default `[]`) to WorkspaceUiState. Add `softDeleteElement(id: string)` action: pushes id to deletedElementIds, resets selectedElementId to null. Add `restoreElement(id: string)` action: removes id from deletedElementIds. Add `finalizeDelete(id: string)` action: same as restore for now (in mock data, the element stays in ELEMENTI — deletion is visual only via filtering).

2. **Filter deleted elements in display-helpers.ts**: Update `getElementsForView()` to accept an optional `deletedIds: readonly string[]` parameter. Filter out elements whose `id as string` is in deletedIds. Update `findElementById()` similarly — or leave it as-is since detail pane shouldn't show deleted elements (they're deselected by softDeleteElement). Better: update getElementsForView only, since selection is reset on delete.

3. **Update ListPane.tsx**: Read `deletedElementIds` from store via useSelector. Pass to getElementsForView calls so deleted elements don't appear in the list.

4. **Wire ActionToolbar Elimina**: In DetailPane.tsx, update ActionToolbar to accept an `onDelete?: () => void` prop. In the Dropdown.Menu `onAction` handler, when `id === 'delete'`, call `onDelete()`. In DetailPane, pass `onDelete` that calls `softDeleteElement(selectedElementId)` and triggers a toast.

5. **Add Toast.Provider to WorkspacePreviewPage.tsx**: Import `Toast` from `@heroui/react`. Add `<Toast.Provider placement="bottom-center" />` as the last child in the composition shell. This renders the toast region.

6. **Implement toast with undo**: Import `toast` from `@heroui/react`. When soft-deleting, call:
   ```typescript
   const elementId = selectedElementId;
   softDeleteElement(elementId);
   toast(`"${element.titolo}" eliminato`, {
     timeout: 30000,
     actionProps: {
       children: "Annulla",
       onPress: () => restoreElement(elementId),
     },
     variant: "default",
   });
   ```
   On timeout expiry, the toast auto-dismisses. The element stays in `deletedElementIds` (soft-deleted visually). For the prototype this is sufficient — real deletion would happen on Jazz persistence.

7. **Verify**: `npx tsc --noEmit` passes. `npx vitest run` passes. Test the flow conceptually: getElementsForView with deletedIds filters correctly (add a unit test).

## Constraints
- HeroUI toast() is an imperative API — call it anywhere, Toast.Provider renders the visual region.
- Toast.Provider must be at the WorkspacePreviewPage level (composition shell) to be visible across all panes.
- `timeout: 30000` (30 seconds) — HeroUI default is 4000ms, must be explicit.
- The toast `actionProps.onPress` fires when user clicks "Annulla" — this calls `restoreElement()`.
- After soft delete, selectedElementId is set to null so detail pane shows empty state.
- `deletedElementIds` is a simple string array in the observable store — no persistence needed for prototype.
- Toast placement: `bottom-center` to match iPad-native patterns.

## Inputs

- ``src/ui/workspace-home/workspace-ui-store.ts` — extend with deletedElementIds state`
- ``src/ui/workspace-home/display-helpers.ts` — update getElementsForView to accept deletedIds filter`
- ``src/ui/workspace-home/ListPane.tsx` — read deletedElementIds and pass to getElementsForView`
- ``src/ui/workspace-home/DetailPane.tsx` — wire Elimina dropdown onAction to soft delete + toast`
- ``src/ui/workspace-home/WorkspacePreviewPage.tsx` — add Toast.Provider`
- ``src/ui/workspace-home/__tests__/display-helpers.test.ts` — add test for getElementsForView with deletedIds`

## Expected Output

- ``src/ui/workspace-home/workspace-ui-store.ts` — extended with deletedElementIds, softDeleteElement, restoreElement`
- ``src/ui/workspace-home/display-helpers.ts` — getElementsForView accepts optional deletedIds parameter`
- ``src/ui/workspace-home/ListPane.tsx` — filters out deleted elements from list display`
- ``src/ui/workspace-home/DetailPane.tsx` — Elimina triggers soft delete + toast with 30s undo`
- ``src/ui/workspace-home/WorkspacePreviewPage.tsx` — Toast.Provider added to composition shell`
- ``src/ui/workspace-home/__tests__/display-helpers.test.ts` — new tests for deleted element filtering`

## Verification

npx tsc --noEmit && npx vitest run
